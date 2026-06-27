from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProgressUpdate(BaseModel):
    unit_id: int
    is_completed: bool = False
    completion_pct: float = 0.0


class ProgressOut(BaseModel):
    id: int
    student_id: int
    unit_id: int
    is_completed: bool
    completion_pct: float
    last_accessed: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentOverview(BaseModel):
    """Aggregate summary for a single student — used in teacher dashboards."""
    student_id: int
    full_name: str
    email: str
    level: Optional[str] = None
    course_name: Optional[str] = None
    units_completed: int
    units_total: int
    average_quiz_score: Optional[float] = None
    quizzes_taken: int


class CourseAnalytics(BaseModel):
    course_id: int
    course_name: str
    level: str
    student_count: int
    average_quiz_score: Optional[float] = None
    average_completion_pct: float
