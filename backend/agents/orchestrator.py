"""
ProductOps Orchestrator — ADK SequentialAgent that runs the full pipeline.

Pipeline: Feedback Analyzer → Business Prioritizer → Engineering Planner

Each sub-agent reads/writes session state via output_key/input_key.
The orchestrator manages the session lifecycle and returns structured results.
"""
import json
import logging
import os
import time
import uuid
from typing import Any

from google.adk.agents import SequentialAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.agents.feedback_analyzer import create_feedback_analyzer_agent
from backend.agents.business_prioritizer import create_business_prioritizer_agent
from backend.agents.engineering_planner import create_engineering_planner_agent
from backend.gateway import llm_gateway
from backend.utils.retry import async_retry
from backend.utils.output_schemas import (
    AnalysisOutput,
    PrioritizationOutput,
    PlanningOutput,
)

# Session service (in-memory for MVP)
session_service = InMemorySessionService()

APP_NAME = "productops_ai"
logger = logging.getLogger(__name__)

# --- TEMPORARY FILE LOGGER FOR TRACING ---
_fh = logging.FileHandler("pipeline_debug_trace.log", mode="w")
_fh.setLevel(logging.INFO)
logger.addHandler(_fh)
# -----------------------------------------


@async_retry(max_attempts=3, base_delay=2.0, max_delay=30.0)
async def _execute_adk_pipeline(
    feedback_text: str,
    user_id: str,
) -> tuple[str, dict]:
    """
    Execute the ADK SequentialAgent pipeline with exponential backoff retry.

    Creates a fresh session per call so each retry attempt starts with clean
    state — prevents stale partial agent outputs from polluting a retry.

    Gateway integration:
    - Before each attempt, asks the LLM Gateway for the next available key
      (round-robin across the pool) and injects it into os.environ so the
      ADK LlmAgent picks it up automatically.
    - On a 429 / quota error, marks that key as rate-limited in the gateway's
      circuit breaker, then re-raises so @async_retry selects a fresh key
      on the next attempt.

    Args:
        feedback_text: Raw customer feedback to process.
        user_id: Stable user identifier for the parent run.

    Returns:
        Tuple of (final_response_text, session_state_dict).
    """
    # ── Gateway key selection ────────────────────────────────────────────────
    # Ask the gateway for the next available provider (round-robin, skips
    # rate-limited keys). If None (gateway not configured or all exhausted)
    # the existing GOOGLE_API_KEY in os.environ is used as fallback.
    provider = await llm_gateway.next_provider()
    if provider is not None:
        os.environ["GOOGLE_API_KEY"] = provider.api_key
        logger.info(
            "PIPELINE_DEBUG: Selected Provider: '%s', Key Suffix: '...%s', os.environ Key Suffix: '...%s'",
            provider.key_id,
            provider.api_key[-4:] if provider.api_key else "None",
            os.environ.get("GOOGLE_API_KEY", "")[-4:]
        )
    else:
        logger.warning(
            "PIPELINE_DEBUG: No gateway provider available — falling back to ambient GOOGLE_API_KEY. Suffix: '...%s'",
            os.environ.get("GOOGLE_API_KEY", "")[-4:]
        )

    # Fresh session ID per attempt — isolates state between retries
    session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )

    # Instantiate agents DYNAMICALLY so they capture the current os.environ["GOOGLE_API_KEY"]
    productops_pipeline = SequentialAgent(
        name="productops_orchestrator",
        description=(
            "Orchestrates the ProductOps pipeline: "
            "Analyze feedback → Prioritize → Generate engineering plan"
        ),
        sub_agents=[
            create_feedback_analyzer_agent(),
            create_business_prioritizer_agent(),
            create_engineering_planner_agent(),
        ],
    )

    runner = Runner(
        agent=productops_pipeline,
        app_name=APP_NAME,
        session_service=session_service,
    )

    message = types.Content(
        role="user",
        parts=[
            types.Part(
                text=(
                    f"Analyze this customer feedback and produce a full "
                    f"product operations plan:\n\n{feedback_text}"
                )
            ),
        ],
    )

    # ── Metrics: record the attempt ───────────────────────────────────────────
    if provider is not None:
        provider.record_attempt()

    final_text = ""
    try:
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=message,
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_text = event.content.parts[0].text or ""
        # ── Metrics: record success ──────────────────────────────────────────
        if provider is not None:
            provider.record_success()
        logger.info("PIPELINE_DEBUG: Response status: SUCCESS")
    except Exception as exc:
        # ── Circuit-breaker notification ────────────────────────────────────
        # If the error is a rate-limit / quota exhaustion, tell the gateway
        # to exclude this key for the cooldown period. The @async_retry
        # decorator will then retry and _next_available() will skip it.
        logger.error("PIPELINE_DEBUG: Response status: FAILED with %s", type(exc).__name__)
        if provider is not None:
            provider.record_failure(str(exc)[:200])
            error_str = str(exc).lower()
            if "429" in error_str or "quota" in error_str or "resource_exhausted" in error_str:
                provider.mark_rate_limited(exc)
                logger.warning(
                    "Pipeline: 429 on provider '%s' — circuit breaker activated, "
                    "next retry will use a different key.",
                    provider.key_id,
                )
        raise  # let @async_retry decide whether to retry

    final_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )
    state = final_session.state if final_session else {}
    return final_text, state


