from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from pathlib import Path
from app.db.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.profile import upload_avatar, update_profile
from app.core.config import settings

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    occupation: Optional[str] = None
    bio: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    savings_target: Optional[Decimal] = None

def user_to_dict(u: User) -> dict:
    return {
        "id": u.id, "name": u.name, "email": u.email,
        "avatar_url": u.avatar_url, "phone": u.phone,
        "city": u.city, "occupation": u.occupation, "bio": u.bio,
        "monthly_income": float(u.monthly_income or 0),
        "savings_target": float(u.savings_target or 0),
        "onboarded": u.onboarded,
        "created_at": str(u.created_at),
        "expense_budget": float(u.monthly_income or 0) - float(u.savings_target or 0),
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return user_to_dict(user)

@router.patch("/me")
def patch_profile(data: ProfileUpdate, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    updated = update_profile(db, user, data.model_dump(exclude_none=True))
    return user_to_dict(updated)

@router.post("/avatar")
async def upload_avatar_route(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    avatar_url = await upload_avatar(db, user, file)
    return {"avatar_url": avatar_url, "message": "Avatar updated successfully"}

@router.delete("/avatar")
def delete_avatar(db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    if user.avatar_url:
        old = Path(settings.UPLOAD_DIR) / Path(user.avatar_url).name
        if old.exists(): old.unlink()
    user.avatar_url = None
    db.commit()
    return {"message": "Avatar removed"}
