---
name: business-prioritizer
description: >
  Prioritizes analyzed customer feedback using the RICE scoring framework
  (Reach, Impact, Confidence, Effort). Estimates business impact, revenue
  risk, and retention risk. Second stage of the ProductOps AI pipeline.
---

# Business Prioritizer Agent Skill

## Purpose

Apply RICE prioritization scoring to analyzed feedback from the Feedback Analyzer.
Produce a ranked list of feedback items by business priority.
This is Stage 2 of the ProductOps pipeline.

## Tools Used

| Tool | Purpose |
|------|---------|
| `calculate_rice_score` | Compute RICE = (Reach × Impact × Confidence) / Effort |
| `estimate_business_impact` | Assess revenue risk, retention risk, and justification |
| `rank_feedback_items` | Sort items by urgency then RICE score descending |

## RICE Framework

| Component | Scale | How Determined |
|-----------|-------|----------------|
| **Reach** | 1–5 | Estimated % of users affected based on category |
| **Impact** | 1–3 | How severely it affects users (from severity) |
| **Confidence** | 0–1 | Certainty of estimates (from sentiment strength) |
| **Effort** | 1–5 | Engineering effort (from category, lower = faster) |
| **RICE Score** | `(R×I×C)/E` | Higher = higher priority |

## Input

Reads `analysis_result` from ADK session state (set by Feedback Analyzer).

## Output (session state key: `prioritization_result`)

```json
{
  "prioritized_items": [
    {
      "feedback_id": "fb_<id>",
      "rice_score": 4.8,
      "reach": 4, "impact": 3, "confidence": 0.9, "effort": 2,
      "urgency": "critical | high | medium | low",
      "business_impact": "high | medium | low",
      "revenue_risk": true,
      "retention_risk": true,
      "business_justification": "<specific reasoning>",
      "recommended_action": "fix_immediately | fix_next_sprint | plan_for_roadmap | monitor"
    }
  ],
  "priority_ranking": ["fb_id1", "fb_id2"],
  "ranking_rationale": "<explanation of top choices>"
}
```

## Recommended Action Mapping

| Urgency | Action |
|---------|--------|
| critical | fix_immediately |
| high | fix_next_sprint |
| medium | plan_for_roadmap |
| low | monitor |

## Failure Handling

- Empty analysis input → return empty prioritized_items, empty ranking
- RICE confidence < 0.3 → flag as needs_human_review
- Circular dependencies detected → log warning, break cycle

## Evaluation Criteria

- RICE score within ±2 of human baseline
- Urgency label matches expected for 80%+ of test cases
- Business justification is specific and references the feedback content
