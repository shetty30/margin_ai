from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(100), nullable=False)
    email            = Column(String(150), unique=True, nullable=False, index=True)
    password_hash    = Column(String(255), nullable=False)
    avatar_url       = Column(String(500), nullable=True)
    phone            = Column(String(15), nullable=True)
    city             = Column(String(100), nullable=True)
    occupation       = Column(String(100), nullable=True)
    bio              = Column(Text, nullable=True)
    monthly_income   = Column(Numeric(10, 2), default=0)
    savings_target   = Column(Numeric(10, 2), default=0)
    currency         = Column(String(3), default="INR")
    onboarded        = Column(Integer, default=0)
    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, server_default=func.now(), onupdate=func.now())

    transactions  = relationship("Transaction", back_populates="user", cascade="all, delete")
    goals         = relationship("Goal", back_populates="user", cascade="all, delete")
    budget_configs= relationship("BudgetConfig", back_populates="user", cascade="all, delete")
