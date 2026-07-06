"""
Engineering Planner Agent — Stage 3 of the ProductOps pipeline.

Migrated to OpenAI. Generates engineering tasks, effort estimates, and release notes.
"""
import json
import logging
from typing import Any

from backend.providers.openai_provider import get_ai_provider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Engineering Planner Agent in the ProductOps AI pipeline.
Your job is to generate actionable engineering tasks from prioritized feedback.

Story Point Scale:
- 1 point = 2-4 hours (trivial fix)
- 2 points = 1 day (simple task)
- 3 points = 2-3 days (medium task)
- 5 points = 1 week (complex task)
- 8 points = 2 weeks (large feature)
- 13 points = 3+ weeks (major feature)

Priority levels:
- P0 (Critical): Fix immediately
- P1 (High): Next sprint
- P2 (Medium): Planned roadmap
- P3 (Low): Backlog

Always respond with valid JSON only."""

PLANNING_PROMPT_TEMPLATE = """Generate engineering tasks for this prioritized feedback.

Analysis:
{analysis_json}

Prioritization:
{prioritization_json}

For each high-priority item, create engineering tasks with:

1. **Task Breakdown**: Break into implementable sub-tasks
2. **Story Points**: Use Fibonacci scale (1, 2, 3, 5, 8, 13)
3. **Priority**: P0 (critical), P1 (high), P2 (medium), P3 (low)
4. **Acceptance Criteria**: Clear, testable conditions
5. **Technical Approach**: Implementation strategy

Respond with ONLY this JSON structure:
{{
  "tasks": [
    {{
      "task_id": "TASK-<number>",
      "feedback_id": "<source feedback_id>",
      "title": "<concise task title>",
      "description": "<detailed task description>",
      "technical_approach": "<implementation strategy and technical details>",
      "effort_estimate": "<e.g., '1 week', '3 days'>",
      "story_points": <1|2|3|5|8|13>,
      "priority": "<P0|P1|P2|P3>",
      "acceptance_criteria": [
        "<testable criterion 1>",
        "<testable criterion 2>",
        "<testable criterion 3>"
      ]
    }}
  ],
  "release_notes": "<markdown-formatted release notes describing what will be shipped>",
  "release_summary": "<one-sentence summary of the release>",
  "total_story_points": <sum of all story points>,
  "sprint_recommendation": "<e.g., '1-2 sprints' where 1 sprint = 10-13 points>"
}}

Generate comprehensive, implementable tasks."""


async def plan_engineering(
    analysis: dict[str, Any],
    prioritization: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate engineering plan from analysis and prioritization.
    
    Args:
        analysis: Structured analysis from feedback_analyzer
        prioritization: Prioritization with RICE scores
        
    Returns:
        Engineering plan with tasks and estimates
    """
    feedback_id = analysis.get("feedback_id", "unknown")
    
    try:
        provider = get_ai_provider()
        
        analysis_json = json.dumps(analysis, indent=2)
        prioritization_json = json.dumps(prioritization, indent=2)
        
        prompt = PLANNING_PROMPT_TEMPLATE.format(
            analysis_json=analysis_json,
            prioritization_json=prioritization_json,
        )
        
        result = await provider.generate_json(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.4,
            max_tokens=4096,
        )
        
        logger.info(f"Engineering plan generated: {len(result.get('tasks', []))} tasks")
        return result
        
    except Exception as exc:
        logger.error(f"Engineering planning failed: {exc}")
        
        # Rule-based fallback planning
        category = analysis.get("category", "question")
        severity = analysis.get("severity", "medium")
        summary = analysis.get("summary", "No summary available")
        priority_item = prioritization.get("prioritized_items", [{}])[0]
        urgency = priority_item.get("urgency", "medium")
        rice_score = priority_item.get("rice_score", 5.0)
        
        # Map urgency to priority
        priority_map = {"critical": "P0", "high": "P1", "medium": "P2", "low": "P3"}
        priority = priority_map.get(urgency, "P2")
        
        # Story points based on category and severity
        if category == "bug":
            story_points = 3 if severity in ["critical", "high"] else 2
            effort = "1 week" if severity in ["critical", "high"] else "3 days"
        elif category == "performance":
            story_points = 5
            effort = "1-2 weeks"
        elif category == "feature_request":
            story_points = 8
            effort = "2 weeks"
        else:
            story_points = 2
            effort = "2-3 days"
        
        # Generate task
        task = {
            "task_id": f"TASK-{feedback_id[-4:]}",
            "feedback_id": feedback_id,
            "title": f"{category.replace('_', ' ').title()}: {summary[:60]}",
            "description": f"Address {category} reported in feedback: {analysis.get('raw_text', '')[:200]}",
            "technical_approach": f"1. Reproduce issue\n2. Identify root cause\n3. Implement fix\n4. Add tests\n5. Deploy",
            "effort_estimate": effort,
            "story_points": story_points,
            "priority": priority,
            "acceptance_criteria": [
                f"Issue resolved as described in feedback",
                "No regressions introduced",
                "Tests added to prevent recurrence",
            ],
            "fallback_mode": True,
        }
        
        # Generate release notes
        release_notes = f"""## Release Notes

### {category.replace('_', ' ').title()}
{summary}

**Priority:** {urgency.title()}  
**Estimated Effort:** {effort}

#### Changes
- {category.replace('_', ' ').title()} fix based on user feedback
- Improved reliability and user experience

"""
        
        return {
            "tasks": [task],
            "release_notes": release_notes,
            "release_summary": f"{urgency.title()} {category} fix: {summary[:80]}",
            "total_story_points": story_points,
            "sprint_recommendation": f"1 sprint ({story_points} points)",
            "fallback_mode": True,
            "error": f"OpenAI unavailable: {str(exc)[:100]}"
        }
