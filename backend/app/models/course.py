"""
Course and Unit models.

A Course belongs to a CBET level (e.g. "Plumbing" at Level 3).
A Unit belongs to a Course, OR is marked `is_common=True` meaning it is
visible to every student regardless of their enrolled course/level
(e.g. Safety, Math Basics, English Basics - per the spec's "common units"
rule).
"""
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import CBETLevel


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)  # e.g. "Plumbing", "Motor Vehicle Mechanics"
    level = Column(Enum(CBETLevel), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    units = relationship("Unit", back_populates="course", cascade="all, delete-orphan")
    students = relationship("User", back_populates="course")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    # Null course_id + is_common=True => visible to ALL students on ANY course/level
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    is_common = Column(Boolean, default=False, nullable=False)

    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="units")
    content_items = relationship("ContentItem", back_populates="unit", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="unit", cascade="all, delete-orphan")
    progress_records = relationship("ProgressRecord", back_populates="unit", cascade="all, delete-orphan")
