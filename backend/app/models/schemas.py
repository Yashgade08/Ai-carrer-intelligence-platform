from pydantic import BaseModel
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str


class SkillGap(BaseModel):
    matched_skills: List[str]
    missing_skills: List[str]
    extra_skills: List[str]


class AnalyzeResponse(BaseModel):
    semantic_similarity: float
    ats_score: float
    keyword_match_score: float
    skills: SkillGap
    top_jd_keywords: List[str]
    summary: str


class SuggestRequest(BaseModel):
    resume_text: str
    job_description: str
    missing_skills: Optional[List[str]] = None


class SuggestionResponse(BaseModel):
    suggestions: List[str]
    raw: str


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    tone: Optional[str] = "professional"


class CoverLetterResponse(BaseModel):
    cover_letter: str


class ParseResponse(BaseModel):
    filename: str
    text: str
    char_count: int
