"""
Progress tracking + analytics endpoints.

- Students mark/update their own progress per unit.
- Teachers see aggregate analytics: per-student overview, per-course stats.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_student, require_teacher
from app.models.course import Course, Unit
from app.models.enums import CBET_LEVEL_LABELS, UserRole
from app.models.progress import ProgressRecord
from app.models.quiz import QuizAttempt
from app.models.user import User
from app.schemas.progress import CourseAnalytics, ProgressOut, ProgressUpdate, StudentOverview

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.post("", response_model=ProgressOut)
def upsert_progress(
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    unit = db.query(Unit).filter(Unit.id == payload.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    record = (
        db.query(ProgressRecord)
        .filter(ProgressRecord.student_id == current_user.id, ProgressRecord.unit_id == payload.unit_id)
        .first()
    )
    if not record:
        record = ProgressRecord(student_id=current_user.id, unit_id=payload.unit_id)
        db.add(record)

    record.is_completed = payload.is_completed
    record.completion_pct = payload.completion_pct
    db.commit()
    db.refresh(record)
    return record


@router.get("/me", response_model=List[ProgressOut])
def my_progress(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    return db.query(ProgressRecord).filter(ProgressRecord.student_id == current_user.id).all()


@router.get("/student/{student_id}", response_model=List[ProgressOut])
def progress_for_student(student_id: int, db: Session = Depends(get_db), _: User = Depends(require_teacher)):
    return db.query(ProgressRecord).filter(ProgressRecord.student_id == student_id).all()


@router.get("/overview/students", response_model=List[StudentOverview])
def students_overview(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher),
):
    """Teacher dashboard: per-student summary, optionally filtered by course."""
    query = db.query(User).filter(User.role == UserRole.STUDENT)
    if course_id:
        query = query.filter(User.course_id == course_id)
    students = query.all()

    results = []
    for student in students:
        course = db.query(Course).filter(Course.id == student.course_id).first() if student.course_id else None

        # Units visible to this student = course units + common units
        if student.course_id:
            unit_ids = [
                u.id
                for u in db.query(Unit)
                .filter((Unit.course_id == student.course_id) | (Unit.is_common == True))  # noqa: E712
                .all()
            ]
        else:
            unit_ids = [u.id for u in db.query(Unit).filter(Unit.is_common == True).all()]  # noqa: E712

        progress_records = (
            db.query(ProgressRecord)
            .filter(ProgressRecord.student_id == student.id, ProgressRecord.unit_id.in_(unit_ids))
            .all()
            if unit_ids
            else []
        )
        units_completed = sum(1 for p in progress_records if p.is_completed)

        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.student_id == student.id, QuizAttempt.score.isnot(None)
        ).all()
        avg_score = sum(a.score for a in attempts) / len(attempts) if attempts else None

        results.append(
            StudentOverview(
                student_id=student.id,
                full_name=student.full_name,
                email=student.email,
                level=CBET_LEVEL_LABELS.get(student.level) if student.level else None,
                course_name=course.name if course else None,
                units_completed=units_completed,
                units_total=len(unit_ids),
                average_quiz_score=round(avg_score, 1) if avg_score is not None else None,
                quizzes_taken=len(attempts),
            )
        )
    return results


@router.get("/overview/courses", response_model=List[CourseAnalytics])
def courses_overview(db: Session = Depends(get_db), _: User = Depends(require_teacher)):
    """Teacher/admin dashboard: per-course aggregate analytics."""
    courses = db.query(Course).all()
    results = []
    for course in courses:
        students = db.query(User).filter(User.course_id == course.id, User.role == UserRole.STUDENT).all()
        student_ids = [s.id for s in students]

        unit_ids = [
            u.id
            for u in db.query(Unit).filter((Unit.course_id == course.id) | (Unit.is_common == True)).all()  # noqa: E712
        ]

        avg_completion = 0.0
        if student_ids and unit_ids:
            records = (
                db.query(ProgressRecord)
                .filter(ProgressRecord.student_id.in_(student_ids), ProgressRecord.unit_id.in_(unit_ids))
                .all()
            )
            if records:
                avg_completion = sum(r.completion_pct for r in records) / len(records)

        avg_score = None
        if student_ids:
            attempts = (
                db.query(QuizAttempt)
                .filter(QuizAttempt.student_id.in_(student_ids), QuizAttempt.score.isnot(None))
                .all()
            )
            if attempts:
                avg_score = round(sum(a.score for a in attempts) / len(attempts), 1)

        results.append(
            CourseAnalytics(
                course_id=course.id,
                course_name=course.name,
                level=CBET_LEVEL_LABELS.get(course.level, course.level.value),
                student_count=len(students),
                average_quiz_score=avg_score,
                average_completion_pct=round(avg_completion, 1),
            )
        )
    return results
