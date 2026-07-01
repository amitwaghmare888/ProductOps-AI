---
name: feedback-analyzer
description: >
  Analyzes raw customer feedback to extract structured insights including
  category, sentiment, entities, platforms, severity, and a concise summary.
  First stage of the ProductOps AI pipeline. Produces JSON output for the
  Business Prioritizer.
---

# Feedback Analyzer Agent Skill

## Purpose

Analyze raw customer feedback text and produce structured JSON insights.
This is Stage 1 of the ProductOps pipeline. Output is consumed by the
Business Prioritizer agent via ADK session state.

## Tools Used

| Tool | Purpose |
|------|---------|
| `categorize_feedback` | Classify into: bug_report, feature_request, pain_point, praise, question |
| `detect_sentiment` | Detect: positive, negative, neutral, mixed + score 0–1 |
| `extract_entities` | Extract product entities, platforms, and severity |

## Input

Raw customer feedback text (string). May contain multiple issues.

## Output (session state key: `analysis_result`)

```json
{
  "feedback_id": "fb_<8chars>",
  "raw_text": "<original feedback>",
  "category": "bug_report | feature_request | pain_point | praise | question",
  "category_confidence": 0.0,
  "sentiment": "positive | negative | neutral | mixed",
  "sentiment_score": 0.0,
  "entities": ["entity1", "entity2"],
  "platforms": ["ios", "android"],
  "severity": "critical | high | medium | low",
  "summary": "<one-sentence specific summary>"
}
```

## Workflow

1. Call `categorize_feedback(feedback_text)` → category + confidence
2. Call `detect_sentiment(feedback_text)` → sentiment + score
3. Call `extract_entities(feedback_text)` → entities + platforms + severity
4. Synthesize all tool outputs into the JSON structure above
5. Write output to session state via `output_key="analysis_result"`

## Failure Handling

- Empty/gibberish input → category=question, severity=low, needs_review=true
- Category confidence < 0.5 → set needs_review=true, do not block pipeline
- Missing entities → return empty list, do not fail

## Evaluation Criteria

- Category accuracy ≥ 85% on test dataset
- Sentiment accuracy ≥ 80% on test dataset
- Severity accuracy ≥ 80% on test dataset
- Processing time < 5s per feedback item

## Example

**Input:**
```
App crashes every time I try to export a report to PDF on iOS 17.
This is completely broken and I use this daily.
```

**Output:**
```json
{
  "feedback_id": "fb_a1b2c3d4",
  "category": "bug_report",
  "category_confidence": 0.85,
  "sentiment": "negative",
  "sentiment_score": 0.1,
  "entities": ["PDF", "Reports"],
  "platforms": ["ios"],
  "severity": "critical",
  "summary": "Consistent app crash on PDF export for iOS 17 users"
}
```
