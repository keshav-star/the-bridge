# Phase 1 Complete — "The Bridge" Foundation

> All three pages live at **http://localhost:3000** ✅

---

## Project Structure

```
justtitle/
├── .env                        # Root env for Docker
├── .gitignore
├── docker-compose.yml          # Orchestrates DB + Backend + Frontend
│
├── backend/
│   ├── Dockerfile              # Python 3.11-slim
│   ├── requirements.txt        # FastAPI, SQLAlchemy, pgvector, OpenAI, PyMuPDF...
│   ├── alembic.ini             # Migration config
│   ├── alembic/env.py          # Async migration env
│   ├── db/init.sql             # CREATE EXTENSION IF NOT EXISTS vector
│   └── app/
│       ├── main.py             # FastAPI entry + CORS + lifespan
│       ├── core/config.py      # Pydantic-settings (single source of truth)
│       ├── db/
│       │   ├── session.py      # Async SQLAlchemy engine + Base + get_db()
│       │   ├── models.py       # ORM: User, Profile (pgvector), JobListing, Application, Rating
│       │   └── __init__.py     # Barrel export
│       ├── schemas/
│       │   ├── schemas.py      # Pydantic v2 DTOs (request/response)
│       │   └── __init__.py     # Barrel export
│       ├── services/
│       │   ├── ai_service.py   # PDF parse, embeddings, pitch generation (OpenAI + mocks)
│       │   └── matching_service.py  # pgvector cosine similarity SQL
│       └── api/v1/
│           ├── router.py       # Aggregates all routes
│           └── routes/
│               ├── users.py          # POST /users, GET /users/{id}
│               ├── resumes.py        # POST /resumes/process-resume
│               ├── jobs.py           # POST /jobs, POST /jobs/{id}/match, GET /jobs
│               ├── applications.py   # POST, GET, PATCH /applications
│               └── ratings.py        # POST /ratings (trust score system)
│
└── frontend/
    ├── Dockerfile              # Node 20 Alpine
    ├── src/app/
    │   ├── globals.css         # Dark-mode design system (Indigo/Violet tokens)
    │   ├── layout.tsx          # Root layout + SEO metadata
    │   ├── page.tsx            # Landing Page (Framer Motion hero)
    │   └── dashboard/
    │       ├── student/page.tsx   # Student Dashboard (gauges, pitch, timeline)
    │       └── recruiter/page.tsx # Recruiter Dashboard (JD → Top 5 match)
    └── src/components/ui/      # Shadcn: button, card, badge, tabs, input, progress...
```

---

## Terminal Commands Used

```bash
# 1. Create project directories
mkdir -p frontend backend

# 2. Scaffold Next.js frontend (inside ./frontend)
npx -y create-next-app@latest ./frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git

# 3. Install frontend packages
cd frontend && npm install framer-motion recharts @tanstack/react-query axios lucide-react

# 4. Initialize Shadcn UI (auto-detects Tailwind v4)
npx shadcn@latest init -d

# 5. Add Shadcn components
npx shadcn@latest add card badge tabs input label progress separator avatar

# 6. Start frontend dev server
npm run dev
```

---

## API Endpoints (FastAPI — port 8000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/users/` | Register user |
| GET | `/api/v1/users/{id}` | Get user |
| POST | `/api/v1/resumes/process-resume` | Upload PDF → Skill Matrix + Embedding |
| POST | `/api/v1/jobs/` | Create Job Listing (embeds JD) |
| POST | `/api/v1/jobs/{id}/match` | Find Top-5 Candidates (cosine similarity) |
| GET | `/api/v1/jobs/` | List active jobs |
| POST | `/api/v1/applications/` | Apply to job (auto pitch + score) |
| GET | `/api/v1/applications/user/{id}` | Student's applications |
| PATCH | `/api/v1/applications/{id}/status` | Update status |
| POST | `/api/v1/ratings/` | Rate candidate (auto trust score) |

---

## Docker Commands

```bash
# Start everything (DB + Backend + Frontend)
docker compose up --build

# Start DB only (for local backend dev)
docker compose up db -d

# Run database migrations inside backend container
docker compose exec backend alembic revision --autogenerate -m "initial"
docker compose exec backend alembic upgrade head

# View logs
docker compose logs -f backend
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **OpenAI + Mock fallback** | Run fully offline for demos. Set `OPENAI_API_KEY` to enable real AI. |
| **pgvector over Pinecone** | One less external dependency. PostgreSQL handles both relational and vector data. |
| **Async SQLAlchemy** | FastAPI's async support makes I/O non-blocking — critical for embedding calls. |
| **Alembic from day 1** | Schema will evolve (ratings system, trust decay). Migrations prevent data loss. |
| **Pydantic-settings** | Type-safe, validated env vars. No raw `os.getenv()` throughout the codebase. |
| **Barrel exports** | `from app.db import User` instead of drilling into submodules. |

---

## Live Pages (localhost:3000)

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero + Feature cards + Stats + CTA |
| Student | `/dashboard/student` | Resume upload, match gauges, AI pitch, timeline |
| Recruiter | `/dashboard/recruiter` | JD input, Top-5 candidates, bar chart, pitch detail |

> **Next Steps → Phase 2:** Connect frontend to FastAPI via Axios. Enable real resume uploads. Add auth via Supabase.
