"""
Resume processing endpoint — /api/v1/resumes/process-resume

Accepts a PDF upload, extracts text, runs LLM parsing,
generates a vector embedding, and upserts the user's Profile.
"""
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import Profile, User
from app.schemas import ProfileRead, ResumeProcessResponse
from app.services.ai_service import (
    extract_text_from_pdf,
    generate_embedding,
    parse_resume_to_skill_matrix,
)

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/process-resume", response_model=ResumeProcessResponse)
async def process_resume(
    user_id: str = Form(..., description="UUID of the student uploading the resume"),
    file: UploadFile = File(..., description="PDF resume file"),
    db: AsyncSession = Depends(get_db),
):
    """
    Full resume processing pipeline:
    1. Validate PDF
    2. Extract text via PyMuPDF
    3. Parse to structured SkillMatrix via LLM (or mock)
    4. Generate vector embedding
    5. Upsert Profile in DB
    """
    # Validate user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    # Extract text
    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"PDF extraction failed: {exc}")

    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="PDF appears to be empty or image-only")

    # Parse to skill matrix
    skill_matrix = await parse_resume_to_skill_matrix(resume_text)

    # Generate embedding from the skill summary
    embed_text = f"{skill_matrix.experience_summary} {' '.join(skill_matrix.core_skills + skill_matrix.languages + skill_matrix.frameworks)}"
    embedding = await generate_embedding(embed_text)

    # Upsert profile
    profile_result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = profile_result.scalar_one_or_none()

    if profile:
        profile.skill_matrix = skill_matrix.model_dump()
        profile.resume_text = resume_text[:10000]
        profile.embedding = embedding
    else:
        profile = Profile(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_matrix=skill_matrix.model_dump(),
            resume_text=resume_text[:10000],
            embedding=embedding,
        )
        db.add(profile)

    await db.flush()
    await db.refresh(profile)

    return ResumeProcessResponse(
        profile_id=profile.id,
        skill_matrix=skill_matrix,
        message="Resume processed and profile updated successfully",
    )

@router.get("/profile/{user_id}", response_model=ProfileRead)
async def get_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch the profile (including skill matrix) for a given user."""
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for this user")
    return profile
