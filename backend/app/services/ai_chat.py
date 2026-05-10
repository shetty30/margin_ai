"""
AI Chat service — powered by Qwen/Qwen2.5-7B-Instruct
via HuggingFace Inference API (serverless, free tier).
Falls back to Groq llama-3.1-8b if HF is unavailable.
"""
import json
import httpx
from app.core.config import settings

_HF_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions"
_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def build_context(ctx: dict) -> str:
    cats  = ctx.get("by_category", [])
    goals = ctx.get("goals", [])
    txns  = ctx.get("recent_txns", [])
    cat_lines  = "\n".join(f"  - {c['name']}: ₹{c['total']:,.0f}" for c in cats) or "  None yet"
    goal_lines = "\n".join(f"  - {g['title']}: ₹{g['saved']:,.0f} / ₹{g['target']:,.0f}" for g in goals) or "  None set"
    txn_lines  = "\n".join(f"  - {t['merchant']}: ₹{abs(t['amount']):,.0f} on {t['date']}" for t in txns) or "  None yet"
    return f"""You are Margin AI, a sharp and friendly personal finance advisor for Indian users.
Always answer using ONLY the real data below. Be direct, specific, and max 3 sentences.

FINANCIAL DATA:
• Monthly income   : ₹{ctx.get('income',0):,.0f}
• Savings target   : ₹{ctx.get('savings_target',0):,.0f}  ({ctx.get('savings_rate',0):.1f}% savings rate)
• Expense budget   : ₹{ctx.get('expense_budget',0):,.0f}
• Total spent      : ₹{ctx.get('total_spent',0):,.0f}
• Remaining margin : ₹{ctx.get('remaining',0):,.0f}
• Daily average    : ₹{ctx.get('daily_avg',0):,.0f}

SPENDING BY CATEGORY:
{cat_lines}

SAVINGS GOALS:
{goal_lines}

RECENT TRANSACTIONS:
{txn_lines}"""


async def _call_hf(messages: list, max_tokens: int = 500) -> str:
    """Call HuggingFace Inference API — Qwen/Qwen2.5-7B-Instruct."""
    headers = {"Content-Type": "application/json"}
    if settings.HF_TOKEN:
        headers["Authorization"] = f"Bearer {settings.HF_TOKEN}"

    payload = {
        "model": "Qwen/Qwen2.5-7B-Instruct",
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(_HF_URL, headers=headers, json=payload)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def _call_groq_fallback(messages: list, max_tokens: int = 500) -> str:
    """Fallback to Groq llama-3.1-8b."""
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(_GROQ_URL, headers=headers, json=payload)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def _call_model(messages: list, max_tokens: int = 500) -> str:
    """Try Qwen via HF first, fall back to Groq."""
    try:
        return await _call_hf(messages, max_tokens)
    except Exception as hf_err:
        if settings.GROQ_API_KEY:
            try:
                return await _call_groq_fallback(messages, max_tokens)
            except Exception as groq_err:
                raise RuntimeError(f"HF: {hf_err} | Groq: {groq_err}")
        raise hf_err


async def chat(msg: str, ctx: dict) -> str:
    try:
        messages = [
            {"role": "system", "content": build_context(ctx)},
            {"role": "user",   "content": msg},
        ]
        return await _call_model(messages)
    except Exception as e:
        return f"AI unavailable: {e}"


async def afford(question: str, ctx: dict) -> dict:
    try:
        system = (
            build_context(ctx)
            + '\n\nRespond ONLY with valid JSON — no markdown, no explanation:\n'
            + '{"verdict":"yes" or "no","headline":"one sentence","reasoning":"2-3 sentences with specific numbers","tradeoff":"one actionable suggestion"}'
        )
        messages = [
            {"role": "system", "content": system},
            {"role": "user",   "content": question},
        ]
        raw = await _call_model(messages, max_tokens=300)
        # Extract JSON robustly
        start = raw.find("{")
        end   = raw.rfind("}") + 1
        if start >= 0 and end > start:
            raw = raw[start:end]
        return json.loads(raw)
    except Exception as e:
        return {
            "verdict":   "unknown",
            "headline":  "AI unavailable",
            "reasoning": str(e),
            "tradeoff":  "",
        }
