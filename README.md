# AI Career Intelligence Platform

Resume-vs-job-description semantic scoring, ATS analysis, and AI-generated
resume suggestions & cover letters.

**Stack:** React + Tailwind (frontend) · FastAPI (backend) · Sentence-BERT +
spaCy + TF-IDF (scoring engine) · Llama 3 via Groq (AI suggestions)

> **Note on Llama 3:** the original spec used a locally-hosted Llama 3 via
> Ollama. Ollama needs a GPU-capable host, which free/cheap platforms like
> Render and Vercel don't provide. This build calls the same Llama 3 model
> through **Groq's hosted API** instead — same model family, free tier,
> zero infra to manage. If you later get a GPU box, swap the URL/model in
> `backend/app/services/llm_service.py` back to your Ollama endpoint.

---

## 1. Project structure

```
career-platform/
├── backend/                 FastAPI app
│   ├── app/
│   │   ├── main.py          app entrypoint, CORS
│   │   ├── routers/         analyze / parse / suggest endpoints
│   │   ├── services/        embeddings, skill extraction, ATS scoring,
│   │   │                    resume parsing, LLM calls
│   │   ├── models/          pydantic schemas
│   │   └── skills_db.py     curated skills list for matching
│   ├── requirements.txt
│   ├── render.yaml           # one-click Render deploy config
│   └── .env.example
└── frontend/                 React + Vite + Tailwind v4
    ├── src/
    │   ├── App.jsx
    │   ├── api.js             API client
    │   └── components/
    ├── vercel.json
    └── .env.example
```

---

## 2. Run it locally first

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env        # then paste in your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```
Visit `http://localhost:8000/api/health` — should return `{"status":"healthy"}`.

The first request to `/api/analyze` will download the `all-MiniLM-L6-v2`
Sentence-BERT model (~90MB) from Hugging Face — this needs internet access
and takes a few seconds on first run only; it's cached after that.

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:8000
npm run dev
```
Visit `http://localhost:5173`.

---

## 3. Get a free Groq API key (for Llama 3 suggestions & cover letters)

1. Go to https://console.groq.com and sign up (free).
2. Create an API key.
3. Put it in `backend/.env` as `GROQ_API_KEY=...` (locally) and in your
   Render environment variables (in production — see below).

Groq's free tier is generous and fast; no credit card required as of writing.
If you'd rather use a different provider (OpenAI, Gemini, etc.), the only
file to touch is `backend/app/services/llm_service.py` — swap the URL,
headers, and model name.

---

## 4. Deploy the backend to Render

1. Push this repo to GitHub.
2. Go to https://render.com → **New +** → **Blueprint**, and point it at
   your repo. Render will detect `backend/render.yaml` automatically.
   - If you'd rather set it up manually instead of using the blueprint:
     **New +** → **Web Service** → connect the repo → set **Root Directory**
     to `backend` → Build Command:
     `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
     → Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. In the service's **Environment** tab, add:
   - `GROQ_API_KEY` — your key from step 3 above
   - `ALLOWED_ORIGINS` — your Vercel frontend URL once you have it (comma
     separated if you need more than one, e.g. localhost + prod)
4. Deploy. First boot will take a couple of minutes (installing torch +
   downloading the Sentence-BERT and spaCy models). Free tier services also
   spin down after inactivity and take ~30-60s to wake up on the next
   request — worth mentioning if you demo this live.
5. Note your backend URL, e.g. `https://career-intel-api.onrender.com`.

**Free tier RAM note:** Render's free plan gives 512MB RAM. `sentence-transformers`
+ `spacy` + `torch` fit, but it's snug. If you hit OOM errors, upgrade to the
$7/mo Starter plan, or swap in a smaller embedding approach (e.g. drop
Sentence-BERT and rely on TF-IDF + skill matching only) for a leaner deploy.

---

## 5. Deploy the frontend to Vercel

1. Go to https://vercel.com → **Add New** → **Project** → import the same
   repo → set **Root Directory** to `frontend`.
2. Vercel auto-detects Vite. Under **Environment Variables**, add:
   - `VITE_API_URL` = your Render backend URL from step 4 (no trailing slash)
3. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.
4. Go back to Render and set `ALLOWED_ORIGINS` to that Vercel URL, then
   redeploy the backend (or it'll block requests with a CORS error).

---

## 6. Sanity-check the live deployment

- `https://<render-url>/api/health` → `{"status": "healthy"}`
- Open the Vercel URL, upload a resume PDF/DOCX (or paste text), paste a
  job description, click **Run analysis**.
- Click **Get resume suggestions** / **Draft cover letter** to confirm the
  Groq/Llama 3 integration works end to end.

---

## 7. Known limitations / good "future work" talking points

- No auth or persistent history in this MVP (by design, to ship fast) —
  natural next step: JWT auth + PostgreSQL to save past analyses, matching
  the original spec.
- Skill extraction relies on a curated skills dictionary
  (`backend/app/skills_db.py`) rather than an open-ended NER model — easy
  to extend by adding entries, but won't catch every possible skill phrase.
- Render free tier cold-starts and 512MB RAM ceiling are the main
  production caveats — call this out if you're demoing it for interviews.
