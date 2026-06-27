"""
VAMBU TVET SmartLearn (VSL) - API entry point.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.models import *  # noqa: F401,F403  (ensures all models register on Base.metadata)
from app.routers import auth, content, courses, progress, quizzes, users

app = FastAPI(
    title="VAMBU TVET SmartLearn API",
    description="Learn Anywhere, Even Offline \u2014 CBET-aligned TVET learning platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)

# Create tables on startup (for prototype use; for production prefer Alembic migrations)
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(content.router)
app.include_router(quizzes.router)
app.include_router(progress.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {
        "name": "VAMBU TVET SmartLearn API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
