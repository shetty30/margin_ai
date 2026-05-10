"""
SMS Parser + AI Categoriser
───────────────────────────
Stage 1 — Python regex  : extract amount, merchant, payment method from raw SMS.
Stage 2 — Keyword map   : instant O(1) lookup for 50+ known merchants.
Stage 3 — DistilBERT NLI: zero-shot classification via HuggingFace Inference API
           (model: typeform/distilbert-base-uncased-mnli) when stages 1-2 give "Misc".
"""

import re
import httpx
from decimal import Decimal
from app.core.config import settings

# ── Regex patterns for Indian bank SMS ──────────────────────────────────────
SMS_PATTERNS = [
    # "Rs. 1,234.50 debited from ... to Swiggy via UPI"
    r"(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s+(?:debited|deducted).*?(?:\bto\b|\bat\b)\s+([A-Za-z0-9\s\.\-&/]+?)(?:\s+via|\s+on|\s+ref|\s+UPI|\s+\(|\.?\s*$)",
    # "debited Rs. 1234 at McDonald's"
    r"(?:debited|deducted)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?).*?(?:\bto\b|\bat\b)\s+([A-Za-z0-9\s\.\-&/]+?)(?:\s+via|\s+on|$)",
    # "1234 debited to Merchant"
    r"([\d,]+(?:\.\d{1,2})?)\s+debited.*?(?:\bto\b|\bat\b)\s+([A-Za-z0-9\s\.\-&/]+?)(?:\s+via|$)",
    # "spent Rs 500 at Amazon"
    r"(?:spent|paid|purchase)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?).*?(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s\.\-&/]+?)(?:\s+on|\s+via|$)",
]

# ── Keyword → Category map (50+ merchants) ──────────────────────────────────
CAT_MAP = {
    # Food & Dining
    "swiggy": "Food & Dining", "zomato": "Food & Dining", "dominos": "Food & Dining",
    "domino": "Food & Dining", "mcdonalds": "Food & Dining", "mcdonald": "Food & Dining",
    "kfc": "Food & Dining", "starbucks": "Food & Dining", "dunkin": "Food & Dining",
    "blinkit": "Food & Dining", "zepto": "Food & Dining", "bigbasket": "Food & Dining",
    "grofers": "Food & Dining", "instamart": "Food & Dining", "pizzahut": "Food & Dining",
    "subway": "Food & Dining", "burger king": "Food & Dining", "haldiram": "Food & Dining",
    # Transport
    "uber": "Transport", "ola": "Transport", "rapido": "Transport",
    "irctc": "Transport", "redbus": "Transport", "indigo": "Transport",
    "spicejet": "Transport", "air india": "Transport", "paytm fastag": "Transport",
    "fastag": "Transport",
    # Shopping
    "amazon": "Shopping", "flipkart": "Shopping", "myntra": "Shopping",
    "ajio": "Shopping", "nykaa": "Shopping", "meesho": "Shopping",
    "snapdeal": "Shopping", "tatacliq": "Shopping", "reliance": "Shopping",
    # Entertainment
    "netflix": "Entertainment", "spotify": "Entertainment", "hotstar": "Entertainment",
    "prime": "Entertainment", "zee5": "Entertainment", "sony": "Entertainment",
    "bookmyshow": "Entertainment", "pvr": "Entertainment", "inox": "Entertainment",
    "youtube": "Entertainment", "apple music": "Entertainment",
    # Utilities
    "airtel": "Utilities", "jio": "Utilities", "bsnl": "Utilities",
    "bescom": "Utilities", "tata power": "Utilities", "mahadiscom": "Utilities",
    "electricity": "Utilities", "water bill": "Utilities", "gas": "Utilities",
    # Health
    "apollo": "Health", "practo": "Health", "netmeds": "Health",
    "pharmeasy": "Health", "1mg": "Health", "medplus": "Health",
    "fortis": "Health", "manipal": "Health", "narayana": "Health",
}

PAYMENT_RE = {
    "NEFT":   r"\bneft\b",
    "IMPS":   r"\bimps\b",
    "Card":   r"\b(?:debit|credit)\s*card\b",
    "ATM":    r"\batm\b",
    "Wallet": r"\bwallet\b",
}

CATEGORIES = [
    "Food & Dining", "Transport", "Shopping",
    "Entertainment", "Utilities", "Health", "Misc",
]

_HF_ZERO_SHOT_URL = "https://api-inference.huggingface.co/models/typeform/distilbert-base-uncased-mnli"


# ── Stage 1 + 2: Regex parse ─────────────────────────────────────────────────
def parse_sms(sms: str) -> dict:
    result = {
        "amount": None, "merchant": None,
        "category": "Misc", "payment_method": "UPI", "parsed": False,
    }

    # Detect payment method
    for method, pattern in PAYMENT_RE.items():
        if re.search(pattern, sms, re.I):
            result["payment_method"] = method
            break

    # Extract amount + merchant
    for pattern in SMS_PATTERNS:
        m = re.search(pattern, sms, re.I)
        if m:
            try:
                result["amount"]   = Decimal(m.group(1).replace(",", ""))
                result["merchant"] = m.group(2).strip().title()[:50]
                # Stage 2: keyword lookup
                merchant_lower = result["merchant"].lower()
                for kw, cat in CAT_MAP.items():
                    if kw in merchant_lower:
                        result["category"] = cat
                        break
                result["parsed"] = True
                break
            except Exception:
                continue

    return result


# ── Stage 3: DistilBERT zero-shot classification ─────────────────────────────
async def categorise_bert(merchant: str, amount: float) -> str:
    """
    Zero-shot classify a merchant into one of 7 spending categories using
    DistilBERT NLI (typeform/distilbert-base-uncased-mnli) via HF Inference API.
    Falls back to 'Misc' on any error or cold-start timeout.
    """
    try:
        headers = {"Content-Type": "application/json"}
        if settings.HF_TOKEN:
            headers["Authorization"] = f"Bearer {settings.HF_TOKEN}"

        payload = {
            "inputs": f"Payment to {merchant} for ₹{amount:.0f}",
            "parameters": {
                "candidate_labels": CATEGORIES,
                "multi_label": False,
            },
        }
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.post(_HF_ZERO_SHOT_URL, headers=headers, json=payload)
            if r.status_code == 503:
                # Model is loading on HF servers — return Misc rather than wait
                return "Misc"
            r.raise_for_status()
            data = r.json()
            # Returns labels sorted by score descending
            return data["labels"][0]
    except Exception:
        return "Misc"


# ── Legacy shim so old imports don't break ──────────────────────────────────
async def categorise_groq(merchant: str, amount: float) -> str:
    """Deprecated — routes to categorise_bert."""
    return await categorise_bert(merchant, amount)
