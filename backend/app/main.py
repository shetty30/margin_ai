from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.routes import auth, transactions, dashboard, goals, categories, ai, profile
from app.core.config import settings

app = FastAPI(title="Margin AI", version="1.0.0", description="Income − Savings = Your Margin")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=settings.UPLOAD_DIR), name="avatars")

for r in [auth.router, profile.router, transactions.router, dashboard.router, goals.router, categories.router, ai.router]:
    app.include_router(r)

@app.get("/")
def root(): return {"app": "Margin AI", "version": "1.0.0", "docs": "/docs"}
