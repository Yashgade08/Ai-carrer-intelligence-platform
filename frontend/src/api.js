import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({ baseURL: API_URL, timeout: 45000 });

export async function parseResumeFile(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/api/parse-resume", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { filename, text, char_count }
}

export async function analyzeResume(resumeText, jobDescription) {
  const { data } = await client.post("/api/analyze", {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return data;
}

export async function getSuggestions(resumeText, jobDescription, missingSkills) {
  const { data } = await client.post("/api/suggest", {
    resume_text: resumeText,
    job_description: jobDescription,
    missing_skills: missingSkills,
  });
  return data;
}

export async function getCoverLetter(resumeText, jobDescription, tone = "professional") {
  const { data } = await client.post("/api/cover-letter", {
    resume_text: resumeText,
    job_description: jobDescription,
    tone,
  });
  return data;
}

export default client;
