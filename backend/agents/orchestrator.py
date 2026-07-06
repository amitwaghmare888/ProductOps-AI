"""
ProductOps Orchestrator — Orchestrates the full pipeline without ADK.

Migrated from Google ADK to direct OpenAI integration.
Pipeline: Feedback Analyzer → Business Prioritizer → Engineering Planner
"""
import json
import logging
import time
import uuid
from typing import Any

from backend.agents.feedback_analyzer import analyze_feedback
from backend.agents.business_prioritizer import prioritize_feedback
from backend.agents.engineering_planner import plan_engineering
from backend.utils.retry import async_retry
from backend.utils.output_schemas import (
    AnalysisOutput,
    PrioritizationOutput,
    PlanningOutput,
)

logger = logging.getLogger(__name__)


@async_retry(max_attempts=3, base_delay=2.0, max_delay=30.0)
async def _execute_pipeline(feedback_text: str) -> tuple[dict, dict, dict]:
    """
    Execute the ProductOps pipeline with exponential backoff retry.
    
    Args:
        feedback_text: Raw customer feedback to process.
        
    Returns:
        Tuple of (analysis, prioritization, planning) dicts.
    """
    # Stage 1: Analysis
    logger.info("Starting Stage 1: Feedback Analysis")
    analysis = await analyze_feedback(feedback_text)
    
    # Stage 2: Prioritization
    logger.info("Starting Stage 2: Business Prioritization")
    prioritization = await prioritize_feedback(analysis)
    
    # Stage 3: Engineering Planning
    logger.info("Starting Stage 3: Engineering Planning")
    planning = await plan_engineering(analysis, prioritization)
    
    return analysis, prioritization, planning


async def run_pipeline(
    feedback_text: str,
    run_id: str | None = None,
) -> dict[str, Any]:
    """
    Run the full ProductOps pipeline on customer feedback.
    
    Delegates execution to _execute_pipeline which includes
    exponential backoff retry (3 attempts, 2-30s delay).
    
    Args:
        feedback_text: Raw customer feedback. Multiple items separated by newlines.
        run_id: Optional pipeline run ID. Auto-generated if not provided.
        
    Returns:
        dict with run_id, status, analysis, prioritization, planning, and duration_ms.
    """
    run_id = run_id or str(uuid.uuid4())
    
    # Timing spans the full execution including any retry delays
    start = time.time()
    
    try:
        # Execute with retry
        analysis, prioritization, planning = await _execute_pipeline(feedback_text)
    except Exception as exc:
        duration_ms = int((time.time() - start) * 1000)
        error_msg = str(exc)
        
        # User-friendly error messages for common issues
        if "rate_limit" in error_msg.lower() or "429" in error_msg:
            error_msg = (
                "API rate limit reached. Please wait a few moments and try again. "
                "For higher limits, consider upgrading your OpenAI plan."
            )
        elif "quota" in error_msg.lower():
            error_msg = (
                "API quota exceeded. Please check your OpenAI account usage and billing. "
                "Visit: https://platform.openai.com/usage"
            )
        elif "timeout" in error_msg.lower():
            error_msg = (
                "Request timed out. The AI model took too long to respond. "
                "Please try again with shorter feedback or check your connection."
            )
        
        logger.error(f"Pipeline {run_id} failed: {exc}")
        
        return {
            "run_id": run_id,
            "session_id": run_id,
            "status": "failed",
            "error_message": error_msg,
            "analysis": None,
            "prioritization": None,
            "planning": None,
            "duration_ms": duration_ms,
            "final_response": None,
        }
    
    duration_ms = int((time.time() - start) * 1000)
    
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
        "final_response": f"Pipeline completed successfully in {duration_ms}ms",
    }


def _validate_output(stage: str, output: dict | list | str, schema: type) -> None:
    """
    Validate an agent output dict against its expected Pydantic schema.
    
    Non-blocking: logs warnings on schema drift but never raises.
    This provides output quality observability without breaking demo stability.
    
    Args:
        stage: Agent stage name used in log messages (e.g. 'analysis').
        output: Parsed agent output.
        schema: Pydantic model class to validate against.
    """
    if not isinstance(output, dict) or "error" in output:
        logger.warning(
            "Agent stage '%s' produced output with errors. Snippet: %s",
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
