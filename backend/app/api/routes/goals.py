from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from decimal import Decimal
from datetime import date
from typing import Optional
from app.db.database import get_db
from app.models.user import User
from app.models.goal import Goal
from app.services.auth import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])

class GoalIn(BaseModel):
    title: str; target_amount: Decimal; saved_amount: Decimal=Decimal("0")
    deadline: date; emoji: Optional[str]="🎯"

@router.get("/")
def list_goals(db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    gs = db.query(Goal).filter(Goal.user_id==user.id, Goal.status=="active").all()
    return [{"id":g.id,"title":g.title,"target":float(g.target_amount),"saved":float(g.saved_amount),
             "deadline":str(g.deadline),"status":g.status,"emoji":g.emoji,
             "pct":round(float(g.saved_amount)/float(g.target_amount)*100,1) if g.target_amount else 0} for g in gs]

@router.post("/")
def create_goal(data: GoalIn, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    g = Goal(user_id=user.id, **data.model_dump())
    db.add(g); db.commit(); db.refresh(g)
    return g

@router.patch("/{goal_id}/deposit")
def deposit(goal_id: int, amount: float, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id==goal_id, Goal.user_id==user.id).first()
    if not g: raise HTTPException(404,"Goal not found")
    g.saved_amount = float(g.saved_amount)+amount
    if float(g.saved_amount)>=float(g.target_amount): g.status="completed"
    db.commit()
    return {"saved":float(g.saved_amount),"status":g.status}
