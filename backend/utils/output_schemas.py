"""
Pydantic v2 schemas for validating agent output structures.

These schemas describe the expected JSON contract for each pipeline stage.
They are used for NON-BLOCKING validation — drift is logged as a warning,
never raised as an exception, to preserve demo stability.

All models use:
    model_config = {"extra": "allow"}
so that additional fields from the LLM never cause validation failures.
All non-identity fields are Optional to tolerate partial outputs.
"""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel


# ─── Stage 1: Feedback Analyzer ──────────────────────────────────────────────

class AnalysisOutput(BaseModel):
    """Expected JSON output for the feedback_analyzer agent."""

    model_config = {"extra": "allow"}

    feedback_id: str
    raw_text: str
    category: str
    category_confidence: float | None = None
    sentiment: str
    sentiment_score: float | None = None
    entities: list[Any] = []
    platforms: list[Any] = []
    severity: str
    summary: str


# ─── Stage 2: Business Prioritizer ───────────────────────────────────────────

class PrioritizedItem(BaseModel):
    model_config = {"extra": "allow"}

    feedback_id: str
    rice_score: float | None = None
    reach: float | None = None
    impact: float | None = None
    confidence: float | None = None
    effort: float | None = None
    urgency: str
    business_impact: str | None = None
    revenue_risk: float | None = None
    retention_risk: float | None = None
    business_justification: str | None = None
    recommended_action: str | None = None


class PrioritizationOutput(BaseModel):
    """Expected JSON output for the business_prioritizer agent."""

    model_config = {"extra": "allow"}

    prioritized_items: list[PrioritizedItem] = []
    priority_ranking: list[str] = []
    ranking_rationale: str | None = None


# ─── Stage 3: Engineering Planner ────────────────────────────────────────────

class EngineeringTask(BaseModel):
    model_config = {"extra": "allow"}

    task_id: str
    feedback_id: str | None = None
    title: str
    description: str | None = None
    technical_approach: str | None = None
    effort_estimate: str | None = None
    story_points: int | None = None
    priority: str | None = None
    acceptance_criteria: list[str] = []


class PlanningOutput(BaseModel):
    """Expected JSON output for the engineering_planner agent."""

    model_config = {"extra": "allow"}

    tasks: list[EngineeringTask] = []
    release_notes: str | None = None
    release_summary: str | None = None
    total_story_points: int | None = None
    sprint_recommendation: str | None = None
