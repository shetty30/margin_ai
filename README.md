# Margin AI 
**Income − Savings = Your Margin**

> A constraint-first personal finance app for India's urban professionals. Commit your savings upfront — the system derives what you can spend. AI answers questions from your actual data, not generic advice.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)

---

## The problem

Most finance apps track spending after the fact. That's reactive and too late.

Margin AI flips the model:

```
Income  −  Savings  =  Expense budget
```

You protect savings first. The remaining amount is your margin — what you're allowed to spend. The AI enforces this contract and answers real questions from your real numbers.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔒 Constraint budgeting | Savings committed first, budget derived automatically |
| 📩 SMS auto-import | Parses UPI bank SMS — covers HDFC, SBI, ICICI, Axis, Kotak |
| ⚡ AI categoriser | Groq llama-3.1-8b tags every transaction instantly |
| 💬 AI chat | Ask "where did my salary go?" — answered from live SQL data |
| 🎯 Can I afford this? | Gemini checks budget, goals, and bills before answering |
| 📊 Live dashboard | Spend by category, daily bar chart, savings rate |
| 🎯 Goals tracker | Progress bars with on-track / behind status |
| 👤 User profiles | Avatar upload, bio, financial setup |

---

## Tech stack

```
Backend    →  Python 3.11 · FastAPI · SQLAlchemy · MySQL 8 · JWT Auth
Frontend   →  React 18 · Vite · Tailwind CSS · SCSS · Recharts
AI         →  Groq (llama-3.1-8b) · Gemini 1.5 Flash  — both free tier
```

---

## Quick start

**Prerequisites:** Python 3.11+, MySQL 8, Node.js 18+

```bash
# 1. Clone
git clone https://github.com/yourusername/margin-ai.git
cd margin-ai

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Configure
cp .env.example .env
# Fill in: DB_PASSWORD, SECRET_KEY, GROQ_API_KEY, GEMINI_API_KEY

# 4. Database
# Open schema.sql in MySQL Workbench → run all
python -m app.db.init_db

# 5. Run backend
uvicorn app.main:app --reload --port 8000

# 6. Frontend (new terminal)
cd ../frontend
npm install && npm run dev
```

**→ Backend:** `localhost:8000/docs`  
**→ Frontend:** `localhost:5173`

**Free API keys:**
- Groq: [console.groq.com](https://console.groq.com)
- Gemini: [aistudio.google.com](https://aistudio.google.com)

---

## Architecture

```
┌─────────────────┐     JWT      ┌──────────────────┐     SQL      ┌─────────┐
│   React + Vite  │ ──────────▶  │  FastAPI Backend  │ ──────────▶ │ MySQL 8 │
│   (port 5173)   │             │   (port 8000)     │             │         │
└─────────────────┘             └──────────────────┘             └─────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          │                             │
                    ┌─────▼─────┐               ┌──────▼──────┐
                    │   Groq    │               │   Gemini    │
                    │ llama-3.1 │               │ 1.5 Flash   │
                    │ (tagging) │               │ (chat+calc) │
                    └───────────┘               └─────────────┘
```

---

## Database schema

```sql
users            → profile, income, savings target, avatar
transactions     → amount, merchant, category, method, date, source
categories       → 7 defaults (Food, Transport, Shopping...)
goals            → target, saved amount, deadline, status
budget_configs   → monthly income/savings contracts
monthly_reports  → AI-generated end-of-month insights
```

Key design decisions: composite index on `(user_id, txn_date)` for dashboard speed · CASCADE deletes for referential integrity · `source` ENUM tracks manual vs SMS vs import

---

## API reference

```
POST   /auth/register          Create account
POST   /auth/login             Returns JWT

GET    /profile/me             Full profile
PATCH  /profile/me             Update details
POST   /profile/me/avatar      Upload photo

GET    /dashboard/             Aggregated financial summary
GET    /transactions/          List by month + category
POST   /transactions/parse-sms Parse UPI SMS → structured data

POST   /ai/chat                Chat with your finances
POST   /ai/afford              "Can I afford X?" analysis
```

Full interactive docs at `/docs` when running locally.

---

## Relevance to finance

This project applies core personal finance concepts in code:

- **Cash flow management** — income, fixed costs, discretionary spend separation
- **Savings rate tracking** — real-time % calculation against income
- **Goal-based investing logic** — deadline-driven progress calculation
- **Spend categorisation** — consistent taxonomy across 7 categories
- **Behavioural nudges** — constraint-first design reduces overconsumption

---

## Roadmap

- [x] Core backend — schema, auth, REST API
- [x] AI integration — SMS parser, categoriser, chat, afford calc
- [x] Premium UI — glassmorphism, animations, dark theme
- [x] User profiles with avatar upload
- [ ] Monthly report stored procedure
- [ ] Deploy — Railway (backend) + Vercel (frontend)
- [ ] Android SMS bridge (READ_SMS)

---

## Built by

**Shriya Shetty** · Finance student  
[GitHub](https://github.com/shetty30) · [LinkedIn](https://linkedin.com/in/yourprofile)

---

*Built to demonstrate applied full-stack development skills with a finance domain focus — relational database design, REST API architecture, AI integration, and production-grade UI.*
