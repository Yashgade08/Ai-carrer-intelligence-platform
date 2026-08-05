from fastapi import APIRouter, UploadFile, File
from app.models.schemas import ParseResponse
from app.services.resume_parser import parse_resume_file

router = APIRouter(prefix="/api", tags=["parse"])


@router.post("/parse-resume", response_model=ParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    text = await parse_resume_file(file)
    return ParseResponse(
        filename=file.filename,
        text=text,
        char_count=len(text),
    )
