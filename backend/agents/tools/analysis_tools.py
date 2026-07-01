"""
Feedback analysis tools for the Feedback Analyzer agent.
Three FunctionTools: categorize, sentiment, entity extraction.
"""
import re


def categorize_feedback(feedback_text: str) -> dict:
    """
    Classify customer feedback into a product category.

    Args:
        feedback_text: The raw customer feedback text to classify.

    Returns:
        dict with 'category' (bug_report|feature_request|pain_point|praise|question)
        and 'confidence' (0.0-1.0).
    """
    text_lower = feedback_text.lower()

    bug_signals = [
        "crash", "error", "broken", "doesn't work", "not working",
        "bug", "fail", "issue", "problem", "can't", "cannot", "won't",
        "stopped working", "locked out", "data loss", "incorrect", "wrong",
    ]
    feature_signals = [
        "would be nice", "feature", "add", "wish", "want", "could you",
        "please add", "support for", "integration", "allow", "enable",
        "would love", "it would be", "possible to",
    ]
    pain_signals = [
        "slow", "difficult", "hard to", "confusing", "frustrating",
        "annoying", "painful", "takes too long", "complicated", "unclear",
        "forever", "clunky",
    ]
    praise_signals = [
        "love", "great", "amazing", "excellent", "fantastic", "awesome",
        "perfect", "wonderful", "best", "thank", "appreciate", "good job",
        "well done", "smooth", "helpful",
    ]
    question_signals = [
        "how do", "how to", "can i", "is there", "does it", "where is",
        "what is", "?",
    ]

    scores = {
        "bug_report": sum(1 for s in bug_signals if s in text_lower),
        "feature_request": sum(1 for s in feature_signals if s in text_lower),
        "pain_point": sum(1 for s in pain_signals if s in text_lower),
        "praise": sum(1 for s in praise_signals if s in text_lower),
        "question": sum(1 for s in question_signals if s in text_lower),
    }

    best = max(scores, key=scores.get)
    total = sum(scores.values()) or 1
    confidence = min(scores[best] / total, 0.95) if scores[best] > 0 else 0.3

    return {"category": best, "confidence": round(confidence, 2)}


def detect_sentiment(feedback_text: str) -> dict:
    """
    Detect the emotional sentiment in customer feedback.

    Args:
        feedback_text: The raw customer feedback text.

    Returns:
        dict with 'sentiment' (positive|negative|neutral|mixed) and
        'score' (0.0=very negative, 0.5=neutral, 1.0=very positive).
    """
    text_lower = feedback_text.lower()

    positive_words = [
        "love", "great", "amazing", "excellent", "good", "helpful",
        "fast", "easy", "perfect", "awesome", "nice", "thank", "appreciate",
        "fantastic", "wonderful", "smooth", "intuitive", "better",
        "improvement", "well done",
    ]
    negative_words = [
        "hate", "terrible", "awful", "bad", "broken", "crash", "slow",
        "frustrating", "annoying", "useless", "horrible", "worst", "fail",
        "error", "bug", "problem", "issue", "difficult", "confusing",
        "disaster", "blocked", "urgent", "critical",
    ]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)
    total = pos_count + neg_count or 1
    score = round(pos_count / total, 2)

    if pos_count > 0 and neg_count > 0:
        sentiment = "mixed"
    elif score > 0.6:
        sentiment = "positive"
    elif score < 0.4:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return {"sentiment": sentiment, "score": score}


def extract_entities(feedback_text: str) -> dict:
    """
    Extract product entities, platforms, and assess severity from feedback.

    Args:
        feedback_text: The raw customer feedback text.

    Returns:
        dict with 'entities' (list of product-relevant terms),
        'platforms' (list of detected platforms),
        and 'severity' (critical|high|medium|low).
    """
    # Platform detection
    platforms = []
    platform_patterns = [
        r"\b(iOS|Android|Windows|Mac|macOS|Linux|Chrome|Firefox|Safari|Edge)\b",
        r"\b(iPhone|iPad|mobile|desktop|web|browser|app)\b",
    ]
    for pattern in platform_patterns:
        found = re.findall(pattern, feedback_text, re.IGNORECASE)
        platforms.extend([f.lower() for f in found])
    platforms = list(set(platforms))

    # Entity extraction: quoted phrases + capitalized multi-char words
    entities = list(set(re.findall(r'"([^"]+)"', feedback_text)))
    capitalized = re.findall(r"\b[A-Z][a-zA-Z]{2,}\b", feedback_text)
    stop_words = {
        "The", "This", "That", "When", "What", "Where", "How", "Why",
        "But", "And", "For", "Are", "Not", "Can", "With", "From",
        "Our", "Very", "Please", "Would", "Could", "Should", "Also",
        "Even", "Just", "Still", "Some", "All", "Every", "Happens",
        "Specifically", "URGENT", "Critical",
    }
    entities.extend([w for w in capitalized if w not in stop_words])
    entities = list(set(entities))[:8]

    # Severity assessment
    text_lower = feedback_text.lower()
    if any(w in text_lower for w in [
        "crash", "data loss", "critical", "urgent", "every time",
        "always", "blocked", "locked out", "disaster",
    ]):
        severity = "critical"
    elif any(w in text_lower for w in [
        "error", "broken", "fail", "often", "frequently", "wrong",
        "incorrect", "doesn't work",
    ]):
        severity = "high"
    elif any(w in text_lower for w in [
        "slow", "difficult", "sometimes", "occasionally", "confusing",
        "hard to",
    ]):
        severity = "medium"
    else:
        severity = "low"

    return {
        "entities": entities,
        "platforms": platforms,
        "severity": severity,
    }
