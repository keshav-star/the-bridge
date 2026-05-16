"""
AI Service — Resume parsing, vectorization, matching, and pitch generation.

Uses OpenAI when OPENAI_API_KEY is set.
Falls back to deterministic mocks for local/offline development.
"""
from __future__ import annotations

import json
import random
import re
import uuid
from typing import Any, Dict, List, Optional

import fitz  # PyMuPDF

from app.core.config import settings
from app.schemas import SkillMatrix

import logging

logger = logging.getLogger(__name__)

# ── OpenAI client (lazy init) ─────────────────────────────────────────────────

_openai_client = None


def _get_openai():
    global _openai_client
    if _openai_client is None and settings.OPENAI_API_KEY:
        from openai import AsyncOpenAI
        
        # OpenRouter usually doesn't support the 'json_object' response format on all models,
        # but let's first ensure the base_url is being picked up.
        logger.info(f"Initializing AI client with base_url: {settings.OPENAI_BASE_URL}")
        
        _openai_client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            # OpenRouter optional headers
            default_headers={
                "HTTP-Referer": "https://github.com/justtitle/the-bridge",
                "X-Title": "The Bridge Platform",
            }
        )
    return _openai_client


# ── PDF Extraction ────────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [page.get_text("text") for page in doc]
    doc.close()
    return "\n".join(pages).strip()


# ── Skill Matrix Extraction ───────────────────────────────────────────────────

_MOCK_SKILL_MATRIX = SkillMatrix(
    core_skills=["Problem Solving", "System Design", "REST APIs"],
    languages=["Python", "TypeScript", "SQL"],
    frameworks=["FastAPI", "Next.js", "React", "SQLAlchemy"],
    experience_summary="A driven software engineering student with hands-on project experience in full-stack development and AI integration.",
    years_of_experience=1,
    github_projects=[
        {
            "name": "AI Chat App",
            "url": "https://github.com/student/ai-chat",
            "description": "LLM-powered real-time chat with streaming responses",
            "tech_stack": ["Next.js", "FastAPI", "OpenAI"],
        }
    ],
    education={
        "degree": "B.Tech Computer Engineering",
        "institution": "UIET",
        "graduation_year": 2025,
    },
)

_PARSE_PROMPT = """
You are an expert tech recruiter. Extract a structured JSON skill matrix from the resume text below.
Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "core_skills": ["string"],
  "languages": ["string"],
  "frameworks": ["string"],
  "experience_summary": "string",
  "years_of_experience": integer,
  "github_projects": [{"name":"string","url":"string","description":"string","tech_stack":["string"]}],
  "education": {"degree":"string","institution":"string","graduation_year":integer}
}

Resume text:
"""


async def parse_resume_to_skill_matrix(resume_text: str) -> SkillMatrix:
    """
    Parse raw resume text into a structured SkillMatrix.
    Uses OpenAI GPT if key is present, else returns a mock.
    """
    client = _get_openai()
    if not client:
        return _MOCK_SKILL_MATRIX

    kwargs = {
        "model": settings.OPENAI_CHAT_MODEL,
        "messages": [
            {"role": "system", "content": "You extract structured JSON from resumes. Return only valid JSON."},
            {"role": "user", "content": _PARSE_PROMPT + resume_text[:8000]},
        ],
        "temperature": 0,
    }
    
    # Try using json_object if supported
    try:
        response = await client.chat.completions.create(
            **kwargs,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        logger.warning(f"JSON mode failed, retrying without it: {e}")
        response = await client.chat.completions.create(**kwargs)
    raw = response.choices[0].message.content or "{}"
    data = json.loads(raw)
    return SkillMatrix(**data)


# ── Embeddings ────────────────────────────────────────────────────────────────

def _mock_embedding(dim: int = 1536) -> List[float]:
    """Generate a deterministic-ish unit-normalized random vector for testing."""
    vec = [random.gauss(0, 1) for _ in range(dim)]
    magnitude = sum(v ** 2 for v in vec) ** 0.5
    return [v / magnitude for v in vec]


async def generate_embedding(text: str) -> List[float]:
    """
    Generate a semantic embedding for text.
    Uses OpenAI text-embedding-3-small if key is present, else a mock vector.
    """
    client = _get_openai()
    if not client:
        return _mock_embedding(settings.VECTOR_DIMENSION)

    response = await client.embeddings.create(
        model=settings.OPENAI_EMBED_MODEL,
        input=text[:8000],
    )
    return response.data[0].embedding


# ── Pitch Generation ──────────────────────────────────────────────────────────

_MOCK_PITCH = """• Strong full-stack skills in Next.js and FastAPI directly match the JD's core tech requirements.
• Open-source AI project demonstrates initiative and practical LLM integration experience.
• Expected graduation in 2025 aligns with the role's immediate-start requirement."""


async def generate_ai_pitch(
    skill_matrix: Dict[str, Any],
    job_description: str,
    candidate_name: str,
) -> str:
    """
    Generate a 3-bullet personalized pitch for a candidate against a JD.
    """
    client = _get_openai()
    if not client:
        return _MOCK_PITCH

    prompt = f"""
You are a career coach writing a concise pitch for a recruiter.
Candidate: {candidate_name}
Skill Matrix: {json.dumps(skill_matrix, indent=2)}
Job Description: {job_description[:2000]}

Write EXACTLY 3 bullet points (starting with •) explaining why this candidate fits the role.
Be specific — reference their actual skills and projects. Keep each point under 30 words.
"""
    response = await client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=300,
    )
    return response.choices[0].message.content or _MOCK_PITCH
