"""
Content endpoints: Notes, Past Papers, Marking Schemes, Videos.

Students can only list/download content for units they're allowed to see
(their course's units + common units). Teachers/Admins upload content.
"""
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_teacher
from app.models.content import ContentItem
from app.models.course import Unit
from app.models.enums import ContentType, UserRole
from app.models.user import User
from app.schemas.content import ContentItemCreate, ContentItemOut

router = APIRouter(prefix="/api/content", tags=["content"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".mp4", ".webm", ".png", ".jpg", ".jpeg"}


def _user_can_access_unit(user: User, unit: Unit) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.TEACHER):
        return True
    if unit.is_common:
        return True
    return unit.course_id == user.course_id


@router.get("/unit/{unit_id}", response_model=List[ContentItemOut])
def list_content_for_unit(unit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    if not _user_can_access_unit(current_user, unit):
        raise HTTPException(status_code=403, detail="You don't have access to this unit's content")

    return db.query(ContentItem).filter(ContentItem.unit_id == unit_id).all()


@router.post("/upload", response_model=ContentItemOut, status_code=status.HTTP_201_CREATED)
async def upload_content(
    title: str,
    content_type: ContentType,
    unit_id: int,
    description: Optional[str] = None,
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    file_path = None
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type {ext} is not allowed")

        os.makedirs(settings.upload_dir, exist_ok=True)
        stored_name = f"{uuid.uuid4().hex}{ext}"
        full_path = os.path.join(settings.upload_dir, stored_name)
        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_path = stored_name

    item = ContentItem(
        title=title,
        description=description,
        content_type=content_type,
        unit_id=unit_id,
        file_path=file_path,
        uploaded_by_id=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{content_id}/download")
def download_content(content_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ContentItem).filter(ContentItem.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    unit = db.query(Unit).filter(Unit.id == item.unit_id).first()
    if not _user_can_access_unit(current_user, unit):
        raise HTTPException(status_code=403, detail="You don't have access to this content")

    if not item.file_path:
        raise HTTPException(status_code=404, detail="This content item has no file attached")

    full_path = os.path.join(settings.upload_dir, item.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File missing from storage")

    return FileResponse(full_path, filename=item.title)


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(content_id: int, db: Session = Depends(get_db), _: User = Depends(require_teacher)):
    item = db.query(ContentItem).filter(ContentItem.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    if item.file_path:
        full_path = os.path.join(settings.upload_dir, item.file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    db.delete(item)
    db.commit()
