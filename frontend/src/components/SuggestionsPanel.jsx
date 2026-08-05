import { useState } from "react";
import { getSuggestions, getCoverLetter } from "../api";

export default function SuggestionsPanel({ resumeText, jobDescription, missingSkills }) {
  const [suggestions, setSuggestions] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [error, setError] = useState("");

  const runSuggestions = async () => {
    setLoadingSuggestions(true);
    setError("");
    try {
      const data = await getSuggestions(resumeText, jobDescription, missingSkills);
      setSuggestions(data.suggestions);
    } catch (e) {
      setError(e?.response?.data?.detail || "Couldn't generate suggestions. Check the API is configured with GROQ_API_KEY.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const runCoverLetter = async () => {
    setLoadingLetter(true);
    setError("");
    try {
      const data = await getCoverLetter(resumeText, jobDescription);
      setCoverLetter(data.cover_letter);
    } catch (e) {
      setError(e?.response?.data?.detail || "Couldn't generate a cover letter. Check the API is configured with GROQ_API_KEY.");
    } finally {
      setLoadingLetter(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runSuggestions}
          disabled={loadingSuggestions}
          className="px-4 py-2 rounded-md bg-lime-400 text-slate-900 font-mono text-sm font-semibold hover:bg-lime-300 transition-colors disabled:opacity-50"
        >
          {loadingSuggestions ? "generating…" : "Get resume suggestions"}
        </button>
        <button
          onClick={runCoverLetter}
          disabled={loadingLetter}
          className="px-4 py-2 rounded-md border border-slate-600 text-slate-200 font-mono text-sm hover:border-lime-400/60 hover:text-lime-300 transition-colors disabled:opacity-50"
        >
          {loadingLetter ? "writing…" : "Draft cover letter"}
        </button>
      </div>

      {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}

      {suggestions && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-5">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-3">
            Improvement suggestions
          </h4>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-slate-200 flex gap-2">
                <span className="text-lime-400 font-mono">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {coverLetter && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-5">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-3">
            Draft cover letter
          </h4>
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">
            {coverLetter}
          </pre>
        </div>
      )}
    </div>
  );
}
