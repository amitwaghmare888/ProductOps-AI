"""
Phase 1 smoke test — run the full ADK pipeline from the command line.

Usage:
    cd productops-ai
    python -m scripts.test_pipeline

Requires GOOGLE_API_KEY in .env file.
"""
import asyncio
import json
import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from backend.agents.orchestrator import run_pipeline


SAMPLE_FEEDBACK = """App crashes every single time I try to export a report to PDF on my iPhone 15. \
This is completely broken and I use this feature daily for client meetings. \
Please fix this urgently."""


async def main():
    print("=" * 60)
    print("ProductOps AI — Phase 1 Pipeline Test")
    print("=" * 60)
    print()
    print(f"Input: {SAMPLE_FEEDBACK[:80]}...")
    print()
    print("Running pipeline (Analyzer → Prioritizer → Planner)...")
    print()

    try:
        result = await run_pipeline(SAMPLE_FEEDBACK)
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print(f"✅ Pipeline completed in {result['duration_ms']}ms")
    print(f"   Run ID: {result['run_id']}")
    print()

    # Print each stage
    print("─" * 40)
    print("STAGE 1: Feedback Analysis")
    print("─" * 40)
    analysis = result.get("analysis", {})
    if isinstance(analysis, dict) and "raw_output" not in analysis:
        print(f"  Category:   {analysis.get('category', '?')}")
        print(f"  Sentiment:  {analysis.get('sentiment', '?')} ({analysis.get('sentiment_score', '?')})")
        print(f"  Severity:   {analysis.get('severity', '?')}")
        print(f"  Entities:   {analysis.get('entities', [])}")
        print(f"  Summary:    {analysis.get('summary', '?')}")
    else:
        print(json.dumps(analysis, indent=2))
    print()

    print("─" * 40)
    print("STAGE 2: Business Prioritization")
    print("─" * 40)
    prioritization = result.get("prioritization", {})
    if isinstance(prioritization, dict) and "prioritized_items" in prioritization:
        for item in prioritization["prioritized_items"]:
            print(f"  RICE Score:  {item.get('rice_score', '?')}")
            print(f"  Urgency:     {item.get('urgency', '?')}")
            print(f"  Impact:      {item.get('business_impact', '?')}")
            print(f"  Action:      {item.get('recommended_action', '?')}")
    else:
        print(json.dumps(prioritization, indent=2))
    print()

    print("─" * 40)
    print("STAGE 3: Engineering Plan")
    print("─" * 40)
    planning = result.get("planning", {})
    if isinstance(planning, dict) and "tasks" in planning:
        for task in planning["tasks"]:
            print(f"  [{task.get('priority', '?')}] {task.get('title', '?')}")
            print(f"  Effort: {task.get('effort_estimate', '?')} ({task.get('story_points', '?')} pts)")
            print()
        print(f"  Total Points:  {planning.get('total_story_points', '?')}")
        print(f"  Sprint Est:    {planning.get('sprint_recommendation', '?')}")
        print()
        if planning.get("release_notes"):
            print("  Release Notes:")
            for line in planning["release_notes"].split("\n"):
                print(f"    {line}")
    else:
        print(json.dumps(planning, indent=2))

    print()
    print("=" * 60)
    print("✅ Phase 1 Complete — All 3 agents executed successfully")
    print("=" * 60)

    # Write full result to file for inspection
    with open("test_output.json", "w") as f:
        json.dump(result, f, indent=2, default=str)
    print(f"\nFull output saved to test_output.json")


if __name__ == "__main__":
    asyncio.run(main())
