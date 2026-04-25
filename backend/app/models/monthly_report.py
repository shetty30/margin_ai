from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class MonthlyReport(Base):
    __tablename__ = "monthly_reports"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_year      = Column(String(7), nullable=False)
    total_spent     = Column(Numeric(10, 2))
    savings_rate    = Column(Numeric(5, 2))
    top_category_id = Column(Integer, ForeignKey("categories.id"))
    ai_insight_text = Column(Text)
    generated_at    = Column(DateTime, server_default=func.now())
