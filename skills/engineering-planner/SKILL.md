---
name: engineering-planner
description: >
  Generates actionable engineering tasks, effort estimates, and release notes
  from prioritized customer feedback. Final stage of the ProductOps AI pipeline.
  Reads prioritization_result from session state and produces engineering_plan.
---

# Engineering Planner Agent Skill

## Purpose

Convert prioritized feedback into structured engineering work items.
Generate effort estimates, technical approaches, acceptance criteria, and
release notes. This is Stage 3 (final) of the ProductOps pipeline.

## Tools Used

| Tool | Purpose |
|------|---------|
| `estimate_effort` | Calculate story points and effort size (small/medium/large/xl) |
| `generate_engineering_tasks` | Create structured task with title, description, technical approach, acceptance criteria |
| `generate_release_notes` | Produce markdown release notes from the task list |

## Input

Reads `prioritization_result` from ADK session state (set by Business Prioritizer).

## Output (session state key: `planning_result`)

```json
{
  "tasks": [
    {
      "task_id": "TASK-<6CHARS>",
      "feedback_id": "fb_<id>",
      "title": "[P0] Fix: <summary>",
      "description": "<detailed description>",
      "technical_approach": "<numbered steps>",
      "effort_estimate": "small | medium | large | xl",
      "story_points": 3,
      "priority": "P0 | P1 | P2 | P3",
      "acceptance_criteria": ["<testable criterion>"]
    }
  ],
  "release_notes": "## Next Release\n### 🐛 Bug Fixes\n...",
  "release_summary": "<N bugs, N features, N improvements>",
  "total_story_points": 8,
  "sprint_recommendation": "1 sprint"
}
```

## Story Points → Effort Size

| Story Points | Effort Size |
|-------------|------------|
| 1–2 | small |
| 3–5 | medium |
| 6–8 | large |
| 9+ | xl |

## Priority Mapping

| Severity | Priority Label |
|----------|---------------|
| critical | P0 |
| high | P1 |
| medium | P2 |
| low | P3 |

## Sprint Estimation

1 sprint = 10 story points.
Round up: 11 story points = 2 sprints.

## Task Ordering

Focus on top items by RICE score and urgency:
- Always include all `urgency=critical` items
- Include `urgency=high` items if total story points < 20
- Exclude `urgency=low` items unless specifically requested

## Technical Approach Template

**Bug Report:**
```
1. Reproduce the issue in <technical_area>
2. Add debug logging to isolate failure point
3. Implement fix with appropriate error handling
4. Write unit and integration tests
5. Test across affected platforms
```

**Feature Request:**
```
1. Create technical design for <technical_area>
2. Review design with tech lead
3. Implement incrementally behind feature flag
4. Write documentation and tests
5. Rollout plan
```

## Release Notes Format

```markdown
## Next Release

### 🐛 Bug Fixes
- <fix title without priority prefix>

### ✨ New Features
- <feature title without priority prefix>

### 🔧 Improvements
- <improvement title without priority prefix>
```

## Failure Handling

- No prioritized items → return empty tasks, empty release notes
- Uncertain technical approach → flag as needs_tech_lead_review
- Low confidence effort estimate → provide range (e.g., "medium-large")

## Evaluation Criteria

- Task completeness score ≥ 4/5 (all required fields present)
- Technical approach is specific to the technical area, not generic
- Acceptance criteria are testable, not vague
- Effort estimates within ±1 size category of human estimate
