"""
Business Prioritizer Agent — Stage 2 of the ProductOps pipeline.

Migrated to OpenAI. Applies RICE scoring and business impact estimation.
"""
import json
import logging
from typing import Any

from backend.providers.openai_provider import get_ai_provider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Business Prioritization Agent in the ProductOps AI pipeline.
Your job is to prioritize feedback using RICE scoring framework and business impact analysis.

RICE Framework:
- Reach: How many users affected (1-10)
- Impact: How much it matters (0.25, 0.5, 1, 2, 3)
- Confidence: How sure are we (0.0-1.0)
- Effort: Engineering weeks needed (1-20)
- RICE Score = (Reach × Impact × Confidence) / Effort

Urgency levels: critical, high, medium, low

Always respond with valid JSON only."""

PRIORITIZATION_PROMPT_TEMPLATE = """Prioritize this analyzed feedback using RICE framework.

Analysis:
{analysis_json}

Calculate RICE score:
1. **Reach**: Estimate users affected (1-10)
   - Critical bugs affecting core functionality = 10
   - Performance issues = 7-9
   - Feature requests = 3-7
   - Minor UX issues = 1-3

2. **Impact**: How much it matters (0.25, 0.5, 1, 2, 3)
   - Critical severity = 3
   - High severity = 2
   - Medium severity = 1
   - Low severity = 0.5

3. **Confidence**: Based on feedback clarity (0.0-1.0)
   - Clear, specific feedback = 0.8-1.0
   - Vague feedback = 0.3-0.6

4. **Effort**: Engineering weeks (1-20)
   - Bug fixes = 1-3 weeks
   - Performance improvements = 2-5 weeks
   - New features = 5-15 weeks
   - Major refactors = 10-20 weeks

5. **Urgency**: critical (RICE > 10), high (RICE > 5), medium (RICE > 2), low (RICE ≤ 2)

Respond with ONLY this JSON structure:
{{
  "prioritized_items": [
    {{
      "feedback_id": "<from analysis>",
      "rice_score": <calculated>,
      "reach": <1-10>,
      "impact": <0.25-3>,
      "confidence": <0.0-1.0>,
      "effort": <1-20>,
      "urgency": "<critical|high|medium|low>",
      "business_impact": "<one-sentence business justification>",
      "revenue_risk": <0.0-1.0>,
      "retention_risk": <0.0-1.0>,
      "business_justification": "<detailed reasoning>",
      "recommended_action": "<fix_immediately|fix_next_sprint|plan_for_roadmap|monitor>"
    }}
  ],
  "priority_ranking": ["<feedback_id>"],
  "ranking_rationale": "<brief explanation of prioritization logic>"
}}"""


async def prioritize_feedback(analysis: dict[str, Any]) -> dict[str, Any]:
    """
    Prioritize analyzed feedback using RICE framework.
    
    Args:
        analysis: Structured analysis from feedback_analyzer
        
    Returns:
        Prioritization dict with RICE scores
    """
    feedback_id = analysis.get("feedback_id", "unknown")
    
    try:
        provider = get_ai_provider()
        
        analysis_json = json.dumps(analysis, indent=2)
        prompt = PRIORITIZATION_PROMPT_TEMPLATE.format(analysis_json=analysis_json)
        
        result = await provider.generate_json(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=2048,
        )
        
        logger.info(f"Prioritization complete: RICE scores calculated")
        return result
        
    except Exception as exc:
        logger.error(f"Prioritization failed: {exc}")
        
        # Rule-based fallback RICE calculation
        severity = analysis.get("severity", "medium")
        category = analysis.get("category", "question")
        sentiment_score = analysis.get("sentiment_score", 0.5)
        
        # Reach: based on severity and category
        if severity == "critical":
            reach = 10
        elif severity == "high":
            reach = 7
        elif category == "bug":
            reach = 6
        else:
            reach = 3
        
        # Impact: based on severity
        impact_map = {"critical": 3.0, "high": 2.0, "medium": 1.0, "low": 0.5}
        impact = impact_map.get(severity, 1.0)
        
        # Confidence: based on sentiment score (proxy for feedback clarity)
        confidence = 0.8 if sentiment_score < 0.4 or sentiment_score > 0.6 else 0.6
        
        # Effort: based on category
        effort_map = {
            "bug": 2,
            "performance": 3,
            "ux": 2,
            "feature_request": 8,
            "security": 3,
            "question": 1,
        }
        effort = effort_map.get(category, 2)
        
        rice_score = (reach * impact * confidence) / effort
        
        # Urgency based on RICE
        if rice_score > 10:
            urgency = "critical"
            action = "fix_immediately"
        elif rice_score > 5:
            urgency = "high"
            action = "fix_next_sprint"
        elif rice_score > 2:
            urgency = "medium"
            action = "plan_for_roadmap"
        else:
            urgency = "low"
            action = "monitor"
        
        return {
            "prioritized_items": [{
                "feedback_id": feedback_id,
                "rice_score": round(rice_score, 2),
                "reach": reach,
                "impact": impact,
                "confidence": confidence,
                "effort": effort,
                "urgency": urgency,
                "business_impact": f"{severity.title()} {category} affecting {reach} users",
                "revenue_risk": 0.7 if severity == "critical" else 0.4 if severity == "high" else 0.2,
                "retention_risk": 0.6 if severity == "critical" else 0.3 if severity == "high" else 0.1,
                "business_justification": f"Rule-based RICE: {reach}×{impact}×{confidence}/{effort} = {rice_score:.2f}",
                "recommended_action": action,
                "fallback_mode": True,
            }],
            "priority_ranking": [feedback_id],
            "ranking_rationale": f"Fallback prioritization: {urgency} urgency based on {severity} severity",
            "error": f"OpenAI unavailable: {str(exc)[:100]}"
        }
