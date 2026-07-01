"""
Engineering planning tools for the Engineering Planner agent.
Three FunctionTools: task generation, effort estimation, release notes.
"""
import uuid


def generate_engineering_tasks(
    feedback_id: str,
    category: str,
    severity: str,
    summary: str,
    technical_area: str,
    effort_estimate: str,
) -> dict:
    """
    Generate a structured engineering task from a prioritized feedback item.

    Args:
        feedback_id: The ID of the source feedback item.
        category: Feedback category (bug_report|feature_request|pain_point|praise|question).
        severity: Severity (critical|high|medium|low).
        summary: A one-sentence summary of the feedback.
        technical_area: The affected technical area (e.g. 'PDF export', 'iOS app').
        effort_estimate: Estimated effort size (small|medium|large|xl).

    Returns:
        dict with task_id, title, description, technical_approach,
        priority, effort_estimate, and acceptance_criteria.
    """
    priority_map = {"critical": "P0", "high": "P1", "medium": "P2", "low": "P3"}
    priority = priority_map.get(severity, "P3")

    prefix_map = {
        "bug_report": "Fix",
        "feature_request": "Implement",
        "pain_point": "Improve",
        "praise": "Maintain",
        "question": "Document",
    }
    prefix = prefix_map.get(category, "Address")
    title = f"[{priority}] {prefix}: {summary[:60]}"

    if category == "bug_report":
        description = (
            f"Users are experiencing: {summary}. "
            f"This is a {severity}-severity bug affecting {technical_area}. "
            f"Investigate root cause, implement fix, and add regression tests."
        )
        technical_approach = (
            f"1. Reproduce the issue in {technical_area}\n"
            f"2. Add debug logging to isolate failure point\n"
            f"3. Implement fix with appropriate error handling\n"
            f"4. Write unit and integration tests\n"
            f"5. Test across affected platforms"
        )
        acceptance_criteria = [
            f"Bug no longer reproducible in {technical_area}",
            "No regression on related functionality",
            "Test coverage added for the fix",
        ]
    elif category == "feature_request":
        description = (
            f"Feature request: {summary}. "
            f"Design, implement, and test this new capability in {technical_area}."
        )
        technical_approach = (
            f"1. Create technical design for {technical_area} enhancement\n"
            f"2. Review design with tech lead\n"
            f"3. Implement feature incrementally\n"
            f"4. Add feature flag for safe rollout\n"
            f"5. Write documentation and tests"
        )
        acceptance_criteria = [
            f"Feature works as described: {summary[:50]}",
            "Feature flag toggles correctly",
            "Documentation and tests included",
        ]
    else:
        description = (
            f"UX improvement needed: {summary}. "
            f"Address user pain point in {technical_area}."
        )
        technical_approach = (
            f"1. Audit current UX flow in {technical_area}\n"
            f"2. Identify key friction points\n"
            f"3. Design and implement improvement\n"
            f"4. Validate with user testing or metrics"
        )
        acceptance_criteria = [
            f"User experience improved in {technical_area}",
            "Validated through testing or metrics",
        ]

    return {
        "task_id": f"TASK-{uuid.uuid4().hex[:6].upper()}",
        "feedback_id": feedback_id,
        "title": title,
        "description": description,
        "technical_approach": technical_approach,
        "effort_estimate": effort_estimate,
        "priority": priority,
        "acceptance_criteria": acceptance_criteria,
    }


def estimate_effort(
    category: str,
    severity: str,
    entity_count: int,
    technical_area: str,
) -> dict:
    """
    Estimate engineering effort for addressing a feedback item.

    Args:
        category: Feedback category.
        severity: Severity level.
        entity_count: Number of affected components/entities.
        technical_area: Primary technical area involved.

    Returns:
        dict with effort_size (small|medium|large|xl), story_points (int),
        and rationale (string).
    """
    base_effort = {
        "bug_report": 3,
        "feature_request": 8,
        "pain_point": 5,
        "praise": 1,
        "question": 1,
    }.get(category, 5)

    severity_mod = {"critical": -1, "high": 0, "medium": 1, "low": 2}.get(severity, 0)
    component_mod = min(entity_count // 3, 3)
    story_points = max(1, base_effort + severity_mod + component_mod)

    if story_points <= 2:
        effort_size = "small"
    elif story_points <= 5:
        effort_size = "medium"
    elif story_points <= 8:
        effort_size = "large"
    else:
        effort_size = "xl"

    return {
        "effort_size": effort_size,
        "story_points": story_points,
        "rationale": (
            f"{category.replace('_', ' ').title()} in {technical_area}: "
            f"{story_points} story points. "
            f"Severity={severity}, components={entity_count}."
        ),
    }


def generate_release_notes(tasks_json: str, version: str = "Next Release") -> dict:
    """
    Generate markdown release notes from a list of engineering tasks.

    Args:
        tasks_json: JSON string of task list. Each task needs 'title' and optionally 'category'.
        version: Version label for the release notes header.

    Returns:
        dict with 'release_notes' (markdown string) and 'summary' (one-line summary).
    """
    import json

    try:
        tasks = json.loads(tasks_json)
    except (json.JSONDecodeError, TypeError):
        if isinstance(tasks_json, list):
            tasks = tasks_json
        else:
            return {"release_notes": f"## {version}\n\nNo tasks.", "summary": "No tasks to report."}

    bugs = []
    features = []
    improvements = []

    for t in tasks:
        title = t.get("title", "")
        if "Fix" in title or t.get("category") == "bug_report":
            bugs.append(t)
        elif "Implement" in title or t.get("category") == "feature_request":
            features.append(t)
        else:
            improvements.append(t)

    sections = [f"## {version}\n"]

    if bugs:
        sections.append("### 🐛 Bug Fixes\n")
        for t in bugs:
            clean = t.get("title", "Unknown")
            for prefix in ["[P0] Fix: ", "[P1] Fix: ", "[P2] Fix: ", "[P3] Fix: "]:
                clean = clean.replace(prefix, "")
            sections.append(f"- {clean}")
        sections.append("")

    if features:
        sections.append("### ✨ New Features\n")
        for t in features:
            clean = t.get("title", "Unknown")
            for prefix in ["[P1] Implement: ", "[P2] Implement: ", "[P3] Implement: "]:
                clean = clean.replace(prefix, "")
            sections.append(f"- {clean}")
        sections.append("")

    if improvements:
        sections.append("### 🔧 Improvements\n")
        for t in improvements:
            clean = t.get("title", "Unknown")
            for prefix in ["[P0] ", "[P1] ", "[P2] ", "[P3] ", "Improve: ", "Address: "]:
                clean = clean.replace(prefix, "")
            sections.append(f"- {clean}")
        sections.append("")

    release_notes = "\n".join(sections)
    summary = (
        f"{len(bugs)} bug fix(es), {len(features)} new feature(s), "
        f"{len(improvements)} improvement(s) for {version}."
    )

    return {"release_notes": release_notes, "summary": summary}
