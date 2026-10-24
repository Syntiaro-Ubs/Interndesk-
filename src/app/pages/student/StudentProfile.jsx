import React, { useEffect, useState, useRef } from "react";
import { MapPin, Briefcase, TrendingUp, User, Share2, Upload, FileText, Plus, Edit, Eye, Award, Download, Linkedin, Phone, X, Camera, Check } from "lucide-react";
import { Mail, Globe } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
const DEFAULT_COVER = "";
function StudentProfile({ setView, userInfo }) {
  const resolvedName = userInfo && (userInfo.firstName || userInfo.lastName) ? `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() : "";
  const resolvedEmail = userInfo?.email || "";
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [frontendBaseUrl, setFrontendBaseUrl] = useState("");
  const [visibility, setVisibility] = useState("private");
  const publicProfileUrl = visibility === "public" && frontendBaseUrl && userInfo?.id
    ? `${frontendBaseUrl}/?profile=${encodeURIComponent(userInfo.id)}`
    : "";
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [modal, setModal] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER);
  const [resumeName, setResumeName] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [profile, setProfile] = useState({
    name: resolvedName,
    headline: "",
    location: "",
    email: resolvedEmail,
    phone: "",
    linkedin: "",
    portfolio: "",
    publicUrl: publicProfileUrl,
    bio: "",
    tags: ""
  });
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [tools, setTools] = useState("");
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [draft, setDraft] = useState({});
  const [editIdx, setEditIdx] = useState(null);
  useEffect(() => {
    let active = true;
    api.config().then((config) => {
      if (active) setFrontendBaseUrl(String(config.frontendBaseUrl || "").replace(/\/$/, ""));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    api.studentProfile().then((saved) => {
      if (!active) return;
      const details = saved.profileData || {};
      setVisibility(saved.visibility || "private");
      const savedEducation = details.education || (saved.college ? [{ inst: saved.college, degree: saved.degree || "", spec: "", year: saved.graduationYear || "", score: saved.cgpa ?? "", logo: saved.college.slice(0, 3).toUpperCase() }] : []);
      const savedSkills = details.skillLevels || (saved.skills || []).map((name) => ({ name, level: 0 }));
      setProfileData(details);
      setProfile((current) => ({ ...current, name: saved.fullName || current.name, headline: details.headline || "", location: saved.location || "", phone: saved.phone || "", linkedin: details.linkedin || "", portfolio: details.portfolio || "", bio: saved.bio || "", tags: (saved.skills || []).join(", ") }));
      setEducation(savedEducation);
      setSkills(savedSkills);
      setTools(details.tools || "");
      setProjects(details.projects || []);
      setCerts(details.certifications || []);
      setAvatarUrl(details.avatar || null);
      setCoverUrl(details.cover || DEFAULT_COVER);
      setResumeName(details.resumeName || (saved.resumeKey ? saved.resumeKey.split("/").pop() : ""));
      setResumeDate(details.resumeUpdatedAt ? new Date(details.resumeUpdatedAt).toLocaleDateString() : "");
    }).catch((error) => { if (active) toast.error(error.message || "Could not load your profile."); });
    return () => { active = false; };
  }, [userInfo?.id]);
  const openModal = (section, idx) => {
    setEditIdx(idx ?? null);
    if (section === "basic") setDraft({ ...profile });
    else if (section === "about") setDraft({ bio: profile.bio, tags: profile.tags });
    else if (section === "education") setDraft(idx != null ? { ...education[idx] } : { degree: "", inst: "", spec: "", year: "", score: "", logo: "" });
    else if (section === "skills") setDraft({ skills: skills.map((s) => ({ ...s })), tools });
    else if (section === "project") setDraft(idx != null ? { ...projects[idx] } : { title: "", desc: "", tech: "", date: "" });
    else if (section === "cert") setDraft(idx != null ? { ...certs[idx] } : { title: "", issuer: "", date: "" });
    setModal(section);
  };
  const saveModal = async () => {
    let nextProfile = profile;
    let nextEducation = education;
    let nextSkills = skills;
    let nextProjects = projects;
    let nextCerts = certs;
    let nextTools = tools;
    if (modal === "basic") nextProfile = { ...profile, ...draft };
    else if (modal === "about") nextProfile = { ...profile, bio: draft.bio, tags: draft.tags };
    else if (modal === "education") nextEducation = editIdx != null ? education.map((item, index) => index === editIdx ? draft : item) : [...education, draft];
    else if (modal === "skills") { nextSkills = draft.skills; nextTools = draft.tools; }
    else if (modal === "project") nextProjects = editIdx != null ? projects.map((item, index) => index === editIdx ? draft : item) : [...projects, draft];
    else if (modal === "cert") nextCerts = editIdx != null ? certs.map((item, index) => index === editIdx ? draft : item) : [...certs, draft];
    const primaryEducation = nextEducation[0] || {};
    const profileDataNext = { ...profileData, headline: nextProfile.headline, linkedin: nextProfile.linkedin, portfolio: nextProfile.portfolio, education: nextEducation, skillLevels: nextSkills, tools: nextTools, projects: nextProjects, certifications: nextCerts };
    setSavingProfile(true);
    try {
      await api.updateStudentProfile({
        fullName: nextProfile.name, phone: nextProfile.phone, location: nextProfile.location, bio: nextProfile.bio,
        college: primaryEducation.inst || "", degree: primaryEducation.degree || "",
        graduationYear: primaryEducation.year ? Number(String(primaryEducation.year).slice(-4)) : undefined,
        cgpa: primaryEducation.score ? Number(primaryEducation.score) : undefined,
        skills: nextProfile.tags.split(",").map((value) => value.trim()).filter(Boolean), profileData: profileDataNext,
      });
      setProfile(nextProfile);
      setEducation(nextEducation);
      setSkills(nextSkills);
      setTools(nextTools);
      setProjects(nextProjects);
      setCerts(nextCerts);
      setProfileData(profileDataNext);
      setModal(null);
    } catch (error) { toast.error(error.message || "Could not save your profile."); }
    finally { setSavingProfile(false); }
  };
  const persistProfileData = async (key, value) => {
    const next = { ...profileData, [key]: value };
    try {
      await api.updateStudentProfile({ profileData: next });
      setProfileData(next);
      if (key === "avatar") setAvatarUrl(value);
      if (key === "cover") setCoverUrl(value);
    } catch (error) { toast.error(error.message || "Could not save this profile change."); }
  };
  const readDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsDataURL(file);
  });
  const handleImage = async (event, key) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) { toast.error("Choose an image smaller than 1.5 MB."); return; }
    try { await persistProfileData(key, await readDataUrl(file)); }
    catch (error) { toast.error(error.message || "Could not save this image."); }
  };
  const handleAvatar = (event) => handleImage(event, "avatar");
  const handleCover = (event) => handleImage(event, "cover");
  const handleResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readDataUrl(file);
      const mimeType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
      const uploaded = await api.uploadResume({ fileName: file.name, mimeType, dataBase64: String(dataUrl).split(",")[1] });
      const nextProfileData = { ...profileData, resumeKey: uploaded.resumeKey, resumeName: uploaded.fileName, resumeUpdatedAt: uploaded.uploadedAt };
      await api.updateStudentProfile({ resumeKey: uploaded.resumeKey, profileData: nextProfileData });
      setProfileData(nextProfileData);
      setResumeName(uploaded.fileName);
      setResumeDate(new Date(uploaded.uploadedAt).toLocaleDateString());
    } catch (error) { toast.error(error.message || "Could not upload your resume."); }
  };
  const tagArray = profile.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const toolArray = tools.split(",").map((t) => t.trim()).filter(Boolean);
  const completionItems = [
    ["Basic Info", Boolean(profile.name && profile.email && profile.headline)],
    ["Education", education.length > 0],
    ["Skills", skills.length > 0],
    ["Resume", resumeName !== ""],
    ["Projects", projects.length > 0]
  ];
  const completionPct = Math.round(completionItems.filter(([, done]) => done).length / completionItems.length * 100);
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background" }, /* @__PURE__ */ React.createElement("input", { ref: avatarInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleAvatar }), /* @__PURE__ */ React.createElement("input", { ref: coverInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleCover }), /* @__PURE__ */ React.createElement("input", { ref: resumeInputRef, type: "file", accept: ".pdf,.doc,.docx", className: "hidden", onChange: handleResume }), /* @__PURE__ */ React.createElement("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 py-4 lg:py-5" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "h-32 sm:h-44 relative group bg-gradient-to-r from-slate-200 to-slate-100" }, coverUrl && /* @__PURE__ */ React.createElement("img", { src: coverUrl, alt: "Cover", className: "w-full h-full object-cover" }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => coverInputRef.current?.click(),
      className: "absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm" }, /* @__PURE__ */ React.createElement(Camera, { className: "w-4 h-4" }), " Change Cover Photo")
  )), /* @__PURE__ */ React.createElement("div", { className: "px-4 sm:px-6 pb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-end justify-between -mt-6 sm:-mt-18 mb-4 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "relative group w-24 h-24 sm:w-36 sm:h-36 flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-full rounded-full flex items-center justify-center cursor-pointer", onClick: () => avatarInputRef.current?.click() }, /* @__PURE__ */ React.createElement("svg", { className: "absolute inset-0 w-full h-full p-0.5 pointer-events-none", viewBox: "0 0 100 100" }, /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: "50",
      cy: "50",
      r: "45",
      stroke: "#e0dfdc",
      strokeWidth: "5",
      fill: "none"
    }
  ), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: "50",
      cy: "50",
      r: "45",
      stroke: completionPct === 100 ? "#10b981" : "#0a66c2",
      strokeWidth: "5",
      fill: "none",
      strokeDasharray: "282.74",
      strokeDashoffset: 282.74 - completionPct / 100 * 282.74,
      strokeLinecap: "round",
      transform: "rotate(-90 50 50)",
      className: "transition-all duration-700 ease-out"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "w-[calc(100%-10px)] h-[calc(100%-10px)] rounded-full border-2 border-white shadow-md overflow-hidden bg-primary flex items-center justify-center" }, avatarUrl ? /* @__PURE__ */ React.createElement("img", { src: avatarUrl, alt: "Avatar", className: "w-full h-full object-cover" }) : /* @__PURE__ */ React.createElement(User, { className: "w-8 h-8 sm:w-12 sm:h-12 text-white" })), /* @__PURE__ */ React.createElement("div", { className: `absolute -top-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs border border-white ${completionPct === 100 ? "bg-emerald-500" : "bg-[#0a66c2]"}` }, completionPct, "%")), /* @__PURE__ */ React.createElement("button", { onClick: () => avatarInputRef.current?.click(), className: "absolute -bottom-1.5 -right-1.5 bg-primary text-white rounded-full p-1.5 shadow border-2 border-white hover:bg-primary/90 transition-colors" }, /* @__PURE__ */ React.createElement(Camera, { className: "w-3 h-3" }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 pb-1" }, /* @__PURE__ */ React.createElement("button", { onClick: () => resumeInputRef.current?.click(), className: "flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors" }, /* @__PURE__ */ React.createElement(Upload, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Upload Resume"), /* @__PURE__ */ React.createElement("span", { className: "sm:hidden" }, "Resume")), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("basic"), className: "flex items-center gap-1.5 px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:border-primary hover:text-primary transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Edit Profile"), /* @__PURE__ */ React.createElement("span", { className: "sm:hidden" }, "Edit")))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl sm:text-3xl font-medium text-foreground leading-tight" }, profile.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm sm:text-base text-muted-foreground mt-1" }, profile.headline)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-x-4 gap-y-1.5 flex-wrap mb-5" }, profile.location && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-3.5 h-3.5 flex-shrink-0" }), profile.location), profile.email && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground" }, /* @__PURE__ */ React.createElement(Mail, { className: "w-3.5 h-3.5 flex-shrink-0" }), profile.email), profile.phone && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground" }, /* @__PURE__ */ React.createElement(Phone, { className: "w-3.5 h-3.5 flex-shrink-0" }), profile.phone), profile.linkedin && /* @__PURE__ */ React.createElement("a", { href: "#", className: "flex items-center gap-1.5 text-sm text-primary hover:underline" }, /* @__PURE__ */ React.createElement(Linkedin, { className: "w-3.5 h-3.5 flex-shrink-0" }), profile.linkedin), profile.portfolio && /* @__PURE__ */ React.createElement("a", { href: "#", className: "flex items-center gap-1.5 text-sm text-primary hover:underline" }, /* @__PURE__ */ React.createElement(Globe, { className: "w-3.5 h-3.5 flex-shrink-0" }), profile.portfolio)), null)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col lg:flex-row gap-5 lg:gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 w-full min-w-0 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base text-foreground" }, "About"), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("about"), className: "p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground leading-relaxed mb-3" }, profile.bio), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, tagArray.map((tag) => /* @__PURE__ */ React.createElement("span", { key: tag, className: "px-3 py-1 bg-primary/10 text-primary rounded-full text-xs" }, tag)))), (education.length === 0 || skills.length === 0 || projects.length === 0 || certs.length === 0) && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5 flex flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "w-full text-sm font-medium text-foreground mb-1" }, "Add to your profile"), education.length === 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("education"), className: "px-4 py-1.5 border border-primary text-primary rounded-full text-xs font-semibold hover:bg-primary/5 transition-colors" }, "+ Add Education"), skills.length === 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("skills"), className: "px-4 py-1.5 border border-primary text-primary rounded-full text-xs font-semibold hover:bg-primary/5 transition-colors" }, "+ Add Skills"), projects.length === 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("project"), className: "px-4 py-1.5 border border-primary text-primary rounded-full text-xs font-semibold hover:bg-primary/5 transition-colors" }, "+ Add Projects"), certs.length === 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("cert"), className: "px-4 py-1.5 border border-primary text-primary rounded-full text-xs font-semibold hover:bg-primary/5 transition-colors" }, "+ Add Certifications")), education.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base text-foreground" }, "Education"), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("education"), className: "flex items-center gap-1 text-sm text-primary hover:bg-background px-2 py-1 rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }), "Add")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, education.map((edu, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: `flex items-start gap-3 sm:gap-4 ${idx !== 0 ? "pt-4 border-t border-border" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0" }, edu.logo || edu.inst.slice(0, 2).toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm text-foreground" }, edu.inst), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, edu.degree)), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("education", idx), className: "p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, edu.year), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, edu.spec), edu.score && /* @__PURE__ */ React.createElement("span", { className: "inline-block mt-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs" }, "CGPA: ", edu.score, "/10")))))), skills.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base text-foreground" }, "Skills"), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("skills"), className: "flex items-center gap-1 text-sm text-primary hover:bg-background px-2 py-1 rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }), "Edit")), /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm text-foreground mb-3" }, "Core Competencies"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 max-w-xl" }, skills.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-xs mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-foreground" }, s.name), /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, s.level, "%")), /* @__PURE__ */ React.createElement("div", { className: "h-1.5 bg-background rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "h-full bg-primary rounded-full", style: { width: `${s.level}%` } })))))), toolArray.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm text-foreground mb-2" }, "Tools & Software"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, toolArray.map((t) => /* @__PURE__ */ React.createElement("span", { key: t, className: "px-3 py-1 bg-background border border-border rounded-lg text-xs text-foreground" }, t)))))), projects.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base text-foreground" }, "Projects"), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("project"), className: "flex items-center gap-1 text-sm text-primary hover:bg-background px-2 py-1 rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }), "Add")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, projects.map((p, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: `${idx !== 0 ? "pt-4 border-t border-border" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between mb-1" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm text-foreground" }, p.title), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("project", idx), className: "p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mb-2" }, p.date), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground leading-relaxed mb-2" }, p.desc), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5" }, p.tech.split(",").map((t) => t.trim()).filter(Boolean).map((t) => /* @__PURE__ */ React.createElement("span", { key: t, className: "px-2 py-1 bg-background rounded text-xs text-muted-foreground" }, t))))))), certs.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base text-foreground" }, "Certifications"), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("cert"), className: "flex items-center gap-1 text-sm text-primary hover:bg-background px-2 py-1 rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }), "Add")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, certs.map((cert, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex items-start gap-3 p-3 bg-background rounded-xl border border-border" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 bg-card rounded-lg flex items-center justify-center flex-shrink-0 border border-border" }, /* @__PURE__ */ React.createElement(Award, { className: "w-4 h-4 text-primary" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xs text-foreground leading-tight mb-0.5" }, cert.title), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground" }, cert.issuer), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, "Issued ", cert.date)), /* @__PURE__ */ React.createElement("button", { onClick: () => openModal("cert", idx), className: "p-1 text-muted-foreground hover:text-primary transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-3.5 h-3.5" }))))))), /* @__PURE__ */ React.createElement("div", { className: "w-full lg:w-72 flex-shrink-0 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-semibold text-foreground flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Globe, { className: "w-4 h-4 text-primary" }), "Public Profile & URL"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => openModal("basic"),
      className: "p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(Edit, { className: "w-3.5 h-3.5" })
  )), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-background rounded-xl border border-border space-y-1.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground font-medium" }, "Your personal URL:"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-primary truncate" }, publicProfileUrl)), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (!publicProfileUrl) return;
        try {
          if (publicProfileUrl) navigator.clipboard.writeText(publicProfileUrl).catch(() => {
          });
        } catch {
        }
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      },
      disabled: !publicProfileUrl,
      className: `w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${copiedUrl ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary hover:bg-primary/20"}`
    },
    copiedUrl ? /* @__PURE__ */ React.createElement(Check, { className: "w-3.5 h-3.5 text-emerald-600" }) : /* @__PURE__ */ React.createElement(Share2, { className: "w-3.5 h-3.5" }),
    copiedUrl ? "Copied to Clipboard!" : "Copy Public Profile Link"
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm text-foreground" }, "Resume"), /* @__PURE__ */ React.createElement("button", { onClick: () => resumeInputRef.current?.click(), className: "p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))), resumeName ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-background rounded-xl border border-border mb-3 flex items-start gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card p-2 rounded-lg border border-border" }, /* @__PURE__ */ React.createElement(FileText, { className: "w-5 h-5 text-primary" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-foreground truncate" }, resumeName), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground mt-0.5" }, resumeDate))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try { const file = await api.downloadResume(); const url = URL.createObjectURL(file); window.open(url, "_blank"); }
        catch (error) { toast.error(error.message || "Could not open your resume."); }
      },
      className: "flex-1 py-2 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(Eye, { className: "w-4 h-4" }),
    "View"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
        const file = await api.downloadResume();
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        element.download = resumeName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        } catch (error) { toast.error(error.message || "Could not download your resume."); }
      },
      className: "w-10 py-2 border border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(Download, { className: "w-4 h-4" })
  ))) : /* @__PURE__ */ React.createElement("button", { onClick: () => resumeInputRef.current?.click(), className: "w-full py-4 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Upload, { className: "w-5 h-5" }), "Upload Resume")), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm text-foreground mb-3" }, "Activity & Analytics"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, [].map(([label, val, desc, Icon, color]) => /* @__PURE__ */ React.createElement("div", { key: label, className: "flex items-center justify-between p-3 bg-background rounded-xl border border-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-card rounded-lg border border-border" }, /* @__PURE__ */ React.createElement(Icon, { className: `w-4 h-4 ${color}` })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-foreground" }, label), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, desc))), /* @__PURE__ */ React.createElement("span", { className: "text-base text-foreground" }, val)))))))), modal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base text-foreground" }, modal === "basic" && "Edit Profile", modal === "about" && "Edit About", modal === "education" && (editIdx != null ? "Edit Education" : "Add Education"), modal === "skills" && "Edit Skills", modal === "project" && (editIdx != null ? "Edit Project" : "Add Project"), modal === "cert" && (editIdx != null ? "Edit Certification" : "Add Certification")), /* @__PURE__ */ React.createElement("button", { onClick: () => setModal(null), className: "p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" }))), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto flex-1 px-6 py-5 space-y-4", style: { scrollbarWidth: "none" } }, modal === "basic" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { label: "Full Name", value: draft.name, onChange: (v) => setDraft((d) => ({ ...d, name: v })) }), /* @__PURE__ */ React.createElement(Field, { label: "Headline", value: draft.headline, onChange: (v) => setDraft((d) => ({ ...d, headline: v })), placeholder: "MBA \xB7 University \xB7 Class of 20XX" }), /* @__PURE__ */ React.createElement(Field, { label: "Location", value: draft.location, onChange: (v) => setDraft((d) => ({ ...d, location: v })), placeholder: "City, Country" }), /* @__PURE__ */ null, /* @__PURE__ */ React.createElement(Field, { label: "Phone", value: draft.phone, onChange: (v) => setDraft((d) => ({ ...d, phone: v })), placeholder: "+91 XXXXX XXXXX" }), /* @__PURE__ */ React.createElement(Field, { label: "LinkedIn URL", value: draft.linkedin, onChange: (v) => setDraft((d) => ({ ...d, linkedin: v })), placeholder: "linkedin.com/in/username" }), /* @__PURE__ */ React.createElement(Field, { label: "Portfolio URL", value: draft.portfolio, onChange: (v) => setDraft((d) => ({ ...d, portfolio: v })), placeholder: "yourwebsite.com" })), modal === "about" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs text-muted-foreground mb-1.5" }, "Bio"), /* @__PURE__ */ React.createElement("textarea", { rows: 5, value: draft.bio, onChange: (e) => setDraft((d) => ({ ...d, bio: e.target.value })), className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none" })), /* @__PURE__ */ React.createElement(Field, { label: "Skills / Tags (comma separated)", value: draft.tags, onChange: (v) => setDraft((d) => ({ ...d, tags: v })), placeholder: "Brand Strategy, Marketing, Analytics" })), modal === "education" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { label: "Institution Name", value: draft.inst, onChange: (v) => setDraft((d) => ({ ...d, inst: v })), placeholder: "e.g. IIM Ahmedabad" }), /* @__PURE__ */ React.createElement(Field, { label: "Degree / Program", value: draft.degree, onChange: (v) => setDraft((d) => ({ ...d, degree: v })), placeholder: "e.g. MBA, B.Tech" }), /* @__PURE__ */ React.createElement(Field, { label: "Specialization / Field of Study", value: draft.spec, onChange: (v) => setDraft((d) => ({ ...d, spec: v })), placeholder: "e.g. Marketing & Strategy" }), /* @__PURE__ */ React.createElement(Field, { label: "Year", value: draft.year, onChange: (v) => setDraft((d) => ({ ...d, year: v })), placeholder: "2024 \u2013 2026" }), /* @__PURE__ */ React.createElement(Field, { label: "CGPA / Score", value: draft.score, onChange: (v) => setDraft((d) => ({ ...d, score: v })), placeholder: "e.g. 8.7" }), /* @__PURE__ */ React.createElement(Field, { label: "Logo Initials", value: draft.logo, onChange: (v) => setDraft((d) => ({ ...d, logo: v })), placeholder: "e.g. IIM, DU" })), modal === "skills" && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-muted-foreground" }, "Core Competencies"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setDraft((d) => ({ ...d, skills: [...d.skills, { name: "", level: 70 }] })), className: "text-xs text-primary flex items-center gap-1 hover:underline" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-3.5 h-3.5" }), "Add Skill")), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, draft.skills.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("input", { value: s.name, onChange: (e) => setDraft((d) => {
    const skills2 = [...d.skills];
    skills2[i] = { ...skills2[i], name: e.target.value };
    return { ...d, skills: skills2 };
  }), placeholder: "Skill name", className: "flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors" }), /* @__PURE__ */ React.createElement("input", { type: "range", min: 10, max: 100, value: s.level, onChange: (e) => setDraft((d) => {
    const skills2 = [...d.skills];
    skills2[i] = { ...skills2[i], level: Number(e.target.value) };
    return { ...d, skills: skills2 };
  }), className: "w-24 accent-primary" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted-foreground w-8 text-right" }, s.level, "%"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setDraft((d) => ({ ...d, skills: d.skills.filter((_, j) => j !== i) })), className: "text-muted-foreground hover:text-red-500 transition-colors" }, /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })))))), /* @__PURE__ */ React.createElement(Field, { label: "Tools & Software (comma separated)", value: draft.tools, onChange: (v) => setDraft((d) => ({ ...d, tools: v })), placeholder: "Excel, Tableau, Python..." })), modal === "project" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { label: "Project Title", value: draft.title, onChange: (v) => setDraft((d) => ({ ...d, title: v })) }), /* @__PURE__ */ React.createElement(Field, { label: "Duration", value: draft.date, onChange: (v) => setDraft((d) => ({ ...d, date: v })), placeholder: "Jan 2025 \u2013 Mar 2025" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs text-muted-foreground mb-1.5" }, "Description"), /* @__PURE__ */ React.createElement("textarea", { rows: 4, value: draft.desc, onChange: (e) => setDraft((d) => ({ ...d, desc: e.target.value })), className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none" })), /* @__PURE__ */ React.createElement(Field, { label: "Technologies (comma separated)", value: draft.tech, onChange: (v) => setDraft((d) => ({ ...d, tech: v })), placeholder: "React, Python, SQL..." })), modal === "cert" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { label: "Certification Title", value: draft.title, onChange: (v) => setDraft((d) => ({ ...d, title: v })) }), /* @__PURE__ */ React.createElement(Field, { label: "Issuing Organization", value: draft.issuer, onChange: (v) => setDraft((d) => ({ ...d, issuer: v })), placeholder: "e.g. Google, Microsoft" }), /* @__PURE__ */ React.createElement(Field, { label: "Issue Date", value: draft.date, onChange: (v) => setDraft((d) => ({ ...d, date: v })), placeholder: "e.g. Mar 2025" }), /* @__PURE__ */ React.createElement("div", { className: "pt-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-foreground mb-1.5" }, "Upload Certificate (PDF/Image)"), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col items-center justify-center gap-2 h-20 px-4 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl cursor-pointer transition-colors group" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform" }, /* @__PURE__ */ React.createElement(Upload, { className: "w-4 h-4" })), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-foreground" }, "Click to upload"), /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".pdf,.png,.jpg,.jpeg", className: "hidden", onChange: (e) => {
    if (e.target.files?.[0]) alert("File selected: " + e.target.files[0].name);
  } }))))), /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 border-t border-border flex gap-3 flex-shrink-0" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setModal(null), className: "flex-1 py-2.5 border border-border rounded-xl text-sm text-foreground hover:border-primary hover:text-primary transition-colors" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: saveModal, className: "flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" }), "Save")))));
}
function Field({ label, value, onChange, placeholder, type = "text" }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs text-muted-foreground mb-1.5" }, label), /* @__PURE__ */ React.createElement("input", { type, value: value || "", onChange: (e) => onChange(e.target.value), placeholder, className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" }));
}
export {
  StudentProfile
};

