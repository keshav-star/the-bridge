"""
SQLAlchemy ORM Models for The Bridge.

All vector columns use pgvector's Vector type.
JSONB columns store flexible structured data (skills, GitHub projects, etc.)
"""
import enum
import uuid
from datetime import datetime
from typing import List, Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.core.config import settings


# ── Enums ─────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    ALUMNI = "ALUMNI"
    RECRUITER = "RECRUITER"


class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), nullable=False, default=UserRole.STUDENT
    )
    graduation_year: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    profile: Mapped[Optional["Profile"]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    job_listings: Mapped[List["JobListing"]] = relationship(
        back_populates="poster", cascade="all, delete-orphan"
    )
    applications: Mapped[List["Application"]] = relationship(
        back_populates="applicant", cascade="all, delete-orphan"
    )
    ratings_given: Mapped[List["Rating"]] = relationship(
        "Rating", foreign_keys="Rating.rater_id", back_populates="rater"
    )
    ratings_received: Mapped[List["Rating"]] = relationship(
        "Rating", foreign_keys="Rating.ratee_id", back_populates="ratee"
    )


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Flexible structured data stored as JSONB
    skill_matrix: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # {
    #   "core_skills": [...], "languages": [...], "frameworks": [...],
    #   "experience_summary": "...", "years_of_experience": 2,
    #   "github_projects": [...], "education": {...}
    # }

    github_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    resume_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    trust_score: Mapped[float] = mapped_column(Float, default=100.0)

    # pgvector — 1536-dimensional OpenAI embedding
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        Vector(settings.VECTOR_DIMENSION), nullable=True
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="profile")


class JobListing(Base):
    __tablename__ = "job_listings"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    poster_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # { "role_type": "Full-time", "min_graduation_year": 2023, "tags": [...] }

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # pgvector — JD semantic embedding
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        Vector(settings.VECTOR_DIMENSION), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    poster: Mapped["User"] = relationship(back_populates="job_listings")
    applications: Mapped[List["Application"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    applicant_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus), default=ApplicationStatus.PENDING
    )
    match_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # AI-generated content
    ai_pitch: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # 3-bullet-point pitch stored as text (can be parsed as JSON array)

    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    applicant: Mapped["User"] = relationship(back_populates="applications")
    job: Mapped["JobListing"] = relationship(back_populates="applications")


class Rating(Base):
    __tablename__ = "ratings"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    rater_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    ratee_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    application_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("applications.id", ondelete="SET NULL"), nullable=True
    )

    score: Mapped[float] = mapped_column(Float, nullable=False)  # 1.0 – 5.0
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    rater: Mapped["User"] = relationship("User", foreign_keys=[rater_id], back_populates="ratings_given")
    ratee: Mapped["User"] = relationship("User", foreign_keys=[ratee_id], back_populates="ratings_received")
