from typing import Optional

from pydantic import BaseModel

from app.models.enums import CBETLevel


class CourseCreate(BaseModel):
    name: str
    level: CBETLevel
    description: Optional[str] = None


class CourseOut(BaseModel):
    id: int
    name: str
    level: CBETLevel
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UnitCreate(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None  # null if is_common=True
    is_common: bool = False
    order_index: int = 0


class UnitOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    is_common: bool
    order_index: int

    class Config:
        from_attributes = True
