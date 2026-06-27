# VAMBU TVET SmartLearn — Backend API

FastAPI + PostgreSQL backend for the VSL learning platform.

## Features implemented

- **Auth**: JWT login/register, role-based access (admin / teacher / student)
- **CBET structure**: Levels 2–6, Courses, Units (course-specific + common units visible to everyone)
- **Content**: Notes, Past Papers, Marking Schemes, Videos — file upload + access-controlled download
- **Quizzes**: MCQ / True-False (auto-graded) + Short Answer (flagged for manual review)
- **Progress tracking**: per-student, per-unit completion
- **Analytics**: teacher dashboards — per-student overview, per-course aggregate stats
- **Access control**: students only see units belonging to their enrolled course, plus all "common" units (Safety, Math Basics, English Basics, etc.) — matching the spec's CBET access rules

## Setup

### 1. Install PostgreSQL and create a database

```bash
sudo -u postgres psql
CREATE DATABASE vsl_db;
CREATE USER vsl_user WITH PASSWORD 'vsl_password';
GRANT ALL PRIVILEGES ON DATABASE vsl_db TO vsl_user;
\q
```

### 2. Set up the Python environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL, SECRET_KEY, CORS_ORIGINS to match your setup
```

### 4. Seed demo data (creates tables + sample admin/teacher/student accounts)

```bash
python -m app.seed
```

This creates:
| Role | Email | Password |
|---|---|---|
| Admin | admin@vsl.ac.ke | Admin@123 |
| Teacher | teacher@vsl.ac.ke | Teacher@123 |
| Student (Plumbing, L3) | student1@vsl.ac.ke | Student@123 |
| Student (Motor Vehicle, L3) | student2@vsl.ac.ke | Student@123 |

**Change these passwords before any real deployment.**

### 5. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs (interactive): http://localhost:8000/docs

## Project structure

```
app/
  core/        # config, database session, security (JWT/bcrypt), auth dependencies
  models/      # SQLAlchemy ORM models (User, Course, Unit, ContentItem, Quiz, Question, QuizAttempt, ProgressRecord)
  schemas/     # Pydantic request/response schemas
  routers/     # API endpoints grouped by feature
  main.py      # FastAPI app entry point
  seed.py      # demo data seeder
uploads/       # uploaded note/past-paper/video files (created automatically)
```

## Key access-control rule (CBET)

A student tied to `course_id=X` can see:
- All units where `Unit.course_id == X`
- All units where `Unit.is_common == True` (e.g. Workshop Safety, Math Basics)

They are blocked (`403`) from browsing units belonging to a different course. Teachers/Admins bypass this restriction entirely.

## Notes on the offline/LAN-sync features from the original spec

This build is a **single-deployment full-stack web app** as scoped. The original document's hybrid on-site LAN server + cloud sync architecture, and the AI Assistant chatbot, are **not** implemented here — they're natural next phases:
- A PWA service worker + IndexedDB caching layer on the frontend would add offline-first behavior.
- A separate lightweight sync service (or the same FastAPI app deployed on-site) could push/pull content + quiz attempts on an interval.
- The AI Assistant could be added as a new router calling an LLM API, gated behind the same role/unit access rules used for content.
