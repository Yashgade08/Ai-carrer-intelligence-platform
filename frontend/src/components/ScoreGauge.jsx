export default function ScoreGauge({ label, value, accent = "#C6F135" }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r={radius}
            stroke="#2A3654" strokeWidth="8" fill="none"
          />
          <circle
            cx="60" cy="60" r={radius}
            stroke={accent} strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-white">{pct.toFixed(0)}</span>
          <span className="font-mono text-[10px] text-slate-400">/ 100</span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">{label}</span>
    </div>
  );
}
