"""
Gemini provider implementation for the LLM Gateway.

Uses google-genai synchronous client internally.
Async support is provided via asyncio.to_thread().
Model fallback: if the primary model returns an error, retries with fallback_model.
Circuit breaker: rate-limited keys are skipped for RATE_LIMIT_COOLDOWN_SECONDS.
"""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timezone, timedelta

from google import genai
from google.genai import types as genai_types

from backend.gateway.providers.base import (
    LLMProvider,
    ProviderMetrics,
    ProviderResponse,
)

logger = logging.getLogger(__name__)

# Duration a rate-limited key is excluded from round-robin before being retried
RATE_LIMIT_COOLDOWN_SECONDS = 60


class GeminiProvider(LLMProvider):
    """
    Gemini API key implementation of LLMProvider.

    One GeminiProvider instance per API key in the pool.
    Tracks per-key request metrics and implements a circuit breaker
    that automatically skips rate-limited keys during round-robin routing.

    Features:
    - Per-key metrics: total/success/failure/rate-limited/fallback counts, avg latency
    - Circuit breaker: keys excluded for 60 s after a 429 / quota error
    - Model fallback: retries failed requests with an alternate model before returning error
    - Masked key ID: safe for logging and metrics display
    """

    def __init__(self, api_key: str, key_index: int) -> None:
        self._api_key = api_key
        # Mask key for safe display: first 8 chars + last 4 chars
        if len(api_key) > 12:
            masked = f"{api_key[:8]}...{api_key[-4:]}"
        else:
            masked = "***"
        self._key_id = f"gemini_key_{key_index + 1} ({masked})"
        self._client = genai.Client(api_key=api_key)
        self._metrics = ProviderMetrics(
            key_id=self._key_id,
            provider_name="gemini",
        )
        self._rate_limited_until: datetime | None = None

    # ── LLMProvider interface ─────────────────────────────────────────────────

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def key_id(self) -> str:
        return self._key_id

    @property
    def api_key(self) -> str:
        """Raw API key — injected into os.environ by orchestrator for each attempt."""
        return self._api_key

    @property
    def is_available(self) -> bool:
        """True unless rate-limited and the cooldown window has not yet expired."""
        if self._rate_limited_until is None:
            return True
        now = datetime.now(timezone.utc)
        if now >= self._rate_limited_until:
            # Cooldown expired — restore key
            self._rate_limited_until = None
            self._metrics.is_rate_limited = False
            self._metrics.rate_limited_until = None
            logger.info(
                "Gateway: %s rate-limit cooldown expired. Key restored.", self._key_id
            )
            return True
        return False

    def get_metrics(self) -> ProviderMetrics:
        return self._metrics

    # ── Generation ────────────────────────────────────────────────────────────

    def _call_model(
        self,
        prompt: str,
        model: str,
        temperature: float,
        response_mime_type: str,
    ) -> tuple[str, int]:
        """
        Execute a single Gemini generate_content call.

        Returns:
            (response_text, latency_ms)

        Raises:
            Exception on any API error (caller decides retry / fallback logic).
        """
        start = time.monotonic()
        response = self._client.models.generate_content(
            model=model,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type=response_mime_type,
            ),
        )
        latency_ms = int((time.monotonic() - start) * 1000)
        return response.text or "", latency_ms

    def _mark_rate_limited(self, exc: Exception) -> None:
        """Activate circuit breaker for this key (internal implementation)."""
        self._metrics.rate_limited_requests += 1
        self._metrics.is_rate_limited = True
        cooldown_until = datetime.now(timezone.utc) + timedelta(
            seconds=RATE_LIMIT_COOLDOWN_SECONDS
        )
        self._rate_limited_until = cooldown_until
        self._metrics.rate_limited_until = cooldown_until.isoformat()
        logger.warning(
            "Gateway: %s is rate-limited. Excluded until %s. Error: %s",
            self._key_id,
            cooldown_until.isoformat(),
            str(exc)[:120],
        )

    def mark_rate_limited(self, exc: Exception) -> None:
        """Public ABC implementation — delegates to _mark_rate_limited."""
        self._mark_rate_limited(exc)

    def record_attempt(self) -> None:
        """Record that an ADK passthrough attempt was made with this provider's key."""
        self._metrics.total_requests += 1

    def record_success(self, latency_ms: int = 0) -> None:
        """Record a successful ADK passthrough request."""
        self._metrics.successful_requests += 1
        self._metrics.total_latency_ms += latency_ms

    def record_failure(self, error: str | None = None) -> None:
        """Record a failed ADK passthrough request."""
        self._metrics.failed_requests += 1
        if error:
            self._metrics.last_error = error[:200]

    def generate_sync(
        self,
        prompt: str,
        model: str,
        fallback_model: str | None = None,
        temperature: float = 0.1,
        response_mime_type: str = "application/json",
    ) -> ProviderResponse:
        """
        Synchronous Gemini generation with metrics, circuit breaker, and model fallback.

        Execution order:
        1. Try primary model.
        2. On rate-limit error → activate circuit breaker, return error (no fallback).
        3. On other error → try fallback_model if provided.
        4. On fallback success → record fallback_request metric, return success.
        5. On fallback failure → return error.
        """
        self._metrics.total_requests += 1
        used_fallback = False

        # ── Primary model attempt ─────────────────────────────────────────────
        try:
            text, latency_ms = self._call_model(
                prompt, model, temperature, response_mime_type
            )
            self._metrics.successful_requests += 1
            self._metrics.total_latency_ms += latency_ms
            return ProviderResponse(
                text=text,
                provider_name="gemini",
                key_id=self._key_id,
                model=model,
                latency_ms=latency_ms,
                success=True,
                used_fallback_model=False,
            )

        except Exception as primary_exc:
            error_str = str(primary_exc).lower()
            is_rate_limit = "429" in error_str or "quota" in error_str or "rate" in error_str

            self._metrics.failed_requests += 1
            self._metrics.last_error = str(primary_exc)[:200]
            logger.warning(
                "Gateway: %s primary model '%s' failed: %s",
                self._key_id, model, str(primary_exc)[:120],
            )

            if is_rate_limit:
                self._mark_rate_limited(primary_exc)
                return ProviderResponse(
                    text="",
                    provider_name="gemini",
                    key_id=self._key_id,
                    model=model,
                    latency_ms=0,
                    success=False,
                    error=str(primary_exc)[:200],
                )

            # ── Fallback model attempt ────────────────────────────────────────
            if fallback_model and fallback_model != model:
                logger.info(
                    "Gateway: %s retrying with fallback model '%s'.",
                    self._key_id, fallback_model,
                )
                try:
                    text, latency_ms = self._call_model(
                        prompt, fallback_model, temperature, response_mime_type
                    )
                    self._metrics.successful_requests += 1
                    self._metrics.fallback_requests += 1
                    self._metrics.total_latency_ms += latency_ms
                    return ProviderResponse(
                        text=text,
                        provider_name="gemini",
                        key_id=self._key_id,
                        model=fallback_model,
                        latency_ms=latency_ms,
                        success=True,
                        used_fallback_model=True,
                    )
                except Exception as fallback_exc:
                    logger.error(
                        "Gateway: %s fallback model '%s' also failed: %s",
                        self._key_id, fallback_model, str(fallback_exc)[:120],
                    )
                    return ProviderResponse(
                        text="",
                        provider_name="gemini",
                        key_id=self._key_id,
                        model=fallback_model,
                        latency_ms=0,
                        success=False,
                        error=str(fallback_exc)[:200],
                    )

            return ProviderResponse(
                text="",
                provider_name="gemini",
                key_id=self._key_id,
                model=model,
                latency_ms=0,
                success=False,
                error=str(primary_exc)[:200],
            )

    async def generate(
        self,
        prompt: str,
        model: str,
        fallback_model: str | None = None,
        temperature: float = 0.1,
        response_mime_type: str = "application/json",
    ) -> ProviderResponse:
        """Async wrapper around generate_sync using asyncio.to_thread."""
        return await asyncio.to_thread(
            self.generate_sync,
            prompt,
            model,
            fallback_model,
            temperature,
            response_mime_type,
        )
