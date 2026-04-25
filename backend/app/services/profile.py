import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.config import settings

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = settings.MAX_AVATAR_SIZE_MB * 1024 * 1024

async def upload_avatar(db: Session, user: User, file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, or WebP images allowed")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(400, f"Image must be under {settings.MAX_AVATAR_SIZE_MB}MB")

    try:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(contents))
        img.thumbnail((400, 400))
        ext = "jpg" if file.content_type == "image/jpeg" else file.content_type.split("/")[1]
        filename = f"{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
        upload_path = Path(settings.UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)
        save_path = upload_path / filename
        img.save(save_path, quality=85, optimize=True)
    except Exception as e:
        raise HTTPException(500, f"Image processing failed: {str(e)}")

    if user.avatar_url:
        old_file = Path(settings.UPLOAD_DIR) / Path(user.avatar_url).name
        if old_file.exists():
            old_file.unlink()

    avatar_url = f"/avatars/{filename}"
    user.avatar_url = avatar_url
    db.commit()
    return avatar_url

def update_profile(db: Session, user: User, data: dict) -> User:
    allowed = {"name","phone","city","occupation","bio","monthly_income","savings_target"}
    for key, val in data.items():
        if key in allowed and val is not None:
            setattr(user, key, val)
    if data.get("monthly_income") is not None and data.get("savings_target") is not None:
        user.onboarded = 1
    db.commit()
    db.refresh(user)
    return user
