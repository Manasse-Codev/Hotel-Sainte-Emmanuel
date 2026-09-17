import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Ensure SQLite directory exists if custom mount path is used (e.g. Render Persistent Disk)
if settings.DATABASE_URL.startswith("sqlite:///"):
    clean_url = settings.DATABASE_URL.replace("sqlite:///", "")
    if clean_url.startswith("/"):
        db_file_path = Path("/" + clean_url.lstrip("/"))
    else:
        db_file_path = Path(clean_url)
    try:
        db_file_path.parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

# SQLite connection arguments
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
