"""Application management routes."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import Application, ApplicationStatus, JobListing, Profile, User
from app.schemas import ApplicationRead
from app.services.ai_service import generate_ai_pitch

router = APIRouter()


@router.post("/", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    applicant_id: str = Query(...),
    job_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Student applies to a job.
    Auto-generates AI pitch and calculates match score from stored embeddings.
    """
    # Validate applicant and job
    user_r = await db.execute(select(User).where(User.id == applicant_id))
    user = user_r.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Applicant not found")

    job_r = await db.execute(select(JobListing).where(JobListing.id == job_id))
    job = job_r.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Prevent duplicate applications
    dup = await db.execute(
        select(Application).where(
            Application.applicant_id == applicant_id,
            Application.job_id == job_id,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already applied to this job")

    # Fetch profile for pitch + score
    profile_r = await db.execute(select(Profile).where(Profile.user_id == applicant_id))
    profile = profile_r.scalar_one_or_none()

    match_score = None
    ai_pitch = None

    if profile and profile.embedding and job.embedding:
        # Cosine similarity: dot product of normalized vectors
        e1, e2 = profile.embedding, job.embedding
        dot = sum(a * b for a, b in zip(e1, e2))
        match_score = round(dot, 4)

    if profile and profile.skill_matrix:
        ai_pitch = await generate_ai_pitch(
            skill_matrix=profile.skill_matrix,
            job_description=job.description,
            candidate_name=user.name,
        )

    application = Application(
        id=str(uuid.uuid4()),
        applicant_id=applicant_id,
        job_id=job_id,
        status=ApplicationStatus.PENDING,
        match_score=match_score,
        ai_pitch=ai_pitch,
    )
    db.add(application)
    await db.flush()
    await db.refresh(application)
    return application


@router.get("/user/{user_id}", response_model=list[ApplicationRead])
async def get_user_applications(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get all applications for a student."""
    result = await db.execute(
        select(Application)
        .where(Application.applicant_id == user_id)
        .order_by(Application.applied_at.desc())
    )
    return result.scalars().all()


@router.patch("/{application_id}/status", response_model=ApplicationRead)
async def update_application_status(
    application_id: str,
    new_status: ApplicationStatus = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Recruiter updates application status (shortlist, interview, offer, reject)."""
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = new_status
    await db.flush()
    await db.refresh(app)
    return app
