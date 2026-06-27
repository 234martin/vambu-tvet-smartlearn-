"""
Courses & Units endpoints.

Access rule (per spec):
- Students see: units belonging to their enrolled course, PLUS all units marked is_common=True.
- Teachers/Admins see everything (and manage course/unit creation).
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_teacher
from app.models.course import Course, Unit
from app.models.enums import CBETLevel, UserRole
from app.models.user import User
from app.schemas.course import CourseCreate, CourseOut, UnitCreate, UnitOut

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=List[CourseOut])
def list_courses(
    level: Optional[CBETLevel] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Course)
    if level:
        query = query.filter(Course.level == level)
    return query.order_by(Course.level, Course.name).all()


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher),
):
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/units", response_model=List[UnitOut])
def list_units_for_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns units a user is allowed to see for this course:
    course-specific units + common units. Enforces that students can
    only browse units for THEIR OWN enrolled course.
    """
    if current_user.role == UserRole.STUDENT and current_user.course_id != course_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access units for your enrolled course",
        )

    units = (
        db.query(Unit)
        .filter((Unit.course_id == course_id) | (Unit.is_common == True))  # noqa: E712
        .order_by(Unit.is_common, Unit.order_index)
        .all()
    )
    return units


@router.post("/units", response_model=UnitOut, status_code=status.HTTP_201_CREATED)
def create_unit(
    payload: UnitCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher),
):
    if not payload.is_common and not payload.course_id:
        raise HTTPException(
            status_code=400,
            detail="A unit must either be marked common or belong to a course",
        )
    unit = Unit(**payload.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.get("/units/common", response_model=List[UnitOut])
def list_common_units(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Unit).filter(Unit.is_common == True).order_by(Unit.order_index).all()  # noqa: E712
