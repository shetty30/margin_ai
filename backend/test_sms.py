from app.services.ai_categoriser import parse_sms

tests = [
    ("Kotak/Paytm UPI",    "Sent Rs.29.00 from Kotak Bank AC X2356 to paytmqr67z057@ptys on 07-05-26.UPI Ref 649349751831. Not you, https://kotak.com/KBANKT/Fraud"),
    ("Swiggy debit",       "INR 1500.00 debited from your account ending 4321 to Swiggy via UPI on 10-05-2026"),
    ("PhonePe transfer",   "Rs.250 transferred to 9876543210@ybl on 10-05-2026"),
    ("Netflix/ICICI UPI",  "Sent Rs.499 from HDFC Bank to netflix@icici on 09-05-26"),
    ("Amazon debit",       "Your A/c XX1234 debited Rs.850 for Amazon on 10-05-2026"),
    ("Uber paid",          "You paid Rs.120 to Uber on 10-05-2026 via UPI"),
]

for label, sms in tests:
    r = parse_sms(sms)
    print(f"[{label}]")
    print(f"  parsed   = {r['parsed']}")
    print(f"  amount   = {r['amount']}")
    print(f"  merchant = {r['merchant']}")
    print(f"  category = {r['category']}")
    print()
