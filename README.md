# Margin AI — Setup Guide
## VS Code + MySQL Workbench

---

## What changed in this version
- App renamed: Finova → Margin AI
- User profile system: name, phone, city, occupation, bio
- Avatar upload: JPEG/PNG/WebP, auto-resized to 400x400, served at /avatars/
- Onboarding flow: new users complete 3-step setup before dashboard
- New profile page with inline editing and avatar management
- New DB table columns: avatar_url, phone, city, occupation, bio, onboarded, updated_at
- New route: /profile (GET me, PATCH me, POST avatar, DELETE avatar)

---

## Project structure

```
margin-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── auth.py          ← register returns onboarded flag
│   │   │   ├── profile.py       ← GET/PATCH /profile/me + avatar upload/delete
│   │   │   ├── transactions.py  ← CRUD + SMS parse
│   │   │   ├── dashboard.py     ← aggregated metrics
│   │   │   ├── goals.py         ← goals + emoji field
│   │   │   ├── categories.py
│   │   │   └── ai.py            ← chat + afford calc
│   │   ├── core/
│   │   │   ├── config.py        ← UPLOAD_DIR + MAX_AVATAR_SIZE_MB settings
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── init_db.py
│   │   ├── models/
│   │   │   └── user.py          ← new: avatar_url, phone, city, occupation, bio, onboarded
│   │   ├── services/
│   │   │   ├── profile.py       ← NEW: avatar upload (PIL resize) + profile update
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── ai_categoriser.py
│   │   │   └── ai_chat.py
│   │   ├── uploads/avatars/     ← where avatar files are stored
│   │   └── main.py              ← mounts /avatars as static files
│   ├── schema.sql
│   ├── requirements.txt         ← added: pillow, aiofiles
│   └── .env
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx        ← redirects to /onboarding if not onboarded
        │   ├── Onboarding.jsx   ← NEW: 3-step setup (income → savings → profile)
        │   ├── Profile.jsx      ← NEW: full profile page with avatar upload
        │   ├── Dashboard.jsx
        │   ├── Transactions.jsx
        │   ├── Goals.jsx
        │   └── Chat.jsx
        ├── api/client.js        ← profile API calls added
        └── components/layout/Layout.jsx ← Profile icon in nav
```

---

## Step 1 — MySQL Workbench

Open Workbench → new query tab → paste schema.sql → lightning bolt.

New tables vs previous version: users table has 6 new columns.

Verify:
```sql
USE margin_ai;
DESCRIBE users;
-- Should show: avatar_url, phone, city, occupation, bio, onboarded columns
```

---

## Step 2 — Backend setup

```bash
cd margin-ai/backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Edit .env — fill in your values.

```bash
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000
```

Test avatar upload at: http://localhost:8000/docs → POST /profile/avatar

---

## Step 3 — Frontend

```bash
cd margin-ai/frontend
npm install
npm run dev
```

Open: http://localhost:5173

Flow for new user:
1. Register → redirected to /onboarding
2. Complete 3 steps (income → savings → profile details)
3. Redirected to dashboard

Flow for existing user:
1. Login → dashboard directly (if onboarded=1)

---

## Avatar upload rules
- Formats: JPEG, PNG, WebP only
- Max size: 2MB (configurable in .env → MAX_AVATAR_SIZE_MB)
- Auto-resized to 400x400 max using Pillow
- Stored in backend/app/uploads/avatars/
- Served at: http://localhost:8000/avatars/filename.jpg
- Old avatar is deleted when new one is uploaded

---

## New API endpoints

| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | /profile/me | Get full profile |
| PATCH | /profile/me | Update name, phone, city, occupation, bio, income, savings |
| POST | /profile/avatar | Upload avatar (multipart/form-data, field name: file) |
| DELETE | /profile/avatar | Remove avatar |

---

## Terminal commands

```bash
# Start backend
cd margin-ai/backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Start frontend
cd margin-ai/frontend && npm run dev

# Test avatar upload via curl
curl -X POST http://localhost:8000/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/photo.jpg"
```
