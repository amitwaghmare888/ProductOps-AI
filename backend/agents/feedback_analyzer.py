"""
Feedback Analyzer Agent — Stage 1 of the ProductOps pipeline.

Migrated to OpenAI. Analyzes raw customer feedback using structured prompts.
Outputs structured JSON analysis.
"""
import json
import logging
import hashlib
from typing import Any

from backend.providers.openai_provider import get_ai_provider
from backend.agents.tools.analysis_tools import (
    categorize_feedback,
    detect_sentiment,
    extract_entities,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Feedback Analyzer Agent in the ProductOps AI pipeline.
Your job is to analyze raw customer feedback and produce structured analysis.

You have access to these analysis functions:
1. categorize_feedback - Categorizes feedback into bug, feature_request, performance, ux, security, question
2. detect_sentiment - Analyzes sentiment (positive/negative/neutral) with score 0-1
3. extract_entities - Extracts mentioned products, features, platforms, and assesses severity

Always respond with valid JSON only."""

ANALYSIS_PROMPT_TEMPLATE = """Analyze this customer feedback and provide a complete structured analysis.

Feedback:
{feedback_text}

Perform these steps:
1. Categorize the feedback (bug, feature_request, performance, ux, security, or question)
2. Detect sentiment (positive, negative, neutral) with confidence score
3. Extract entities (products, features, platforms mentioned)
4. Assess severity (critical, high, medium, low)
5. Write a one-sentence summary

Respond with ONLY this JSON structure:
{{
  "feedback_id": "fb_auto_generated",
  "raw_text": "<original feedback>",
  "category": "<category>",
  "category_confidence": <0.0-1.0>,
  "sentiment": "<positive|negative|neutral>",
  "sentiment_score": <0.0-1.0>,
  "entities": ["entity1", "entity2"],
  "platforms": ["platform1"],
  "severity": "<critical|high|medium|low>",
  "summary": "<one-sentence summary>"
}}"""


async def analyze_feedback(feedback_text: str) -> dict[str, Any]:
    """
    Analyze customer feedback using OpenAI.
    
    Args:
        feedback_text: Raw customer feedback text
        
    Returns:
        Structured analysis dict
    """
    feedback_id = f"fb_{hashlib.md5(feedback_text.encode()).hexdigest()[:8]}"
    
    try:
        provider = get_ai_provider()
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(feedback_text=feedback_text)
        
        result = await provider.generate_json(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=2048,
        )
        
        # Ensure required fields exist
        if "feedback_id" not in result:
            result["feedback_id"] = feedback_id
        if "raw_text" not in result:
            result["raw_text"] = feedback_text[:500]
        
        logger.info(f"Feedback analyzed: {result.get('category')} - {result.get('severity')}")
        return result
        
    except Exception as exc:
        logger.error(f"Feedback analysis failed: {exc}")
        
        # Rule-based fallback analysis (works without OpenAI)
        text_lower = feedback_text.lower()
        
        # Categorize
        if any(w in text_lower for w in ['crash', 'bug', 'error', 'broken', 'fails', 'not working']):
            category = 'bug'
            severity = 'high' if any(w in text_lower for w in ['crash', 'critical', 'urgent']) else 'medium'
        elif any(w in text_lower for w in ['want', 'need', 'feature', 'add', 'should', 'wish']):
            category = 'feature_request'
            severity = 'medium'
        elif any(w in text_lower for w in ['slow', 'laggy', 'performance', 'loading']):
            category = 'performance'
            severity = 'high'
        elif any(w in text_lower for w in ['confusing', 'unclear', 'hard to', 'difficult']):
            category = 'ux'
            severity = 'low'
        else:
            category = 'question'
            severity = 'low'
        
        # Sentiment
        if any(w in text_lower for w in ['love', 'great', 'amazing', 'excellent', 'good']):
            sentiment = 'positive'
            sentiment_score = 0.8
        elif any(w in text_lower for w in ['hate', 'terrible', 'awful', 'worst', 'bad', 'crash']):
            sentiment = 'negative'
            sentiment_score = 0.2
        else:
            sentiment = 'neutral'
            sentiment_score = 0.5
        
        # Extract simple entities
        entities = []
        for word in ['app', 'photo', 'upload', 'login', 'payment', 'notification', 'search']:
            if word in text_lower:
                entities.append(word)
        
        platforms = []
        if 'mobile' in text_lower or 'phone' in text_lower:
            platforms.append('mobile')
        if 'web' in text_lower or 'browser' in text_lower:
            platforms.append('web')
        
        return {
            "feedback_id": feedback_id,
            "raw_text": feedback_text[:500],
            "category": category,
            "category_confidence": 0.7,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "entities": entities or ['general'],
            "platforms": platforms or ['unknown'],
            "severity": severity,
            "summary": f"{category.replace('_', ' ').title()}: {feedback_text[:80]}...",
            "fallback_mode": True,
            "error": f"OpenAI unavailable: {str(exc)[:100]}"
        }
