import { useState, useRef } from "react";

export default function UploadZone({ onFileSelected, filename, isParsing, error }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (files && files[0]) onFileSelected(files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
        ${dragActive ? "border-lime-400 bg-lime-400/5" : "border-slate-600 hover:border-slate-500"}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {isParsing ? (
        <div className="flex flex-col items-center gap-2">
          <div className="scan-sweep-mini" />
          <p className="font-mono text-sm text-lime-400">reading document…</p>
        </div>
      ) : filename ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">📄</span>
          <p className="font-mono text-sm text-white">{filename}</p>
          <p className="text-xs text-slate-400">click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl opacity-70">⇪</span>
          <p className="text-sm text-slate-300">Drop your resume here, or click to browse</p>
          <p className="text-xs font-mono text-slate-500">.pdf or .docx</p>
        </div>
      )}
      {error && <p className="mt-3 text-xs text-rose-400 font-mono">{error}</p>}
    </div>
  );
}
