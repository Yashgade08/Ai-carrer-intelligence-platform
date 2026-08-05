"""
Curated skills database used for phrase-matching against resume/JD text.
Grouped so the frontend can render skill-gap results by category.
Extend freely -- this is intentionally a flat, fast-lookup structure.
"""

SKILLS_DB = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "c",
        "go", "golang", "rust", "kotlin", "swift", "ruby", "php", "scala",
        "r", "matlab", "sql", "bash", "shell scripting"
    ],
    "web_frameworks": [
        "react", "react.js", "next.js", "vue", "angular", "svelte",
        "django", "flask", "fastapi", "express", "express.js", "spring boot",
        "node.js", "asp.net", "tailwind css", "bootstrap", "html", "css"
    ],
    "data_ml": [
        "machine learning", "deep learning", "nlp", "natural language processing",
        "computer vision", "pytorch", "tensorflow", "keras", "scikit-learn",
        "pandas", "numpy", "sentence-bert", "bert", "llm", "large language models",
        "prompt engineering", "rag", "retrieval augmented generation",
        "hugging face", "spacy", "opencv", "xgboost", "time series forecasting",
        "prophet", "anomaly detection", "isolation forest", "data visualization",
        "power bi", "tableau", "matplotlib", "seaborn"
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "redis", "sqlite", "supabase",
        "firebase", "dynamodb", "cassandra", "elasticsearch", "oracle"
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
        "ci/cd", "jenkins", "github actions", "terraform", "linux",
        "nginx", "render", "vercel", "railway", "heroku"
    ],
    "tools_practices": [
        "git", "github", "jira", "agile", "scrum", "rest api", "graphql",
        "microservices", "unit testing", "pytest", "jwt authentication",
        "oauth", "websockets", "api design", "system design"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving",
        "project management", "mentoring", "time management",
        "stakeholder management", "collaboration", "critical thinking"
    ],
}


def flat_skill_list():
    seen = set()
    flat = []
    for skills in SKILLS_DB.values():
        for s in skills:
            if s not in seen:
                seen.add(s)
                flat.append(s)
    return flat


def category_for_skill(skill: str) -> str:
    skill = skill.lower()
    for cat, skills in SKILLS_DB.items():
        if skill in skills:
            return cat
    return "other"
