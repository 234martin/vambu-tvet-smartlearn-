from typing import Optional

from pydantic import BaseModel

from app.models.enums import ContentType


class ContentItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: ContentType
    unit_id: int
    external_url: Optional[str] = None


class ContentItemOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content_type: ContentType
    unit_id: int
    file_path: Optional[str] = None
    external_url: Optional[str] = None
    uploaded_by_id: int

    class Config:
        from_attributes = True
