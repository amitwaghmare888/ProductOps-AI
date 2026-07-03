"""
Feedback Analyzer Agent — Stage 1 of the ProductOps pipeline.

Uses Gemini via ADK LlmAgent to analyze raw customer feedback.
Calls 3 FunctionTools: categorize_feedback, detect_sentiment, extract_entities.
Outputs structured JSON analysis into session state via output_key.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.genai import types as genai_types

from backend.agents.tools.analysis_tools import (
    categorize_feedback,
    detect_sentiment,
    extract_entities,
)
from backend.config import get_settings

settings = get_settings()

INSTRUCTION = """You are the Feedback Analyzer Agent in the ProductOps AI pipeline.

Your job: take raw customer feedback and produce a structured analysis.

STEP-BY-STEP — you MUST follow this exact sequence:
1. Call the `categorize_feedback` tool with the feedback text.
2. Call the `detect_sentiment` tool with the feedback text.
3. Call the `extract_entities` tool with the feedback text.
4. Combine the tool results into a single JSON object.

After calling all 3 tools, output ONLY this JSON (no extra text):
{
  "feedback_id": "fb_<first 8 chars of a random id>",
  "raw_text": "<the original feedback text>",
  "category": "<category from categorize_feedback>",
  "category_confidence": <confidence from categorize_feedback>,
  "sentiment": "<sentiment from detect_sentiment>",
  "sentiment_score": <score from detect_sentiment>,
  "entities": <entities list from extract_entities>,
  "platforms": <platforms list from extract_entities>,
  "severity": "<severity from extract_entities>",
  "summary": "<YOUR one-sentence summary of the core issue or request>"
}

Rules:
- Always call ALL 3 tools before producing output.
- Your summary must be specific to the feedback, not generic.
- If the feedback is empty or unclear, still produce valid JSON with category "question" and severity "low".
- Output ONLY the JSON object, nothing else.
"""

def create_feedback_analyzer_agent() -> LlmAgent:
    return LlmAgent(
        name="feedback_analyzer",
        model=settings.agent_model,
        description=(
            "Analyzes raw customer feedback to extract category, sentiment, "
            "entities, severity, and a structured summary."
        ),
        instruction=INSTRUCTION,
        tools=[
            FunctionTool(categorize_feedback),
            FunctionTool(detect_sentiment),
            FunctionTool(extract_entities),
        ],
        generate_content_config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
        output_key="analysis_result",
    )
