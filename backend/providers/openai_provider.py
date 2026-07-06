"""
OpenAI provider for ProductOps AI.

Centralized AI client that replaces Google Gemini with OpenAI API.
Provides structured JSON output, retry logic, and error handling.
"""
import json
import logging
import os
from typing import Any, Optional

from openai import OpenAI, AsyncOpenAI
from pydantic import BaseModel

from backend.config import get_settings
from backend.utils.retry import async_retry

logger = logging.getLogger(__name__)

# DEMO MODE: Set to True to skip OpenAI and use fallbacks immediately
DEMO_MODE = True  # Change to False when you have a valid OpenAI API key


class OpenAIProvider:
    """Centralized OpenAI client for all agents."""
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        self.model = settings.openai_model
        
        if DEMO_MODE:
            logger.warning("⚠️ DEMO MODE: OpenAI calls will be skipped, using fallbacks")
            self.client = None
            return
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        
        # Add 60s timeout to prevent hanging
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            timeout=60.0,
            max_retries=2,
        )
        logger.info(f"OpenAI provider initialized with model: {self.model}")
    
    @async_retry(max_attempts=3, base_delay=2.0, max_delay=30.0)
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        """
        Generate text response from OpenAI.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text response
        """
        if DEMO_MODE or not self.client:
            raise Exception("Demo mode: Using fallback intelligence")
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""
        except Exception as exc:
            logger.error(f"OpenAI API error: {exc}")
            raise
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """
        Generate structured JSON response from OpenAI.
        
        Uses JSON mode to ensure valid JSON output.
        
        Args:
            prompt: User prompt (should mention JSON format)
            system_prompt: Optional system prompt
            temperature: Sampling temperature (lower for structured output)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Parsed JSON dict
        """
        if DEMO_MODE or not self.client:
            # Skip OpenAI in demo mode - let agents use fallbacks
            raise Exception("Demo mode: Using fallback intelligence")
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error(f"Failed to parse JSON response: {exc}")
            return {"error": "Invalid JSON response", "raw": content}
        except Exception as exc:
            logger.error(f"OpenAI API error: {exc}")
            raise
    
    @async_retry(max_attempts=3, base_delay=2.0, max_delay=30.0)
    async def generate_structured(
        self,
        prompt: str,
        schema: type[BaseModel],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> BaseModel:
        """
        Generate structured response validated against Pydantic schema.
        
        Args:
            prompt: User prompt
            schema: Pydantic model class for validation
            system_prompt: Optional system prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Validated Pydantic model instance
        """
        if DEMO_MODE or not self.client:
            raise Exception("Demo mode: Using fallback intelligence")
        
        # Add schema to prompt
        schema_json = schema.model_json_schema()
        enhanced_prompt = (
            f"{prompt}\n\n"
            f"Respond with valid JSON matching this schema:\n"
            f"```json\n{json.dumps(schema_json, indent=2)}\n```"
        )
        
        result = await self.generate_json(
            prompt=enhanced_prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        try:
            return schema.model_validate(result)
        except Exception as exc:
            logger.warning(f"Schema validation failed: {exc}. Returning raw dict.")
            # Return as dict if validation fails
            return result  # type: ignore


# Global provider instance
_provider: Optional[OpenAIProvider] = None


def get_ai_provider() -> OpenAIProvider:
    """Get or create global AI provider instance."""
    global _provider
    if _provider is None:
        _provider = OpenAIProvider()
    return _provider
