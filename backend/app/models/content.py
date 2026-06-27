"""
ContentItem: Notes, Past Papers, Marking Schemes, Videos.
Files are stored on disk; this row tracks metadata + path.
"""
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ContentType


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)

    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    file_path = Column(String(500), nullable=True)  # relative path under UPLOAD_DIR
    external_url = Column(String(500), nullable=True)  # e.g. for hosted video links

    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    unit = relationship("Unit", back_populates="content_items")
    uploaded_by = relationship("User", back_populates="uploaded_content", foreign_keys=[uploaded_by_id])
