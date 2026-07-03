"""
Abstract base for LLM providers.

Defines the interface that every provider implementation must satisfy.
To add a new provider (OpenAI, Anthropic/Claude, Mistral, Vertex AI),
implement LLMProvider and register it with LLMGateway.

Current implementations: GeminiProvider (backend/gateway/providers/gemini.py)
"""
from __future__ import annotations

import dataclasses
from abc import ABC, abstractmethod


@dataclasses.dataclass
class ProviderMetrics:
    """
    Per-provider / per-key request metrics snapshot.

    Held in memory for the lifetime of the process.
    Exposed via GET /api/v1/gateway/stats.
    """

    key_id: str
    provider_name: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    rate_limited_requests: int = 0
    fallback_requests: int = 0        # times the fallback model was used
    total_latency_ms: int = 0
    last_error: str | None = None
    is_rate_limited: bool = False
    rate_limited_until: str | None = None  # ISO 8601

    @property
    def avg_latency_ms(self) -> float:
        if self.successful_requests == 0:
            return 0.0
        return round(self.total_latency_ms / self.successful_requests, 1)

    @property
    def success_rate(self) -> float:
        if self.total_requests == 0:
            return 1.0
        return round(self.successful_requests / self.total_requests, 3)

    def to_dict(self) -> dict:
        return {
            "key_id": self.key_id,
            "provider": self.provider_name,
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "rate_limited_requests": self.rate_limited_requests,
            "fallback_requests": self.fallback_requests,
            "success_rate": self.success_rate,
            "avg_latency_ms": self.avg_latency_ms,
            "is_rate_limited": self.is_rate_limited,
            "rate_limited_until": self.rate_limited_until,
            "last_error": self.last_error,
        }


@dataclasses.dataclass
class ProviderResponse:
    """Normalized response from any LLM provider."""

    text: str
    provider_name: str
    key_id: str
    model: str
    latency_ms: int
    success: bool
    used_fallback_model: bool = False
    error: str | None = None


class LLMProvider(ABC):
    """
    Abstract base for LLM providers.

    The LLMGateway routes requests to any registered LLMProvider without
    knowing provider-specific implementation details. All providers expose
    the same sync and async generation interface plus a metrics snapshot.

    To add a new provider (OpenAI, Claude, etc.):
        1. Subclass LLMProvider.
        2. Implement all abstract properties and methods.
        3. Register an instance via LLMGateway.register_provider().
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable provider name. Examples: 'gemini', 'openai', 'claude'."""
        ...

    @property
    @abstractmethod
    def key_id(self) -> str:
        """Masked, log-safe identifier for this specific key."""
        ...

    @property
    @abstractmethod
    def api_key(self) -> str:
        """The raw API key for this provider (used to inject into os.environ)."""
        ...

    @property
    @abstractmethod
    def is_available(self) -> bool:
        """
        Whether this provider is currently accepting requests.
        Returns False when rate-limited and the cooldown has not expired.
        """
        ...

    def mark_rate_limited(self, exc: Exception) -> None:
        """
        Activate the circuit breaker for this provider key.

        Default: no-op.  GeminiProvider overrides this to set the
        60-second cooldown and update metrics.  Called by orchestrator.py
        when the ADK pipeline raises a 429 / quota error so the gateway
        excludes this key from round-robin for the next attempt.
        """

    def record_attempt(self) -> None:
        """Record that an attempt was made using this provider (increments total_requests)."""

    def record_success(self, latency_ms: int = 0) -> None:
        """Record a successful request (increments successful_requests)."""

    def record_failure(self, error: str | None = None) -> None:
        """Record a failed request (increments failed_requests)."""

    @abstractmethod
    def get_metrics(self) -> ProviderMetrics:
        """Return a snapshot of this provider's request metrics."""
        ...

    @abstractmethod
    def generate_sync(
        self,
        prompt: str,
        model: str,
        fallback_model: str | None = None,
        temperature: float = 0.1,
        response_mime_type: str = "application/json",
    ) -> ProviderResponse:
        """
        Synchronous text generation.

        Args:
            prompt: Full prompt string.
            model: Primary model identifier (e.g. 'gemini-2.0-flash').
            fallback_model: Optional model to retry on primary failure.
            temperature: Sampling temperature (lower = more deterministic).
            response_mime_type: MIME type constraint for the response.
        """
        ...

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        model: str,
        fallback_model: str | None = None,
        temperature: float = 0.1,
        response_mime_type: str = "application/json",
    ) -> ProviderResponse:
        """
        Async text generation. Used by LangGraph nodes and FastAPI handlers.
        Sync-based SDKs may implement this via asyncio.to_thread().
        """
        ...
