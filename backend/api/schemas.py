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
