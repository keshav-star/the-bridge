"""
Job Listings + AI Matching endpoints.

POST /jobs/           — Create a JD, embed it, store it
POST /jobs/{id}/match — Run cosine similarity to find top 5 candidates
GET  /jobs/           — List all active jobs
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import JobListing, User
from app.schemas import JobListingCreate, JobListingRead, MatchResponse
from app.services.ai_service import generate_embedding, generate_ai_pitch
from app.services.matching_service import find_top_candidates

router = APIRouter()


@router.post("/", response_model=JobListingRead, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobListingCreate,
    poster_id: str = Query(..., description="UUID of the alumni/recruiter posting the job"),
    db: AsyncSession = Depends(get_db),
):
    """Create a job listing with a semantic embedding of its description."""
    # Validate poster
    result = await db.execute(select(User).where(User.id == poster_id))
    poster = result.scalar_one_or_none()
    if not poster:
        raise HTTPException(status_code=404, detail="Poster user not found")

    # Embed the JD
    embedding = await generate_embedding(f"{payload.title}\n{payload.description}")

    job = JobListing(
        id=str(uuid.uuid4()),
        poster_id=poster_id,
        title=payload.title,
        company=payload.company,
        description=payload.description,
        requirements=payload.requirements,
        embedding=embedding,
    )
    db.add(job)
    await db.flush()
    await db.refresh(job)
    return job


@router.post("/{job_id}/match", response_model=MatchResponse)
async def match_candidates(
    job_id: str,
    limit: int = Query(default=5, ge=1, le=20),
    min_graduation_year: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    AI Matcher — find top candidates for a job using pgvector cosine similarity.
    Supports hard constraints: min_graduation_year.
    """
    result = await db.execute(select(JobListing).where(JobListing.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.embedding is None:
        raise HTTPException(status_code=422, detail="Job has no embedding — re-create the listing")

    candidates = await find_top_candidates(
        db=db,
        jd_embedding=job.embedding,
        job_id=job_id,
        limit=limit,
        min_graduation_year=min_graduation_year,
    )

    # Generate AI pitches for each candidate
    for candidate in candidates:
        candidate.ai_pitch = await generate_ai_pitch(
            skill_matrix=candidate.skill_matrix or {},
            job_description=job.description,
            candidate_name=candidate.name,
        )

    return MatchResponse(job_id=job_id, top_candidates=candidates)


@router.get("/", response_model=list[JobListingRead])
async def list_jobs(
    active_only: bool = Query(default=True),
    db: AsyncSession = Depends(get_db),
):
    """List job listings."""
    stmt = select(JobListing)
    if active_only:
        stmt = stmt.where(JobListing.is_active == True)
    result = await db.execute(stmt.order_by(JobListing.created_at.desc()).limit(50))
    return result.scalars().all()


@router.get("/{job_id}", response_model=JobListingRead)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobListing).where(JobListing.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
