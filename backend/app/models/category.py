from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class Category(Base):
    __tablename__ = "categories"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(50), nullable=False)
    icon       = Column(String(10))
    color_hex  = Column(String(7))
    is_default = Column(Boolean, default=True)
