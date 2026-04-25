from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.services.auth import register_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(data: RegisterIn, db: Session=Depends(get_db)):
    user = register_user(db, data.name, data.email, data.password)
    from app.core.security import create_access_token
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "token_type": "bearer",
        "user": {"id":user.id,"name":user.name,"email":user.email,"onboarded":user.onboarded}
    }

@router.post("/login")
def login(data: LoginIn, db: Session=Depends(get_db)):
    r = login_user(db, data.email, data.password)
    u = r["user"]
    return {
        "access_token": r["access_token"],
        "token_type": "bearer",
        "user": {"id":u.id,"name":u.name,"email":u.email,"onboarded":u.onboarded,"avatar_url":u.avatar_url}
    }
