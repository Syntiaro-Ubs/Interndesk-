import React, { useCallback, useEffect, useState } from "react";
import { ResumeProvider, useResume } from "./atsFreeResume/context/ResumeContext.js";
import { BuilderSidebar } from "./atsFreeResume/components/builder/BuilderSidebar.js";
import { ActiveSectionContent } from "./atsFreeResume/components/builder/ActiveSectionContent.js";
import { LivePreviewPanel } from "./atsFreeResume/components/builder/LivePreviewPanel.jsx";
import { BuilderTopBar } from "./atsFreeResume/components/builder/BuilderTopBar.jsx";
import { ATSAnalyzerModal } from "./atsFreeResume/components/ats/ATSAnalyzerModal.js";
import { JobDescriptionModal } from "./atsFreeResume/components/ats/JobDescriptionModal.js";
import { ResumePaymentModal } from "./atsFreeResume/components/ats/ResumePaymentModal.jsx";
import "./atsFreeResume/atsFreeResume.css";
import { api } from "../../api.js";
import { toast } from "sonner";

function ResumeWorkspace({ setView, userInfo }) {
  const { atsResult, resumeData, isMobilePreviewOpen, draftId, manualSave } = useResume();
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const markDownloadUnlocked = useCallback(() => {
    setDownloadUnlocked(true);
    document.body.dataset.resumeDownloadUnlocked = "true";
  }, []);
  useEffect(() => {
    document.body.dataset.resumeDownloadUnlocked = downloadUnlocked ? "true" : "false";
  }, [downloadUnlocked]);
  useEffect(() => {
    const handlePrintShortcut = (event) => {
      if (!downloadUnlocked && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsPaymentModalOpen(true);
      }
    };
    window.addEventListener("keydown", handlePrintShortcut);
    return () => window.removeEventListener("keydown", handlePrintShortcut);
  }, [downloadUnlocked]);
  useEffect(() => () => { delete document.body.dataset.resumeDownloadUnlocked; }, []);
  const downloadResume = async () => {
    if (!downloadUnlocked) {
      setIsPaymentModalOpen(true);
      return;
    }
    try {
      await manualSave();
      const authorizedDraft = await api.downloadResumeDraft(draftId);
      if (!authorizedDraft.authorized) throw new Error("Payment is required to download this resume.");
    } catch (error) {
      toast.error(error.message || "The server could not authorize this download.");
      return;
    }
    setIsPaymentModalOpen(false);
    document.body.dataset.resumeDownloadUnlocked = "true";
    window.print();
  };

  return <div className="ats-resume-workspace flex h-[calc(100vh-176px)] min-h-[450px] flex-col overflow-hidden bg-slate-100 font-sans text-slate-900 lg:h-[calc(100vh-112px)]">
    <BuilderTopBar onBack={() => setView("student-home")} onOpenATS={() => setIsATSModalOpen(true)} onOpenJD={() => setIsJDModalOpen(true)} onRequestDownload={() => setIsPaymentModalOpen(true)} />
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="no-print hidden w-60 shrink-0 md:flex lg:w-64"><BuilderSidebar /></div>
      <div className={`min-w-0 flex-1 flex-col overflow-hidden ${isMobilePreviewOpen ? "hidden lg:flex" : "flex"}`}><ActiveSectionContent /></div>
      <div className={`min-w-0 flex-1 overflow-hidden ${isMobilePreviewOpen ? "flex w-full" : "hidden lg:flex lg:w-1/2"}`}><LivePreviewPanel /></div>
    </div>
    <ATSAnalyzerModal isOpen={isATSModalOpen} onClose={() => setIsATSModalOpen(false)} result={atsResult} />
    <JobDescriptionModal isOpen={isJDModalOpen} onClose={() => setIsJDModalOpen(false)} resumeData={resumeData} />
    <ResumePaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} draftId={draftId} userInfo={userInfo} onDownload={downloadResume} onUnlocked={markDownloadUnlocked} />
  </div>;
}

export function ResumeBuilder({ setView, userInfo }) {
  return <ResumeProvider userInfo={userInfo}><ResumeWorkspace setView={setView} userInfo={userInfo} /></ResumeProvider>;
}
