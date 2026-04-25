from app.db.database import engine, Base
from app.models import User, Category, Transaction, Goal, BudgetConfig, MonthlyReport

CATS = [
    {"name":"Food & Dining","icon":"🍔","color_hex":"#6c5ce7"},
    {"name":"Transport","icon":"🚖","color_hex":"#0984e3"},
    {"name":"Shopping","icon":"🛒","color_hex":"#a29bfe"},
    {"name":"Entertainment","icon":"🎮","color_hex":"#fd79a8"},
    {"name":"Utilities","icon":"🏠","color_hex":"#fdcb6e"},
    {"name":"Health","icon":"💊","color_hex":"#00b894"},
    {"name":"Misc","icon":"📦","color_hex":"#636e72"},
]

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created")

def seed():
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(Category).count()==0:
            for c in CATS: db.add(Category(**c))
            db.commit()
            print(f"✅ Seeded {len(CATS)} categories")
        else:
            print("ℹ️  Categories already seeded")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed()
