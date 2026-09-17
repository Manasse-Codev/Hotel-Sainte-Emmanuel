import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_FILE = BACKEND_DIR / "hotel.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hôtel Sainte Emmanuelle API"
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE}"
    SECRET_KEY: str = "hse_jwt_secret_key_soubre_nawa_2025_elegance"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def resolve_db_url(cls, v: str) -> str:
        if v and v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        if v and "sqlite:///./" in v:
            db_name = v.split("sqlite:///./")[-1]
            return f"sqlite:///{BACKEND_DIR / db_name}"
        return v or f"sqlite:///{DEFAULT_DB_FILE}"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        extra = "allow"

settings = Settings()
