from fastapi import APIRouter
from app.models.schemas import (
    SuggestRequest,
    SuggestionResponse,
    CoverLetterRequest,
    CoverLetterResponse,
)
from app.services.llm_service import generate_resume_suggestions, generate_cover_letter

router = APIRouter(prefix="/api", tags=["suggest"])


@router.post("/suggest", response_model=SuggestionResponse)
async def suggest(payload: SuggestRequest):
    raw = await generate_resume_suggestions(
        payload.resume_text,
        payload.job_description,
        payload.missing_skills or [],
    )
    lines = [
        line.strip("-• \t")
        for line in raw.splitlines()
        if line.strip() and line.strip("-• \t")
    ]
    return SuggestionResponse(suggestions=lines, raw=raw)


@router.post("/cover-letter", response_model=CoverLetterResponse)
async def cover_letter(payload: CoverLetterRequest):
    letter = await generate_cover_letter(
        payload.resume_text, payload.job_description, payload.tone or "professional"
    )
    return CoverLetterResponse(cover_letter=letter)
