from app.core.config import settings

def build_context(ctx: dict) -> str:
    return f"""You are Margin AI, a personal finance assistant.
User financial data:
- Income: ₹{ctx.get('income',0):,.0f} | Savings target: ₹{ctx.get('savings_target',0):,.0f} ({ctx.get('savings_rate',0):.1f}%)
- Expense budget: ₹{ctx.get('expense_budget',0):,.0f} | Spent: ₹{ctx.get('total_spent',0):,.0f}
- Remaining: ₹{ctx.get('remaining',0):,.0f} | Daily avg: ₹{ctx.get('daily_avg',0):,.0f}
- Categories: {ctx.get('by_category',[])}
- Goals: {ctx.get('goals',[])}
- Recent transactions: {ctx.get('recent_txns',[])}
Answer using ONLY this real data. Be direct, specific, max 3 sentences."""

async def chat(msg: str, ctx: dict) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        m = genai.GenerativeModel("gemini-1.5-flash")
        return m.generate_content(f"{build_context(ctx)}\n\nUser: {msg}").text
    except Exception as e: return f"AI unavailable: {e}"

async def afford(question: str, ctx: dict) -> dict:
    try:
        import google.generativeai as genai, json
        genai.configure(api_key=settings.GEMINI_API_KEY)
        m = genai.GenerativeModel("gemini-1.5-flash")
        p = f"""{build_context(ctx)}\n\nUser asks: {question}\nRespond ONLY as JSON: {{"verdict":"yes"or"no","headline":"one sentence","reasoning":"2-3 sentences with numbers","tradeoff":"what to adjust"}}"""
        t = m.generate_content(p).text.strip().replace("```json","").replace("```","").strip()
        return json.loads(t)
    except Exception as e: return {"verdict":"unknown","headline":"AI unavailable","reasoning":str(e),"tradeoff":""}
