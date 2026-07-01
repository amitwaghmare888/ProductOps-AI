"""
Evaluation runner — orchestrates test execution and scoring.

Runs each test case through the full pipeline, then scores each stage
using LLM-as-judge. Returns aggregated results.
"""
import asyncio
from typing import Any

from backend.agents.orchestrator import run_pipeline
from backend.evaluation.test_data import TEST_CASES, TestCase
from backend.evaluation.judges import (
    judge_analysis,
    judge_prioritization,
    judge_planning,
)


async def run_single_test(case: TestCase) -> dict[str, Any]:
    """Run one test case through the full pipeline and score each stage."""
    try:
        result = await run_pipeline(case.input)
    except Exception as e:
        return {
            "test_id": case.id,
            "description": case.description,
            "input": case.input[:100],
            "passed": False,
            "error": str(e),
            "analysis_score": 0.0,
            "prioritization_score": 0.0,
            "planning_score": 0.0,
            "overall_score": 0.0,
        }

    analysis = result.get("analysis", {})
    prioritization = result.get("prioritization", {})
    planning = result.get("planning", {})

    # Score each stage with LLM-as-judge
    analysis_scores = judge_analysis(
        input_text=case.input,
        agent_output=analysis,
        expected_category=case.expected_category,
        expected_sentiment=case.expected_sentiment,
        expected_severity=case.expected_severity,
    )

    prioritization_scores = judge_prioritization(
        analysis_output=analysis,
        agent_output=prioritization,
        expected_urgency=case.expected_urgency,
    )

    planning_scores = judge_planning(
        prioritization_output=prioritization,
        agent_output=planning,
    )

    analysis_avg = analysis_scores.get("average", 0.0)
    priority_avg = prioritization_scores.get("average", 0.0)
    planning_avg = planning_scores.get("average", 0.0)
    overall = round((analysis_avg + priority_avg + planning_avg) / 3, 2)
    passed = overall >= 3.0  # Pass threshold: 3/5

    return {
        "test_id": case.id,
        "description": case.description,
        "input": case.input[:100],
        "passed": passed,
        "analysis_score": analysis_avg,
        "prioritization_score": priority_avg,
        "planning_score": planning_avg,
        "overall_score": overall,
        "analysis_details": analysis_scores,
        "prioritization_details": prioritization_scores,
        "planning_details": planning_scores,
    }


async def run_evaluation(
    test_subset: list[str] | None = None,
) -> dict[str, Any]:
    """
    Run all (or a subset of) test cases and return aggregated results.

    Args:
        test_subset: Optional list of test case IDs to run. Runs all if None.

    Returns:
        Aggregated evaluation results with per-test details.
    """
    cases = TEST_CASES
    if test_subset:
        cases = [c for c in TEST_CASES if c.id in test_subset]

    if not cases:
        return {
            "test_cases_total": 0,
            "test_cases_passed": 0,
            "analysis_score": 0.0,
            "prioritization_score": 0.0,
            "planning_score": 0.0,
            "overall_score": 0.0,
            "details": [],
        }

    # Run sequentially to respect Gemini rate limits
    details = []
    for case in cases:
        print(f"  Running test {case.id}: {case.description}...")
        detail = await run_single_test(case)
        details.append(detail)
        # Brief pause to avoid rate limiting
        await asyncio.sleep(1)

    # Aggregate
    passed = [d for d in details if d.get("passed")]

    def avg(key):
        vals = [d[key] for d in details if key in d and isinstance(d[key], (int, float))]
        return round(sum(vals) / len(vals), 2) if vals else 0.0

    return {
        "test_cases_total": len(cases),
        "test_cases_passed": len(passed),
        "analysis_score": avg("analysis_score"),
        "prioritization_score": avg("prioritization_score"),
        "planning_score": avg("planning_score"),
        "overall_score": avg("overall_score"),
        "details": details,
    }
