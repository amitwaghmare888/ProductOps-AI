"""
FastAPI routes for the ProductOps AI backend.

Endpoints:
- GET  /health                     — Health check
- POST /pipeline                   — Start a pipeline run
- GET  /pipeline                   — List recent runs
- GET  /pipeline/{run_id}          — Get pipeline result
- GET  /pipeline/{run_id}/items    — Persisted feedback items for a run
- GET  /pipeline/{run_id}/tasks    — Persisted engineering tasks for a run
- POST /feedback/upload            — Upload CSV/JSON feedback file
- POST /evaluate                   — Run evaluation framework
- GET  /evaluate                   — List past evaluations
- GET  /memory/recent              — Get recent agent memories
- GET  /mcp/stats                  — Get MCP feedback stats
- GET  /analytics/summary          — Aggregate analytics
- GET  /gateway/stats              — [v0.4.1] LLM Gateway metrics
"""
import asyncio
import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import (
    get_db,
    PipelineRun,
    FeedbackItem,
    EngineeringTask,
    EvaluationRun as EvaluationRunModel,
)
from backend.api.schemas import (
    PipelineRunRequest,
    PipelineRunResponse,
    PipelineResultResponse,
    PipelineListItem,
    FeedbackUploadResponse,
    EvaluationRequest,
    EvaluationResponse,
    HealthResponse,
    FeedbackItemResponse,
    EngineeringTaskResponse,
    AnalyticsSummaryResponse,
    GatewayStatsResponse,
)
from backend.agents.orchestrator import run_pipeline
from backend.mcp.client import mcp_client
from backend.memory.memory_service import memory_service
from backend.gateway import llm_gateway

router = APIRouter()


# ─── Health ──────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="0.1.0",
        agents=["feedback_analyzer", "business_prioritizer", "engineering_planner"],
    )


# ─── Pipeline ────────────────────────────────────────────────────────────────

@router.post("/pipeline", response_model=PipelineRunResponse, status_code=202)
async def start_pipeline(
    request: PipelineRunRequest,
    db: AsyncSession = Depends(get_db),
):
    """Start a new pipeline run. Returns immediately; poll GET /pipeline/{id} for results."""
    run_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    db_run = PipelineRun(
        id=run_id,
        created_at=now,
        status="running",
        input_source=request.source,
        raw_input=request.feedback_text,
    )
    db.add(db_run)
    await db.commit()

    # Fire and forget — run pipeline in background
    asyncio.create_task(_run_pipeline_bg(run_id, request.feedback_text))

    return PipelineRunResponse(
        run_id=run_id,
        status="running",
        created_at=now.isoformat(),
        message="Pipeline started. Poll GET /pipeline/{run_id} for results.",
    )


async def _run_pipeline_bg(run_id: str, feedback_text: str):
    """Background task: execute pipeline and persist results."""
    from backend.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            result = await run_pipeline(feedback_text, run_id=run_id)

            # Save to long-term memory
            try:
                await memory_service.store_pipeline_result(run_id, result)
            except Exception:
                pass  # Memory storage is best-effort

            # Update DB
            stmt = (
                PipelineRun.__table__.update()
                .where(PipelineRun.id == run_id)
                .values(
                    status="completed",
                    analysis_output=json.dumps(result.get("analysis", {})),
                    prioritization_output=json.dumps(result.get("prioritization", {})),
                    planning_output=json.dumps(result.get("planning", {})),
                    duration_ms=result.get("duration_ms"),
                    session_id=result.get("session_id"),
                )
            )
            await db.execute(stmt)
            await db.commit()

            # Persist structured outputs to relational tables (best-effort)
            try:
                await _persist_structured_outputs(db, run_id, result)
            except Exception:
                pass  # Non-fatal: pipeline_runs record is already saved

        except Exception as e:
            stmt = (
                PipelineRun.__table__.update()
                .where(PipelineRun.id == run_id)
                .values(status="failed", error_message=str(e))
            )
            await db.execute(stmt)
            await db.commit()


