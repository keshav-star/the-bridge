"""Central settings loaded from environment variables via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ───────────────────────────────────────────
    APP_NAME: str = "The Bridge"
    DEBUG: bool = True

    # ── Database ──────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://bridge:bridge_secret@db:5432/bridge_db"
    DATABASE_URL_SYNC: str = "postgresql://bridge:bridge_secret@db:5432/bridge_db"

    # ── OpenAI ────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_EMBED_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    VECTOR_DIMENSION: int = 1536

    # ── CORS ──────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://frontend:3000",
    ]


settings = Settings()
