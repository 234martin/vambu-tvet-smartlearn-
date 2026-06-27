"""
Quiz / Question / QuizAttempt models.

Auto-grading: MCQ and TRUE_FALSE are graded automatically by comparing
the submitted answer to `correct_answer`. SHORT_ANSWER is stored but
flagged for manual teacher review (is_auto_gradable=False on the question).
"""
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import QuestionType


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    time_limit_minutes = Column(Integer, nullable=True)  # null = untimed
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    unit = relationship("Unit", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan", order_by="Question.order_index")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False, default=QuestionType.MCQ)

    # For MCQ: JSON-encoded list of options stored as text, e.g. '["A","B","C","D"]'
    options = Column(Text, nullable=True)
    correct_answer = Column(String(500), nullable=False)  # exact match string, or option key
    points = Column(Integer, default=1, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    score = Column(Float, nullable=True)  # percentage, null until graded
    max_score = Column(Float, nullable=True)
    is_graded = Column(Boolean, default=False, nullable=False)

    # JSON-encoded { question_id: submitted_answer }
    answers = Column(Text, nullable=False, default="{}")

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="quiz_attempts")