async def _persist_structured_outputs(
    db: AsyncSession,
    run_id: str,
    result: dict,
) -> None:
    """
    Persist structured pipeline outputs to feedback_items and engineering_tasks.

    IDs use a run_id prefix (first 8 chars) to guarantee global uniqueness
    across runs, while preserving the original feedback_id linkage between
    items and tasks.

    Silently skips if agent outputs are unstructured (JSON parse failed /
    LLM drift). This is called from _run_pipeline_bg as a best-effort step
    after the main pipeline_runs record is already committed.

    Args:
        db: Active async database session.
        run_id: Pipeline run ID (used as ID namespace prefix).
        result: Full pipeline result dict from run_pipeline().
    """
    analysis = result.get("analysis", {})
    prioritization = result.get("prioritization", {})
    planning = result.get("planning", {})
    prefix = run_id[:8]

    # Skip if the analysis stage output is unstructured (parse failure)
    if not isinstance(analysis, dict) or "raw_output" in analysis:
        return

    # Build RICE/priority lookup keyed by the LLM-assigned feedback_id
    priority_lookup: dict[str, dict] = {}
    if isinstance(prioritization, dict):
        for rank, item in enumerate(
            prioritization.get("prioritized_items", []), start=1
        ):
            fid = str(item.get("feedback_id", ""))
            if fid:
                priority_lookup[fid] = {
                    "rice_score": item.get("rice_score"),
                    "priority_rank": rank,
                }

    # ── FeedbackItem ─────────────────────────────────────────────────────────
    original_fid = str(
        analysis.get("feedback_id", f"fb_{uuid.uuid4().hex[:8]}")
    )
    db_fid = f"{prefix}_{original_fid}"
    pdata = priority_lookup.get(original_fid, {})
    entities_raw = analysis.get("entities", [])

    db.add(FeedbackItem(
        id=db_fid,
        pipeline_run_id=run_id,
        raw_text=str(analysis.get("raw_text", ""))[:5000],
        category=analysis.get("category"),
        sentiment=analysis.get("sentiment"),
        sentiment_score=(
            float(analysis["sentiment_score"])
            if analysis.get("sentiment_score") is not None
            else None
        ),
        entities=json.dumps(entities_raw) if entities_raw else None,
        severity=analysis.get("severity"),
        rice_score=(
            float(pdata["rice_score"])
            if pdata.get("rice_score") is not None
            else None
        ),
        priority_rank=pdata.get("priority_rank"),
    ))

    # ── EngineeringTasks ─────────────────────────────────────────────────────
    if isinstance(planning, dict) and "tasks" in planning:
        for task in planning.get("tasks", []):
            raw_tid = str(task.get("task_id", f"task_{uuid.uuid4().hex[:8]}"))
            task_fid = str(task.get("feedback_id", ""))
            acceptance = task.get("acceptance_criteria", [])

            db.add(EngineeringTask(
                id=f"{prefix}_{raw_tid}",
                pipeline_run_id=run_id,
                # Map original feedback_id to the namespaced DB FeedbackItem id
                feedback_item_id=f"{prefix}_{task_fid}" if task_fid else db_fid,
                title=str(task.get("title", "Untitled Task"))[:500],
                description=task.get("description"),
                technical_approach=task.get("technical_approach"),
                effort_estimate=task.get("effort_estimate"),
                priority=task.get("priority"),
                acceptance_criteria=json.dumps(acceptance) if acceptance else None,
            ))

    await db.commit()


@router.get("/pipeline", response_model=list[PipelineListItem])
async def list_pipeline_runs(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PipelineRun).order_by(desc(PipelineRun.created_at)).limit(limit)
    )
    runs = result.scalars().all()
    return [
        PipelineListItem(
            run_id=r.id,
            status=r.status,
            created_at=r.created_at.isoformat() if r.created_at else "",
            input_source=r.input_source or "manual",
            duration_ms=r.duration_ms,
        )
        for r in runs
    ]


