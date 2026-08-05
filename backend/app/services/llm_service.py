"""
Calls Groq's OpenAI-compatible chat completions API, which serves Llama 3
models with free-tier low-latency inference -- a drop-in swap for a locally
hosted Ollama instance when deploying to platforms without GPU access.

Set GROQ_API_KEY in the environment. Get a free key at https://console.groq.com
"""
import os
import httpx
from fastapi import HTTPException

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"


def _api_key() -> str:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the server.",
        )
    return key


async def _chat(system_prompt: str, user_prompt: str, max_tokens: int = 700) -> str:
    headers = {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.5,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(GROQ_URL, headers=headers, json=payload)
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"LLM provider error: {resp.status_code} {resp.text[:300]}",
        )
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


async def generate_resume_suggestions(
    resume_text: str, job_description: str, missing_skills: list[str]
) -> str:
    system = (
        "You are an expert resume coach and ATS optimization specialist. "
        "Give concise, specific, actionable bullet-point suggestions. "
        "No generic advice -- reference actual content from the resume and JD."
    )
    missing_str = ", ".join(missing_skills) if missing_skills else "none detected"
    user = f"""Resume:
{resume_text[:4000]}

Job Description:
{job_description[:3000]}

Skills present in the JD but missing from the resume: {missing_str}

Give me 5-8 specific, actionable suggestions to improve this resume for this
role. Focus on: rewording weak bullet points, quantifying achievements,
incorporating missing keywords naturally, and structural improvements.
Return as a plain bullet list, one suggestion per line, no preamble."""
    return await _chat(system, user)


async def generate_cover_letter(
    resume_text: str, job_description: str, tone: str = "professional"
) -> str:
    system = (
        f"You are an expert cover letter writer. Write in a {tone} tone. "
        "Keep it to 3-4 short paragraphs, tailored specifically to the role "
        "and grounded in real details from the resume. No placeholders like "
        "[Company Name] unless the company isn't identifiable in the JD."
    )
    user = f"""Resume:
{resume_text[:4000]}

Job Description:
{job_description[:3000]}

Write a tailored cover letter for this application."""
    return await _chat(system, user, max_tokens=600)
