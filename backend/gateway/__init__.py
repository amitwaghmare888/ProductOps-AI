"""
LLM Gateway package.

Provides a production-grade, provider-agnostic LLM client pool with
round-robin key routing, circuit breaker, model fallback, and metrics.

Quick start:
    from backend.gateway import llm_gateway
    response = await llm_gateway.generate(prompt, model="gemini-2.0-flash")

Initialize at startup:
    from backend.gateway import init_gateway
    init_gateway(settings.gateway_api_keys_list)
"""
from backend.gateway.llm_gateway import llm_gateway, init_gateway, LLMGateway

__all__ = ["llm_gateway", "init_gateway", "LLMGateway"]
