"""
LLM-as-judge scoring functions.

Uses Gemini to evaluate agent outputs against expected results.
Three judge functions: one per pipeline stage (analysis, prioritization, planning).
"""
import json
from google import genai
from google.genai import types
from backend.config import get_settings


def _get_client():
    """Lazy client init — only created when judge is called."""
    settings = get_settings()
    return genai.Client(api_key=settings.google_api_key)


ANALYSIS_JUDGE_PROMPT = """You are evaluating an AI feedback analysis agent. Score each dimension from 1 to 5.

Original customer feedback:
{input}

Agent's analysis output:
{agent_output}

Expected values:
- Expected Category: {expected_category}
- Expected Sentiment: {expected_sentiment}
- Expected Severity: {expected_severity}

Scoring guide (1-5):
1 = completely wrong, 2 = mostly wrong, 3 = partially correct, 4 = mostly correct, 5 = exact match

Return ONLY valid JSON, no other text:
{{"category_score": <1-5>, "sentiment_score": <1-5>, "severity_score": <1-5>, "summary_quality": <1-5>, "reasoning": "<one sentence explaining scores>"}}"""


PRIORITIZATION_JUDGE_PROMPT = """You are evaluating an AI business prioritization agent. Score each dimension from 1 to 5.

The analysis used as input:
{analysis_output}

Agent's prioritization output:
{agent_output}

Expected urgency level: {expected_urgency}

Scoring guide (1-5):
1 = completely wrong, 2 = mostly wrong, 3 = partially correct, 4 = mostly correct, 5 = exact match

Score these dimensions:
- rice_reasonable: Is the RICE score reasonable for this type of feedback?
- urgency_accuracy: Does the urgency match expected ({expected_urgency})?
- justification: Is the business justification relevant and specific?
- action: Is the recommended action appropriate for the urgency level?

Return ONLY valid JSON:
{{"rice_reasonable": <1-5>, "urgency_accuracy": <1-5>, "justification": <1-5>, "action": <1-5>, "reasoning": "<one sentence>"}}"""


PLANNING_JUDGE_PROMPT = """You are evaluating an AI engineering planner agent. Score each dimension from 1 to 5.

The prioritization used as input:
{prioritization_output}

Agent's planning output:
{agent_output}

Scoring guide (1-5):
1 = completely wrong, 2 = mostly wrong, 3 = partially correct, 4 = mostly correct, 5 = exact match

Score these dimensions:
- task_completeness: Does the task have title, description, technical_approach, acceptance_criteria?
- technical_feasibility: Is the technical approach realistic and specific?
- effort_accuracy: Is the effort estimate reasonable for the work described?
- criteria_quality: Are the acceptance criteria clear and testable?

Return ONLY valid JSON:
{{"task_completeness": <1-5>, "technical_feasibility": <1-5>, "effort_accuracy": <1-5>, "criteria_quality": <1-5>, "reasoning": "<one sentence>"}}"""


def _call_judge(prompt: str) -> dict:
    """Call Gemini as a judge and parse JSON response."""
    settings = get_settings()
    client = _get_client()

    try:
        response = client.models.generate_content(
            model=settings.judge_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except json.JSONDecodeError:
        # Try extracting JSON from the response
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass
        return {"error": "json_parse_failed", "raw": text[:200]}
    except Exception as e:
        return {"error": str(e)}


def judge_analysis(
    input_text: str,
    agent_output: dict,
    expected_category: str,
    expected_sentiment: str,
    expected_severity: str,
) -> dict:
    """Score the Feedback Analyzer output using LLM-as-judge."""
    prompt = ANALYSIS_JUDGE_PROMPT.format(
        input=input_text,
        agent_output=json.dumps(agent_output, indent=2),
        expected_category=expected_category,
        expected_sentiment=expected_sentiment,
        expected_severity=expected_severity,
    )
    result = _call_judge(prompt)

    scores = [
        result.get("category_score", 1),
        result.get("sentiment_score", 1),
        result.get("severity_score", 1),
        result.get("summary_quality", 1),
    ]
    result["average"] = round(sum(scores) / len(scores), 2)
    return result


def judge_prioritization(
    analysis_output: dict,
    agent_output: dict,
    expected_urgency: str,
) -> dict:
    """Score the Business Prioritizer output using LLM-as-judge."""
    prompt = PRIORITIZATION_JUDGE_PROMPT.format(
        analysis_output=json.dumps(analysis_output, indent=2),
        agent_output=json.dumps(agent_output, indent=2),
        expected_urgency=expected_urgency,
    )
    result = _call_judge(prompt)

    scores = [
        result.get("rice_reasonable", 1),
        result.get("urgency_accuracy", 1),
        result.get("justification", 1),
        result.get("action", 1),
    ]
    result["average"] = round(sum(scores) / len(scores), 2)
    return result


def judge_planning(
    prioritization_output: dict,
    agent_output: dict,
) -> dict:
    """Score the Engineering Planner output using LLM-as-judge."""
    prompt = PLANNING_JUDGE_PROMPT.format(
        prioritization_output=json.dumps(prioritization_output, indent=2),
        agent_output=json.dumps(agent_output, indent=2),
    )
    result = _call_judge(prompt)

    scores = [
        result.get("task_completeness", 1),
        result.get("technical_feasibility", 1),
        result.get("effort_accuracy", 1),
        result.get("criteria_quality", 1),
    ]
    result["average"] = round(sum(scores) / len(scores), 2)
    return result
