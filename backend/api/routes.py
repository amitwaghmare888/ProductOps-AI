"""
FastAPI routes for the ProductOps AI backend.

Endpoints:
- GET  /health              — Health check
- POST /pipeline            — Start a pipeline run
- GET  /pipeline            — List recent runs
- GET  /pipeline/{run_id}   — Get pipeline result
- POST /feedback/upload     — Upload CSV/JSON feedback file
- POST /evaluate            — Run evaluation framework
- GET  /evaluate            — List past evaluations
- GET  /memory/recent       — Get recent agent memories
- GET  /mcp/stats           — Get MCP feedback stats
"""
import asyncio
import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import (
    get_db,
    PipelineRun,
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
)
from backend.agents.orchestrator import run_pipeline
from backend.mcp.client import mcp_client
from backend.memory.memory_service import memory_service

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

        except Exception as e:
            stmt = (
                PipelineRun.__table__.update()
                .where(PipelineRun.id == run_id)
                .values(status="failed", error_message=str(e))
            )
            await db.execute(stmt)
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
