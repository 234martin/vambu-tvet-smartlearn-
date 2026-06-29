"""
Database engine, session factory, and declarative base.

Supports either PostgreSQL (production-style, e.g.
postgresql://user:pass@host/db) or SQLite (zero-setup, e.g.
sqlite:///./vsl.db) depending on DATABASE_URL. SQLite needs
check_same_thread=False since FastAPI may touch a connection from a
different thread than the one that created it; Postgres doesn't need
or want that argument.

Some hosts (Render, Heroku, etc.) hand out connection strings starting
with "postgres://" rather than "postgresql://" -- the former isn't
accepted by SQLAlchemy's psycopg2 dialect, so we normalize it here.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

_database_url = settings.database_url
if _database_url.startswith("postgres://"):
    _database_url = _database_url.replace("postgres://", "postgresql://", 1)

_connect_args = {"check_same_thread": False} if _database_url.startswith("sqlite") else {}

engine = create_engine(_database_url, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
