# 🚀 The Bridge: Command Reference

This guide provides a comprehensive list of commands for development, deployment, and troubleshooting of **The Bridge** platform.

---

## 🛠️ 1. Project Setup (First Time)

### Prerequisites
- [Docker & Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 18+](https://nodejs.org/)
- [Python 3.11+](https://www.python.org/)

### Initialize Environment
```bash
# 1. Clone the repository (if you haven't)
# 2. Setup environment variables
cp .env.example .env
# Important: Update .env with your Supabase keys and OpenAI API key
```

### Install Dependencies (Local)
**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🐳 2. Docker Operations

Docker is the recommended way to run the full stack (Frontend, Backend, and DB with pgvector).

| Action | Command |
| :--- | :--- |
| **Start Everything** | `docker compose up --build` |
| **Start Detached** | `docker compose up -d` |
| **Stop Everything** | `docker compose down` |
| **Stop & Remove Volumes** | `docker compose down -v` *(Resets Database)* |
| **View Logs** | `docker compose logs -f` |
| **View Specific Logs** | `docker compose logs -f frontend` (or `backend`/`db`) |
| **Restart a Service** | `docker compose restart frontend` |
| **Rebuild & Start** | `docker compose up --build --force-recreate` |

---

## 💻 3. Development Workflow (Local)

Sometimes it's faster to run services locally without Docker (e.g., for faster HMR).

### Running Frontend
```bash
cd frontend
npm run dev
# Dashboard at: http://localhost:3000
```

### Running Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# API Docs at: http://localhost:8000/docs
```

---

## 🗄️ 4. Database Management (Alembic & pgvector)

Migrations are handled by Alembic inside the `backend` directory.

### Migrations (Alembic)
If you change models in `backend/app/db/models.py`:
```bash
cd backend
# 1. Create a new migration
alembic revision --autogenerate -m "description of changes"

# 2. Apply migration to DB
alembic upgrade head

# 3. Rollback last migration
alembic downgrade -1
```

### Seeding Data
To populate the database with initial mock data:
```bash
cd backend
python seed.py
```

### Database Maintenance
| Action | Command |
| :--- | :--- |
| **Connect to DB (CLI)** | `docker exec -it bridge_db psql -U bridge -d bridge_db` |
| **Reset DB Volume** | `docker volume rm justtitle_pgdata` |
| **Clean Docker System** | `docker system prune -a` *(Use with caution)* |

---

## 🧹 5. Cache & Cleanup

When things get weird (e.g., build errors or ghost dependencies), use these commands.

### Frontend Cleanup
```bash
cd frontend
rm -rf .next          # Clear Next.js build cache
rm -rf node_modules   # Remove dependencies
npm install           # Reinstall fresh
```

### Backend Cleanup
```bash
cd backend
find . -type d -name "__pycache__" -exec rm -rf {} +
rm -rf .pytest_cache
```

### Hard Reset (The "Nuke" Option)
If you want to start completely fresh:
```bash
# 1. Stop and remove everything
docker compose down -v

# 2. Clear local caches
cd frontend && rm -rf .next node_modules && npm i
cd ../backend && rm -rf venv && python -m venv venv && pip install -r requirements.txt

# 3. Start over
docker compose up --build
```

---

## 🚢 6. Deployment (Generic)

### Production Build
**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

**Backend:**
```bash
cd backend
# Use gunicorn for production
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

---

> [!TIP]
> **Pro-Tip**: Use `docker compose up -d` to run in the background, and then use `docker compose logs -f --tail 100` to see only the most recent logs.
