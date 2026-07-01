"""
MCP client wrapper for use within the FastAPI backend.

Provides a clean Python interface to call the MCP server's tools.
For MVP: direct function calls (same process).
For production: swap to mcp.client.stdio transport.
"""
import json
from typing import Any


class MCPFeedbackClient:
    """Client that calls the productops-feedback MCP server tools."""

    async def ingest_csv(self, csv_content: str) -> dict:
        """Ingest CSV feedback via MCP tool."""
        from backend.mcp.server import ingest_csv_feedback
        result = ingest_csv_feedback(csv_content=csv_content)
        return json.loads(result) if isinstance(result, str) else result

    async def ingest_json(self, json_content: str | list | dict) -> dict:
        """Ingest JSON feedback via MCP tool."""
        from backend.mcp.server import ingest_json_feedback
        content = json_content if isinstance(json_content, str) else json.dumps(json_content)
        result = ingest_json_feedback(json_content=content)
        return json.loads(result) if isinstance(result, str) else result

    async def search(self, query: str, limit: int = 10) -> dict:
        """Search ingested feedback via MCP tool."""
        from backend.mcp.server import search_feedback
        result = search_feedback(query=query, limit=limit)
        return json.loads(result) if isinstance(result, str) else result

    async def get_stats(self) -> dict:
        """Get feedback statistics via MCP tool."""
        from backend.mcp.server import get_feedback_stats
        result = get_feedback_stats()
        return json.loads(result) if isinstance(result, str) else result

    async def store_analysis(self, feedback_id: str, analysis: dict) -> dict:
        """Store analysis result via MCP tool."""
        from backend.mcp.server import store_analysis_result
        result = store_analysis_result(
            feedback_id=feedback_id,
            analysis_json=json.dumps(analysis),
        )
        return json.loads(result) if isinstance(result, str) else result


# Singleton instance
mcp_client = MCPFeedbackClient()
