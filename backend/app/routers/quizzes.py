"""
Quiz endpoints: create (teacher), take (student), submit + auto-grade.

Auto-grading rule:
- MCQ / TRUE_FALSE: exact-match (case-insensitive, trimmed) against correct_answer.
- SHORT_ANSWER: stored but excluded from the auto-graded score; is_graded
  stays False until a teacher reviews it (manual grading endpoint provided).
"""
import json
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_student, require_teacher
from app.models.course import Unit
from app.models.enums import QuestionType, UserRole
from app.models.quiz import Question, Quiz, QuizAttempt
from app.models.user import User
from app.schemas.quiz import (
    QuizAttemptOut,
    QuizCreate,
    QuizDetailForStudent,
    QuizDetailForTeacher,
    QuizOut,
    QuizSubmission,
)

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


def _user_can_access_unit(user: User, unit: Unit) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.TEACHER):
        return True
    if unit.is_common:
        return True
    return unit.course_id == user.course_id


def _question_to_dict(q: Question) -> dict:
    return {
        "id": q.id,
        "question_text": q.question_text,
        "question_type": q.question_type,
        "options": json.loads(q.options) if q.options else None,
        "points": q.points,
        "order_index": q.order_index,
    }


def _serialize_quiz_for_teacher(quiz: Quiz) -> dict:
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "unit_id": quiz.unit_id,
        "time_limit_minutes": quiz.time_limit_minutes,
        "created_by_id": quiz.created_by_id,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": json.loads(q.options) if q.options else None,
                "correct_answer": q.correct_answer,
                "points": q.points,
                "order_index": q.order_index,
            }
            for q in quiz.questions
        ],
    }


@router.post("", response_model=QuizDetailForTeacher, status_code=status.HTTP_201_CREATED)
def create_quiz(payload: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(require_teacher)):
    unit = db.query(Unit).filter(Unit.id == payload.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    quiz = Quiz(
        title=payload.title,
        description=payload.description,
        unit_id=payload.unit_id,
        time_limit_minutes=payload.time_limit_minutes,
        created_by_id=current_user.id,
    )
    db.add(quiz)
    db.flush()  # get quiz.id before adding questions

    for q in payload.questions:
        question = Question(
            quiz_id=quiz.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=json.dumps(q.options) if q.options else None,
            correct_answer=q.correct_answer,
            points=q.points,
            order_index=q.order_index,
        )
        db.add(question)

    db.commit()
    db.refresh(quiz)
    return _serialize_quiz_for_teacher(quiz)


@router.get("/unit/{unit_id}", response_model=List[QuizOut])
def list_quizzes_for_unit(unit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    if not _user_can_access_unit(current_user, unit):
        raise HTTPException(status_code=403, detail="You don't have access to this unit's quizzes")
    return db.query(Quiz).filter(Quiz.unit_id == unit_id).all()


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    unit = db.query(Unit).filter(Unit.id == quiz.unit_id).first()
    if not _user_can_access_unit(current_user, unit):
        raise HTTPException(status_code=403, detail="You don't have access to this quiz")

    if current_user.role == UserRole.STUDENT:
        return QuizDetailForStudent(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            unit_id=quiz.unit_id,
            time_limit_minutes=quiz.time_limit_minutes,
            created_by_id=quiz.created_by_id,
            questions=[_question_to_dict(q) for q in quiz.questions],
        )
    return _serialize_quiz_for_teacher(quiz)


@router.post("/{quiz_id}/submit", response_model=QuizAttemptOut)
def submit_quiz(
    quiz_id: int,
    payload: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    unit = db.query(Unit).filter(Unit.id == quiz.unit_id).first()
    if not _user_can_access_unit(current_user, unit):
        raise HTTPException(status_code=403, detail="You don't have access to this quiz")

    total_points = 0
    earned_points = 0
    auto_gradable_total = 0
    has_short_answer = False

    for question in quiz.questions:
        total_points += question.points
        submitted = payload.answers.get(question.id, "").strip().lower()

        if question.question_type in (QuestionType.MCQ, QuestionType.TRUE_FALSE):
            auto_gradable_total += question.points
            if submitted == question.correct_answer.strip().lower():
                earned_points += question.points
        else:
            has_short_answer = True

    score_pct = (earned_points / auto_gradable_total * 100) if auto_gradable_total > 0 else None

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=current_user.id,
        answers=json.dumps(payload.answers),
        score=score_pct,
        max_score=100.0 if score_pct is not None else None,
        is_graded=not has_short_answer,  # fully auto-graded only if no short answers
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("/attempts/me", response_model=List[QuizAttemptOut])
def my_attempts(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    return db.query(QuizAttempt).filter(QuizAttempt.student_id == current_user.id).all()


@router.get("/{quiz_id}/attempts", response_model=List[QuizAttemptOut])
def attempts_for_quiz(quiz_id: int, db: Session = Depends(get_db), _: User = Depends(require_teacher)):
    return db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id).all()
