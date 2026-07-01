"""
Business prioritization tools for the Business Prioritizer agent.
Three FunctionTools: RICE score, business impact, ranking.
"""


def calculate_rice_score(
    category: str,
    severity: str,
    sentiment: str,
    sentiment_score: float,
    entity_count: int,
) -> dict:
    """
    Calculate a RICE prioritization score for a feedback item.

    RICE = (Reach * Impact * Confidence) / Effort

    Args:
        category: Feedback category (bug_report|feature_request|pain_point|praise|question).
        severity: Severity level (critical|high|medium|low).
        sentiment: Detected sentiment (positive|negative|neutral|mixed).
        sentiment_score: Sentiment score from 0.0 to 1.0.
        entity_count: Number of product entities extracted from the feedback.

    Returns:
        dict with rice_score, reach, impact, confidence, effort, and urgency.
    """
    reach_map = {
        "bug_report": 4,
        "feature_request": 3,
        "pain_point": 4,
        "praise": 1,
        "question": 2,
    }
    reach = reach_map.get(category, 2)

    impact_map = {"critical": 3, "high": 2, "medium": 1, "low": 1}
    impact = impact_map.get(severity, 1)

    confidence = 0.8 if sentiment in ("negative", "positive") else 0.5
    if severity == "critical":
        confidence = min(confidence + 0.1, 1.0)

    effort_map = {
        "bug_report": 2,
        "feature_request": 4,
        "pain_point": 3,
        "praise": 1,
        "question": 1,
    }
    effort = effort_map.get(category, 3)
    if severity == "critical":
        effort = max(1, effort - 1)

    rice_score = round((reach * impact * confidence) / effort, 2)

    if severity == "critical" or (category == "bug_report" and sentiment_score < 0.3):
        urgency = "critical"
    elif severity == "high" or rice_score > 2.0:
        urgency = "high"
    elif rice_score > 1.0:
        urgency = "medium"
    else:
        urgency = "low"

    return {
        "rice_score": rice_score,
        "reach": reach,
        "impact": impact,
        "confidence": confidence,
        "effort": effort,
        "urgency": urgency,
    }


def estimate_business_impact(
    category: str,
    severity: str,
    entities: list[str],
) -> dict:
    """
    Estimate the business impact of addressing a feedback item.

    Args:
        category: Feedback category.
        severity: Severity level.
        entities: List of affected product entities.

    Returns:
        dict with business_impact (high|medium|low), revenue_risk, retention_risk,
        and justification string.
    """
    revenue_risk = category == "bug_report" and severity in ("critical", "high")
    retention_risk = (
        category in ("pain_point", "bug_report")
        and severity in ("critical", "high", "medium")
    )

    if severity == "critical" or (revenue_risk and retention_risk):
        business_impact = "high"
        justification = (
            f"Critical {category.replace('_', ' ')} affecting core functionality. "
            f"High risk of user churn and revenue impact."
        )
    elif severity == "high" or category == "pain_point":
        business_impact = "medium"
        justification = (
            f"Significant {category.replace('_', ' ')} that degrades user experience. "
            f"Moderate risk to retention."
        )
    else:
        business_impact = "low"
        justification = (
            f"Low-severity {category.replace('_', ' ')}. "
            f"Improvement opportunity but not urgent."
        )

    entity_context = f" Affects: {', '.join(entities[:3])}." if entities else ""

    return {
        "business_impact": business_impact,
        "revenue_risk": revenue_risk,
        "retention_risk": retention_risk,
        "justification": justification + entity_context,
    }


def rank_feedback_items(items_json: str) -> dict:
    """
    Rank a list of scored feedback items by urgency and RICE score.

    Args:
        items_json: JSON string of a list of objects, each with 'id', 'rice_score', 'urgency'.

    Returns:
        dict with 'ranked_ids' (list ordered by priority) and 'ranking_rationale'.
    """
    import json

    try:
        items = json.loads(items_json)
    except (json.JSONDecodeError, TypeError):
        if isinstance(items_json, list):
            items = items_json
        else:
            return {"ranked_ids": [], "ranking_rationale": "Could not parse items."}

    urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}

    def sort_key(item):
        return (
            urgency_order.get(item.get("urgency", "low"), 3),
            -item.get("rice_score", 0),
        )

    sorted_items = sorted(items, key=sort_key)
    ranked_ids = [item["id"] for item in sorted_items if "id" in item]

    rationale_parts = []
    for i, item in enumerate(sorted_items[:5], 1):
        rationale_parts.append(
            f"#{i}: {item.get('id', '?')} "
            f"(RICE={item.get('rice_score', 0)}, urgency={item.get('urgency', '?')})"
        )

    return {
        "ranked_ids": ranked_ids,
        "ranking_rationale": "; ".join(rationale_parts) if rationale_parts else "No items to rank.",
    }
