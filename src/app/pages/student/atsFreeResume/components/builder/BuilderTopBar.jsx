import React, { useState } from "react";
import { AlertCircle, Check, ChevronLeft, Edit2, Eye, FileDown, Loader2, Search, Sparkles } from "lucide-react";
import { useResume } from "../../context/ResumeContext.js";

export const BuilderTopBar = ({ onOpenATS, onOpenJD, onBack, onRequestDownload }) => {
  const { resumeTitle, setResumeTitle, saveStatus, atsResult, isMobilePreviewOpen, setIsMobilePreviewOpen } = useResume();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const score = atsResult?.overallScore ?? 0;

  const scoreStyle = score >= 80 ? "border-emerald-300 bg-emerald-50 text-emerald-700" : score >= 60 ? "border-amber-300 bg-amber-50 text-amber-700" : "border-rose-300 bg-rose-50 text-rose-700";
  return <header className="no-print z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5">
    <div className="flex min-w-0 items-center gap-2">
      <button type="button" onClick={onBack} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Back to InternDesk"><ChevronLeft className="h-5 w-5" /></button>
      <div className="h-4 w-px bg-slate-200" />
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          {isEditingTitle ? <input autoFocus value={resumeTitle} onChange={(event) => setResumeTitle(event.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={(event) => event.key === "Enter" && setIsEditingTitle(false)} className="w-40 rounded border border-indigo-500 px-1.5 py-0.5 text-xs font-semibold outline-none sm:w-56" /> : <button type="button" onClick={() => setIsEditingTitle(true)} className="flex min-w-0 items-center gap-1 truncate text-xs font-bold text-slate-900 sm:text-sm">{resumeTitle}<Edit2 className="h-3 w-3 shrink-0 text-slate-400" /></button>}
        </div>
        <p className="truncate text-[10px] text-slate-400">Free ATS resume builder</p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <span className="hidden items-center gap-1 text-[11px] text-slate-500 md:flex" aria-live="polite">
        {saveStatus === "loading" ? <><Loader2 className="h-3 w-3 animate-spin" />Loading</> : saveStatus === "saving" || saveStatus === "unsaved" ? <><Loader2 className="h-3 w-3 animate-spin" />Saving to account</> : saveStatus === "error" ? <><AlertCircle className="h-3 w-3 text-rose-500" />Save unavailable</> : <><Check className="h-3 w-3 text-emerald-600" />Saved to account</>}
      </span>
      <button type="button" onClick={onOpenATS} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold sm:px-2.5 ${scoreStyle}`} title="Open ATS resume analysis"><Sparkles className="h-3 w-3" /><span>ATS {score}%</span></button>
      <button type="button" onClick={onOpenJD} className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex" title="Compare with a job description"><Search className="h-3 w-3" /><span>JD Match</span></button>
      <button type="button" onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 lg:hidden"><Eye className="h-3.5 w-3.5" />{isMobilePreviewOpen ? "Edit" : "Preview"}</button>
      <button type="button" onClick={onRequestDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 sm:px-3.5" title="Pay ₹99 to unlock the resume PDF"><FileDown className="h-3.5 w-3.5" /><span className="sm:hidden">PDF · ₹99</span><span className="hidden sm:inline">Download PDF · ₹99</span></button>
    </div>
  </header>;
};
