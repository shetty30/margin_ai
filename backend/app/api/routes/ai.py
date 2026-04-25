from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from app.db.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.dashboard import get_dashboard
from app.services.ai_chat import chat, afford

router = APIRouter(prefix="/ai", tags=["ai"])

class ChatIn(BaseModel):
    message: str

class AffordIn(BaseModel):
    question: str

@router.post("/chat")
async def ai_chat(data: ChatIn, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    ctx = get_dashboard(db, user, date.today().year, date.today().month)
    return {"reply": await chat(data.message, ctx)}

@router.post("/afford")
async def ai_afford(data: AffordIn, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    ctx = get_dashboard(db, user, date.today().year, date.today().month)
    return await afford(data.question, ctx)
