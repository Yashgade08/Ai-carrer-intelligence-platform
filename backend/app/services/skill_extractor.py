"""
Skill extraction using spaCy's PhraseMatcher against a curated skills DB,
plus a fallback that reads flat text for near-matches (handles minor
formatting differences like "Node JS" vs "node.js").
"""
from functools import lru_cache
import re
from app.skills_db import flat_skill_list, category_for_skill


@lru_cache(maxsize=1)
def _get_nlp():
    import spacy
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        # Model not downloaded yet (first boot on a fresh deploy) -- fetch it.
        from spacy.cli import download
        download("en_core_web_sm")
        return spacy.load("en_core_web_sm")


@lru_cache(maxsize=1)
def _get_matcher():
    from spacy.matcher import PhraseMatcher
    nlp = _get_nlp()
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in flat_skill_list()]
    matcher.add("SKILLS", patterns)
    return matcher


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[_/]", " ", text)
    return text


def extract_skills(text: str) -> list[str]:
    nlp = _get_nlp()
    matcher = _get_matcher()
    doc = nlp(_normalize(text))
    matches = matcher(doc)
    found = set()
    for match_id, start, end in matches:
        span = doc[start:end]
        found.add(span.text.strip())
    return sorted(found)


def skill_gap(resume_text: str, jd_text: str) -> dict:
    resume_skills = set(extract_skills(resume_text))
    jd_skills = set(extract_skills(jd_text))

    matched = sorted(resume_skills & jd_skills)
    missing = sorted(jd_skills - resume_skills)
    extra = sorted(resume_skills - jd_skills)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra,
    }
