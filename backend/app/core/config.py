from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_cors_origins: str = "http://localhost:8081,http://127.0.0.1:8081"

    database_url: str | None = None
    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    supabase_secret_key: str | None = None

    # One Gnani Speech API key authenticates Prisma STT and Timbre TTS.
    gnani_api_key: str | None = None
    gnani_speech_base_url: str = "https://api.vachana.ai"
    gnani_stt_model: str = "prisma-v3.0"
    gnani_stt_language_code: str = "indic-auto"
    gnani_tts_model: str = "timbre-v2.5"
    gnani_tts_voice: str = "Kaveri"
    gnani_tts_language: str = "auto"

    # Google AI Studio / Gemini API credentials for Gemma 4 text responses.
    gemini_api_key: str | None = None
    gemini_api_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    gemini_model: str = "gemma-4-26b-a4b-it"

    spotify_client_id: str | None = None
    spotify_redirect_uri: str = "pragya://auth/spotify/callback"
    spotify_scopes: str = "playlist-modify-private"


@lru_cache
def get_settings() -> Settings:
    return Settings()
