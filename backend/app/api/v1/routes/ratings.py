"""Rating routes — trust score system."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.db.models import Profile, Rating, User
from app.schemas import RatingCreate, RatingRead

router = APIRouter()


@router.post("/", response_model=RatingRead, status_code=status.HTTP_201_CREATED)
async def create_rating(
    payload: RatingCreate,
    rater_id: str = Query(..., description="User submitting the rating"),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a rating. Automatically recalculates the ratee's trust score.
    Trust score = average of all received ratings (normalized to 0–100).
    """
    # Validate users
    for uid, label in [(rater_id, "Rater"), (payload.ratee_id, "Ratee")]:
        r = await db.execute(select(User).where(User.id == uid))
        if not r.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"{label} not found")

    if rater_id == payload.ratee_id:
        raise HTTPException(status_code=400, detail="Cannot rate yourself")

    rating = Rating(
        id=str(uuid.uuid4()),
        rater_id=rater_id,
        ratee_id=payload.ratee_id,
        application_id=payload.application_id,
        score=payload.score,
        feedback=payload.feedback,
    )
    db.add(rating)
    await db.flush()

    # Recalculate trust score for ratee
    avg_result = await db.execute(
        select(func.avg(Rating.score)).where(Rating.ratee_id == payload.ratee_id)
    )
    avg_score = avg_result.scalar() or payload.score
    trust_score = round((float(avg_score) / 5.0) * 100, 2)

    profile_r = await db.execute(select(Profile).where(Profile.user_id == payload.ratee_id))
    profile = profile_r.scalar_one_or_none()
    if profile:
        profile.trust_score = trust_score

    await db.flush()
    await db.refresh(rating)
    return rating


@router.get("/user/{user_id}", response_model=list[RatingRead])
async def get_user_ratings(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Rating).where(Rating.ratee_id == user_id).order_by(Rating.created_at.desc())
    )
    return result.scalars().all()
