from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.enums import CBETLevel, UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT
    level: Optional[CBETLevel] = None
    course_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    level: Optional[CBETLevel] = None
    course_id: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
