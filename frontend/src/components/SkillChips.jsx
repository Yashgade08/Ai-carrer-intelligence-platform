function Chip({ label, tone }) {
  const styles = {
    matched: "bg-lime-400/15 text-lime-300 border border-lime-400/40",
    missing: "bg-transparent text-rose-300 border border-dashed border-rose-400/50",
    extra: "bg-slate-700/40 text-slate-300 border border-slate-600",
  };
  return (
    <span className={`inline-block font-mono text-xs px-2.5 py-1 rounded-full ${styles[tone]}`}>
      {label}
    </span>
  );
}

export default function SkillChips({ skills }) {
  const { matched_skills = [], missing_skills = [], extra_skills = [] } = skills || {};

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
          Matched — {matched_skills.length}
        </h4>
        <div className="flex flex-wrap gap-2">
          {matched_skills.length
            ? matched_skills.map((s) => <Chip key={s} label={s} tone="matched" />)
            : <p className="text-xs text-slate-500">No overlapping skills detected.</p>}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
          Missing — {missing_skills.length}
        </h4>
        <div className="flex flex-wrap gap-2">
          {missing_skills.length
            ? missing_skills.map((s) => <Chip key={s} label={s} tone="missing" />)
            : <p className="text-xs text-slate-500">No gaps found. Nice.</p>}
        </div>
      </div>

      {extra_skills.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
            On your resume, not in this JD — {extra_skills.length}
          </h4>
          <div className="flex flex-wrap gap-2">
            {extra_skills.map((s) => <Chip key={s} label={s} tone="extra" />)}
          </div>
        </div>
      )}
    </div>
  );
}
