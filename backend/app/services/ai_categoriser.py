import re
from decimal import Decimal
from app.core.config import settings

SMS_PATTERNS = [
    r"(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)\s+(?:debited|deducted).*?(?:to|at)\s+([A-Za-z0-9\s\.\-&]+?)(?:\s+via|\s+on|\s+ref|$)",
    r"(?:debited|deducted)\s+(?:Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|at)\s+([A-Za-z0-9\s\.\-&]+?)(?:\s+via|\s+on|$)",
    r"([\d,]+(?:\.\d{1,2})?)\s+debited.*?(?:to|at)\s+([A-Za-z0-9\s\.\-&]+?)(?:\s+via|$)",
]
CAT_MAP = {
    "swiggy":"Food & Dining","zomato":"Food & Dining","mcdonalds":"Food & Dining","dominos":"Food & Dining","kfc":"Food & Dining","starbucks":"Food & Dining",
    "ola":"Transport","uber":"Transport","rapido":"Transport","irctc":"Transport",
    "amazon":"Shopping","flipkart":"Shopping","myntra":"Shopping","ajio":"Shopping",
    "netflix":"Entertainment","spotify":"Entertainment","hotstar":"Entertainment","prime":"Entertainment",
    "airtel":"Utilities","jio":"Utilities","bsnl":"Utilities","bescom":"Utilities",
    "apollo":"Health","practo":"Health","netmeds":"Health","pharmeasy":"Health",
}

def parse_sms(sms: str) -> dict:
    r = {"amount":None,"merchant":None,"category":"Misc","payment_method":"UPI","parsed":False}
    if re.search(r"\bneft\b",sms,re.I): r["payment_method"]="NEFT"
    elif re.search(r"\bcard\b",sms,re.I): r["payment_method"]="Card"
    for p in SMS_PATTERNS:
        m = re.search(p,sms,re.I)
        if m:
            try:
                r["amount"]=Decimal(m.group(1).replace(",",""))
                r["merchant"]=m.group(2).strip().title()
                ml=r["merchant"].lower()
                for k,c in CAT_MAP.items():
                    if k in ml: r["category"]=c; break
                r["parsed"]=True; break
            except: continue
    return r

async def categorise_groq(merchant: str, amount: float) -> str:
    try:
        from groq import Groq
        c = Groq(api_key=settings.GROQ_API_KEY)
        resp = c.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role":"user","content":f"Categorise Indian merchant for finance app. Merchant: {merchant}, Amount: ₹{amount}. Reply ONLY one of: Food & Dining, Transport, Shopping, Entertainment, Utilities, Health, Misc"}],
            max_tokens=10,temperature=0)
        return resp.choices[0].message.content.strip()
    except: return "Misc"
