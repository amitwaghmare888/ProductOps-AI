import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Legacy Gemini (disabled)
    google_api_key: str = ""
    google_genai_use_vertexai: bool = False
    
    # OpenAI Configuration
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    ai_provider: str = "openai"
    
    database_url: str = "sqlite+aiosqlite:///./productops.db"
    backend_host: str = "localhost"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # Model config (legacy names for compatibility)
    agent_model: str = "gpt-4o-mini"
    judge_model: str = "gpt-4o-mini"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # Set OpenAI API key in environment
    if settings.openai_api_key:
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
    # Legacy Gemini support (disabled)
    if settings.google_api_key:
        os.environ["GOOGLE_API_KEY"] = settings.google_api_key
    return settings
