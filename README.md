# Margin AI
**Income − Savings = Your Margin**

> 🚧 App in progress

AI-powered personal finance app built for India's urban professionals. Commit savings first — the system tells you what's left to spend.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=flat&logo=huggingface&logoColor=black)

---

## The idea

Most apps track spending after the fact. Margin AI flips it.

```
Income  −  Savings  =  What you can spend
```

You protect savings first. The rest is your margin.

---

## What it does

- 📩 **SMS auto-import** — reads UPI bank messages, logs transactions automatically
- 🧠 **AI categoriser** — 3-stage NLP pipeline classifies every expense
- 💬 **Chat with your finances** — ask anything, answered from your actual data
- 🎯 **Can I afford this?** — AI checks your budget, goals, and bills before answering
- 📊 **Live dashboard** — spending by category, daily chart, savings rate
- 💰 **Income page** — set monthly income and savings target in one place
- 👤 **User profiles** — avatar upload, financial setup, onboarding flow

---

## AI architecture

### Chatbot — Qwen2.5-7B-Instruct via HuggingFace
```
User message
     ↓
Live SQL context injection (budget, goals, recent transactions)
     ↓
Qwen/Qwen2.5-7B-Instruct  ←  HuggingFace Inference API
     ↓                         (OpenAI-compatible endpoint)
Context-aware answer
```
Falls back to **Groq llama-3.1-8b** automatically if HuggingFace is unavailable.

---

### SMS categoriser — 3-stage NLP pipeline
```
Raw bank SMS
     ↓
Stage 1 — Regex
Extracts amount, merchant, transaction type

     ↓
Stage 2 — Keyword map (50+ merchants)
Maps known names instantly  →  e.g. "Swiggy" → Food & Dining

     ↓
Stage 3 — DistilBERT NLI (unknown merchants only)
typeform/distilbert-base-uncased-mnli
Zero-shot classification across 7 categories
Food · Transport · Shopping · Entertainment · Health · Utilities · Misc
```

Regex and keyword map handle ~90% of cases. DistilBERT only fires for unknown merchants — keeping it fast and free.

---

## Stack

```
Backend   →  Python · FastAPI · MySQL 8 · JWT
Frontend  →  React · Vite · Tailwind · SCSS  ⚡ accelerated with Claude AI
AI Chat   →  Qwen2.5-7B-Instruct (HuggingFace) · Groq llama-3.1-8b (fallback)
NLP       →  typeform/distilbert-base-uncased-mnli (zero-shot NLI)
SMS       →  Custom regex · 50+ merchant keyword map
```

---

## What changed

| Feature | Before | After |
|---------|--------|-------|
| Chatbot | Gemini 2.0 Flash | Qwen2.5-7B via HuggingFace + Groq fallback |
| SMS categoriser | Groq LLM-based | Regex + keyword map + DistilBERT NLI |
| Income setup | Profile page only | Dedicated income page |

---

## Status

| Phase | Status |
|-------|--------|
| Backend API | ✅ Complete |
| Database schema | ✅ Complete |
| AI chat (Qwen + fallback) | ✅ Complete |
| SMS NLP pipeline | ✅ Complete |
| Frontend UI | ✅ Complete |
| Income page | ✅ Complete |
| Deployment | 🔜 Coming soon |
| Android SMS bridge | 🔜 Coming soon |

---

## Built by

**Shriya Shetty** · Finance Student  
[GitHub](https://github.com/shetty30) · [LinkedIn](https://linkedin.com/in/yourprofile)
