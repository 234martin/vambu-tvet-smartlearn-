"""
Central application configuration.
Reads from environment variables / .env file.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql://vsl_user:vsl_password@localhost:5432/vsl_db"

    # Auth
    secret_key: str = "dev-secret-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24h

    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Uploads
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 50

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
