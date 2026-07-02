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

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.google_api_key:
        os.environ["GOOGLE_API_KEY"] = settings.google_api_key
    return settings
