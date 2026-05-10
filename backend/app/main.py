from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.routes import auth, transactions, dashboard, goals, categories, ai, profile
from app.core.config import settings

app = FastAPI(title="Margin AI", version="1.0.0", description="Income − Savings = Your Margin")

_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health(): return {"status": "ok"}

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=settings.UPLOAD_DIR), name="avatars")

for r in [auth.router, profile.router, transactions.router, dashboard.router, goals.router, categories.router, ai.router]:
    app.include_router(r)

@app.get("/")
def root(): return {"app": "Margin AI", "version": "1.0.0", "docs": "/docs"}
