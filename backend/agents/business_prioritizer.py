"""
Business Prioritizer Agent — Stage 2 of the ProductOps pipeline.

Reads analysis_result from session state (set by Feedback Analyzer).
Applies RICE scoring and business impact estimation.
Outputs prioritized ranking into session state via output_key.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.genai import types as genai_types

from backend.agents.tools.priority_tools import (
    calculate_rice_score,
    estimate_business_impact,
    rank_feedback_items,
)
from backend.config import get_settings

settings = get_settings()

INSTRUCTION = """You are the Business Prioritization Agent in the ProductOps AI pipeline.

You receive the analysis result from the previous agent via session state.
The analysis is in the state variable `analysis_result`.

STEP-BY-STEP:
1. Read the analysis from state (it was set by the Feedback Analyzer).
2. Call `calculate_rice_score` using values from the analysis:
   - category: the detected category
   - severity: the detected severity
   - sentiment: the detected sentiment
   - sentiment_score: the sentiment score
   - entity_count: the length of the entities list
3. Call `estimate_business_impact` with:
   - category, severity, and the entities list
4. Combine the results.

Output ONLY this JSON (no extra text):
{
  "prioritized_items": [
    {
      "feedback_id": "<id from analysis>",
      "rice_score": <from calculate_rice_score>,
      "reach": <from tool>,
      "impact": <from tool>,
      "confidence": <from tool>,
      "effort": <from tool>,
      "urgency": "<from tool>",
      "business_impact": "<from estimate_business_impact>",
      "revenue_risk": <from tool>,
      "retention_risk": <from tool>,
      "business_justification": "<from tool>",
      "recommended_action": "<fix_immediately|fix_next_sprint|plan_for_roadmap|monitor>"
    }
  ],
  "priority_ranking": ["<ordered feedback_ids>"],
  "ranking_rationale": "<brief explanation>"
}

Recommended action mapping:
- urgency=critical → fix_immediately
- urgency=high → fix_next_sprint
- urgency=medium → plan_for_roadmap
- urgency=low → monitor

Output ONLY the JSON. No commentary.
"""

def create_business_prioritizer_agent() -> LlmAgent:
    return LlmAgent(
        name="business_prioritizer",
        model=settings.agent_model,
        description=(
            "Prioritizes analyzed feedback using RICE scoring, business impact "
            "estimation, and urgency-based ranking."
        ),
        instruction=INSTRUCTION,
        tools=[
            FunctionTool(calculate_rice_score),
            FunctionTool(estimate_business_impact),
            FunctionTool(rank_feedback_items),
        ],
        generate_content_config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
        output_key="prioritization_result",
    )
