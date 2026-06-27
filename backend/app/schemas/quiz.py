from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel

from app.models.enums import QuestionType


class QuestionCreate(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.MCQ
    options: Optional[List[str]] = None  # for MCQ
    correct_answer: str
    points: int = 1
    order_index: int = 0


class QuestionOut(BaseModel):
    """Used when a TEACHER views a question — includes the correct answer."""
    id: int
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    correct_answer: str
    points: int
    order_index: int

    class Config:
        from_attributes = True


class QuestionForStudent(BaseModel):
    """Used when a STUDENT takes a quiz — correct_answer is hidden."""
    id: int
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    points: int
    order_index: int

    class Config:
        from_attributes = True


class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    unit_id: int
    time_limit_minutes: Optional[int] = None
    questions: List[QuestionCreate] = []


class QuizOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    unit_id: int
    time_limit_minutes: Optional[int] = None
    created_by_id: int

    class Config:
        from_attributes = True


class QuizDetailForTeacher(QuizOut):
    questions: List[QuestionOut] = []


class QuizDetailForStudent(QuizOut):
    questions: List[QuestionForStudent] = []


class QuizSubmission(BaseModel):
    answers: Dict[int, str]  # question_id -> submitted answer


class QuizAttemptOut(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    score: Optional[float] = None
    max_score: Optional[float] = None
    is_graded: bool
    started_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
