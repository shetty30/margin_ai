from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.routes import auth, profile, transactions, dashboard, goals, categories, ai

app = FastAPI(title="Margin AI API", version="1.0.0", description="Income − Savings = Your Margin")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://margin-ai-vvny.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

avatar_dir = Path("app/static/avatars")
avatar_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

for r in [auth.router, profile.router, transactions.router, dashboard.router, goals.router, categories.router, ai.router]:
    app.include_router(r)

@app.get("/")
def root():
    return {"app": "Margin AI", "tagline": "Income − Savings = Your Margin", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}