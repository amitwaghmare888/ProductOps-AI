"""
Hand-crafted test dataset for evaluation.

15 test cases covering all feedback categories and severity levels.
Each case has expected outputs for scoring the analysis, prioritization,
and planning stages.
"""
from dataclasses import dataclass


@dataclass
class TestCase:
    id: str
    input: str
    expected_category: str
    expected_sentiment: str
    expected_severity: str
    expected_urgency: str
    description: str


TEST_CASES: list[TestCase] = [
    TestCase(
        id="tc_01",
        input=(
            "App crashes every single time I try to export a report to PDF "
            "on my iPhone 15. This is completely broken. I use this feature "
            "daily for client meetings."
        ),
        expected_category="bug_report",
        expected_sentiment="negative",
        expected_severity="critical",
        expected_urgency="critical",
        description="Critical iOS crash on PDF export",
    ),
    TestCase(
        id="tc_02",
        input=(
            "It would be really nice if you could add dark mode to the app. "
            "Not urgent at all but I'd use it every day if you did."
        ),
        expected_category="feature_request",
        expected_sentiment="positive",
        expected_severity="low",
        expected_urgency="low",
        description="Low priority dark mode request",
    ),
    TestCase(
        id="tc_03",
        input=(
            "The dashboard is incredibly slow to load. It takes over 30 seconds "
            "and sometimes times out completely. Very frustrating when I'm trying "
            "to present to a client."
        ),
        expected_category="pain_point",
        expected_sentiment="negative",
        expected_severity="high",
        expected_urgency="high",
        description="Dashboard performance pain point",
    ),
    TestCase(
        id="tc_04",
        input=(
            "Love the new filter feature! It saves me so much time every week. "
            "You guys are doing an amazing job with these updates."
        ),
        expected_category="praise",
        expected_sentiment="positive",
        expected_severity="low",
        expected_urgency="low",
        description="Positive feedback about new feature",
    ),
    TestCase(
        id="tc_05",
        input=(
            "How do I export data to Excel? I can't find the option "
            "anywhere in the settings or menus."
        ),
        expected_category="question",
        expected_sentiment="neutral",
        expected_severity="low",
        expected_urgency="low",
        description="User question about Excel export",
    ),
    TestCase(
        id="tc_06",
        input=(
            "The login keeps failing with error code 401 even with correct "
            "credentials. I've been locked out for 2 hours. This is urgent — "
            "our whole team of 15 people is completely blocked."
        ),
        expected_category="bug_report",
        expected_sentiment="negative",
        expected_severity="critical",
        expected_urgency="critical",
        description="Critical authentication failure blocking team",
    ),
    TestCase(
        id="tc_07",
        input=(
            "Would love to see Slack integration so notifications come "
            "directly to our team channel instead of email."
        ),
        expected_category="feature_request",
        expected_sentiment="positive",
        expected_severity="medium",
        expected_urgency="medium",
        description="Slack integration feature request",
    ),
    TestCase(
        id="tc_08",
        input=(
            "The search function is really hard to use. The results are "
            "not relevant and it's difficult to filter by date range. "
            "I end up scrolling through hundreds of items manually."
        ),
        expected_category="pain_point",
        expected_sentiment="negative",
        expected_severity="medium",
        expected_urgency="medium",
        description="Search UX pain point",
    ),
    TestCase(
        id="tc_09",
        input=(
            "Data is showing incorrectly on the analytics page — the revenue "
            "numbers don't match our internal spreadsheets. Specifically the "
            "monthly totals are off by about 15 percent."
        ),
        expected_category="bug_report",
        expected_sentiment="negative",
        expected_severity="high",
        expected_urgency="high",
        description="Data accuracy bug in analytics",
    ),
    TestCase(
        id="tc_10",
        input=(
            "Please add bulk export functionality. We need to export more "
            "than 1000 rows at a time and the current 500 row limit is a "
            "real blocker for our enterprise reporting workflow."
        ),
        expected_category="feature_request",
        expected_sentiment="neutral",
        expected_severity="high",
        expected_urgency="high",
        description="Bulk export limit is a blocker",
    ),
    TestCase(
        id="tc_11",
        input=(
            "The mobile app is great but the iPad layout looks terrible — "
            "everything is stretched and the sidebar overlaps the main content. "
            "Makes it unusable on iPad Pro."
        ),
        expected_category="bug_report",
        expected_sentiment="mixed",
        expected_severity="medium",
        expected_urgency="medium",
        description="iPad layout rendering bug",
    ),
    TestCase(
        id="tc_12",
        input=(
            "Would it be possible to support SSO with Okta? Our IT security "
            "policy requires all enterprise SaaS apps to use SSO. This is "
            "blocking our procurement approval."
        ),
        expected_category="feature_request",
        expected_sentiment="neutral",
        expected_severity="high",
        expected_urgency="high",
        description="Enterprise SSO requirement",
    ),
    TestCase(
        id="tc_13",
        input=(
            "The new onboarding flow is much better than the old one. "
            "First-time experience is smooth and the tooltips are genuinely "
            "helpful. Good improvement!"
        ),
        expected_category="praise",
        expected_sentiment="positive",
        expected_severity="low",
        expected_urgency="low",
        description="Positive onboarding feedback",
    ),
    TestCase(
        id="tc_14",
        input=(
            "Reports take forever to generate — sometimes more than 5 minutes "
            "for a simple monthly summary. On the old version of the app it "
            "was under 10 seconds. This is a huge regression."
        ),
        expected_category="pain_point",
        expected_sentiment="negative",
        expected_severity="high",
        expected_urgency="high",
        description="Report generation performance regression",
    ),
    TestCase(
        id="tc_15",
        input=(
            "I accidentally deleted a project and there's no way to recover "
            "it. I've lost 3 weeks of work. This is a disaster — we need "
            "an undo or trash feature immediately."
        ),
        expected_category="bug_report",
        expected_sentiment="negative",
        expected_severity="critical",
        expected_urgency="critical",
        description="Critical data loss with no recovery option",
    ),
]
