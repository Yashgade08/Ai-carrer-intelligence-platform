import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze, parse, suggest

app = FastAPI(
    title="AI Career Intelligence Platform API",
    description="Resume vs Job Description semantic scoring, ATS analysis, and AI-powered suggestions.",
    version="1.0.0",
)

# In production, set ALLOWED_ORIGINS to your deployed frontend URL(s),
# comma separated e.g. "https://your-app.vercel.app,http://localhost:5173"
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(parse.router)
app.include_router(suggest.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Career Intelligence Platform API"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
