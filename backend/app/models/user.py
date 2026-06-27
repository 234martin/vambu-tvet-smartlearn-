"""
User model: admins, teachers, students.
"""
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import CBETLevel, UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)

    # Students are tied to a level + course (per access-restriction rules in the spec).
    # Teachers/admins may leave these null.
    level = Column(Enum(CBETLevel), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="students")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")
    progress_records = relationship("ProgressRecord", back_populates="student", cascade="all, delete-orphan")
    uploaded_content = relationship("ContentItem", back_populates="uploaded_by", foreign_keys="ContentItem.uploaded_by_id")
