"""
TF-IDF based keyword extraction from the job description, keyword-match
scoring against the resume, and a blended ATS compatibility score.
"""
import re
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer

# Extra filler words common in job descriptions that aren't real "skills"
# or meaningful keywords, but rank highly in single-document TF-IDF.
_JD_FILLER_WORDS = {
    "experience", "experience experience", "familiarity", "preferred",
    "plus", "strong", "looking", "role", "years", "year", "team", "teams",
    "ability", "work", "working", "candidate", "candidates", "required",
    "requirements", "responsibilities", "knowledge", "skills", "skill",
    "join", "opportunity", "environment", "including", "using", "use",
}
_JD_STOP_WORDS = list(ENGLISH_STOP_WORDS | _JD_FILLER_WORDS)


def _clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9+#./\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def top_jd_keywords(job_description: str, top_n: int = 15) -> list[str]:
    cleaned = _clean(job_description)
    if not cleaned:
        return []
    vectorizer = TfidfVectorizer(
        stop_words=_JD_STOP_WORDS,
        ngram_range=(1, 2),
        max_features=200,
    )
    try:
        matrix = vectorizer.fit_transform([cleaned])
    except ValueError:
        return []
    scores = matrix.toarray()[0]
    terms = vectorizer.get_feature_names_out()
    ranked = sorted(zip(terms, scores), key=lambda x: x[1], reverse=True)
    # Drop terms that are themselves made only of filler/2-gram noise
    filtered = [
        term for term, score in ranked
        if score > 0 and not all(w in _JD_FILLER_WORDS for w in term.split())
    ]
    return filtered[:top_n]


def keyword_match_score(resume_text: str, jd_keywords: list[str]) -> float:
    if not jd_keywords:
        return 0.0
    resume_clean = _clean(resume_text)
    hits = sum(1 for kw in jd_keywords if kw in resume_clean)
    return round((hits / len(jd_keywords)) * 100, 2)


def compute_ats_score(
    semantic_similarity: float,
    keyword_score: float,
    skills_matched: int,
    skills_missing: int,
) -> float:
    """
    Blended ATS score:
      50% semantic similarity (how relevant the resume reads overall)
      30% keyword match (literal ATS-style keyword matching)
      20% skill coverage (matched vs total required skills)
    """
    total_skills = skills_matched + skills_missing
    skill_coverage = (skills_matched / total_skills * 100) if total_skills else 100.0

    ats = (
        semantic_similarity * 0.5
        + keyword_score * 0.3
        + skill_coverage * 0.2
    )
    return round(min(100.0, ats), 2)


def build_summary(ats_score: float, missing_skills: list[str]) -> str:
    if ats_score >= 80:
        tier = "Excellent match"
    elif ats_score >= 60:
        tier = "Good match"
    elif ats_score >= 40:
        tier = "Moderate match"
    else:
        tier = "Weak match"

    msg = f"{tier} ({ats_score}/100)."
    if missing_skills:
        shown = ", ".join(missing_skills[:5])
        msg += f" Consider addressing these gaps: {shown}."
    else:
        msg += " No major skill gaps detected against this job description."
    return msg
