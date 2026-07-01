"""
ProductOps Feedback MCP Server

An MCP (Model Context Protocol) server that provides tools for ingesting,
searching, and managing customer feedback data. This demonstrates MCP
integration in the ProductOps AI pipeline.

Run standalone:  python -m backend.mcp.server
Test with:       npx @modelcontextprotocol/inspector python -m backend.mcp.server
"""
import json
import csv
import io
import uuid
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("productops-feedback-server")

# In-memory feedback store (shared across tool calls within a session)
_feedback_store: list[dict] = []


@mcp.tool()
def ingest_csv_feedback(csv_content: str) -> str:
    """
    Parse CSV feedback data into structured feedback items.

    The CSV should have at least a 'text' or 'feedback' or 'message' column.
    Optional columns: 'source', 'date', 'user_id'.

    Args:
        csv_content: The raw CSV string content to parse.

    Returns:
        JSON string with 'items' (list of feedback objects) and 'count'.
    """
    reader = csv.DictReader(io.StringIO(csv_content.strip()))
    items = []

    for row in reader:
        text = (
            row.get("text")
            or row.get("feedback")
            or row.get("message", "")
        )
        if not text.strip():
            continue

        item = {
            "id": f"fb_{uuid.uuid4().hex[:8]}",
            "text": text.strip(),
            "source": row.get("source", "csv_upload"),
            "date": row.get("date", datetime.now(timezone.utc).isoformat()),
            "user_id": row.get("user_id", "anonymous"),
        }
        items.append(item)
        _feedback_store.append(item)

    return json.dumps({"items": items, "count": len(items)})


@mcp.tool()
def ingest_json_feedback(json_content: str) -> str:
    """
    Parse JSON feedback data. Accepts a JSON array of objects or a single object.

    Each object should have a 'text' field. Optional: 'source', 'date', 'user_id'.

    Args:
        json_content: JSON string containing feedback data (array or single object).

    Returns:
        JSON string with 'items' (list of feedback objects) and 'count'.
    """
    data = json.loads(json_content)
    if isinstance(data, dict):
        data = [data]

    items = []
    for entry in data:
        text = (
            entry.get("text")
            or entry.get("feedback")
            or entry.get("message", "")
        )
        if not text.strip():
            continue

        item = {
            "id": f"fb_{uuid.uuid4().hex[:8]}",
            "text": text.strip(),
            "source": entry.get("source", "json_api"),
            "date": entry.get("date", datetime.now(timezone.utc).isoformat()),
            "user_id": entry.get("user_id", "anonymous"),
        }
        items.append(item)
        _feedback_store.append(item)

    return json.dumps({"items": items, "count": len(items)})


@mcp.tool()
def search_feedback(query: str, limit: int = 10) -> str:
    """
    Search ingested feedback items by keyword match.

    Args:
        query: Search keyword or phrase to match against feedback text.
        limit: Maximum number of results to return (default 10).

    Returns:
        JSON string with 'results' (matching items) and 'total_matches'.
    """
    query_lower = query.lower()
    matches = [
        item
        for item in _feedback_store
        if query_lower in item["text"].lower()
    ]

    return json.dumps({
        "results": matches[:limit],
        "total_matches": len(matches),
    })


@mcp.tool()
def get_feedback_stats() -> str:
    """
    Return aggregate statistics about all ingested feedback.

    Returns:
        JSON string with 'total' count, 'by_source' breakdown, and 'date_range'.
    """
    if not _feedback_store:
        return json.dumps({"total": 0, "by_source": {}, "date_range": None})

    by_source: dict[str, int] = {}
    for item in _feedback_store:
        src = item.get("source", "unknown")
        by_source[src] = by_source.get(src, 0) + 1

    dates = [item["date"] for item in _feedback_store if item.get("date")]

    return json.dumps({
        "total": len(_feedback_store),
        "by_source": by_source,
        "date_range": {
            "earliest": min(dates) if dates else None,
            "latest": max(dates) if dates else None,
        },
    })


@mcp.tool()
def store_analysis_result(feedback_id: str, analysis_json: str) -> str:
    """
    Store an analysis result for a specific feedback item.

    Args:
        feedback_id: The ID of the feedback item that was analyzed.
        analysis_json: JSON string containing the analysis result.

    Returns:
        JSON string with 'success' boolean and 'stored_id'.
    """
    try:
        parsed = json.loads(analysis_json)
        for item in _feedback_store:
            if item["id"] == feedback_id:
                item["analysis"] = parsed
                return json.dumps({"success": True, "stored_id": feedback_id})

        # Item not found in memory, still accept
        return json.dumps({"success": True, "stored_id": feedback_id, "note": "item_not_in_memory"})
    except json.JSONDecodeError as e:
        return json.dumps({"success": False, "error": str(e), "stored_id": feedback_id})


# Entry point for running as MCP server (stdio transport)
if __name__ == "__main__":
    mcp.run(transport="stdio")