async def run_pipeline(
    feedback_text: str,
    run_id: str | None = None,
) -> dict[str, Any]:
    """
    Run the full ProductOps pipeline on customer feedback.

    Delegates ADK execution to _execute_adk_pipeline which includes
    exponential backoff retry (3 attempts, 2-30s delay).

    Args:
        feedback_text: Raw customer feedback. Multiple items separated by newlines.
        run_id: Optional pipeline run ID. Auto-generated if not provided.

    Returns:
        dict with run_id, status, analysis, prioritization, planning, and duration_ms.
    """
    run_id = run_id or str(uuid.uuid4())
    user_id = f"user_{run_id[:8]}"

    # Timing spans the full execution including any retry delays
    start = time.time()

    # Execute with retry — each attempt creates a fresh internal session
    final_text, state = await _execute_adk_pipeline(feedback_text, user_id)

    duration_ms = int((time.time() - start) * 1000)

    analysis = _parse_state(state.get("analysis_result"))
    prioritization = _parse_state(state.get("prioritization_result"))
    planning = _parse_state(state.get("planning_result"))

    # Non-blocking schema validation — logs warnings on drift, never raises
    _validate_output("analysis", analysis, AnalysisOutput)
    _validate_output("prioritization", prioritization, PrioritizationOutput)
    _validate_output("planning", planning, PlanningOutput)

    return {
        "run_id": run_id,
        "session_id": run_id,
        "status": "completed",
        "analysis": analysis,
        "prioritization": prioritization,
        "planning": planning,
        "duration_ms": duration_ms,
        "final_response": final_text[:500] if final_text else None,
    }


def _parse_state(value: Any) -> dict | list | str:
    """
    Parse a session state value into structured data.

    With response_mime_type="application/json" set on all LlmAgents, values
    arrive as raw JSON strings — no markdown fences. The fence-stripping block
    below is a safety fallback only and logs a warning if triggered.
    """
    if value is None:
        return {}
    if isinstance(value, (dict, list)):
        return value

    if isinstance(value, str):
        cleaned = value.strip()
        # Safety fallback — should not trigger with JSON mode active on all agents
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1] if len(lines) >= 3 else lines[1:]).strip()
            logger.warning(
                "_parse_state: markdown fence detected despite JSON mode — "
                "verify generate_content_config on all LlmAgent definitions."
            )
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {"raw_output": value}

    return {"raw_output": str(value)}


def _validate_output(stage: str, output: dict | list | str, schema: type) -> None:
    """
    Validate an agent output dict against its expected Pydantic schema.

    Non-blocking: logs warnings on schema drift but never raises.
    This provides output quality observability without breaking demo stability.

    Args:
        stage: Agent stage name used in log messages (e.g. 'analysis').
        output: Parsed agent output from _parse_state().
        schema: Pydantic model class to validate against.
    """
    if not isinstance(output, dict) or "raw_output" in output:
        logger.warning(
            "Agent stage '%s' produced unstructured output "
            "(JSON parse failed or LLM drift). Snippet: %s",
            stage,
            str(output)[:200],
        )
        return
    try:
        schema.model_validate(output)
        logger.debug("Agent stage '%s' passed schema validation.", stage)
    except Exception as exc:
        logger.warning(
            "Agent stage '%s' output has schema drift: %s. "
            "Pipeline continues — check prompt alignment.",
            stage,
            exc,
        )
