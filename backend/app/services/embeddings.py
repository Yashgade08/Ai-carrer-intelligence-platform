"""
Sentence-BERT based semantic similarity between resume and job description.
Model is loaded once (module-level singleton) so repeated requests are fast.
"""
from functools import lru_cache
import numpy as np

_MODEL_NAME = "all-MiniLM-L6-v2"  # small, fast, good enough for free-tier RAM


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(_MODEL_NAME)


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    denom = (np.linalg.norm(vec_a) * np.linalg.norm(vec_b))
    if denom == 0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / denom)


def semantic_similarity_score(resume_text: str, job_description: str) -> float:
    """Returns a 0-100 semantic relevance score between resume and JD."""
    model = _get_model()
    embeddings = model.encode([resume_text, job_description], normalize_embeddings=True)
    sim = cosine_similarity(embeddings[0], embeddings[1])
    # cosine sim is already in [-1, 1]; for normalized text embeddings it's
    # typically in [0, 1]. Clamp and scale to a friendly 0-100 range.
    sim = max(0.0, min(1.0, sim))
    return round(sim * 100, 2)
