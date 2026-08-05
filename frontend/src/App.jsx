import { useState } from "react";
import UploadZone from "./components/UploadZone";
import ScoreGauge from "./components/ScoreGauge";
import SkillChips from "./components/SkillChips";
import KeywordStrip from "./components/KeywordStrip";
import SuggestionsPanel from "./components/SuggestionsPanel";
import { parseResumeFile, analyzeResume } from "./api";

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [filename, setFilename] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleFile = async (file) => {
    setIsParsing(true);
    setParseError("");
    try {
      const data = await parseResumeFile(file);
      setResumeText(data.text);
      setFilename(data.filename);
    } catch (e) {
      setParseError(e?.response?.data?.detail || "Failed to read this file.");
    } finally {
      setIsParsing(false);
    }
  };

  const runAnalysis = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError("");
    setScanning(true);
    try {
      const data = await analyzeResume(resumeText, jobDescription);
      setResult(data);
    } catch (e) {
      setAnalyzeError(e?.response?.data?.detail || "Analysis failed. Is the API running?");
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setScanning(false), 900);
    }
  };

  const canAnalyze = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_2px_rgba(198,241,53,0.5)]" />
            <span className="font-mono text-sm tracking-wide text-slate-300">
              career-intel<span className="text-lime-400">.scan</span>
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Sentence-BERT · spaCy · Llama 3</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime-400 mb-3">
          resume ⇄ job description, matched
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight max-w-2xl">
          See your resume the way an ATS scanner does.
        </h1>
        <p className="mt-4 text-slate-400 max-w-xl leading-relaxed">
          Drop in a resume and a job description. Get a semantic relevance score,
          a skill-gap breakdown, and AI-written fixes — before a recruiter's
          filter ever sees it.
        </p>
      </section>

      {/* Input grid */}
      <section className="max-w-6xl mx-auto px-6 pb-12 grid md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
            01 — Resume
          </label>
          <UploadZone
            onFileSelected={handleFile}
            filename={filename}
            isParsing={isParsing}
            error={parseError}
          />
          <details className="mt-3 group">
            <summary className="text-xs font-mono text-slate-500 cursor-pointer hover:text-slate-300">
              or paste resume text instead
            </summary>
            <textarea
              value={resumeText}
              onChange={(e) => { setResumeText(e.target.value); setFilename(""); }}
              rows={6}
              placeholder="Paste resume text…"
              className="mt-2 w-full rounded-md bg-slate-900/60 border border-slate-700 p-3 text-sm text-slate-200 focus:outline-none focus:border-lime-400/60 resize-none"
            />
          </details>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
            02 — Job description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste the job description here…"
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 p-4 text-sm text-slate-200 focus:outline-none focus:border-lime-400/60 resize-none h-full"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <button
          onClick={runAnalysis}
          disabled={!canAnalyze || isAnalyzing}
          className="relative overflow-hidden w-full md:w-auto px-8 py-3 rounded-md bg-lime-400 text-slate-900 font-mono text-sm font-semibold tracking-wide hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? "scanning…" : "Run analysis →"}
        </button>
        {analyzeError && <p className="mt-3 text-xs text-rose-400 font-mono">{analyzeError}</p>}
      </section>

      {/* Results */}
      {result && (
        <section className={`max-w-6xl mx-auto px-6 pb-24 ${scanning ? "scan-reveal" : ""}`}>
          <div className="border-t border-slate-800 pt-10 mb-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-6">
              Results
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 mb-4">
              <ScoreGauge label="ATS Score" value={result.ats_score} accent="#C6F135" />
              <ScoreGauge label="Semantic Match" value={result.semantic_similarity} accent="#5EEAD4" />
              <ScoreGauge label="Keyword Match" value={result.keyword_match_score} accent="#FBBF24" />
            </div>
            <p className="text-sm text-slate-300 font-mono mt-4">{result.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-14">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <SkillChips skills={result.skills} />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <KeywordStrip keywords={result.top_jd_keywords} />
            </div>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">
              AI-powered next steps
            </h2>
            <SuggestionsPanel
              resumeText={resumeText}
              jobDescription={jobDescription}
              missingSkills={result.skills.missing_skills}
            />
          </div>
        </section>
      )}

      <footer className="border-t border-slate-800/80 py-6">
        <p className="max-w-6xl mx-auto px-6 text-xs font-mono text-slate-600">
          AI Career Intelligence Platform — React · FastAPI · Sentence-BERT · spaCy · Llama 3
        </p>
      </footer>
    </div>
  );
}
