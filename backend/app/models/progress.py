"""
ProgressRecord: tracks per-student, per-unit completion status,
used for the student/teacher progress dashboards and analytics.
"""
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ProgressRecord(Base):
    __tablename__ = "progress_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)

    is_completed = Column(Boolean, default=False, nullable=False)
    completion_pct = Column(Float, default=0.0, nullable=False)  # 0-100
    last_accessed = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    student = relationship("User", back_populates="progress_records")
    unit = relationship("Unit", back_populates="progress_records")
