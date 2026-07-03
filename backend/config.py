import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    google_api_key: str = ""
    google_genai_use_vertexai: bool = False
    database_url: str = "sqlite+aiosqlite:///./productops.db"
    backend_host: str = "localhost"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # Model config
    agent_model: str = "gemini-2.0-flash"
    judge_model: str = "gemini-2.0-flash"
    agent_model_fallback: str = "gemini-1.5-flash"  # fallback if primary fails

    # LLM Gateway — API key pool (comma-separated).
    # If set, the gateway uses these keys in round-robin.
    # Falls back to google_api_key if empty (backward compatible).
    google_api_keys: str = ""

    # Feature flag: enables the LangGraph execution path in orchestrator.py.
    # When False (default), the existing ADK SequentialAgent path is used.
    use_langgraph: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def gateway_api_keys_list(self) -> list[str]:
        """
        Resolved list of API keys for the LLM Gateway.

        Priority:
        1. GOOGLE_API_KEYS (comma-separated pool) — multi-key pooling
        2. GOOGLE_API_KEY (single key) — backward compatible fallback
        """
        if self.google_api_keys.strip():
            return [k.strip() for k in self.google_api_keys.split(",") if k.strip()]
        if self.google_api_key.strip():
            return [self.google_api_key.strip()]
        return []


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # Ensure GOOGLE_API_KEY is always present in os.environ.
    #
    # ADK LlmAgent reads this env var at module-import time (before the
    # FastAPI lifespan runs init_gateway). If only GOOGLE_API_KEYS (plural)
    # is set in .env, google_api_key is "" and the original guard never fires,
    # causing "No API key was provided." at runtime.
    #
    # Priority:
    #   1. GOOGLE_API_KEY  — explicit single key (backward compat)
    #   2. First key from GOOGLE_API_KEYS pool — multi-key setup
    _startup_key = settings.google_api_key or (
        settings.gateway_api_keys_list[0] if settings.gateway_api_keys_list else ""
    )
    if _startup_key:
        os.environ["GOOGLE_API_KEY"] = _startup_key
    return settings
