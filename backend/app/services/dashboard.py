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
    # ── Expenses only (negative amounts) ──────────────────────
    spent_scalar = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id==user.id,
        extract("year",Transaction.txn_date)==year,
        extract("month",Transaction.txn_date)==month,
        Transaction.amount < 0,
    ).scalar()
    total_spent = abs(float(spent_scalar or 0))   # always positive

    # ── Actual income transactions (positive amounts) ──────────
    income_scalar = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id==user.id,
        extract("year",Transaction.txn_date)==year,
        extract("month",Transaction.txn_date)==month,
        Transaction.amount > 0,
    ).scalar()
    txn_income = float(income_scalar or 0)

    # Use transaction income if recorded, else fall back to profile income
    effective_income = txn_income if txn_income > 0 else income
    budget = effective_income - savings

    cats = db.query(Category.id,Category.name,Category.color_hex,func.sum(Transaction.amount).label("total")).join(
        Transaction,Transaction.category_id==Category.id
    ).filter(
        Transaction.user_id==user.id,
        extract("year",Transaction.txn_date)==year,
        extract("month",Transaction.txn_date)==month,
        Transaction.amount < 0,  # expenses only
    ).group_by(Category.id, Category.name, Category.color_hex).all()
    cats = sorted(cats, key=lambda r: abs(float(r.total or 0)), reverse=True)

    # Daily spend chart — expenses only, shown as positive values
    daily = db.query(Transaction.txn_date,func.sum(Transaction.amount).label("day_total")).filter(
        Transaction.user_id==user.id,
        extract("year",Transaction.txn_date)==year,
        extract("month",Transaction.txn_date)==month,
        Transaction.amount < 0,
    ).group_by(Transaction.txn_date).order_by(Transaction.txn_date).all()

    goals = db.query(Goal).filter(Goal.user_id==user.id,Goal.status=="active").all()
    recent = db.query(Transaction).filter(Transaction.user_id==user.id).order_by(Transaction.created_at.desc()).limit(5).all()
    days = max(1,date.today().day if date.today().month==month and date.today().year==year else 30)
    return {
        "income": effective_income,
        "savings_target": savings,
        "expense_budget": budget,
        "total_spent": total_spent,
        "remaining": budget - total_spent,
        "savings_rate": round(savings/effective_income*100,1) if effective_income>0 else 0,
        "daily_avg": round(total_spent/days,2),
        "by_category":[{"id":r.id,"name":r.name,"color":r.color_hex,"total":abs(float(r.total))} for r in cats],
        "daily_spend":[{"day":str(r.txn_date),"total":abs(float(r.day_total))} for r in daily],
        "goals":[{"title":g.title,"target":float(g.target_amount),"saved":float(g.saved_amount),"deadline":str(g.deadline),"emoji":g.emoji} for g in goals],
        "recent_txns":[{"merchant":t.merchant,"amount":float(t.amount),"date":str(t.txn_date)} for t in recent],
    }
