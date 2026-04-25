from sqlalchemy import Column, Integer, String, Numeric, Date, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Goal(Base):
    __tablename__ = "goals"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title         = Column(String(100), nullable=False)
    target_amount = Column(Numeric(10, 2), nullable=False)
    saved_amount  = Column(Numeric(10, 2), default=0)
    deadline      = Column(Date, nullable=False)
    status        = Column(Enum("active","completed","paused"), default="active")
    emoji         = Column(String(5), default="🎯")
    created_at    = Column(DateTime, server_default=func.now())
    user          = relationship("User", back_populates="goals")
