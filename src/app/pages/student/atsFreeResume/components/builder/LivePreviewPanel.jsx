import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Palette, ZoomIn, ZoomOut } from "lucide-react";
import { useResume } from "../../context/ResumeContext.js";
import { PaginatedResumePreview } from "./PaginatedResumePreview.js";

const templates = [
  { id: "classic", label: "Classic" }, { id: "professional", label: "Professional" },
  { id: "modern", label: "Modern" }, { id: "minimal", label: "Minimal" },
  { id: "student", label: "Student" }, { id: "photo", label: "With Photo" },
  { id: "creative", label: "Creative" }, { id: "compact", label: "Compact" },
  { id: "executive", label: "Executive" }, { id: "tech", label: "Developer" },
];

export const LivePreviewPanel = () => {
  const { resumeData, templateId, setTemplateId } = useResume();
  const [zoom, setZoom] = useState(0.72);
  const viewportRef = useRef(null);

  const fitZoom = () => Math.min(0.95, Math.max(0.35, ((viewportRef.current?.clientWidth || window.innerWidth) - 40) / 794));
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setZoom(fitZoom()));
    observer.observe(viewport);
    setZoom(fitZoom());
    return () => observer.disconnect();
  }, []);

  return <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-slate-100/80">
    <div className="no-print flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto py-0.5">
        <span className="flex shrink-0 items-center text-[11px] font-bold uppercase tracking-wide text-slate-400"><Palette className="mr-1 h-3 w-3" />Style</span>
        {templates.map((template) => <button key={template.id} type="button" onClick={() => setTemplateId(template.id)} className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${templateId === template.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{template.label}</button>)}
      </div>
      <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs text-slate-600">
        <button type="button" onClick={() => setZoom((value) => Math.max(0.35, value - 0.05))} className="rounded p-1 hover:bg-white" title="Zoom out"><ZoomOut className="h-3.5 w-3.5" /></button>
        <span className="min-w-9 px-1.5 text-center text-[11px] font-semibold">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoom((value) => Math.min(1.25, value + 0.05))} className="rounded p-1 hover:bg-white" title="Zoom in"><ZoomIn className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => setZoom(fitZoom())} className="ml-0.5 rounded p-1 hover:bg-white" title="Fit page"><Maximize2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
    <div ref={viewportRef} className="resume-preview-viewport flex flex-1 items-start justify-center overflow-auto p-4 sm:p-6">
      <div className="resume-preview-zoom relative flex justify-center" style={{ zoom }}>
        <PaginatedResumePreview data={resumeData} templateId={templateId} />
      </div>
    </div>
  </section>;
};
