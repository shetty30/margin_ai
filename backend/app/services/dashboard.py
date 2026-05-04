from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget_config import BudgetConfig
from app.models.goal import Goal
from app.models.user import User

def get_dashboard(db: Session, user: User, year: int, month: int) -> dict:
    income = float(user.monthly_income or 0)
    savings = float(user.savings_target or 0)
    budget = income - savings
    cfg = db.query(BudgetConfig).filter(
        BudgetConfig.user_id==user.id,
        BudgetConfig.month_year==f"{year}-{month:02d}"
    ).first()
    if cfg:
        income = float(cfg.income or income)
        savings = float(cfg.savings_target or savings)
        budget = income - savings
    spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id==user.id,
        extract("year",Transaction.txn_date)==year,
        extract("month",Transaction.txn_date)==month,
    ).scalar()
    total_spent = float(spent or 0)
    cats = db.query(Category.id,Category.name,Category.color_hex,func.sum(Transaction.amount).label("total")).join(
        Transaction,Transaction.category_id==Category.id
    ).filter(Transaction.user_id==user.id,extract("year",Transaction.txn_date)==year,extract("month",Transaction.txn_date)==month
    ).group_by(Category.id).all()
    cats = sorted(cats, key=lambda r: float(r.total or 0), reverse=True)  # sort by spend desc in Python
    daily = db.query(Transaction.txn_date,func.sum(Transaction.amount).label("t")).filter(
        Transaction.user_id==user.id,extract("year",Transaction.txn_date)==year,extract("month",Transaction.txn_date)==month
    ).group_by(Transaction.txn_date).order_by(Transaction.txn_date).all()
    goals = db.query(Goal).filter(Goal.user_id==user.id,Goal.status=="active").all()
    recent = db.query(Transaction).filter(Transaction.user_id==user.id).order_by(Transaction.created_at.desc()).limit(5).all()
    days = max(1,date.today().day if date.today().month==month and date.today().year==year else 30)
    return {
        "income":income,"savings_target":savings,"expense_budget":budget,
        "total_spent":total_spent,"remaining":budget-total_spent,
        "savings_rate":round(savings/income*100,1) if income>0 else 0,
        "daily_avg":round(total_spent/days,2),
        "by_category":[{"id":r.id,"name":r.name,"color":r.color_hex,"total":float(r.total)} for r in cats],
        "daily_spend":[{"day":str(r.txn_date),"total":float(r.t)} for r in daily],
        "goals":[{"title":g.title,"target":float(g.target_amount),"saved":float(g.saved_amount),"deadline":str(g.deadline),"emoji":g.emoji} for g in goals],
        "recent_txns":[{"merchant":t.merchant,"amount":float(t.amount),"date":str(t.txn_date)} for t in recent],
    }
