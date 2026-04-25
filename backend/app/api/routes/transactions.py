from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import Optional
from datetime import date
from pydantic import BaseModel
from decimal import Decimal
from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.services.auth import get_current_user
from app.services.ai_categoriser import parse_sms, categorise_groq

router = APIRouter(prefix="/transactions", tags=["transactions"])

class TxnIn(BaseModel):
    amount: Decimal; merchant: Optional[str]=None; category_id: Optional[int]=None
    payment_method: str="UPI"; txn_date: date; is_recurring: bool=False
    note: Optional[str]=None; source: str="manual"

class SMSIn(BaseModel):
    sms_text: str

@router.get("/")
def list_txns(year: int=Query(default=date.today().year), month: int=Query(default=date.today().month),
              category_id: Optional[int]=None, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    q = db.query(Transaction).filter(Transaction.user_id==user.id,
        extract("year",Transaction.txn_date)==year, extract("month",Transaction.txn_date)==month)
    if category_id: q=q.filter(Transaction.category_id==category_id)
    return q.order_by(Transaction.txn_date.desc()).all()

@router.post("/")
def create_txn(data: TxnIn, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    t = Transaction(user_id=user.id, **data.model_dump())
    db.add(t); db.commit(); db.refresh(t)
    return t

@router.delete("/{txn_id}")
def delete_txn(txn_id: int, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    t = db.query(Transaction).filter(Transaction.id==txn_id, Transaction.user_id==user.id).first()
    if not t:
        from fastapi import HTTPException; raise HTTPException(404,"Not found")
    db.delete(t); db.commit()
    return {"deleted": True}

@router.post("/parse-sms")
async def parse_sms_route(data: SMSIn, user: User=Depends(get_current_user)):
    r = parse_sms(data.sms_text)
    if r["parsed"] and r["category"]=="Misc" and r["merchant"]:
        r["category"] = await categorise_groq(r["merchant"], float(r["amount"] or 0))
    return {**r, "raw_sms": data.sms_text}
