"""
Long-term memory service for ProductOps agents.

Stores and retrieves past analysis/prioritization results in SQLite
so agents can calibrate against historical decisions.
"""
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from backend.database import AgentMemory, AsyncSessionLocal


class MemoryService:
    """Persistent memory backed by SQLite for cross-run agent context."""

    async def store(
        self,
        agent_name: str,
        memory_type: str,
        content: dict,
        relevance_score: float = 1.0,
    ) -> str:
        """Store a memory entry. Returns the generated memory ID."""
        memory_id = f"mem_{uuid.uuid4().hex[:10]}"
        async with AsyncSessionLocal() as db:
            entry = AgentMemory(
                id=memory_id,
                agent_name=agent_name,
                memory_type=memory_type,
                content=json.dumps(content),
                relevance_score=relevance_score,
                created_at=datetime.now(timezone.utc),
            )
            db.add(entry)
            await db.commit()
        return memory_id

    async def retrieve(
        self,
        agent_name: str,
        memory_type: str,
        limit: int = 5,
    ) -> list[dict]:
        """Retrieve recent memories for a specific agent and type."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(AgentMemory)
                .where(
                    AgentMemory.agent_name == agent_name,
                    AgentMemory.memory_type == memory_type,
                )
                .order_by(AgentMemory.created_at.desc())
                .limit(limit)
            )
            rows = result.scalars().all()

        memories = []
        for row in rows:
            try:
                content = json.loads(row.content)
            except json.JSONDecodeError:
                content = {"raw": row.content}
            memories.append({
                "id": row.id,
                "content": content,
                "relevance_score": row.relevance_score,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            })
        return memories

    async def store_pipeline_result(self, run_id: str, pipeline_output: dict) -> None:
        """Commit a full pipeline result to long-term memory (all 3 stages)."""
        analysis = pipeline_output.get("analysis", {})
        prioritization = pipeline_output.get("prioritization", {})
        planning = pipeline_output.get("planning", {})

        if analysis and not isinstance(analysis, str):
            await self.store(
                agent_name="feedback_analyzer",
                memory_type="analysis_result",
                content={"run_id": run_id, "result": analysis},
            )
        if prioritization and not isinstance(prioritization, str):
            await self.store(
                agent_name="business_prioritizer",
                memory_type="prioritization_result",
                content={"run_id": run_id, "result": prioritization},
            )
        if planning and not isinstance(planning, str):
            await self.store(
                agent_name="engineering_planner",
                memory_type="planning_result",
                content={"run_id": run_id, "result": planning},
            )

    async def get_recent_analyses(self, limit: int = 3) -> list[dict]:
        """Shortcut: get recent analysis memories."""
        return await self.retrieve("feedback_analyzer", "analysis_result", limit)

    async def get_recent_priorities(self, limit: int = 3) -> list[dict]:
        """Shortcut: get recent prioritization memories."""
        return await self.retrieve("business_prioritizer", "prioritization_result", limit)


# Singleton
memory_service = MemoryService()
