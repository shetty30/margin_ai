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
# Covers: debited, sent, transferred, paid, spent formats
SMS_PATTERNS = [
    # "Rs. 1,234.50 debited from ... to Swiggy via UPI"
    r"(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s+(?:debited|deducted).*?(?:\bto\b|\bat\b)\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+via|\s+on|\s+ref|\s+UPI|\s+\(|\.?\s*$)",
    # "debited Rs. 1234 at McDonald's"
    r"(?:debited|deducted)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?).*?(?:\bto\b|\bat\b)\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+via|\s+on|$)",
    # "Sent Rs.29.00 from [bank] to merchant@upi on date"
    r"[Ss]ent\s+(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?\bto\b\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+on\b|\s+via\b|\s+UPI\b|\s+Ref\b|\.?\s*$)",
    # "transferred Rs.X to merchant"
    r"(?:transferred|transfer(?:red)?)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?).*?\bto\b\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+on\b|\s+via\b|\s+ref\b|\.?\s*$)",
    # "1234 debited to Merchant"
    r"([\d,]+(?:\.\d{1,2})?)\s+debited.*?(?:\bto\b|\bat\b)\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+via|$)",
    # "spent/paid/purchase Rs 500 at Amazon"
    r"(?:spent|paid|purchase)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?).*?(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+on|\s+via|$)",
    # "payment of Rs.X to merchant"
    r"[Pp]ayment\s+of\s+(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?\bto\b\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+on\b|\s+via\b|\s+ref\b|\.?\s*$)",
    # "Rs.X transferred to merchant@upi" (amount-first format)
    r"(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s+transferred\s+to\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+on\b|\s+via\b|\s+ref\b|\.?\s*$)",
    # "debited Rs.X for merchant" (uses 'for' as preposition)
    r"(?:debited|deducted)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?).*?\bfor\b\s+([A-Za-z0-9\s\.\-&/@_]+?)(?:\s+on\b|\s+via\b|\s+ref\b|\.?\s*$)",
    # Fallback: any Rs/INR amount in the SMS (amount only, no merchant)
    r"(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)",
]

# ── UPI domain → app name ────────────────────────────────────────────────────
UPI_DOMAIN_MAP = {
    "paytm":       "Paytm",
    "ptys":        "Paytm",
    "ybl":         "PhonePe",
    "ibl":         "PhonePe",
    "axl":         "PhonePe",
    "okhdfcbank":  "Google Pay",
    "okaxis":      "Google Pay",
    "oksbi":       "Google Pay",
    "okicici":     "Google Pay",
    "apl":         "Amazon Pay",
    "rapl":        "Amazon Pay",
    "icici":       "ICICI UPI",
    "sbi":         "SBI UPI",
    "hdfc":        "HDFC UPI",
    "axis":        "Axis UPI",
    "kotak":       "Kotak UPI",
    "upi":         "UPI Payment",
    "gpay":        "Google Pay",
    "freecharge":  "FreeCharge",
    "mobikwik":    "MobiKwik",
    "juspay":      "JusPay",
    "airtel":      "Airtel Money",
}

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


# ── UPI ID resolver ───────────────────────────────────────────────────────────
def _resolve_upi_id(raw: str) -> str:
    """
    Convert a UPI VPA like 'paytmqr67z057@ptys' or 'swiggy@icici' into a
    human-readable merchant name.
    """
    raw = raw.strip()
    if "@" not in raw:
        return raw.title()

    handle, domain = raw.split("@", 1)
    handle_lower = handle.lower()
    domain_lower = domain.lower()

    # 1. Check if handle contains a known merchant keyword
    for kw in sorted(CAT_MAP.keys(), key=len, reverse=True):
        if kw in handle_lower:
            return kw.replace("&", "and").title()

    # 2. Pure phone number handle — resolve by domain/app
    if re.fullmatch(r"\d{10}", handle):
        for key, app in UPI_DOMAIN_MAP.items():
            if key in domain_lower:
                return app
        return "UPI Payment"

    # 3. Domain-based app resolution
    for key, app in UPI_DOMAIN_MAP.items():
        if key in domain_lower:
            return app

    # 4. Strip trailing digits from handle and title-case
    name = re.sub(r"[0-9]+$", "", handle).strip()
    name = re.sub(r"[^a-zA-Z\s]", " ", name).strip()
    if len(name) >= 3:
        return name.title()

    return raw.title()


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

    amount_only = None

    for i, pattern in enumerate(SMS_PATTERNS):
        m = re.search(pattern, sms, re.I | re.DOTALL)
        if not m:
            continue

        try:
            amount_str = m.group(1).replace(",", "")
            result["amount"] = Decimal(amount_str)

            # Fallback pattern (last one) only captures amount
            if i == len(SMS_PATTERNS) - 1:
                amount_only = result["amount"]
                break

            raw_merchant = m.group(2).strip()

            # Clean up trailing noise words
            noise = re.compile(
                r"\s+(?:ref|upi|via|on|at|from|for|dated?|txn|transaction|ac|a/c|account|"
                r"bank|ltd|pvt|india|limited|services?)\b.*$",
                re.I,
            )
            raw_merchant = noise.sub("", raw_merchant).strip().rstrip(".")

            # Resolve UPI IDs
            if "@" in raw_merchant:
                raw_merchant = _resolve_upi_id(raw_merchant)
            else:
                raw_merchant = raw_merchant.title()[:60]

            result["merchant"] = raw_merchant or None

            # Stage 2: keyword lookup
            merchant_lower = (result["merchant"] or "").lower()
            for kw, cat in CAT_MAP.items():
                if kw in merchant_lower:
                    result["category"] = cat
                    break

            result["parsed"] = True
            break

        except Exception:
            continue

    # If only amount captured, still mark parsed so UI can show it
    if not result["parsed"] and amount_only is not None:
        result["amount"]  = amount_only
        result["parsed"]  = True
        result["merchant"] = None

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
                return "Misc"
            r.raise_for_status()
            data = r.json()
            return data["labels"][0]
    except Exception:
        return "Misc"


# ── Legacy shim so old imports don't break ──────────────────────────────────
async def categorise_groq(merchant: str, amount: float) -> str:
    """Deprecated — routes to categorise_bert."""
    return await categorise_bert(merchant, amount)
