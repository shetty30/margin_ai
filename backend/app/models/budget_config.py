from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base

class BudgetConfig(Base):
    __tablename__ = "budget_configs"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month_year     = Column(String(7), nullable=False)
    income         = Column(Numeric(10, 2))
    savings_target = Column(Numeric(10, 2))
    __table_args__ = (UniqueConstraint("user_id", "month_year", name="uq_user_month"),)
    user           = relationship("User", back_populates="budget_configs")

    @property
    def derived_expense_budget(self):
        return float(self.income or 0) - float(self.savings_target or 0)
