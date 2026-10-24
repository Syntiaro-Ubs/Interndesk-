import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { emptyResumeData } from "../utils/sampleData.js";
import { analyzeResumeATS } from "../utils/atsEngine.js";
import { api } from "../../../../api.js";

const ResumeContext = createContext(undefined);
const clone = (value) => JSON.parse(JSON.stringify(value));
const newDraftId = () => globalThis.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => { const random = Math.random() * 16 | 0; return (char === "x" ? random : (random & 3 | 8)).toString(16); });

function getStorageKey(userInfo) {
  const account = userInfo?._id || userInfo?.id || userInfo?.email || "guest";
  return `interndesk-ats-resume:${String(account).toLowerCase()}`;
}

function makeProfileResume(userInfo) {
  const data = clone(emptyResumeData);
  const fullName = userInfo?.fullName || [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(" ");
  data.personal = {
    ...data.personal,
    fullName,
    email: userInfo?.email || "",
    phone: userInfo?.phone || "",
    location: userInfo?.location || "",
    title: userInfo?.headline || userInfo?.department || "",
  };
  const rawSkills = Array.isArray(userInfo?.skills) ? userInfo.skills : typeof userInfo?.skills === "string" ? userInfo.skills.split(",") : [];
  data.skills.other = rawSkills.map((skill) => typeof skill === "string" ? skill.trim() : skill?.name?.trim()).filter(Boolean);
  const education = Array.isArray(userInfo?.education) ? userInfo.education : [];
  data.education = education.map((item, index) => ({
    id: `profile-edu-${index}`,
    institution: item.institution || item.school || item.university || "",
    degree: item.degree || item.program || "",
    fieldOfStudy: item.fieldOfStudy || item.field || item.specialization || "",
    location: item.location || "",
    startDate: item.startDate || item.start || "",
    endDate: item.endDate || item.end || item.year || "",
    isCurrent: Boolean(item.isCurrent),
    cgpa: item.cgpa || item.grade || "",
    description: "",
  })).filter((item) => item.institution || item.degree);
  return data;
}

function initialResume(userInfo) {
  const profileResume = makeProfileResume(userInfo);
  try {
    const savedId = localStorage.getItem(getStorageKey(userInfo));
    const draftId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(savedId || "") ? savedId : newDraftId();
    return { draftId, resumeData: profileResume, templateId: "classic", resumeTitle: "My Professional Resume" };
  } catch {
    return { draftId: newDraftId(), resumeData: profileResume, templateId: "classic", resumeTitle: "My Professional Resume" };
  }
}

export const ResumeProvider = ({ children, userInfo }) => {
  const [initialDraft] = useState(() => initialResume(userInfo));
  const [draftId] = useState(initialDraft.draftId);
  const [resumeTitle, setResumeTitle] = useState(initialDraft.resumeTitle);
  const [templateId, setTemplateId] = useState(initialDraft.templateId);
  const [resumeData, setResumeData] = useState(initialDraft.resumeData);
  const [saveStatus, setSaveStatus] = useState("loading");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [atsResult, setAtsResult] = useState(() => analyzeResumeATS(initialDraft.resumeData));
  const storageKey = useMemo(() => getStorageKey(userInfo), [userInfo?._id, userInfo?.id, userInfo?.email]);

  useEffect(() => {
    let active = true;
    api.getResumeDraft(draftId).then((record) => {
      if (!active) return;
      setResumeTitle(record.title || "My Professional Resume");
      setTemplateId(record.templateId || "classic");
      setResumeData({ ...makeProfileResume(userInfo), ...(record.resumeData || {}) });
      setLastSavedAt(record.updatedAt ? new Date(record.updatedAt) : null);
      setSaveStatus("saved");
      setHydrated(true);
    }).catch((error) => {
      if (!active) return;
      if (error.status === 404) {
        setSaveStatus("unsaved");
        setHydrated(true);
      } else setSaveStatus("error");
    });
    return () => { active = false; };
  }, [draftId]);

  useEffect(() => setAtsResult(analyzeResumeATS(resumeData)), [resumeData]);
  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      api.saveResumeDraft(draftId, { title: resumeTitle, templateId, resumeData }).then(() => {
        try { localStorage.setItem(storageKey, draftId); } catch {}
        setLastSavedAt(new Date());
        setSaveStatus("saved");
      }).catch(() => setSaveStatus("error"));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [hydrated, storageKey, draftId, resumeTitle, templateId, resumeData]);

  const updatePersonal = (updates) => setResumeData((prev) => ({ ...prev, personal: { ...prev.personal, ...updates } }));
  const updateSummary = (summary) => setResumeData((prev) => ({ ...prev, summary }));
  const setSectionOrder = (sectionOrder) => setResumeData((prev) => ({ ...prev, sectionOrder }));
  const updateListItem = (key, id, updates) => setResumeData((prev) => ({ ...prev, [key]: prev[key].map((item) => item.id === id ? { ...item, ...updates } : item) }));
  const removeListItem = (key, id) => setResumeData((prev) => ({ ...prev, [key]: prev[key].filter((item) => item.id !== id) }));
  const addListItem = (key, item, prefix) => setResumeData((prev) => ({ ...prev, [key]: [...prev[key], { ...item, id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }] }));
  const loadSampleData = () => { setResumeData(makeProfileResume(userInfo)); setResumeTitle("My Professional Resume"); setTemplateId("classic"); };
  const clearResumeData = () => setResumeData(clone(emptyResumeData));
  const loadResume = (record) => { setResumeTitle(record.title || "My Professional Resume"); setTemplateId(record.templateId || "classic"); setResumeData(record.resumeData || clone(emptyResumeData)); };
  const manualSave = useCallback(async () => {
    try {
      await api.saveResumeDraft(draftId, { title: resumeTitle, templateId, resumeData });
      try { localStorage.setItem(storageKey, draftId); } catch {}
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (error) { setSaveStatus("error"); throw error; }
  }, [storageKey, draftId, resumeTitle, templateId, resumeData]);

  const addEducation = (item) => addListItem("education", item, "edu");
  const updateEducation = (id, updates) => updateListItem("education", id, updates);
  const deleteEducation = (id) => removeListItem("education", id);
  const reorderEducation = (from, to) => setResumeData((prev) => { const education = [...prev.education]; const [item] = education.splice(from, 1); education.splice(to, 0, item); return { ...prev, education }; });
  const addExperience = (item) => addListItem("experience", item, "exp");
  const updateExperience = (id, updates) => updateListItem("experience", id, updates);
  const deleteExperience = (id) => removeListItem("experience", id);
  const addProject = (item) => addListItem("projects", item, "proj");
  const updateProject = (id, updates) => updateListItem("projects", id, updates);
  const deleteProject = (id) => removeListItem("projects", id);
  const addSkill = (category, skill) => setResumeData((prev) => { const value = skill.trim(); const list = prev.skills[category] || []; if (!value || list.includes(value)) return prev; return { ...prev, skills: { ...prev.skills, [category]: [...list, value] } }; });
  const removeSkill = (category, skill) => setResumeData((prev) => ({ ...prev, skills: { ...prev.skills, [category]: (prev.skills[category] || []).filter((item) => item !== skill) } }));
  const addCertification = (item) => addListItem("certifications", item, "cert");
  const updateCertification = (id, updates) => updateListItem("certifications", id, updates);
  const deleteCertification = (id) => removeListItem("certifications", id);
  const addAchievement = (item) => addListItem("achievements", item, "ach");
  const updateAchievement = (id, updates) => updateListItem("achievements", id, updates);
  const deleteAchievement = (id) => removeListItem("achievements", id);
  const addLanguage = (language, proficiency) => { const value = language.trim(); if (value) addListItem("languages", { language: value, proficiency }, "lang"); };
  const deleteLanguage = (id) => removeListItem("languages", id);
  const addCustomSection = (title) => { const value = title.trim(); if (value) addListItem("customSections", { title: value, items: [] }, "custom"); };
  const updateCustomSection = (id, updates) => updateListItem("customSections", id, updates);
  const deleteCustomSection = (id) => removeListItem("customSections", id);

  return _jsx(ResumeContext.Provider, { value: {
    resumeId: null, draftId, resumeTitle, setResumeTitle, templateId, setTemplateId, resumeData, saveStatus, lastSavedAt,
    activeSection, setActiveSection, atsResult, isMobilePreviewOpen, setIsMobilePreviewOpen,
    loadResume, loadSampleData, clearResumeData, manualSave, updatePersonal, updateSummary, setSectionOrder,
    addEducation, updateEducation, deleteEducation, reorderEducation, addExperience, updateExperience, deleteExperience,
    addProject, updateProject, deleteProject, addSkill, removeSkill, addCertification, updateCertification,
    deleteCertification, addAchievement, updateAchievement, deleteAchievement, addLanguage, deleteLanguage,
    addCustomSection, updateCustomSection, deleteCustomSection,
  }, children });
};

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) throw new Error("useResume must be used within a ResumeProvider");
  return context;
}
