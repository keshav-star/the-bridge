"""
Matching Service — Cosine similarity search using pgvector.
"""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.schemas import CandidateMatch


async def find_top_candidates(
    db: AsyncSession,
    jd_embedding: List[float],
    job_id: str,
    limit: int = 5,
    min_graduation_year: Optional[int] = None,
) -> List[CandidateMatch]:
    """
    Use pgvector cosine similarity to find the top-N candidates
    for a given Job Description embedding.

    Hard filters supported:
    - min_graduation_year: only include students graduating on or after this year
    """
    # Format the embedding vector for pgvector
    vector_str = "[" + ",".join(str(v) for v in jd_embedding) + "]"

    grad_filter = ""
    if min_graduation_year:
        grad_filter = f"AND u.graduation_year >= {min_graduation_year}"

    query = text(f"""
        SELECT
            u.id         AS user_id,
            u.name       AS name,
            u.email      AS email,
            p.skill_matrix,
            1 - (p.embedding <=> '{vector_str}'::vector) AS match_score
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        WHERE p.embedding IS NOT NULL
          AND u.role IN ('STUDENT', 'ALUMNI')
          {grad_filter}
        ORDER BY match_score DESC
        LIMIT :limit
    """)

    result = await db.execute(query, {"limit": limit})
    rows = result.fetchall()

    candidates = []
    for row in rows:
        candidates.append(
            CandidateMatch(
                user_id=row.user_id,
                name=row.name,
                email=row.email,
                match_score=round(float(row.match_score), 4),
                skill_matrix=row.skill_matrix,
                reasons_for_fit=_extract_reasons(row.skill_matrix),
            )
        )
    return candidates


def _extract_reasons(skill_matrix: Optional[dict]) -> List[str]:
    """Extract human-readable fit reasons from a skill matrix."""
    if not skill_matrix:
        return ["Profile available on request"]
    reasons = []
    if skill_matrix.get("languages"):
        reasons.append(f"Proficient in: {', '.join(skill_matrix['languages'][:3])}")
    if skill_matrix.get("frameworks"):
        reasons.append(f"Framework experience: {', '.join(skill_matrix['frameworks'][:3])}")
    if skill_matrix.get("experience_summary"):
        reasons.append(skill_matrix["experience_summary"][:120])
    return reasons or ["Semantic match via vector similarity"]
