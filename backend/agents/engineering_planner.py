"""
Engineering Planner Agent — Stage 3 of the ProductOps pipeline.

Reads prioritization_result from session state (set by Business Prioritizer).
Generates engineering tasks, effort estimates, and release notes.
Outputs the engineering plan into session state via output_key.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.genai import types as genai_types

from backend.agents.tools.planner_tools import (
    generate_engineering_tasks,
    estimate_effort,
    generate_release_notes,
)
from backend.config import get_settings

settings = get_settings()

INSTRUCTION = """You are the Engineering Planner Agent in the ProductOps AI pipeline.

You receive the prioritization result from the previous agent via session state.
The prioritization is in the state variable `prioritization_result`.

STEP-BY-STEP:
1. Read the prioritization from state.
2. For the top prioritized item(s) (urgency=critical or high first, then by RICE score):
   a. Call `estimate_effort` with category, severity, entity_count, and technical_area
      (derive technical_area from the entities or feedback context).
   b. Call `generate_engineering_tasks` with:
      - feedback_id, category, severity, summary (from the analysis context),
        technical_area, and the effort_estimate from step 2a.
3. After generating tasks for all top items, call `generate_release_notes` with
   a JSON string of the task list.
4. Combine everything.

Output ONLY this JSON (no extra text):
{
  "tasks": [
    {
      "task_id": "<from generate_engineering_tasks>",
      "feedback_id": "<source>",
      "title": "<from tool>",
      "description": "<from tool>",
      "technical_approach": "<from tool>",
      "effort_estimate": "<from estimate_effort>",
      "story_points": <from estimate_effort>,
      "priority": "<P0|P1|P2|P3>",
      "acceptance_criteria": ["<from tool>"]
    }
  ],
  "release_notes": "<markdown from generate_release_notes>",
  "release_summary": "<summary from generate_release_notes>",
  "total_story_points": <sum>,
  "sprint_recommendation": "<e.g. '1 sprint' where 1 sprint = 10 points>"
}

Output ONLY the JSON. No commentary.
"""

def create_engineering_planner_agent() -> LlmAgent:
    return LlmAgent(
        name="engineering_planner",
        model=settings.agent_model,
        description=(
            "Generates engineering tasks, effort estimates, and release notes "
            "from prioritized feedback items."
        ),
        instruction=INSTRUCTION,
        tools=[
            FunctionTool(generate_engineering_tasks),
            FunctionTool(estimate_effort),
            FunctionTool(generate_release_notes),
        ],
        generate_content_config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
        output_key="planning_result",
    )