@router.get("/pipeline/{run_id}", response_model=PipelineResultResponse)
async def get_pipeline_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PipelineRun).where(PipelineRun.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Pipeline run not found")

    def _parse(val):
        if val is None:
            return None
        try:
            return json.loads(val)
        except Exception:
            return {"raw": val}

    return PipelineResultResponse(
        run_id=run.id,
        status=run.status,
        created_at=run.created_at.isoformat() if run.created_at else "",
        input_source=run.input_source or "manual",
        analysis=_parse(run.analysis_output),
        prioritization=_parse(run.prioritization_output),
        planning=_parse(run.planning_output),
        duration_ms=run.duration_ms,
        error_message=run.error_message,
    )


# ─── Feedback Upload ─────────────────────────────────────────────────────────

@router.post("/feedback/upload", response_model=FeedbackUploadResponse)
async def upload_feedback(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a CSV or JSON file and start a pipeline run."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    content_str = content.decode("utf-8")

    # Ingest via MCP
    if file.filename.endswith(".csv"):
        result = await mcp_client.ingest_csv(content_str)
    elif file.filename.endswith(".json"):
        result = await mcp_client.ingest_json(content_str)
    else:
        raise HTTPException(status_code=400, detail="Only .csv and .json supported")

    items = result.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="No valid feedback in file")

    # Combine top 10 items for pipeline
    combined = "\n\n".join(
        f"[Feedback {i+1}]: {item['text']}"
        for i, item in enumerate(items[:10])
    )

    run_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    db_run = PipelineRun(
        id=run_id,
        created_at=now,
        status="running",
        input_source=file.filename,
        raw_input=combined,
    )
    db.add(db_run)
    await db.commit()

    asyncio.create_task(_run_pipeline_bg(run_id, combined))

    return FeedbackUploadResponse(
        run_id=run_id,
        items_ingested=len(items),
        status="running",
        message=f"Ingested {len(items)} items. Pipeline started.",
    )


# ─── Evaluation ──────────────────────────────────────────────────────────────

@router.post("/evaluate", response_model=EvaluationResponse)
async def run_evaluation_endpoint(
    request: EvaluationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Run the evaluation framework. This can take several minutes."""
    from backend.evaluation.eval_runner import run_evaluation

    eval_result = await run_evaluation(test_subset=request.test_subset)

    eval_id = str(uuid.uuid4())
    db_eval = EvaluationRunModel(
        id=eval_id,
        created_at=datetime.now(timezone.utc),
        test_cases_total=eval_result["test_cases_total"],
        test_cases_passed=eval_result["test_cases_passed"],
        analysis_score=eval_result.get("analysis_score"),
        prioritization_score=eval_result.get("prioritization_score"),
        planning_score=eval_result.get("planning_score"),
        overall_score=eval_result.get("overall_score"),
        details=json.dumps(eval_result.get("details", [])),
    )
    db.add(db_eval)
    await db.commit()

    return EvaluationResponse(
        eval_id=eval_id,
        status="completed",
        test_cases_total=eval_result["test_cases_total"],
        test_cases_passed=eval_result["test_cases_passed"],
        analysis_score=eval_result.get("analysis_score"),
        prioritization_score=eval_result.get("prioritization_score"),
        planning_score=eval_result.get("planning_score"),
        overall_score=eval_result.get("overall_score"),
        details=eval_result.get("details", []),
    )


@router.get("/evaluate")
async def list_evaluations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EvaluationRunModel).order_by(desc(EvaluationRunModel.created_at)).limit(10)
    )
    runs = result.scalars().all()
    return [
        {
            "eval_id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "overall_score": r.overall_score,
            "test_cases_total": r.test_cases_total,
            "test_cases_passed": r.test_cases_passed,
            "analysis_score": r.analysis_score,
            "prioritization_score": r.prioritization_score,
            "planning_score": r.planning_score,
        }
        for r in runs
    ]


# ─── Memory ──────────────────────────────────────────────────────────────────

@router.get("/memory/recent")
async def get_recent_memories():
    analyses = await memory_service.get_recent_analyses()
    priorities = await memory_service.get_recent_priorities()
    return [
        {"agent": "feedback_analyzer", "type": "analysis_result", "entries": analyses},
        {"agent": "business_prioritizer", "type": "prioritization_result", "entries": priorities},
    ]


# ─── MCP Stats ───────────────────────────────────────────────────────────────

@router.get("/mcp/stats")
async def get_mcp_stats():
    return await mcp_client.get_stats()


# ─── LLM Gateway ──────────────────────────────────────────────────────────

@router.get("/gateway/stats", response_model=GatewayStatsResponse)
async def get_gateway_stats():
    """
    [v0.4.1] LLM Gateway metrics for all configured API keys.

    Returns per-key statistics including request counts, error rates,
    average latency, circuit-breaker status, and model fallback usage.
    Useful for monitoring API key health and load distribution across
    a multi-key Gemini pool.
    """
    raw = llm_gateway.get_stats()
    return GatewayStatsResponse(
        total_providers=raw["total_providers"],
        active_providers=raw["active_providers"],
        aggregate_requests=raw["aggregate_requests"],
        aggregate_errors=raw["aggregate_errors"],
        aggregate_success_rate=raw["aggregate_success_rate"],
        providers=raw["providers"],
    )

# ─── Pipeline Items & Tasks ───────────────────────────────────────────────────

@router.get("/pipeline/{run_id}/items", response_model=list[FeedbackItemResponse])
async def get_pipeline_items(run_id: str, db: AsyncSession = Depends(get_db)):
    """
    Return all feedback items persisted for a pipeline run.
    Populated after a completed run via _persist_structured_outputs.
    """
    result = await db.execute(
        select(FeedbackItem).where(FeedbackItem.pipeline_run_id == run_id)
    )
    items = result.scalars().all()
    return [
        FeedbackItemResponse(
            id=i.id,
            pipeline_run_id=i.pipeline_run_id,
            raw_text=i.raw_text,
            category=i.category,
            sentiment=i.sentiment,
            sentiment_score=i.sentiment_score,
            entities=json.loads(i.entities) if i.entities else [],
            severity=i.severity,
            rice_score=i.rice_score,
            priority_rank=i.priority_rank,
            created_at=i.created_at.isoformat() if i.created_at else "",
        )
        for i in items
    ]


@router.get("/pipeline/{run_id}/tasks", response_model=list[EngineeringTaskResponse])
async def get_pipeline_tasks(run_id: str, db: AsyncSession = Depends(get_db)):
    """
    Return all engineering tasks persisted for a pipeline run.
    Populated after a completed run via _persist_structured_outputs.
    """
    result = await db.execute(
        select(EngineeringTask).where(EngineeringTask.pipeline_run_id == run_id)
    )
    tasks = result.scalars().all()
    return [
        EngineeringTaskResponse(
            id=t.id,
            pipeline_run_id=t.pipeline_run_id,
            feedback_item_id=t.feedback_item_id,
            title=t.title,
            description=t.description,
            technical_approach=t.technical_approach,
            effort_estimate=t.effort_estimate,
            priority=t.priority,
            acceptance_criteria=json.loads(t.acceptance_criteria)
            if t.acceptance_criteria
            else [],
        )
        for t in tasks
    ]


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """
    Aggregate analytics across all pipeline runs.
    Returns run counts by status, item/task totals, avg duration, and
    the top 5 feedback categories seen across all runs.
    """
    total = (await db.execute(
        select(func.count()).select_from(PipelineRun)
    )).scalar_one()
    completed = (await db.execute(
        select(func.count()).select_from(PipelineRun).where(PipelineRun.status == "completed")
    )).scalar_one()
    failed = (await db.execute(
        select(func.count()).select_from(PipelineRun).where(PipelineRun.status == "failed")
    )).scalar_one()
    running = (await db.execute(
        select(func.count()).select_from(PipelineRun).where(PipelineRun.status == "running")
    )).scalar_one()

    total_items = (await db.execute(
        select(func.count()).select_from(FeedbackItem)
    )).scalar_one()
    total_tasks = (await db.execute(
        select(func.count()).select_from(EngineeringTask)
    )).scalar_one()

    avg_dur = (await db.execute(
        select(func.avg(PipelineRun.duration_ms)).where(PipelineRun.status == "completed")
    )).scalar_one()

    # Top 5 feedback categories across all persisted items
    cat_rows = (await db.execute(
        select(FeedbackItem.category, func.count().label("count"))
        .where(FeedbackItem.category.is_not(None))
        .group_by(FeedbackItem.category)
        .order_by(desc("count"))
        .limit(5)
    )).all()
    top_categories = [{"category": r.category, "count": r.count} for r in cat_rows]

    return AnalyticsSummaryResponse(
        total_runs=total,
        completed_runs=completed,
        failed_runs=failed,
        running_runs=running,
        total_feedback_items=total_items,
        total_engineering_tasks=total_tasks,
        avg_duration_ms=float(avg_dur) if avg_dur is not None else None,
        top_categories=top_categories,
    )
