"""API v1 Router — aggregates all route modules."""
from fastapi import APIRouter

from app.api.v1.routes import users, resumes, jobs, applications, ratings

api_router = APIRouter()

api_router.include_router(users.router,       prefix="/users",        tags=["Users"])
api_router.include_router(resumes.router,     prefix="/resumes",      tags=["Resumes"])
api_router.include_router(jobs.router,        prefix="/jobs",         tags=["Jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(ratings.router,     prefix="/ratings",      tags=["Ratings"])
