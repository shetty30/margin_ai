from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.db.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.dashboard import get_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
def dashboard(year: int=Query(default=date.today().year), month: int=Query(default=date.today().month),
              db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    return get_dashboard(db, user, year, month)
