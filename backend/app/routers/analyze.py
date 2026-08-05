from fastapi import APIRouter
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, SkillGap
from app.services.embeddings import semantic_similarity_score
from app.services.skill_extractor import skill_gap
from app.services.ats_scorer import (
    top_jd_keywords,
    keyword_match_score,
    compute_ats_score,
    build_summary,
)

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    resume_text = payload.resume_text
    jd_text = payload.job_description

    semantic_score = semantic_similarity_score(resume_text, jd_text)
    gap = skill_gap(resume_text, jd_text)
    jd_keywords = top_jd_keywords(jd_text)
    kw_score = keyword_match_score(resume_text, jd_keywords)

    ats = compute_ats_score(
        semantic_similarity=semantic_score,
        keyword_score=kw_score,
        skills_matched=len(gap["matched_skills"]),
        skills_missing=len(gap["missing_skills"]),
    )
    summary = build_summary(ats, gap["missing_skills"])

    return AnalyzeResponse(
        semantic_similarity=semantic_score,
        ats_score=ats,
        keyword_match_score=kw_score,
        skills=SkillGap(**gap),
        top_jd_keywords=jd_keywords,
        summary=summary,
    )
