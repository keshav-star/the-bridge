# The Bridge — AI-Augmented Recruitment Platform

**The Bridge** is a high-trust recruitment ecosystem designed exclusively for the UIET community. It bridges the gap between students and alumni by leveraging semantic AI to match talent with opportunities, eliminating the noise of traditional job boards.

---

## 🚀 Key Features

### For Students
*   **AI Resume Parser**: Upload a PDF resume; the system extracts a structured skill matrix and generates vector embeddings.
*   **Semantic Job Matching**: Get matched with alumni-posted jobs based on your actual skills and experience, not just keywords.
*   **Application Tracking**: Track your application status (Pending, Shortlisted, Interview, Offer) with AI-generated pitches for each role.

### For Alumni & Recruiters
*   **AI Candidate Vetting**: Paste a Job Description and instantly surface the top 5 most relevant candidates using `pgvector` cosine similarity.
*   **Personalized AI Pitches**: View AI-generated explanations of why a specific student is a great fit for your role.
*   **High-Trust Network**: Exclusive access ensures all participants are verified members of the UIET community.

---

## 🛠 Tech Stack

### Frontend
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: Tailwind CSS + Shadcn UI
*   **Animations**: Framer Motion
*   **Data Fetching**: TanStack Query (React Query)
*   **Auth**: Supabase Auth + Role-Based Routing

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **Database**: PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) for semantic search
*   **ORM**: SQLAlchemy (Async)
*   **AI Processing**: OpenRouter (GPT-4o-mini / text-embedding-3-small)
*   **PDF Extraction**: PyMuPDF

### Infrastructure
*   **Containerization**: Docker & Docker Compose

---

## 🚦 Getting Started

### Prerequisites
*   [Docker](https://www.docker.com/) and Docker Compose installed.
*   A [Supabase](https://supabase.com/) project (for Authentication).
*   An [OpenRouter](https://openrouter.ai/) or OpenAI API key.

### 1. Environment Configuration
Create a `.env` file in the root directory (and sync it to `backend/` and `frontend/` directories):

```env
# Database (PostgreSQL + pgvector)
POSTGRES_USER=bridge
POSTGRES_PASSWORD=bridge_secret
POSTGRES_DB=bridge_db
DATABASE_URL=postgresql+asyncpg://bridge:bridge_secret@db:5432/bridge_db

# OpenAI / OpenRouter
OPENAI_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_CHAT_MODEL=openai/gpt-4o-mini
OPENAI_EMBED_MODEL=openai/text-embedding-3-small

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Launch the Platform
Run the following command to build and start the entire stack:

```bash
docker compose up --build
```

The services will be available at:
*   **Frontend**: [http://localhost:3000](http://localhost:3000)
*   **Backend API**: [http://localhost:8000](http://localhost:8000)
*   **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏗 Architecture Overview

1.  **Authentication**: Handled via Supabase. Users choose a role (Student or Recruiter) on the `/auth` page.
2.  **Onboarding**: New users are routed to `/onboarding/{role}` to create their profile in the PostgreSQL backend.
3.  **Role-Based Routing**: Middleware and a `/auth/resolve-role` route ensure users always land on the correct dashboard.
4.  **Semantic Search**: When a recruiter posts a JD, the backend generates an embedding and performs a vector search against student profiles in the database.

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/  # API Endpoints (Users, Jobs, Resumes, etc.)
│   │   ├── core/           # Config & Security
│   │   ├── db/             # Models & Session management
│   │   ├── services/       # AI logic, matching service, resume parsing
│   │   └── schemas/        # Pydantic request/response models
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router (Dashboards, Auth, Onboarding)
│   │   ├── components/     # UI Components (Shadcn)
│   │   ├── hooks/          # TanStack Query hooks
│   │   └── lib/            # API clients & Supabase config
└── docker-compose.yml      # Orchestrates Backend, Frontend, and DB
```

---

## 📝 License
This project is for the UIET community. All rights reserved.
