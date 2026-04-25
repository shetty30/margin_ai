from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, Text, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount         = Column(Numeric(10, 2), nullable=False)
    merchant       = Column(String(150))
    category_id    = Column(Integer, ForeignKey("categories.id"), index=True)
    payment_method = Column(Enum("UPI","NEFT","Card","Cash","Auto-debit","Other"), default="UPI")
    txn_date       = Column(Date, nullable=False, index=True)
    is_recurring   = Column(Boolean, default=False)
    note           = Column(Text)
    source         = Column(Enum("manual","sms","import"), default="manual")
    created_at     = Column(DateTime, server_default=func.now())
    user           = relationship("User", back_populates="transactions")
    category       = relationship("Category")
