"""
User management endpoints (admin/teacher use): list students, deactivate accounts, etc.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin, require_teacher
from app.models.enums import CBETLevel, UserRole
from app.models.user import User
from app.schemas.auth import UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = None,
    course_id: Optional[int] = None,
    level: Optional[CBETLevel] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if course_id:
        query = query.filter(User.course_id == course_id)
    if level:
        query = query.filter(User.level == level)
    return query.all()


@router.patch("/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/reactivate", response_model=UserOut)
def reactivate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/assign-course", response_model=UserOut)
def assign_course(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher),
):
    """Enroll/move a student into a course (and align their level to the course's level)."""
    from app.models.course import Course

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    user.course_id = course.id
    user.level = course.level
    db.commit()
    db.refresh(user)
    return user
