"""
Pydantic request/response models for the FastAPI endpoints.
"""
from pydantic import BaseModel, Field
from typing import Any


class PipelineRunRequest(BaseModel):
    feedback_text: str = Field(
        ...,
        min_length=10,
        max_length=50000,
        description="Raw customer feedback text. Separate multiple items with newlines.",
    )
    source: str = Field(default="manual", description="Source of feedback")


class PipelineRunResponse(BaseModel):
    run_id: str
    status: str
    created_at: str
    message: str


class PipelineResultResponse(BaseModel):
    run_id: str
    status: str
    created_at: str
    input_source: str
    analysis: dict[str, Any] | None = None
    prioritization: dict[str, Any] | None = None
    planning: dict[str, Any] | None = None
    duration_ms: int | None = None
    error_message: str | None = None


class PipelineListItem(BaseModel):
    run_id: str
    status: str
    created_at: str
    input_source: str
    duration_ms: int | None = None


class FeedbackUploadResponse(BaseModel):
    run_id: str
    items_ingested: int
    status: str
    message: str


class EvaluationRequest(BaseModel):
    test_subset: list[str] | None = Field(
        default=None,
        description="Optional list of test case IDs to run. Runs all if null.",
    )


class EvaluationResponse(BaseModel):
    eval_id: str
    status: str
    test_cases_total: int
    test_cases_passed: int
    analysis_score: float | None = None
    prioritization_score: float | None = None
    planning_score: float | None = None
    overall_score: float | None = None
    details: list[dict[str, Any]] = []


class HealthResponse(BaseModel):
    status: str
    version: str
    agents: list[str]


class FeedbackItemResponse(BaseModel):
    """Persisted feedback item from a pipeline run."""
    id: str
    pipeline_run_id: str
    raw_text: str
    category: str | None = None
    sentiment: str | None = None
    sentiment_score: float | None = None
    entities: list[Any] = []
    severity: str | None = None
    rice_score: float | None = None
    priority_rank: int | None = None
    created_at: str


class EngineeringTaskResponse(BaseModel):
    """Persisted engineering task generated from a pipeline run."""
    id: str
    pipeline_run_id: str
    feedback_item_id: str | None = None
    title: str
    description: str | None = None
    technical_approach: str | None = None
    effort_estimate: str | None = None
    priority: str | None = None
    acceptance_criteria: list[str] = []


class AnalyticsSummaryResponse(BaseModel):
    """Aggregate analytics across all pipeline runs."""
    total_runs: int
    completed_runs: int
    failed_runs: int
    running_runs: int
    total_feedback_items: int
    total_engineering_tasks: int
    avg_duration_ms: float | None = None
    top_categories: list[dict[str, Any]] = []


class GatewayKeyStats(BaseModel):
    """Per-key metrics for a single LLM Gateway provider."""
    key_id: str
    provider: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    rate_limited_requests: int
    fallback_requests: int
    success_rate: float
    avg_latency_ms: float
    is_rate_limited: bool
    rate_limited_until: str | None = None
    last_error: str | None = None


class GatewayStatsResponse(BaseModel):
    """Aggregate LLM Gateway metrics — all providers and keys combined."""
    total_providers: int
    active_providers: int
    aggregate_requests: int
    aggregate_errors: int
    aggregate_success_rate: float
    providers: list[GatewayKeyStats]
