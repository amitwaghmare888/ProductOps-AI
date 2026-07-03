"""
LLM Gateway — production-grade provider pool with round-robin routing,
circuit breaker, model fallback, and request metrics.

Architecture:
    Provider abstraction  — any LLMProvider can be registered (Gemini, OpenAI, Claude)
    Round-robin routing   — distributes requests across all available providers
    Circuit breaker       — rate-limited providers are skipped automatically
    Model fallback        — each request can specify a fallback model
    Request metrics       — per-provider tracking of calls, errors, latency

Singleton:
    Use `llm_gateway` (module-level instance) throughout the application.
    Initialize once at startup via `init_gateway()`.

Usage:
    # Async (LangGraph nodes, FastAPI handlers)
    from backend.gateway import llm_gateway
    response = await llm_gateway.generate(prompt, model="gemini-2.0-flash",
                                           fallback_model="gemini-1.5-flash")

    # Sync (evaluation judges, scripts)
    response = llm_gateway.generate_sync(prompt, model="gemini-2.0-flash")
"""
from __future__ import annotations

import asyncio
import logging
from typing import Sequence

from backend.gateway.providers.base import LLMProvider, ProviderResponse
from backend.gateway.providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)


class LLMGateway:
    """
    LLM Gateway: provider-agnostic request pool with metrics.

    Manages one or more LLMProvider instances and routes generation
    requests using round-robin with automatic circuit-breaker failover.

    Current providers: Gemini (GeminiProvider)
    Future providers:  OpenAI, Anthropic/Claude — implement LLMProvider and
                       call register_provider() at startup.
    """

    def __init__(self) -> None:
        self._providers: list[LLMProvider] = []
        self._index: int = 0
        self._lock = asyncio.Lock()

    # ── Provider registration ─────────────────────────────────────────────────

    def register_provider(self, provider: LLMProvider) -> None:
        """
        Register a provider with the gateway.
        Call at application startup before handling any requests.
        """
        self._providers.append(provider)
        logger.info(
            "LLMGateway: registered provider='%s' key_id='%s'. "
            "Total providers: %d.",
            provider.provider_name,
            provider.key_id,
            len(self._providers),
        )

    @classmethod
    def from_gemini_keys(cls, api_keys: list[str]) -> "LLMGateway":
        """
        Factory — create a fully initialized gateway from Gemini API keys.

        Each key becomes an independent GeminiProvider registered in the pool.
        Single-key lists produce a single-provider gateway (backward compatible).
        """
        gw = cls()
        for idx, key in enumerate(api_keys):
            stripped = key.strip()
            if stripped:
                gw.register_provider(GeminiProvider(stripped, idx))
        return gw

    # ── Provider selection ────────────────────────────────────────────────────

    def _next_available(self) -> LLMProvider | None:
        """
        Round-robin provider selection, skipping rate-limited providers.

        Iterates through the full provider list (at most once) to find
        the next available provider. Returns None if all are unavailable.
        """
        if not self._providers:
            return None

        total = len(self._providers)
        for _ in range(total):
            provider = self._providers[self._index % total]
            self._index = (self._index + 1) % total
            if provider.is_available:
                return provider
            logger.debug(
                "LLMGateway: skipping '%s' (rate-limited).", provider.key_id
            )

        logger.error(
            "LLMGateway: all %d provider(s) are currently unavailable.", total
        )
        return None

    async def next_provider(self) -> LLMProvider | None:
        """
        Public async interface — returns the next available provider.

        Used by orchestrator.py to select a gateway key before each ADK
        pipeline attempt.  Acquires the round-robin lock so concurrent
        async callers do not collide on the shared index.

        Returns None when all providers are rate-limited or none are registered
        (falls back to the ambient GOOGLE_API_KEY already in os.environ).
        """
        async with self._lock:
            return self._next_available()

    def _unavailable_response(self, model: str) -> ProviderResponse:
        """Return a standard error response when no provider is available."""
        return ProviderResponse(
            text="",
            provider_name="none",
            key_id="none",
            model=model,
            latency_ms=0,
            success=False,
            error="All LLM Gateway providers are unavailable (rate-limited or not configured).",
        )

    # ── Generation ────────────────────────────────────────────────────────────

    async def generate(
        self,
        prompt: str,
        model: str,
        fallback_model: str | None = None,
        temperature: float = 0.1,
        response_mime_type: str = "application/json",
    ) -> ProviderResponse:
        """
        Async generation — routes to the next available provider.

        Acquires the round-robin lock to safely advance the index,
        then delegates to the selected provider's async generate().

        Args:
            prompt: Full prompt string.
            model: Primary model (e.g. 'gemini-2.0-flash').
            fallback_model: Model to try if primary fails (not rate-limit errors).
            temperature: Sampling temperature.
            response_mime_type: Response format constraint.

        Returns:
            ProviderResponse with text, metrics, and success flag.
        """
        async with self._lock:
            provider = self._next_available()

        if provider is None:
            return self._unavailable_response(model)

        return await provider.generate(
            prompt=prompt,
            model=model,
            fallback_model=fallback_model,
            temperature=temperature,
            response_mime_type=response_mime_type,
        )

    def generate_sync(
        self,
        prompt: str,
        model: str,
        fallback_model: str | None = None,
        temperature: float = 0.1,
        response_mime_type: str = "application/json",
    ) -> ProviderResponse:
        """
        Synchronous generation — for use in non-async callers.

        Safe for single-threaded callers (evaluation judges, CLI scripts).
        Uses the same round-robin index as async generate(); do not mix
        concurrent sync calls from multiple threads without external locking.

        Args: same as generate().
        """
        provider = self._next_available()
        if provider is None:
            return self._unavailable_response(model)

        return provider.generate_sync(
            prompt=prompt,
            model=model,
            fallback_model=fallback_model,
            temperature=temperature,
            response_mime_type=response_mime_type,
        )

    # ── Metrics ───────────────────────────────────────────────────────────────

    def get_stats(self) -> dict:
        """
        Return aggregate and per-provider metrics.
        Consumed by GET /api/v1/gateway/stats.
        """
        all_metrics = [p.get_metrics() for p in self._providers]
        total_req = sum(m.total_requests for m in all_metrics)
        total_err = sum(m.failed_requests for m in all_metrics)
        active_count = sum(1 for p in self._providers if p.is_available)

        return {
            "total_providers": len(self._providers),
            "active_providers": active_count,
            "aggregate_requests": total_req,
            "aggregate_errors": total_err,
            "aggregate_success_rate": (
                round((total_req - total_err) / total_req, 3)
                if total_req > 0
                else 1.0
            ),
            "providers": [m.to_dict() for m in all_metrics],
        }

    @property
    def is_ready(self) -> bool:
        """True if at least one provider is registered and available."""
        return any(p.is_available for p in self._providers)

    @property
    def provider_count(self) -> int:
        return len(self._providers)


