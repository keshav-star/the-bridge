"""Pydantic v2 schemas (request / response DTOs)."""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Shared ────────────────────────────────────────────────────────────────────

class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── User ──────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    ALUMNI = "ALUMNI"
    RECRUITER = "RECRUITER"


class UserCreate(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str
    role: UserRole = UserRole.STUDENT
    graduation_year: Optional[int] = None


class UserRead(OrmModel):
    id: str
    email: str
    name: str
    role: UserRole
    graduation_year: Optional[int] = None
    is_active: bool
    created_at: datetime


# ── Profile ───────────────────────────────────────────────────────────────────

class SkillMatrix(BaseModel):
    core_skills: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    experience_summary: str = ""
    years_of_experience: int = 0
    github_projects: List[Dict[str, Any]] = Field(default_factory=list)
    education: Dict[str, Any] = Field(default_factory=dict)


class ProfileRead(OrmModel):
    id: str
    user_id: str
    skill_matrix: Optional[Dict[str, Any]] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    trust_score: float
    updated_at: datetime


# ── Resume Processing ─────────────────────────────────────────────────────────

class ResumeProcessResponse(BaseModel):
    profile_id: str
    skill_matrix: SkillMatrix
    message: str = "Resume processed successfully"


# ── Job Listings ──────────────────────────────────────────────────────────────

class JobListingCreate(BaseModel):
    title: str
    company: str
    description: str
    requirements: Optional[Union[Dict[str, Any], List[Any]]] = None


class JobListingRead(OrmModel):
    id: str
    poster_id: str
    title: str
    company: str
    description: str
    requirements: Optional[Union[Dict[str, Any], List[Any]]] = None
    is_active: bool
    created_at: datetime


# ── Matching ──────────────────────────────────────────────────────────────────

class CandidateMatch(BaseModel):
    user_id: str
    name: str
    email: str
    match_score: float
    skill_matrix: Optional[Dict[str, Any]] = None
    ai_pitch: Optional[str] = None
    reasons_for_fit: List[str] = Field(default_factory=list)


class MatchResponse(BaseModel):
    job_id: str
    top_candidates: List[CandidateMatch]


# ── Applications ──────────────────────────────────────────────────────────────

class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class ApplicationRead(OrmModel):
    id: str
    applicant_id: str
    job_id: str
    status: ApplicationStatus
    match_score: Optional[float] = None
    ai_pitch: Optional[str] = None
    applied_at: datetime
    updated_at: datetime


# ── Ratings ───────────────────────────────────────────────────────────────────

class RatingCreate(BaseModel):
    ratee_id: str
    application_id: Optional[str] = None
    score: float = Field(ge=1.0, le=5.0)
    feedback: Optional[str] = None


class RatingRead(OrmModel):
    id: str
    rater_id: str
    ratee_id: str
    score: float
    feedback: Optional[str] = None
    created_at: datetime
