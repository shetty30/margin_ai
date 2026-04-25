from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.category import Category
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/")
def list_cats(db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    return db.query(Category).all()
