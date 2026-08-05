export default function KeywordStrip({ keywords }) {
  if (!keywords || keywords.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
        Top JD keywords (TF-IDF)
      </h4>
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <span
            key={k}
            className="font-mono text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