# ── Module-level singleton ────────────────────────────────────────────────────

# Initialized at application startup via init_gateway().
# Import and use directly: `from backend.gateway import llm_gateway`
llm_gateway: LLMGateway = LLMGateway()


def init_gateway(api_keys: list[str]) -> None:
    """
    Initialize the module-level LLMGateway singleton.

    Called once in the FastAPI lifespan handler.  Registers providers
    **on the existing singleton** so that every module that imported
    ``llm_gateway`` via ``from backend.gateway import llm_gateway``
    sees the populated instance.

    .. note::
       We deliberately mutate rather than replace the singleton.
       ``from X import Y`` copies the *reference* at import time;
       rebinding ``Y`` inside ``X`` does NOT update the copies held
       by other modules.  Mutating the original object does.

    Args:
        api_keys: List of API keys resolved from settings.gateway_api_keys_list.
                  May contain one key (single-key backward-compat) or many.
    """
    if not api_keys:
        logger.warning(
            "LLMGateway: no API keys provided. Gateway will not be operational. "
            "Set GOOGLE_API_KEY or GOOGLE_API_KEYS in .env."
        )
        return

    for idx, key in enumerate(api_keys):
        stripped = key.strip()
        if stripped:
            llm_gateway.register_provider(GeminiProvider(stripped, idx))

    logger.info(
        "LLMGateway: initialized with %d Gemini provider(s).",
        llm_gateway.provider_count,
    )

