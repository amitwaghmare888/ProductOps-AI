"""
ProductOps Orchestrator — ADK SequentialAgent that runs the full pipeline.

Pipeline: Feedback Analyzer → Business Prioritizer → Engineering Planner

Each sub-agent reads/writes session state via output_key/input_key.
The orchestrator manages the session lifecycle and returns structured results.
"""
import json
import time
import uuid
from typing import Any

from google.adk.agents import SequentialAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.agents.feedback_analyzer import feedback_analyzer_agent
from backend.agents.business_prioritizer import business_prioritizer_agent
from backend.agents.engineering_planner import engineering_planner_agent


# The core pipeline: 3 agents in sequence
productops_pipeline = SequentialAgent(
    name="productops_orchestrator",
    description=(
        "Orchestrates the ProductOps pipeline: "
        "Analyze feedback → Prioritize → Generate engineering plan"
    ),
    sub_agents=[
        feedback_analyzer_agent,
        business_prioritizer_agent,
        engineering_planner_agent,
    ],
)

# Session service (in-memory for MVP)
session_service = InMemorySessionService()

APP_NAME = "productops_ai"


async def run_pipeline(
    feedback_text: str,
    run_id: str | None = None,
) -> dict[str, Any]:
    """
    Run the full ProductOps pipeline on customer feedback.

    Args:
        feedback_text: Raw customer feedback. Multiple items separated by newlines.
        run_id: Optional pipeline run ID. Auto-generated if not provided.

    Returns:
        dict with run_id, status, analysis, prioritization, planning, and duration_ms.
    """
    run_id = run_id or str(uuid.uuid4())
    user_id = f"user_{run_id[:8]}"

    # Create a fresh session for this run
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=run_id,
    )

    runner = Runner(
        agent=productops_pipeline,
        app_name=APP_NAME,
        session_service=session_service,
    )

    start = time.time()

    # Build the user message
    message = types.Content(
        role="user",
        parts=[
            types.Part(
                text=(
                    f"Analyze this customer feedback and produce a full product operations plan:\n\n"
                    f"{feedback_text}"
                )
            ),
        ],
    )

    # Run the pipeline — iterate through all events
    final_text = ""
    async for event in runner.run_async(
        user_id=user_id,
        session_id=run_id,
        new_message=message,
    ):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_text = event.content.parts[0].text or ""

    duration_ms = int((time.time() - start) * 1000)

    # Read agent outputs from session state
    final_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=run_id,
    )

    state = final_session.state if final_session else {}

    return {
        "run_id": run_id,
        "session_id": run_id,
        "status": "completed",
        "analysis": _parse_state(state.get("analysis_result")),
        "prioritization": _parse_state(state.get("prioritization_result")),
        "planning": _parse_state(state.get("planning_result")),
        "duration_ms": duration_ms,
        "final_response": final_text[:500] if final_text else None,
    }


def _parse_state(value: Any) -> dict | list | str:
    """
    Parse a session state value into structured data.
    Handles JSON strings, markdown-fenced JSON, and raw values.
    """
    if value is None:
        return {}
    if isinstance(value, (dict, list)):
        return value

    if isinstance(value, str):
        cleaned = value.strip()
        # Strip markdown code fences
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first and last lines (``` markers)
            if len(lines) >= 3:
                cleaned = "\n".join(lines[1:-1]).strip()
            else:
                cleaned = "\n".join(lines[1:]).strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {"raw_output": value}

    return {"raw_output": str(value)}
