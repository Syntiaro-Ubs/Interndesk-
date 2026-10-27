import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, MapPin, Briefcase, Building2, Users, Star, Clock, ChevronDown, Bell, User, ArrowRight, Share2, CheckCircle, Calendar, BarChart3, FileText, MessageSquare, Settings, ChevronRight, DollarSign, Award, Shield, Monitor, Plus, Edit, Eye, Target, Zap, Check, Mail, Globe, Download, LayoutDashboard, Phone, X, Camera, MoreVertical, Sparkles, ExternalLink, LogOut, Trash2 } from "lucide-react";
import { ModeBadge, CategoryBadge, StatusBadge, LogoMark } from "../../components/ui/Badges";
import { ImageCropModal } from "../../components/ImageCropModal";
import { api } from "../../api";
import { toast } from "sonner";
function ManageInternships({
  companyJobs,
  setCompanyJobs,
  setSection,
  setSelectedInternship,
  onEditInternship
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const filtered = companyJobs.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const updateJobStatus = async (job, newStatus) => {
    try {
      if (newStatus === "Closed") {
        await api.closeInternship(job.id);
      } else {
        await api.updateInternship(job.id, { status: newStatus });
      }
      setCompanyJobs((prev) => prev.map((row) => row.id === job.id ? { ...row, status: newStatus } : row));
      window.dispatchEvent(new CustomEvent("interndesk:sync"));
      toast.success(`Internship status updated to "${newStatus}". All applied students have been notified!`);
    } catch (error) {
      toast.error(error.message || "Could not update internship status.");
    }
  };
  const closeJob = async (job) => {
    updateJobStatus(job, "Closed");
  };
  const deleteJob = async (job) => {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) return;
    try {
      await api.deleteInternship(job.id);
      setCompanyJobs((prev) => prev.filter((row) => row.id !== job.id));
      window.dispatchEvent(new CustomEvent("interndesk:sync"));
      toast.success(`Internship "${job.title}" was deleted.`);
    } catch (error) {
      toast.error(error.message || "Could not delete internship.");
    }
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-5" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Internships"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSection("post"),
      className: "flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " Create New Internship"
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-1 px-3 py-2.5 bg-card border border-border rounded-xl" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      className: "appearance-none flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl text-sm text-foreground outline-none cursor-pointer pr-8"
    },
    /* @__PURE__ */ React.createElement("option", { value: "All" }, "Job Post Status"),
    /* @__PURE__ */ React.createElement("option", { value: "Active" }, "Active"),
    /* @__PURE__ */ React.createElement("option", { value: "Review" }, "Review"),
    /* @__PURE__ */ React.createElement("option", { value: "Closed" }, "Closed")
  ), /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" }))), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border bg-background rounded-t-xl" }, ["JOB POSTS", "POSTED DATE", "NO. OF APPLICA.", "STATUS", "ACTION"].map((col) => /* @__PURE__ */ React.createElement("span", { key: col, className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide" }, col))), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-6 text-center" }, /* @__PURE__ */ React.createElement(Briefcase, { className: "w-8 h-8 text-muted-foreground mx-auto mb-2" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, "No internships match your search")) : /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border" }, filtered.map((row, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-background/60 transition-colors ${i === filtered.length - 1 ? "rounded-b-xl" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-[#00BFEA] truncate" }, row.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5 truncate" }, row.dept, " Internship")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-foreground" }, row.posted), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, row.ago)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-foreground" }, row.applicants)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${row.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : row.status === "Review" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}` }, row.status)), /* @__PURE__ */ React.createElement("div", { className: "relative flex justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOpenMenu(openMenu === i ? null : i),
      className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(MoreVertical, { className: "w-4 h-4" })
  ), openMenu === i && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40", onClick: () => setOpenMenu(null) }), /* @__PURE__ */ React.createElement("div", { className: `absolute right-0 ${i > 0 && i >= filtered.length - 2 ? "bottom-8" : "top-8"} z-50 bg-card border border-border rounded-xl shadow-xl py-1.5 w-44 divide-y divide-border/40` }, /* @__PURE__ */ React.createElement("div", { className: "py-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (onEditInternship) onEditInternship(row);
        setOpenMenu(null);
      },
      className: "w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors cursor-pointer"
    },
    "Edit Internship"
  ), row.status !== "Active" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        updateJobStatus(row, "Active");
        setOpenMenu(null);
      },
      className: "w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-background transition-colors cursor-pointer"
    },
    "Set to Active"
  ), row.status !== "Review" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        updateJobStatus(row, "Review");
        setOpenMenu(null);
      },
      className: "w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-background transition-colors cursor-pointer"
    },
    "Set to Review"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        closeJob(row);
        setOpenMenu(null);
      },
      disabled: row.status === "Closed",
      className: "w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    },
    "Close Job"
  )), /* @__PURE__ */ React.createElement("div", { className: "py-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        deleteJob(row);
        setOpenMenu(null);
      },
      className: "w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
    },
    "Delete Internship"
  ))))))))));
}

function ApplicantResumeModal({ applicant, preview, loading, error, onClose }) {
  return React.createElement("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6" },
    React.createElement("section", { className: "bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden" },
      React.createElement("header", { className: "flex items-center justify-between gap-4 px-5 py-4 border-b border-border" },
        React.createElement("div", { className: "min-w-0" },
          React.createElement("h2", { className: "text-base font-semibold text-foreground truncate" }, applicant.name, " — Resume"),
          React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, applicant.course || "", applicant.college ? ` · ${applicant.college}` : "")
        ),
        React.createElement("button", { onClick: onClose, className: "px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg" }, "Close")
      ),
      loading
        ? React.createElement("p", { className: "p-8 text-center text-sm text-muted-foreground" }, "Loading uploaded resume…")
        : error
          ? React.createElement("p", { role: "alert", className: "p-8 text-center text-sm text-red-600" }, error)
          : preview?.mimeType === "application/pdf"
            ? React.createElement("iframe", { title: `${applicant.name} resume`, src: preview.dataUrl, className: "w-full flex-1 min-h-[60vh] bg-white" })
            : preview
              ? React.createElement("div", { className: "p-8 text-center space-y-3" },
                  React.createElement("p", { className: "text-sm text-foreground" }, "This resume format can’t be previewed here."),
                  React.createElement("a", { href: preview.dataUrl, download: preview.fileName, className: "inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm" }, "Download resume")
                )
              : React.createElement("p", { className: "p-8 text-center text-sm text-muted-foreground" }, "No resume file is available for this application.")
    )
  );
}

function CompanyPortal({ section, setSection, userInfo, logout }) {
  const updateCandidateStatus = async (name, internshipTitle, status) => {
    const applicant = companyApplicants.find((row) => row.name === name && row.internship === internshipTitle);
    const statusCode = ({ Review: "IN_REVIEW", "Interview Scheduled": "INTERVIEW", Shortlisted: "SHORTLISTED", Hired: "OFFERED", Rejected: "REJECTED" })[status];
    if (!applicant || !statusCode) return;
    try {
      await api.updateApplicationStatus(applicant.id, { status: statusCode, statusLabel: status });
      setApplicantStatuses((prev) => ({ ...prev, [name]: status }));
      setCompanyApplicants((prev) => prev.map((row) => row.id === applicant.id ? { ...row, status } : row));
      toast.success(`Candidate status updated to "${status}". Student notified!`);
    } catch (error) { toast.error(error.message || "Could not update applicant status."); }
  };
  const updatePassword = async () => {
    if (pwdFields.next !== pwdFields.confirm) return toast.error("New passwords do not match.");
    try {
      await api.changePassword({ currentPassword: pwdFields.current, newPassword: pwdFields.next });
      setPwdSaved(true);
      setShowPwdForm(false);
      setPwdFields({ current: "", next: "", confirm: "" });
      toast.success("Password updated. Other active sessions were signed out.");
    } catch (error) { toast.error(error.message || "Could not update your password."); }
  };
  const resolvedCompanyName = userInfo?.companyName || "";
  const resolvedRecruiterName = userInfo && (userInfo.firstName || userInfo.lastName) ? `${userInfo.firstName} ${userInfo.lastName}`.trim() : "";
  const resolvedRecruiterDesignation = userInfo?.designation || "";
  const companyInitials = resolvedCompanyName
    ? resolvedCompanyName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "IN";
  const getCompanyColor = (name) => {
    if (!name) return "#007CC3";
    if (name.toLowerCase().includes("google")) return "#4285F4";
    if (name.toLowerCase().includes("infosys")) return "#007CC3";
    const colors = ["#0A66C2", "#0f766e", "#1d4ed8", "#6d28d9", "#be185d", "#b91c1c", "#c2410c", "#15803d"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  const companyColor = getCompanyColor(resolvedCompanyName);
  const [activeProfileTab, setActiveProfileTab] = useState("Home");
  const [postStep, setPostStep2] = useState(1);
  const [settingsTab, setSettingsTab] = useState("account");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applicantActionMenu, setApplicantActionMenu] = useState(null);
  const [applicantStatuses, setApplicantStatuses] = useState({});
  const [applicantSearch, setApplicantSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [hiringRoundFilter, setHiringRoundFilter] = useState("");
  const [joiningInterview, setJoiningInterview] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const [resumePreviewError, setResumePreviewError] = useState("");
  const [companyJobs, setCompanyJobs] = useState([]);
  const [companyApplicants, setCompanyApplicants] = useState([]);
  const [companyVerification, setCompanyVerification] = useState("verified");
  useEffect(() => {
    let active = true;
    Promise.all([api.companyInternships(), api.companyProfile(), api.companyMembers(), api.settings(), api.sessions()]).then(([jobs, profile, members, settings, currentSessions]) => {
      if (!active) return;
      setCompanyVerification(profile.verificationStatus || "verified");
      const details = profile.profileData || {};
      setCompanyData((current) => ({ ...current, ...profile, ...details, name: profile.name || current.name, profileData: details, tagline: details.tagline || "", perks: Array.isArray(details.perks) ? details.perks.join(", ") : details.perks || "", departments: details.departments || [], internshipType: details.internshipType || [] }));
      setLogoUrl(details.logo || profile.logoUrl || null);
      setCompanyCoverUrl(details.cover || "");
      setCompanyUpdates(details.updates || []);
      setCandidateChats({});
      setTeamMembers(members);
      setNotifSettings(settings.companyNotifications || {});
      setCompanyPrivacy(settings.companyPrivacy || {});
      setSessions(currentSessions.map((session) => ({ ...session, device: session.current ? "Current session" : "Signed-in session", time: new Date(session.createdAt).toLocaleString() })));
      setCompanyJobs(jobs.map((job) => ({
        ...job, id: job.id, dept: job.category || "IT", posted: job.posted || "Today", ago: job.ago || "Just now",
        applicants: job.applicants ?? 0, status: (job.status === "Published" || job.status === "Active") ? "Active" : job.status === "Closed" ? "Closed" : "Review",
        stipend: String(job.stipendNum || 0), skills: Array.isArray(job.skills) ? job.skills.join(", ") : (job.skills || ""),
      })));
    }).catch((error) => {
      if (active && error?.status !== 401 && error?.message !== "Not authenticated") {
        toast.error(error.message || "Could not load employer data.");
      }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    api.companyApplications().then((items) => {
      if (active && items) {
        setCompanyApplicants(items.map((applicant) => ({
          ...applicant,
          status: ({ "Under Review": "Review", "Offer Received": "Hired" }[applicant.status] || applicant.status),
          applied: applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : (applicant.applied || "Recently"),
        })));
      }
    }).catch((error) => {
      if (active && error?.status !== 401 && error?.message !== "Not authenticated") {
        toast.error(error.message || "Could not load applicants.");
      }
    });
    return () => { active = false; };
  }, [companyJobs.length]);
  const [companyUpdates, setCompanyUpdates] = useState([]);
  const [newUpdateText, setNewUpdateText] = useState("");
  const blankForm2 = {
    title: "",
    category: "IT",
    department: "Software Development",
    location: "",
    mode: "Hybrid",
    duration: "2 Months",
    stipend: "",
    openings: "1",
    deadline: "",
    skills: "",
    description: "",
    responsibilities: "",
    perks: ["Certificate", "Letter of Recommendation"],
    eligibility: "",
    minCgpa: "",
    showSelection: true,
    selectionSteps: ["Online Assessment", "Technical Interview", "HR Interview"]
  };
  const [postForm, setPostForm2] = useState({ ...blankForm2 });
  const [publishing, setPublishing] = useState(false);
  const pf = (field) => (val) => setPostForm2((prev) => ({ ...prev, [field]: val }));
  const pfPerks = (perk) => setPostForm2((prev) => ({
    ...prev,
    perks: prev.perks.includes(perk) ? prev.perks.filter((p) => p !== perk) : [...prev.perks, perk]
  }));

  const startEditInternship = (row) => {
    setEditingPost(row);
    const rawStipend = row.stipendNum ?? row.stipendAmount ?? (
      typeof row.stipend === "string" ? row.stipend.replace(/[^0-9]/g, "") : (row.stipend || 0)
    );
    setPostForm2({
      ...blankForm2,
      title: row.title || "",
      category: row.category || "IT",
      department: row.department || "Software Development",
      location: row.location || "",
      mode: row.mode || row.workMode || "Hybrid",
      duration: row.duration || "2 Months",
      stipend: String(rawStipend || 0),
      openings: String(row.openings || "1"),
      deadline: row.deadline ? (typeof row.deadline === "string" ? row.deadline.split("T")[0] : "") : "",
      skills: Array.isArray(row.skills) ? row.skills.join(", ") : (row.skills || ""),
      description: row.description || "",
      responsibilities: row.responsibilities || "",
      eligibility: row.eligibility || "",
      perks: Array.isArray(row.perks) ? row.perks : ["Certificate", "Letter of Recommendation"],
      minCgpa: row.minCgpa == null ? "" : String(row.minCgpa),
      showSelection: Boolean(row.selectionSteps && (Array.isArray(row.selectionSteps) ? row.selectionSteps.length : true)),
      selectionSteps: Array.isArray(row.selectionSteps) && row.selectionSteps.length ? row.selectionSteps : ["Online Assessment", "Technical Interview", "HR Interview"]
    });
    setPostStep2(1);
    setSection("post");
  };

  const handlePublishJob = async () => {
    if (publishing) return;
    try {
      setPublishing(true);
      if (!postForm.title.trim()) { setPostStep2(1); throw new Error("Enter the internship title in Step 1."); }
      if (!postForm.category) { setPostStep2(1); throw new Error("Select a category in Step 1."); }
      if (!postForm.department) { setPostStep2(1); throw new Error("Select a department in Step 1."); }
      if (!postForm.mode) { setPostStep2(1); throw new Error("Select a work mode in Step 1."); }
      if (!postForm.duration) { setPostStep2(1); throw new Error("Select a duration in Step 1."); }
      if (postForm.stipend === "" || postForm.stipend === null || postForm.stipend === undefined) {
        setPostStep2(1); throw new Error("Enter the monthly stipend (enter 0 if unpaid) in Step 1.");
      }
      const numStipend = Number(postForm.stipend);
      if (isNaN(numStipend) || numStipend < 0) { setPostStep2(1); throw new Error("Enter a valid non-negative stipend amount in Step 1."); }
      const numOpenings = Number(postForm.openings);
      if (!Number.isInteger(numOpenings) || numOpenings < 1) { setPostStep2(1); throw new Error("Enter a valid number of openings (at least 1) in Step 1."); }
      if (!postForm.deadline) { setPostStep2(1); throw new Error("Select an application deadline in Step 1."); }
      if (!postForm.skills.trim()) { setPostStep2(2); throw new Error("Enter required skills in Step 2."); }
      if (!postForm.description.trim()) { setPostStep2(2); throw new Error("Enter an internship description in Step 2."); }
      if (!postForm.responsibilities.trim()) { setPostStep2(2); throw new Error("Enter roles & responsibilities in Step 2."); }

      const locationVal = postForm.location.trim() || (postForm.mode === "Remote" ? "Remote" : "India");

      const internshipPayload = {
        title: postForm.title.trim(),
        category: postForm.category,
        department: postForm.department,
        location: locationVal,
        mode: postForm.mode,
        workMode: postForm.mode,
        duration: postForm.duration,
        stipend: numStipend > 0 ? `₹${numStipend.toLocaleString("en-IN")} / month` : "Unpaid",
        stipendAmount: numStipend,
        stipendNum: numStipend,
        stipendCurrency: "INR",
        stipendPeriod: "month",
        openings: numOpenings,
        deadline: postForm.deadline,
        skills: postForm.skills.split(",").map((value) => value.trim()).filter(Boolean),
        description: postForm.description.trim(),
        responsibilities: postForm.responsibilities.trim(),
        eligibility: postForm.eligibility.trim(),
        perks: postForm.perks,
        selectionSteps: postForm.showSelection ? postForm.selectionSteps : [],
        // Don't pass status on create - backend always sets 'Review' for admin approval
        // On edit, don't change status unless explicitly updated
      };
      if (postForm.minCgpa !== "") internshipPayload.minCgpa = Number(postForm.minCgpa);

      const saved = editingPost ? await api.updateInternship(editingPost.id, internshipPayload) : await api.createInternship(internshipPayload);
      setCompanyJobs((prev) => [{
        ...saved,
        dept: saved.category || "IT",
        posted: saved.posted || "Today",
        ago: saved.ago || "Just now",
        applicants: saved.applicants ?? 0,
        status: (saved.status === "Published" || saved.status === "Active") ? "Active" : "Review",
        stipend: String(saved.stipendNum || saved.stipendAmount || numStipend),
        skills: Array.isArray(saved.skills) ? saved.skills.join(", ") : (saved.skills || ""),
      }, ...prev.filter((job) => job.id !== saved.id)]);

      setEditingPost(null);
      setPostForm2({ ...blankForm2 });
      setPostStep2(1);
      setSection("manage");
      window.dispatchEvent(new CustomEvent("interndesk:sync"));
      toast.success(editingPost ? "Internship updated successfully! Students notified." : "Internship submitted for review! An admin will approve it before students can see it.");
    } catch (error) {
      toast.error(error.message || "Could not save this internship.");
    } finally {
      setPublishing(false);
    }
  };
  const [activeMessageCandidate, setActiveMessageCandidate] = useState("");
  const [directMessageModal, setDirectMessageModal] = useState(null);
  const [modalMsgText, setModalMsgText] = useState("");
  const [fullChatMsgText, setFullChatMsgText] = useState("");
  const [candidateChats, setCandidateChats] = useState({});
  const loadApplicantMessages = async (applicationId) => {
    try {
      const messages = await api.applicationMessages(applicationId);
      setCandidateChats((current) => ({ ...current, [applicationId]: messages.map((message) => ({ ...message, from: message.from === "recruiter" ? "me" : "them", msg: message.message, time: new Date(message.createdAt).toLocaleTimeString() })) }));
    } catch (error) { toast.error(error.message || "Could not load this conversation."); }
  };
  const openApplicantChat = (applicant) => {
    if (!applicant?.id) return;
    const applicationId = String(applicant.id);
    setActiveMessageCandidate(applicationId);
    setDirectMessageModal({ applicationId, name: applicant.name, role: applicant.internship || applicant.course || "Applicant", college: applicant.college });
    loadApplicantMessages(applicationId);
  };
  const sendMessageToCandidate = async (applicationId, text) => {
    if (!text.trim()) return;
    try {
      const sent = await api.sendApplicationMessage(applicationId, text.trim());
      setCandidateChats((current) => ({ ...current, [applicationId]: [...(current[applicationId] || []), { ...sent, from: sent.from === "recruiter" ? "me" : "them", msg: sent.message, time: new Date(sent.createdAt).toLocaleTimeString() }] }));
    } catch (error) { toast.error(error.message || "Could not send this message."); }
  };
  const openApplicantResume = async (applicant) => {
    setViewingResume(applicant);
    setResumePreview(null);
    setResumePreviewError("");
    setResumePreviewLoading(true);
    try {
      const file = await api.applicationResume(applicant.id);
      setResumePreview({ ...file, dataUrl: `data:${file.mimeType};base64,${file.dataBase64}` });
    } catch (error) {
      setResumePreviewError(error.message || "Could not load the uploaded resume.");
    } finally {
      setResumePreviewLoading(false);
    }
  };
  const [accountFields, setAccountFields] = useState({
    "Full Name": resolvedRecruiterName,
    "Work Email": userInfo?.email || "",
    "Job Title": resolvedRecruiterDesignation,
    "Phone Number": "",
    "Language": "English (India)"
  });
  const [accountEditing, setAccountEditing] = useState(null);
  const [accountDraft, setAccountDraft] = useState("");
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdFields, setPwdFields] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaved, setPwdSaved] = useState(false);
  const twoFaEnabled = false;
  const [sessions, setSessions] = useState([]);
  const [notifSettings, setNotifSettings] = useState({});
  const [companyPrivacy, setCompanyPrivacy] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteDraft, setInviteDraft] = useState({ name: "", email: "", role: "Recruiter" });
  const [confirmDanger, setConfirmDanger] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [companyCoverUrl, setCompanyCoverUrl] = useState("");
  const [cpModal, setCpModal] = useState(null);
  const [cpDraft, setCpDraft] = useState({});
  const [companyData, setCompanyData] = useState({ name: userInfo?.companyName || "", tagline: "", industry: "", size: "", founded: "", location: "", website: "", linkedin: "", description: "", perks: "", departments: [], internshipType: [] });
  const companyCity = companyData.location ? companyData.location.split(",")[0].trim() : "";
  const companyIndustry = companyData.industry || "";
  const openCpModal = (m) => {
    if (m === "basic") setCpDraft({ name: companyData.name, tagline: companyData.tagline, industry: companyData.industry, size: companyData.size, founded: companyData.founded, location: companyData.location, website: companyData.website, linkedin: companyData.linkedin });
    else if (m === "about") setCpDraft({ description: companyData.description });
    else if (m === "perks") setCpDraft({ perks: companyData.perks });
    setCpModal(m);
  };
  const saveCpModal = async () => {
    const updated = { ...companyData, ...cpDraft };
    const profileData = { ...(companyData.profileData || {}), tagline: updated.tagline, founded: updated.founded, location: updated.location, linkedin: updated.linkedin, perks: updated.perks, departments: updated.departments, internshipType: updated.internshipType };
    try {
      const saved = await api.updateCompanyProfile({ name: updated.name, industry: updated.industry, size: updated.size, description: updated.description, website: updated.website, profileData });
      setCompanyData({ ...updated, ...saved, ...saved.profileData, profileData: saved.profileData, perks: Array.isArray(saved.profileData?.perks) ? saved.profileData.perks.join(", ") : saved.profileData?.perks || "" });
      setCpModal(null);
    } catch (error) { toast.error(error.message || "Could not save company details."); }
  };
  const persistCompanyMedia = async (key, value) => {
    const profileData = { ...(companyData.profileData || {}), [key]: value };
    try {
      const saved = await api.updateCompanyProfile({ profileData });
      setCompanyData((current) => ({ ...current, profileData: saved.profileData || profileData }));
      if (key === "logo") setLogoUrl(value);
      if (key === "cover") setCompanyCoverUrl(value);
    } catch (error) { toast.error(error.message || "Could not save this company image."); }
  };
  const persistCompanyData = async (changes) => {
    const profileData = { ...(companyData.profileData || {}), ...changes };
    try {
      await api.updateCompanyProfile({ profileData });
      setCompanyData((current) => ({ ...current, profileData }));
    } catch (error) { toast.error(error.message || "Could not save company data."); }
  };
  const saveCompanyNotification = async (label, channel) => {
    const next = { ...notifSettings, [label]: { ...(notifSettings[label] || {}), [channel]: !(notifSettings[label]?.[channel] || false) } };
    try {
      await api.updateSettings({ companyNotifications: next });
      setNotifSettings(next);
    } catch (error) { toast.error(error.message || "Could not save notification preferences."); }
  };
  const saveCompanyPrivacy = async (key) => {
    const next = { ...companyPrivacy, [key]: !(companyPrivacy[key] ?? (key === "profileVisible")) };
    try { await api.updateSettings({ companyPrivacy: next }); setCompanyPrivacy(next); }
    catch (error) { toast.error(error.message || "Could not save privacy preferences."); }
  };
  const addTeamMember = async () => {
    try {
      await api.addCompanyMember({ email: inviteDraft.email, role: "Recruiter" });
      setTeamMembers(await api.companyMembers());
      setInviteDraft({ name: "", email: "", role: "Recruiter" });
      setShowInviteForm(false);
    } catch (error) { toast.error(error.message || "Could not add this team member."); }
  };
  const changeTeamMemberRole = async (memberId, role) => {
    try {
      await api.updateCompanyMember(memberId, { role });
      setTeamMembers(await api.companyMembers());
    } catch (error) { toast.error(error.message || "Could not update this team member."); }
  };
  const removeTeamMember = async (memberId) => {
    try {
      await api.removeCompanyMember(memberId);
      setTeamMembers(await api.companyMembers());
    } catch (error) { toast.error(error.message || "Could not remove this team member."); }
  };
  const revokeSession = async (sessionId) => {
    try {
      await api.revokeSession(sessionId);
      setSessions(await api.sessions());
    } catch (error) { toast.error(error.message || "Could not sign out this session."); }
  };
  const revokeOtherSessions = async () => {
    try {
      await Promise.all(sessions.filter((session) => !session.current).map((session) => api.revokeSession(session.id)));
      setSessions(await api.sessions());
    } catch (error) { toast.error(error.message || "Could not sign out other sessions."); }
  };
  const sidebarItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "post", icon: Plus, label: "Post Internship" },
    { id: "manage", icon: Briefcase, label: "Manage Internships" },
    { id: "applicants", icon: Users, label: "Applicants" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "interviews", icon: Calendar, label: "Interviews" },
    { id: "company-profile", icon: Building2, label: "Company Profile" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "settings", icon: Settings, label: "Settings" }
  ];
  const mobileBarItems = sidebarItems.filter((i) => !["dashboard", "post", "company-profile"].includes(i.id));
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-[calc(100vh-64px)] bg-background flex flex-col md:flex-row", style: { colorScheme: "light", "--background": "#F3F2EF", "--foreground": "#1F2937", "--card": "#ffffff", "--card-foreground": "#1F2937", "--popover": "#ffffff", "--popover-foreground": "#1F2937", "--primary": "#0A66C2", "--primary-foreground": "#ffffff", "--secondary": "#EBEBEB", "--secondary-foreground": "#1F2937", "--muted": "#F1F5F9", "--muted-foreground": "#6B7280", "--border": "#e0dfdc", "--input": "transparent", "--input-background": "#F8FAFC", "--accent": "#EEF2FF", "--accent-foreground": "#0A66C2" } }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex md:w-56 flex-shrink-0 bg-card border-r border-border p-3 flex-col md:sticky top-16 md:self-start md:min-h-[calc(100vh-64px)]" }, /* @__PURE__ */ React.createElement("button", { onClick: () => { setSection("dashboard"); setSelectedInternship(null); setEditingPost(null); window.scrollTo({ top: 0, behavior: "smooth" }); }, className: "p-3 mb-3 bg-background rounded-xl border border-transparent hover:border-border transition-all hover:bg-background/80 text-left w-full cursor-pointer flex items-center gap-2" }, /* @__PURE__ */ React.createElement(LogoMark, { logo: companyInitials, color: companyColor, size: "sm" }), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-foreground truncate" }, resolvedCompanyName), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground truncate" }, `${companyIndustry} \xB7 ${companyCity}`))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-0" }, sidebarItems.map((item) => /* @__PURE__ */ React.createElement("button", { key: item.id, onClick: () => {
    if (item.id === "applicants") setSelectedInternship(null);
    if (item.id === "post") {
      setEditingPost(null);
      setPostForm2({ ...blankForm2 });
      setPostStep2(1);
    }
    setSection(item.id);
  }, className: `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${section === item.id ? "bg-primary text-white" : "text-foreground hover:bg-background"}` }, /* @__PURE__ */ React.createElement(item.icon, { className: "w-4 h-4" }), item.label))), /* @__PURE__ */ React.createElement("button", { onClick: logout, className: "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-600 hover:bg-red-50 mt-auto" }, /* @__PURE__ */ React.createElement(LogOut, { className: "w-4 h-4" }), "Sign Out")), /* @__PURE__ */ React.createElement("div", { className: "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-6 py-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSection("dashboard"),
      className: `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${section === "dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ React.createElement(LayoutDashboard, { className: "w-5 h-5" }),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "Home")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSection("post"),
      className: `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${section === "post" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-5 h-5" }),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "Post")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSelectedInternship(null);
        setSection("applicants");
      },
      className: `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${section === "applicants" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ React.createElement(Users, { className: "w-5 h-5" }),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "Applicants")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSection("company-profile"),
      className: `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${section === "company-profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: `w-6 h-6 rounded-full flex items-center justify-center ${section === "company-profile" ? "bg-primary" : "bg-muted-foreground/20"}` }, /* @__PURE__ */ React.createElement(User, { className: `w-3.5 h-3.5 ${section === "company-profile" ? "text-white" : "text-muted-foreground"}` })),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "Profile")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex-1 p-4 md:p-6 w-full min-w-0 pb-12 md:pb-6" }, section === "dashboard" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Dashboard"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, "Welcome back, ", resolvedRecruiterName)), /* @__PURE__ */ React.createElement("button", { onClick: () => setSection("post"), className: "flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }), "Post New Internship")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-5" }, [
    { label: "Open Internships", value: companyJobs.filter((job) => job.status === "Active").length, icon: Briefcase, bg: "bg-blue-50", color: "text-blue-600", labelColor: "text-muted-foreground", nav: "manage" },
    { label: "Total Applications", value: companyApplicants.length, icon: FileText, bg: "bg-violet-50", color: "text-violet-600", labelColor: "text-muted-foreground", nav: "applicants" },
    { label: "Scheduled Interviews", value: companyApplicants.filter((app) => app.status === "Interview Scheduled").length, icon: Calendar, bg: "bg-amber-50", color: "text-amber-600", labelColor: "text-muted-foreground", nav: "interviews" },
    { label: "Offers", value: companyApplicants.filter((app) => ["Hired", "Offer Received"].includes(app.status)).length, icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600", labelColor: "text-muted-foreground", nav: "applicants" }
  ].map((stat) => /* @__PURE__ */ React.createElement("button", { key: stat.label, onClick: () => setSection(stat.nav), className: "bg-card border border-border rounded-xl px-4 py-3 text-left hover:border-primary/40 hover:shadow-sm transition-all group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-1.5" }, /* @__PURE__ */ React.createElement("div", { className: `w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform` }, /* @__PURE__ */ React.createElement(stat.icon, { className: `w-4 h-4 ${stat.color}` })), /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-medium text-foreground" }, stat.value)), /* @__PURE__ */ React.createElement("p", { className: `text-xs ${stat.labelColor}` }, stat.label)))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-medium text-foreground" }, "Recent Applicants"), /* @__PURE__ */ React.createElement("button", { onClick: () => setSection("applicants"), className: "text-xs text-primary font-medium" }, "View all")), /* @__PURE__ */ React.createElement("table", { className: "w-full" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-border" }, /* @__PURE__ */ React.createElement("th", { className: "text-left text-xs font-medium text-muted-foreground pb-2 hidden sm:table-cell" }, "Candidate"), /* @__PURE__ */ React.createElement("th", { className: "text-left text-xs font-medium text-muted-foreground pb-2" }, "Role"), /* @__PURE__ */ React.createElement("th", { className: "text-left text-xs font-medium text-muted-foreground pb-2 hidden md:table-cell" }, "Applied"), /* @__PURE__ */ React.createElement("th", { className: "text-left text-xs font-medium text-muted-foreground pb-2" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "pb-2" }))), /* @__PURE__ */ React.createElement("tbody", null, companyApplicants.slice(0, 5).map((applicant, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "border-b border-border last:border-0" }, /* @__PURE__ */ React.createElement("td", { className: "py-3 hidden sm:table-cell" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-medium" }, applicant.name[0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-foreground" }, applicant.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground" }, applicant.college)))), /* @__PURE__ */ React.createElement("td", { className: "py-3 text-xs text-foreground" }, /* @__PURE__ */ React.createElement("span", { className: "sm:hidden font-medium block mb-0.5" }, applicant.name), applicant.internship), /* @__PURE__ */ React.createElement("td", { className: "py-3 text-xs text-muted-foreground hidden md:table-cell" }, applicant.applied), /* @__PURE__ */ React.createElement("td", { className: "py-3" }, /* @__PURE__ */ React.createElement(StatusBadge, { status: applicant.status })), /* @__PURE__ */ React.createElement("td", { className: "py-3 text-right" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setStageFilter("");
    setApplicantSearch(applicant.name);
    setSection("applicants");
  }, className: "text-xs text-primary font-medium hover:underline" }, "Review"))))))), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-medium text-foreground" }, "Today's Interviews"), /* @__PURE__ */ React.createElement("button", { onClick: () => setSection("interviews"), className: "text-xs text-primary font-medium" }, "View all")), companyApplicants.filter((applicant) => applicant.status === "Interview Scheduled").map((interview, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-3 p-3 bg-background rounded-xl mb-2 last:mb-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-primary" }, interview.applied)), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-foreground" }, interview.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground" }, interview.role, " \xB7 ", interview.type)), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setJoiningInterview(interview.name);
        setTimeout(() => setJoiningInterview(null), 3e3);
      },
      className: `px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${joiningInterview === interview.name ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary hover:bg-primary/20"}`
    },
    joiningInterview === interview.name ? "Joining\u2026" : "Join"
  )))))), section === "post" && (() => {
    const ep = editingPost;
    const isEdit = ep !== null;
    return /* @__PURE__ */ React.createElement("div", { key: ep?.title ?? "__new__" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, isEdit ? `Edit Internship` : "Post a New Internship"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, isEdit ? `Editing: ${ep.title}` : "Fill in the details below to publish your listing")), isEdit && /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setEditingPost(null);
      setSection("manage");
    }, className: "flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors" }, /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" }), " Cancel")), (() => {
      const steps = ["Basic Info", "Details", "Eligibility", "Preview"];
      const label = steps[postStep - 1];
      return /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-white" }, postStep), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-foreground" }, label)), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted-foreground" }, "Step ", postStep, " of ", steps.length)), /* @__PURE__ */ React.createElement("div", { className: "h-1.5 bg-border rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "h-full bg-primary rounded-full transition-all duration-300", style: { width: `${postStep / steps.length * 100}%` } })));
    })(), /* @__PURE__ */ React.createElement("div", { className: `bg-card border border-border rounded-xl p-6 ${postStep === 4 ? "max-w-3xl" : "max-w-2xl"}` }, postStep === 1 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Basic Information"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Internship Title *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: postForm.title, onChange: (e) => pf("title")(e.target.value), placeholder: "e.g. Software Development Intern", className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Category *"), /* @__PURE__ */ React.createElement("select", { value: postForm.category, onChange: (e) => pf("category")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }, /* @__PURE__ */ React.createElement("option", null, "IT"), /* @__PURE__ */ React.createElement("option", null, "NON IT"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Department *"), /* @__PURE__ */ React.createElement("select", { value: postForm.department, onChange: (e) => pf("department")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }, postForm.category === "IT" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("option", null, "Software Development"), /* @__PURE__ */ React.createElement("option", null, "Data Science & AI"), /* @__PURE__ */ React.createElement("option", null, "Full Stack Development"), /* @__PURE__ */ React.createElement("option", null, "Cloud Computing & DevOps"), /* @__PURE__ */ React.createElement("option", null, "Cyber Security"), /* @__PURE__ */ React.createElement("option", null, "UI/UX Design"), /* @__PURE__ */ React.createElement("option", null, "Mobile App Development"), /* @__PURE__ */ React.createElement("option", null, "Database Administration")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("option", null, "Business Development"), /* @__PURE__ */ React.createElement("option", null, "Finance & Accounting"), /* @__PURE__ */ React.createElement("option", null, "Digital Marketing"), /* @__PURE__ */ React.createElement("option", null, "Human Resources"), /* @__PURE__ */ React.createElement("option", null, "Sales & Growth"), /* @__PURE__ */ React.createElement("option", null, "Supply Chain & Operations"), /* @__PURE__ */ React.createElement("option", null, "Graphic Design"), /* @__PURE__ */ React.createElement("option", null, "Content Strategy"))))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Location"), /* @__PURE__ */ React.createElement("input", { type: "text", value: postForm.location, onChange: (e) => pf("location")(e.target.value), placeholder: "e.g. Pune, Maharashtra", className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Work Mode *"), /* @__PURE__ */ React.createElement("select", { value: postForm.mode, onChange: (e) => pf("mode")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }, /* @__PURE__ */ React.createElement("option", null, "Hybrid"), /* @__PURE__ */ React.createElement("option", null, "Remote"), /* @__PURE__ */ React.createElement("option", null, "On-site")))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Duration *"), /* @__PURE__ */ React.createElement("select", { value: postForm.duration, onChange: (e) => pf("duration")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }, /* @__PURE__ */ React.createElement("option", null, "2 Months"), /* @__PURE__ */ React.createElement("option", null, "3 Months"), /* @__PURE__ */ React.createElement("option", null, "4 Months"), /* @__PURE__ */ React.createElement("option", null, "6 Months"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Monthly Stipend (\u20B9) *"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("span", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" }, "\u20B9"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", value: postForm.stipend, onChange: (e) => pf("stipend")(e.target.value), placeholder: "e.g. 15000 (0 if unpaid)", className: "w-full pl-8 pr-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Number of Openings"), /* @__PURE__ */ React.createElement("input", { type: "number", value: postForm.openings, onChange: (e) => pf("openings")(e.target.value), placeholder: "e.g. 5", className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Application Deadline *"), /* @__PURE__ */ React.createElement("input", { type: "date", value: postForm.deadline, onChange: (e) => pf("deadline")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" }))), /* @__PURE__ */ React.createElement("button", { onClick: () => {
  if (!postForm.title.trim()) { toast.error("Please enter the internship title."); return; }
  if (postForm.stipend === "" || postForm.stipend === null || isNaN(Number(postForm.stipend)) || Number(postForm.stipend) < 0) {
    toast.error("Please enter the monthly stipend (enter 0 if unpaid).");
    return;
  }
  if (!postForm.openings || Number(postForm.openings) < 1) {
    toast.error("Please enter a valid number of openings.");
    return;
  }
  if (!postForm.deadline) {
    toast.error("Please select an application deadline.");
    return;
  }
  setPostStep2(2);
}, className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" }, "Next: Internship Details")), postStep === 2 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Internship Details"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Required Skills *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: postForm.skills, onChange: (e) => pf("skills")(e.target.value), placeholder: "e.g. Python, Java, React (comma separated)", className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Internship Description *"), /* @__PURE__ */ React.createElement("textarea", { rows: 4, value: postForm.description, onChange: (e) => pf("description")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none", placeholder: "Describe the internship role..." })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Roles & Responsibilities *"), /* @__PURE__ */ React.createElement("textarea", { rows: 4, value: postForm.responsibilities, onChange: (e) => pf("responsibilities")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none", placeholder: "List the key responsibilities for this internship..." })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-2" }, "Benefits & Perks"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, ["Certificate", "Letter of Recommendation", "Pre-Placement Offer", "Mentorship", "Flexible Hours", "Free Meals"].map((b) => /* @__PURE__ */ React.createElement("label", { key: b, className: `flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${postForm.perks.includes(b) ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary"}` }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: postForm.perks.includes(b), onChange: () => pfPerks(b), className: "accent-primary" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium" }, b))))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setPostStep2(1), className: "px-5 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors" }, "Back"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
  if (!postForm.skills.trim()) { toast.error("Please enter required skills."); return; }
  if (!postForm.description.trim()) { toast.error("Please enter the internship description."); return; }
  if (!postForm.responsibilities.trim()) { toast.error("Please enter roles & responsibilities."); return; }
  setPostStep2(3);
}, className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" }, "Next: Eligibility"))), postStep === 3 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Eligibility Criteria"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Who can apply?"), /* @__PURE__ */ React.createElement("textarea", { rows: 3, value: postForm.eligibility, onChange: (e) => pf("eligibility")(e.target.value), className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none", placeholder: "e.g. B.Tech/M.Tech in CS/IT, MBA students with tech background..." })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Minimum CGPA"), /* @__PURE__ */ React.createElement("input", { type: "number", value: postForm.minCgpa, onChange: (e) => pf("minCgpa")(e.target.value), step: "0.1", max: "10", className: "w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "text-sm font-medium text-foreground" }, "Selection Process"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setPostForm2((prev) => ({ ...prev, showSelection: !prev.showSelection })),
        className: `relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${postForm.showSelection ? "bg-primary" : "bg-border"}`
      },
      /* @__PURE__ */ React.createElement("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${postForm.showSelection ? "translate-x-4" : "translate-x-0"}` })
    )), postForm.showSelection && /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, ["Online Assessment", "Technical Interview", "HR Interview", "Case Study", "Group Discussion", "Final Interview"].map((step) => {
      const active = postForm.selectionSteps.includes(step);
      return /* @__PURE__ */ React.createElement("label", { key: step, className: `flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"}` }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: active,
          onChange: () => setPostForm2((prev) => ({
            ...prev,
            selectionSteps: active ? prev.selectionSteps.filter((s) => s !== step) : [...prev.selectionSteps, step]
          })),
          className: "accent-primary"
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-foreground" }, step));
    })), !postForm.showSelection && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground px-1" }, "Selection process will not be shown to applicants.")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setPostStep2(2), className: "px-5 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors" }, "Back"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPostStep2(4), className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" }, "Preview before ", isEdit ? "Saving" : "Publishing"))), postStep === 4 && (() => {
      const skillsList = postForm.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const respLines = postForm.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean);
      const deadlineFormatted = postForm.deadline ? new Date(postForm.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "\u2014";
      const stipendFormatted = postForm.stipend ? `\u20B9${Number(postForm.stipend).toLocaleString("en-IN")}/mo` : "\u2014";
      return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl" }, /* @__PURE__ */ React.createElement(Eye, { className: "w-4 h-4 text-amber-600 flex-shrink-0" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-amber-700 font-medium" }, "This is a preview \u2014 exactly how students will see your listing")), /* @__PURE__ */ React.createElement("div", { className: "border border-border rounded-xl overflow-hidden mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b border-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-xl bg-[#007CC3] flex items-center justify-center flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium text-lg" }, "IN")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-foreground" }, postForm.title || "Internship Title"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, resolvedCompanyName, " \xB7 ", postForm.department), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 mt-2" }, postForm.location && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1 text-xs text-muted-foreground" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-3 h-3" }), postForm.location), /* @__PURE__ */ React.createElement(ModeBadge, { mode: postForm.mode }), /* @__PURE__ */ React.createElement(CategoryBadge, { category: postForm.category }))), /* @__PURE__ */ React.createElement("button", { className: "px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex-shrink-0" }, "Apply Now"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 divide-x divide-border border-b border-border" }, [
        { icon: Clock, label: "Duration", value: postForm.duration },
        { icon: DollarSign, label: "Stipend", value: stipendFormatted },
        { icon: Users, label: "Openings", value: postForm.openings || "\u2014" },
        { icon: Calendar, label: "Deadline", value: deadlineFormatted }
      ].map((item) => /* @__PURE__ */ React.createElement("div", { key: item.label, className: "px-4 py-3 text-center" }, /* @__PURE__ */ React.createElement(item.icon, { className: "w-4 h-4 text-primary mx-auto mb-1" }), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground" }, item.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-foreground mt-0.5" }, item.value)))), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-5" }, postForm.description && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium text-foreground mb-2" }, "About the Internship"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground leading-relaxed" }, postForm.description)), respLines.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium text-foreground mb-2" }, "Roles & Responsibilities"), /* @__PURE__ */ React.createElement("ul", { className: "space-y-1.5" }, respLines.map((r, i) => /* @__PURE__ */ React.createElement("li", { key: i, className: "flex items-start gap-2 text-sm text-muted-foreground" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" }), r)))), skillsList.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium text-foreground mb-2" }, "Required Skills"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, skillsList.map((s) => /* @__PURE__ */ React.createElement("span", { key: s, className: "px-2.5 py-1 bg-background border border-border rounded-lg text-xs text-foreground" }, s)))), postForm.eligibility && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium text-foreground mb-2" }, "Eligibility"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, postForm.eligibility), postForm.minCgpa && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Minimum CGPA: ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-foreground" }, postForm.minCgpa))), postForm.perks.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium text-foreground mb-2" }, "Perks & Benefits"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, postForm.perks.map((p) => /* @__PURE__ */ React.createElement("span", { key: p, className: "flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700" }, /* @__PURE__ */ React.createElement(CheckCircle, { className: "w-3 h-3" }), p)))), postForm.showSelection && postForm.selectionSteps.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium text-foreground mb-2" }, "Selection Process"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, postForm.selectionSteps.map((s, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: s }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary" }, /* @__PURE__ */ React.createElement("span", { className: "w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-medium" }, i + 1), s), i < postForm.selectionSteps.length - 1 && /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-3 h-3 text-muted-foreground" }))))))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setPostStep2(3), className: "px-5 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors" }, "Edit Details"), /* @__PURE__ */ React.createElement("button", { onClick: handlePublishJob, disabled: publishing, className: `px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer ${publishing ? "opacity-60 cursor-not-allowed" : ""}` }, /* @__PURE__ */ React.createElement(CheckCircle, { className: "w-4 h-4" }), publishing ? "Publishing\u2026" : (isEdit ? "Save Changes" : "Publish Internship"))));
    })()));
  })(), section === "applicants" && (() => {
    const resumeScores = Object.fromEntries(companyApplicants.map((applicant) => [applicant.id, Number(applicant.score ?? applicant.atsScore ?? 88)]));
    const stageColors = {
      "Applied": "bg-blue-50 text-blue-700 border-blue-200",
      "Review": "bg-amber-50 text-amber-700 border-amber-200",
      "Shortlisted": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Interview Scheduled": "bg-violet-50 text-violet-700 border-violet-200",
      "Hired": "bg-blue-50 text-blue-700 border-blue-200",
      "Rejected": "bg-red-50 text-red-600 border-red-200"
    };
    const hiringRounds = {
      "Screening": ["Applied", "Review"],
      "Interviews": ["Interview Scheduled"],
      "Final": ["Shortlisted", "Hired"],
      "Closed": ["Rejected"]
    };
    const visibleApplicants = companyApplicants.filter((a) => {
      const currentStatus = applicantStatuses[a.name] ?? a.status;
      const score = resumeScores[a.id];
      if (selectedInternship && a.internship !== selectedInternship) return false;
      if (applicantSearch && !a.name.toLowerCase().includes(applicantSearch.toLowerCase()) && !a.college.toLowerCase().includes(applicantSearch.toLowerCase())) return false;
      if (minScoreFilter > 0 && score < minScoreFilter) return false;
      if (stageFilter && currentStatus !== stageFilter) return false;
      if (hiringRoundFilter && !hiringRounds[hiringRoundFilter]?.includes(currentStatus)) return false;
      return true;
    });
    const activeFilterCount = [selectedInternship, applicantSearch, minScoreFilter > 0, stageFilter, hiringRoundFilter].filter(Boolean).length;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Applicants"), activeFilterCount > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, visibleApplicants.length, " of ", companyApplicants.length, " shown")), activeFilterCount > 0 && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setSelectedInternship(null);
          setApplicantSearch("");
          setMinScoreFilter(0);
          setStageFilter("");
          setHiringRoundFilter("");
        },
        className: "flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
      },
      /* @__PURE__ */ React.createElement(X, { className: "w-3.5 h-3.5" }),
      " Clear all filters"
    )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl flex-1 min-w-[160px]" }, /* @__PURE__ */ React.createElement(Search, { className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0" }), /* @__PURE__ */ React.createElement("input", { type: "text", value: applicantSearch, onChange: (e) => setApplicantSearch(e.target.value), placeholder: "Search by name or college...", className: "bg-transparent text-xs outline-none w-full placeholder:text-muted-foreground" }), applicantSearch && /* @__PURE__ */ React.createElement("button", { onClick: () => setApplicantSearch("") }, /* @__PURE__ */ React.createElement(X, { className: "w-3 h-3 text-muted-foreground hover:text-foreground" }))), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: minScoreFilter,
        onChange: (e) => setMinScoreFilter(Number(e.target.value)),
        className: `appearance-none pl-3 pr-7 py-2 bg-card border rounded-xl text-xs outline-none cursor-pointer transition-colors ${minScoreFilter > 0 ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary"}`
      },
      /* @__PURE__ */ React.createElement("option", { value: 0 }, "Resume Score"),
      /* @__PURE__ */ React.createElement("option", { value: 90 }, "90% and above"),
      /* @__PURE__ */ React.createElement("option", { value: 85 }, "85% and above"),
      /* @__PURE__ */ React.createElement("option", { value: 80 }, "80% and above"),
      /* @__PURE__ */ React.createElement("option", { value: 75 }, "75% and above")
    ), /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" })), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: hiringRoundFilter,
        onChange: (e) => setHiringRoundFilter(e.target.value),
        className: `appearance-none pl-3 pr-7 py-2 bg-card border rounded-xl text-xs outline-none cursor-pointer transition-colors ${hiringRoundFilter ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary"}`
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Hiring Rounds"),
      /* @__PURE__ */ React.createElement("option", { value: "Screening" }, "Screening"),
      /* @__PURE__ */ React.createElement("option", { value: "Interviews" }, "Interviews"),
      /* @__PURE__ */ React.createElement("option", { value: "Final" }, "Final Stage"),
      /* @__PURE__ */ React.createElement("option", { value: "Closed" }, "Closed")
    ), /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" })), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedInternship ?? "",
        onChange: (e) => setSelectedInternship(e.target.value || null),
        className: `appearance-none pl-3 pr-7 py-2 bg-card border rounded-xl text-xs outline-none cursor-pointer transition-colors ${selectedInternship ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary"}`
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Job Posts"),
      companyJobs.map((job) => /* @__PURE__ */ React.createElement("option", { key: job.id, value: job.title }, job.title))
    ), /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" })), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: stageFilter,
        onChange: (e) => setStageFilter(e.target.value),
        className: `appearance-none pl-3 pr-7 py-2 bg-card border rounded-xl text-xs outline-none cursor-pointer transition-colors ${stageFilter ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary"}`
      },
       React.createElement("option", { value: "" }, "Stages"),
       React.createElement("option", null, "Applied"),
       React.createElement("option", null, "Review"),
       React.createElement("option", null, "Shortlisted"),
       React.createElement("option", null, "Interview Scheduled"),
       React.createElement("option", null, "Hired"),
       React.createElement("option", null, "Rejected")
    ), React.createElement(ChevronDown, { className: "w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" }))), selectedInternship && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl" }, /* @__PURE__ */ React.createElement(Briefcase, { className: "w-3.5 h-3.5 text-primary flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-primary font-medium" }, selectedInternship), /* @__PURE__ */ React.createElement("span", { className: "ml-auto text-xs text-muted-foreground" }, visibleApplicants.length, " result", visibleApplicants.length !== 1 ? "s" : "")), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-[2fr_1fr_1.5fr_1fr_80px_64px] gap-3 px-5 py-3 border-b border-border bg-background min-w-[760px] rounded-t-xl" }, ["APPLICANT", "RESUME SCORE", "JOB POSTS", "STAGES", "RESUME", "ACTION"].map((col) => /* @__PURE__ */ React.createElement("span", { key: col, className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide" }, col))), visibleApplicants.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-6 text-center" }, /* @__PURE__ */ React.createElement(Users, { className: "w-8 h-8 text-muted-foreground mx-auto mb-2" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-1" }, "No applicants yet"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, "No one has applied to this internship so far.")) : /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border min-w-[760px]" }, visibleApplicants.map((applicant, i) => {
      const score = resumeScores[applicant.id];
      const currentStatus = applicantStatuses[applicant.name] ?? applicant.status;
      const setStatus = (s) => updateCandidateStatus(applicant.name, applicant.internship, s);
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "grid grid-cols-[2fr_1fr_1.5fr_1fr_80px_64px] gap-3 px-5 py-3.5 items-center hover:bg-background/60 transition-colors" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-medium flex-shrink-0" }, applicant.name[0]), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground truncate" }, applicant.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground truncate" }, applicant.course))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-1.5 bg-border rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "h-full bg-primary rounded-full", style: { width: score == null ? "0%" : `${score}%` } })), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-foreground font-medium w-7 text-right flex-shrink-0" }, score == null ? "N/A" : score, score == null ? "" : "%")), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-foreground truncate" }, applicant.internship.replace(" Intern", "")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, applicant.applied)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: `inline-flex px-2 py-0.5 rounded border text-[10px] font-medium whitespace-nowrap ${stageColors[currentStatus] ?? "bg-secondary text-foreground border-border"}` }, currentStatus)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => openApplicantResume(applicant),
          className: "flex items-center gap-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-[10px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
        },
        /* @__PURE__ */ React.createElement(Eye, { className: "w-3 h-3 flex-shrink-0" }),
        " View"
      )), /* @__PURE__ */ React.createElement("div", { className: "relative flex justify-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (event) => { const rect = event.currentTarget.getBoundingClientRect(); const spaceAbove = rect.top - 12; const spaceBelow = window.innerHeight - rect.bottom - 12; const openAbove = spaceAbove > spaceBelow; const maxHeight = Math.max(64, Math.min(272, openAbove ? spaceAbove : spaceBelow)); const top = openAbove ? Math.max(8, rect.top - maxHeight - 6) : Math.min(window.innerHeight - maxHeight - 8, rect.bottom + 6); setApplicantActionMenu({ index: i, right: Math.max(8, window.innerWidth - rect.right), top, maxHeight }); },
          className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors"
        },
        /* @__PURE__ */ React.createElement(MoreVertical, { className: "w-4 h-4" })
      ), applicantActionMenu?.index === i && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ createPortal(React.createElement("div", { className: "fixed inset-0 z-40", onClick: () => setApplicantActionMenu(null) }), document.body), /* @__PURE__ */ createPortal(React.createElement("div", { className: "fixed z-50 bg-card border border-border rounded-xl shadow-lg py-1 w-44 max-w-[calc(100vw-16px)] overflow-y-auto", style: { right: applicantActionMenu.right, top: applicantActionMenu.top, maxHeight: applicantActionMenu.maxHeight } }, [
        { label: "Review", icon: FileText, status: "Review", color: "text-amber-600" },
        { label: "Schedule Interview", icon: Calendar, status: "Interview Scheduled", color: "text-violet-600" },
        { label: "Shortlist", icon: CheckCircle, status: "Shortlisted", color: "text-emerald-600" },
        { label: "Hire", icon: Award, status: "Hired", color: "text-blue-600" },
        { label: "Reject", icon: X, status: "Rejected", color: "text-red-600" },
        { label: "Message", icon: MessageSquare, color: "text-primary" },
        { label: "Remove", icon: Trash2, color: "text-red-600" }
      ].map((item) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: item.label,
          onClick: () => {
            if (item.label === "Message") {
              openApplicantChat(applicant);
            } else if (item.label === "Remove") {
              if (window.confirm("Are you sure you want to remove this applicant?")) {
                api.deleteApplication(applicant.id).then(() => {
                  setCompanyApplicants((prev) => prev.filter((a) => a.id !== applicant.id));
                  toast.success("Applicant removed successfully.");
                }).catch((err) => {
                  toast.error(err.message || "Failed to remove applicant.");
                });
              }
            } else {
              setStatus(item.status);
            }
            setApplicantActionMenu(null);
          },
          className: `w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-background transition-colors ${item.color}`
        },
        /* @__PURE__ */ React.createElement(item.icon, { className: "w-3.5 h-3.5 flex-shrink-0" }),
        item.label
      )))))));
    })))));
  })(), section === "manage" && /* @__PURE__ */ React.createElement(ManageInternships, { companyJobs, setCompanyJobs, setSection, setSelectedInternship, onEditInternship: startEditInternship }), section === "company-profile" && /* @__PURE__ */ React.createElement("div", null, cropSrc && /* @__PURE__ */ React.createElement(
    ImageCropModal,
    {
      imageSrc: cropSrc,
      shape: "circle",
      onSave: (url) => {
        setCropSrc(null);
        persistCompanyMedia("logo", url);
      },
      onCancel: () => setCropSrc(null)
    }
  ), /* @__PURE__ */ React.createElement("input", { ref: logoInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setCropSrc(URL.createObjectURL(f));
      e.target.value = "";
    }
  } }), /* @__PURE__ */ React.createElement("input", { ref: coverInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/") && f.size <= 1_500_000) {
      const reader = new FileReader();
      reader.onload = () => persistCompanyMedia("cover", reader.result);
      reader.readAsDataURL(f);
    }
  } }), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "h-32 sm:h-48 relative group cursor-pointer bg-gradient-to-r from-slate-200 to-slate-100", onClick: () => coverInputRef.current?.click() }, companyCoverUrl && /* @__PURE__ */ React.createElement("img", { src: companyCoverUrl, alt: "Company cover", className: "w-full h-full object-cover" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm" }, /* @__PURE__ */ React.createElement(Camera, { className: "w-4 h-4" }), "Change Cover"))), /* @__PURE__ */ React.createElement("div", { className: "px-6 pb-6 relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute -top-12 sm:-top-16 left-6" }, /* @__PURE__ */ React.createElement("div", { className: "relative group w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 cursor-pointer", onClick: () => logoInputRef.current?.click() }, /* @__PURE__ */ React.createElement("div", { className: "w-full h-full rounded border-4 border-white shadow-sm overflow-hidden bg-[#0a66c2] flex items-center justify-center" }, logoUrl ? /* @__PURE__ */ React.createElement("img", { src: logoUrl, alt: "Logo", className: "w-full h-full object-cover" }) : /* @__PURE__ */ React.createElement("span", { className: "text-white text-3xl font-bold" }, companyData.name.charAt(0).toUpperCase())), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    logoInputRef.current?.click();
  }, className: "absolute -bottom-1.5 -right-1.5 bg-[#0a66c2] text-white rounded p-1.5 shadow border-2 border-white hover:bg-[#004182] transition-colors" }, /* @__PURE__ */ React.createElement(Camera, { className: "w-3 h-3" })))), /* @__PURE__ */ React.createElement("div", { className: "pt-16 sm:pt-20" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-semibold text-foreground" }, companyData.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mt-0.5" }, companyData.tagline), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-0.5" }, companyData.industry, " \u2022 ", companyData.location, ""), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1.5" }, `${resolvedRecruiterDesignation}: `, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-foreground" }, resolvedRecruiterName)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mt-4" }, /* @__PURE__ */ null, companyData.website && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: companyData.website.startsWith("http") ? companyData.website : `https://${companyData.website}`,
      target: "_blank",
      rel: "noreferrer",
      className: "flex items-center gap-1.5 px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-full font-semibold text-sm transition-colors"
    },
    "Visit website ",
    /* @__PURE__ */ React.createElement(ExternalLink, { className: "w-3.5 h-3.5" })
  ), /* @__PURE__ */ React.createElement("button", { onClick: () => openCpModal("basic"), className: "w-9 h-9 border border-black/60 rounded-full flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 hover:border-black transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))))))), /* @__PURE__ */ React.createElement("div", { className: "px-6 border-t border-border flex items-center gap-6 overflow-x-auto" }, ["Home", "About", "Posts", "Jobs", "Life"].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab,
      onClick: () => setActiveProfileTab(tab),
      className: `py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${activeProfileTab === tab ? "border-[#0a66c2] text-[#0a66c2]" : "border-transparent text-muted-foreground hover:text-foreground"}`
    },
    tab
  )))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 space-y-5" }, (activeProfileTab === "Home" || activeProfileTab === "About") && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-foreground" }, "About"), /* @__PURE__ */ React.createElement("button", { onClick: () => openCpModal("about"), className: "p-1 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-6" }, companyData.description), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, companyData.website && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground mb-0.5" }, "Website"), /* @__PURE__ */ React.createElement("a", { href: companyData.website.startsWith("http") ? companyData.website : `https://${companyData.website}`, className: "text-sm text-[#0a66c2] hover:underline", target: "_blank", rel: "noreferrer" }, companyData.website)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground mb-0.5" }, "Industry"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, companyData.industry)), companyData.size && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground mb-0.5" }, "Company size"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, companyData.size)), companyData.location && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground mb-0.5" }, "Headquarters"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, companyData.location)), companyData.founded && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground mb-0.5" }, "Founded"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, companyData.founded)))), (activeProfileTab === "Home" || activeProfileTab === "Life") && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-foreground" }, "Perks & Benefits"), /* @__PURE__ */ React.createElement("button", { onClick: () => openCpModal("perks"), className: "p-1 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, companyData.perks.split(",").map((p) => p.trim()).filter(Boolean).map((perk) => /* @__PURE__ */ React.createElement("span", { key: perk, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#f3f2ef] border border-border text-foreground rounded-full text-sm font-medium" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-4 h-4 text-amber-500" }), perk)))), (activeProfileTab === "Home" || activeProfileTab === "Jobs") && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6 space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-foreground mb-4" }, "Hiring Departments"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, (companyData.departments || ["Engineering / Technology", "Data & Analytics"]).map((dept) => /* @__PURE__ */ React.createElement("span", { key: dept, className: "px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium" }, dept)))), companyData.internshipType && companyData.internshipType.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2" }, "Preferred Work Modes"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, companyData.internshipType.map((mode) => /* @__PURE__ */ React.createElement("span", { key: mode, className: "px-2.5 py-1 bg-background border border-border text-foreground rounded-md text-xs font-medium" }, mode))))), (activeProfileTab === "Home" || activeProfileTab === "Jobs") && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-foreground" }, "Open Internship Positions"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-0.5" }, "Active opportunities available at ", companyData.name)), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSection("post"),
      className: "px-4 py-1.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " Post Job"
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 pt-1" }, companyJobs.filter((r) => r.status !== "Closed").map((job, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "p-4 bg-background border border-border rounded-xl hover:border-primary/40 transition-colors space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-[#00BFEA]" }, job.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, job.dept, " \u2022 ", job.location, " \u2022 ", /* @__PURE__ */ React.createElement("span", { className: "text-primary font-medium" }, job.mode)))), job.skills && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 pt-1" }, job.skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => /* @__PURE__ */ React.createElement("span", { key: skill, className: "px-2 py-0.5 bg-card border border-border rounded text-[10px] text-muted-foreground font-medium" }, skill))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground" }, /* @__PURE__ */ React.createElement("span", null, job.applicants, " applicants \u2022 Posted ", job.ago), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSelectedInternship(job.title);
        setSection("applicants");
      },
      className: "text-primary font-semibold hover:underline"
    },
    "View Applicants \u2192"
  )))))), (activeProfileTab === "Home" || activeProfileTab === "Posts") && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-foreground" }, "Company Posts & Updates"), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-muted-foreground" }, companyUpdates.length, " updates")), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-background border border-border rounded-xl space-y-2" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: 2,
      placeholder: `Share an update or hiring announcement from ${companyData.name}\u2026`,
      value: newUpdateText,
      onChange: (e) => setNewUpdateText(e.target.value),
      className: "w-full bg-transparent text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        if (!newUpdateText.trim()) return;
        const update = { id: Date.now(), author: companyData.name, createdAt: new Date().toISOString(), text: newUpdateText.trim(), likes: 0 };
        const next = [update, ...companyUpdates];
        setCompanyUpdates(next);
        await persistCompanyData({ updates: next });
        setNewUpdateText("");
      },
      className: "px-5 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition-colors cursor-pointer"
    },   
    "Publish Update"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, companyUpdates.map((update) => /* @__PURE__ */ React.createElement("div", { key: update.id, className: "p-4 bg-background border border-border rounded-xl space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs" }, update.author[0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-foreground" }, update.author), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground" }, update.createdAt ? new Date(update.createdAt).toLocaleString() : "", " \u2022 Company Announcement"))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-foreground leading-relaxed pt-1" }, update.text), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 pt-2 border-t border-border/60 text-xs text-muted-foreground" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        const next = companyUpdates.map((u) => u.id === update.id ? { ...u, likes: (u.likes || 0) + 1 } : u);
        setCompanyUpdates(next);
        await persistCompanyData({ updates: next });
      },
      className: "flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(Star, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", null, update.likes, " Likes")
  ), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1 cursor-pointer hover:text-black" }, /* @__PURE__ */ React.createElement(Share2, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ React.createElement("span", null, "Share")))))))), activeProfileTab === "Home" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-semibold text-foreground mb-4" }, "Company Overview"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, [
    { label: "Industry", value: companyData.industry, icon: Briefcase },
    { label: "Company Size", value: companyData.size, icon: Users },
    { label: "Founded", value: companyData.founded, icon: Calendar },
    { label: "Location", value: companyData.location, icon: MapPin }
  ].map((item) => /* @__PURE__ */ React.createElement("div", { key: item.label, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(item.icon, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground" }, item.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-foreground font-medium" }, item.value)))))), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-semibold text-foreground mb-4" }, "Hiring Stats"), [["Open Roles", companyJobs.filter((job) => job.status === "Active").length], ["Total Applicants", companyApplicants.length]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, className: "flex justify-between items-center py-2.5 border-b border-border last:border-0 last:pb-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted-foreground" }, l), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-[#0a66c2]" }, v)))))), cpModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base text-foreground" }, cpModal === "basic" && "Edit Company Details", cpModal === "about" && "Edit About", cpModal === "perks" && "Edit Perks & Benefits"), /* @__PURE__ */ React.createElement("button", { onClick: () => setCpModal(null), className: "p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" }))), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto flex-1 px-6 py-5 space-y-4", style: { scrollbarWidth: "none" } }, cpModal === "basic" && /* @__PURE__ */ React.createElement(React.Fragment, null, [["name", "Company Name"], ["tagline", "Tagline"], ["industry", "Industry"], ["size", "Company Size", "e.g. 1,000\u20135,000 employees"], ["founded", "Founded Year", "e.g. 1981"], ["location", "Headquarters Location"], ["website", "Website", "companyname.com"], ["linkedin", "LinkedIn URL", "linkedin.com/company/name"]].map(([key, label, placeholder]) => /* @__PURE__ */ React.createElement("div", { key }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs text-muted-foreground mb-1.5" }, label), /* @__PURE__ */ React.createElement("input", { value: cpDraft[key] || "", onChange: (e) => setCpDraft((d) => ({ ...d, [key]: e.target.value })), placeholder, className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" })))), cpModal === "about" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs text-muted-foreground mb-1.5" }, "Company Description"), /* @__PURE__ */ React.createElement("textarea", { rows: 6, value: cpDraft.description || "", onChange: (e) => setCpDraft((d) => ({ ...d, description: e.target.value })), className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none" })), cpModal === "perks" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs text-muted-foreground mb-1.5" }, "Perks & Benefits (comma separated)"), /* @__PURE__ */ React.createElement("textarea", { rows: 4, value: cpDraft.perks || "", onChange: (e) => setCpDraft((d) => ({ ...d, perks: e.target.value })), placeholder: "Health Insurance, Stock Options, Free Meals...", className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none" }))), /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 border-t border-border flex gap-3 flex-shrink-0" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setCpModal(null), className: "flex-1 py-2.5 border border-border rounded-xl text-sm text-foreground hover:border-primary hover:text-primary transition-colors" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: saveCpModal, className: "flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" }), "Save"))))), section === "messages" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Messages"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, "Communicate with applicants and candidates")), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden flex h-[520px]" }, /* @__PURE__ */ React.createElement("div", { className: "w-full sm:w-72 border-r border-border flex flex-col flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 border-b border-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 px-3 py-2 bg-background rounded-xl" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 text-muted-foreground" }), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "Search messages\u2026", className: "bg-transparent text-sm outline-none w-full" }))), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto flex-1", style: { scrollbarWidth: "none" } }, companyApplicants.map((c, i) => {
    const chats = candidateChats[String(c.id)] || [];
    const lastMsg = chats.length > 0 ? chats[chats.length - 1].msg : "No messages yet";
    const isSelected = activeMessageCandidate === String(c.id);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        onClick: () => { setActiveMessageCandidate(String(c.id)); loadApplicantMessages(String(c.id)); },
        className: `flex items-start gap-3 p-3 cursor-pointer border-b border-border transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-background"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0" }, c.name[0]),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground truncate" }, c.name), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-muted-foreground flex-shrink-0 ml-1" }, c.time)), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground" }, c.role), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground truncate mt-0.5" }, lastMsg)),
      c.unread > 0 && /* @__PURE__ */ React.createElement("span", { className: "w-4 h-4 bg-primary rounded-full text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-1" }, c.unread)
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "hidden sm:flex flex-1 flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 px-5 py-3.5 border-b border-border" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium" }, (companyApplicants.find((app) => String(app.id) === activeMessageCandidate)?.name || "?")[0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, companyApplicants.find((app) => String(app.id) === activeMessageCandidate)?.name || "Select an applicant"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, "Applicant \u2022 ", ""))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-5 space-y-4", style: { scrollbarWidth: "none" } }, (candidateChats[String(activeMessageCandidate)] || []).map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `flex ${m.from === "me" ? "justify-end" : "justify-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `max-w-xs px-4 py-2.5 rounded-2xl text-sm ${m.from === "me" ? "bg-primary text-white rounded-br-sm" : "bg-background text-foreground rounded-bl-sm"}` }, /* @__PURE__ */ React.createElement("p", null, m.msg), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}` }, m.time))))), /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-border" }, /* @__PURE__ */ React.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        sendMessageToCandidate(activeMessageCandidate, fullChatMsgText);
        setFullChatMsgText("");
      },
      className: "flex items-center gap-3 px-4 py-2.5 bg-background rounded-xl border border-border focus-within:border-primary transition-colors"
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Type a message\u2026",
        value: fullChatMsgText,
        onChange: (e) => setFullChatMsgText(e.target.value),
        className: "flex-1 bg-transparent text-sm outline-none"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary/90 transition-colors"
      },
      /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-4 h-4 text-white" })
    )
  ))))), section === "interviews" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Interviews"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage and track all candidate interviews")), /* @__PURE__ */ React.createElement("button", { className: "flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }), "Schedule Interview")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" }, companyApplicants.filter((applicant) => applicant.status === "Interview Scheduled").map((interview) => ({ label: interview.name, value: interview.applied || "", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" })).map((s) => /* @__PURE__ */ React.createElement("div", { key: s.label, className: "bg-card border border-border rounded-xl p-4 flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: `w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0` }, /* @__PURE__ */ React.createElement(s.icon, { className: `w-5 h-5 ${s.color}` })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xl font-medium text-foreground" }, s.value), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, s.label))))), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-border flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-medium text-foreground" }, "Upcoming Interviews"), /* @__PURE__ */ React.createElement("select", { className: "px-3 py-1.5 border border-border rounded-lg text-xs bg-card outline-none cursor-pointer" }, /* @__PURE__ */ React.createElement("option", null, "All Rounds"), /* @__PURE__ */ React.createElement("option", null, "Technical"), /* @__PURE__ */ React.createElement("option", null, "HR"), /* @__PURE__ */ React.createElement("option", null, "Managerial"))), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border" }, companyApplicants.filter((applicant) => applicant.status === "Interview Scheduled").map((iv, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "p-4 sm:p-5 hover:bg-background/50 transition-colors" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-medium flex-shrink-0" }, iv.name[0]), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 mb-0.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, iv.name), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-medium ${iv.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}` }, iv.status)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, iv.college, " � ", iv.internship), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Calendar, { className: "w-3 h-3" }), iv.applied))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 sm:flex-col lg:flex-row" }, /* @__PURE__ */ React.createElement("button", { className: "flex-1 sm:flex-none px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-colors" }, "Reschedule"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        const applicant = companyApplicants.find((row) => row.name === iv.name);
        if (applicant) openApplicantChat(applicant);
      },
      className: "flex-1 sm:flex-none px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-3 h-3" }),
  )))))))), section === "analytics" && (() => {
    const totalApps = companyApplicants.length;
    const activeJobsCount = companyJobs.filter((job) => job.status === "Active").length;
    const interviewCount = companyApplicants.filter((app) => app.status === "Interview Scheduled").length;
    const hiredCount = companyApplicants.filter((app) => ["Hired", "Offer Received", "Shortlisted"].includes(app.status)).length;
    const kpis = [
      { label: "Active Listings", value: activeJobsCount, icon: Briefcase, color: "text-blue-600", change: activeJobsCount > 0 ? "+100%" : "0%", bg: "bg-blue-50" },
      { label: "Total Applications", value: totalApps, icon: FileText, color: "text-violet-600", change: totalApps > 0 ? `+${totalApps}` : "0", bg: "bg-violet-50" },
      { label: "Interviews Scheduled", value: interviewCount, icon: Calendar, color: "text-amber-600", change: interviewCount > 0 ? `+${interviewCount}` : "0", bg: "bg-amber-50" },
      { label: "Shortlisted / Offers", value: hiredCount, icon: CheckCircle, color: "text-emerald-600", change: hiredCount > 0 ? `+${hiredCount}` : "0", bg: "bg-emerald-50" }
    ];
    const funnelStages = [
      { stage: "Applied", count: totalApps, pct: 100, color: "bg-blue-500" },
      { stage: "Under Review", count: companyApplicants.filter((a) => ["Review", "Under Review", "Applied"].includes(a.status)).length, pct: totalApps ? Math.round((companyApplicants.filter((a) => ["Review", "Under Review", "Applied"].includes(a.status)).length / totalApps) * 100) : 0, color: "bg-amber-500" },
      { stage: "Interview Scheduled", count: interviewCount, pct: totalApps ? Math.round((interviewCount / totalApps) * 100) : 0, color: "bg-violet-500" },
      { stage: "Selected / Hired", count: hiredCount, pct: totalApps ? Math.round((hiredCount / totalApps) * 100) : 0, color: "bg-emerald-500" }
    ];
    const topListings = companyJobs.slice(0, 5).map((job) => {
      const apps = job.applicants || 0;
      const views = apps > 0 ? apps * 3 + 4 : 0;
      const conv = views > 0 ? `${Math.min(100, Math.round((apps / views) * 100))}%` : "0%";
      return {
        title: job.title,
        apps,
        views,
        conv,
        trend: apps > 0 ? "+10%" : "0%"
      };
    });
    const timeBuckets = [
      { label: "Week 1", val: totalApps > 0 ? Math.floor(totalApps * 0.2) : 0 },
      { label: "Week 2", val: totalApps > 0 ? Math.floor(totalApps * 0.35) : 0 },
      { label: "Week 3", val: totalApps > 0 ? Math.floor(totalApps * 0.6) : 0 },
      { label: "Week 4", val: totalApps }
    ];
    const maxVal = Math.max(...timeBuckets.map((t) => t.val), 1);
    return React.createElement("div", null,
      React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0" },
        React.createElement("div", null,
          React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Analytics"),
          React.createElement("p", { className: "text-sm text-muted-foreground" }, "Track your hiring performance and insights")
        ),
        React.createElement("select", { className: "px-4 py-2 border border-border rounded-xl text-sm bg-card outline-none cursor-pointer w-full sm:w-auto" },
          React.createElement("option", null, "Last 30 Days"),
          React.createElement("option", null, "Last 3 Months"),
          React.createElement("option", null, "This Year")
        )
      ),
      React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-5xl" },
        kpis.map((k) =>
          React.createElement("div", { key: k.label, className: "bg-card border border-border rounded-xl px-4 py-3" },
            React.createElement("div", { className: "flex items-center justify-between mb-2" },
              React.createElement("div", { className: `w-9 h-9 ${k.bg} rounded-lg flex items-center justify-center` },
                React.createElement(k.icon, { className: `w-4 h-4 ${k.color}` })
              ),
              React.createElement("span", { className: "text-xs text-emerald-600 font-semibold" }, k.change)
            ),
            React.createElement("p", { className: "text-2xl font-bold text-foreground" }, k.value),
            React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5 font-medium" }, k.label)
          )
        )
      ),
      React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5" },
        React.createElement("div", { className: "lg:col-span-2 bg-card border border-border rounded-xl p-5" },
          React.createElement("h2", { className: "text-sm font-semibold text-foreground mb-4" }, "Applications Over Time"),
          React.createElement("div", { className: "flex items-end gap-4 h-40 pt-4" },
            timeBuckets.map((item, i) =>
              React.createElement("div", { key: i, className: "flex-1 flex flex-col items-center gap-1.5 h-full justify-end" },
                React.createElement("div", {
                  className: "w-full bg-primary/80 hover:bg-primary rounded-t-md transition-colors cursor-pointer",
                  style: { height: `${Math.max(15, (item.val / maxVal) * 100)}%` }
                }),
                React.createElement("span", { className: "text-[11px] text-muted-foreground font-medium" }, item.label)
              )
            )
          )
        ),
        React.createElement("div", { className: "bg-card border border-border rounded-xl p-5" },
          React.createElement("h2", { className: "text-sm font-semibold text-foreground mb-4" }, "Hiring Funnel"),
          React.createElement("div", { className: "space-y-3" },
            funnelStages.map((f) =>
              React.createElement("div", { key: f.stage },
                React.createElement("div", { className: "flex justify-between text-xs mb-1" },
                  React.createElement("span", { className: "text-muted-foreground" }, f.stage),
                  React.createElement("span", { className: "text-foreground font-semibold" }, f.count)
                ),
                React.createElement("div", { className: "h-1.5 bg-border rounded-full overflow-hidden" },
                  React.createElement("div", { className: `h-full ${f.color} rounded-full`, style: { width: `${Math.max(f.count > 0 ? 10 : 0, f.pct)}%` } })
                )
              )
            )
          )
        )
      ),
      React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" },
        React.createElement("div", { className: "p-4 border-b border-border" },
          React.createElement("h2", { className: "text-sm font-semibold text-foreground" }, "Top Performing Listings")
        ),
        topListings.length === 0
          ? React.createElement("p", { className: "p-6 text-center text-xs text-muted-foreground" }, "No job listings posted yet.")
          : React.createElement("div", { className: "divide-y divide-border" },
              topListings.map((l, i) =>
                React.createElement("div", { key: i, className: "flex items-center gap-4 p-4 hover:bg-background/50 transition-colors" },
                  React.createElement("span", { className: "text-sm text-muted-foreground w-5 font-semibold" }, i + 1),
                  React.createElement("div", { className: "flex-1" },
                    React.createElement("p", { className: "text-sm font-semibold text-foreground" }, l.title),
                    React.createElement("div", { className: "flex items-center gap-3 mt-0.5 text-xs text-muted-foreground" },
                      React.createElement(FileText, { className: "w-3 h-3" }),
                      l.apps, " apps \u2022 ",
                      React.createElement(Eye, { className: "w-3 h-3" }),
                      l.views, " views \u2022 ",
                      l.conv, " conv."
                    )
                  ),
                  React.createElement("span", { className: "text-xs font-semibold text-emerald-600" }, l.trend)
                )
              )
            )
      )
    );
  })(), section === "settings" && (() => {
    const settingsNav = [
      { id: "account", icon: User, label: "Account preferences", desc: "Name, email, language, profile visibility" },
      { id: "security", icon: Shield, label: "Sign in & security", desc: "Password, two-factor auth, active sessions" },
      { id: "notifications", icon: Bell, label: "Notifications", desc: "Email, push and in-app notification controls" },
      { id: "billing", icon: DollarSign, label: "Subscription & billing", desc: "Plan details, invoices and payment method" },
      { id: "team", icon: Users, label: "Team & permissions", desc: "Members, roles and access management" },
      { id: "privacy", icon: Eye, label: "Data & privacy", desc: "Export data, delete account, privacy controls" }
    ];
    const Toggle = ({ on, onToggle }) => /* @__PURE__ */ React.createElement("button", { onClick: onToggle, className: `relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${on ? "bg-primary" : "bg-border"}` }, /* @__PURE__ */ React.createElement("span", { className: `absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "left-4" : "left-0.5"}` }));
    return /* @__PURE__ */ React.createElement("div", null, showUpgrade && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-medium text-foreground" }, "Upgrade Plan"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowUpgrade(false) }, /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4 text-muted-foreground" }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mb-5" }, [
      { name: "Pro", price: "\u20B94,999/mo", features: ["10 Listings", "Unlimited Applicants", "Analytics"], current: true },
      { name: "Business", price: "\u20B99,999/mo", features: ["50 Listings", "Priority Support", "Custom Branding", "API Access"], current: false },
      { name: "Enterprise", price: "Custom", features: ["Unlimited Listings", "Dedicated Manager", "SLA"], current: false }
    ].map((plan) => /* @__PURE__ */ React.createElement("div", { key: plan.name, className: `p-4 border rounded-xl ${plan.current ? "border-primary bg-primary/5" : "border-border hover:border-primary cursor-pointer transition-colors"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-foreground" }, plan.name), plan.current ? /* @__PURE__ */ React.createElement("span", { className: "text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full" }, "Current") : /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-foreground" }, plan.price)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1" }, plan.features.map((f) => /* @__PURE__ */ React.createElement("span", { key: f, className: "text-[10px] text-muted-foreground" }, f, " \xB7"))), !plan.current && /* @__PURE__ */ React.createElement("button", { className: "mt-3 w-full py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors" }, "Select ", plan.name)))), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowUpgrade(false), className: "w-full py-2 border border-border rounded-xl text-sm text-muted-foreground hover:border-primary transition-colors" }, "Cancel"))), confirmDanger && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-medium text-foreground mb-2" }, confirmDanger === "close" ? "Close Account" : "Delete Account"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mb-5" }, confirmDanger === "close" ? "Your account will be deactivated. You can reactivate it at any time by logging back in." : "This will permanently delete all your data including job postings, applicants and messages. This cannot be undone."), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setConfirmDanger(null), className: "flex-1 py-2 border border-border rounded-xl text-sm text-foreground hover:border-primary transition-colors" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: () => setConfirmDanger(null), className: "flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors" }, confirmDanger === "close" ? "Close Account" : "Delete Forever")))), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-medium text-foreground" }, "Settings"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage your account, security and preferences")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-5 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-64 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-3 border-b border-border" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-medium" }, "Settings")), settingsNav.map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: item.id,
        onClick: () => setSettingsTab(item.id),
        className: `w-full flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 text-left transition-colors ${settingsTab === item.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-background"}`
      },
      /* @__PURE__ */ React.createElement(item.icon, { className: `w-4 h-4 flex-shrink-0 ${settingsTab === item.id ? "text-primary" : "text-muted-foreground"}` }),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: `text-sm font-medium truncate ${settingsTab === item.id ? "text-primary" : "text-foreground"}` }, item.label), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground truncate hidden md:block" }, item.desc)),
      /* @__PURE__ */ React.createElement(ChevronRight, { className: `w-3.5 h-3.5 flex-shrink-0 ${settingsTab === item.id ? "text-primary" : "text-muted-foreground"}` })
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, settingsTab === "account" && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Account preferences"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Manage your personal details and preferences")), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border" }, [
      { label: "Full Name", sub: "Your display name across the platform" },
      { label: "Work Email", sub: "Used for login and notifications" },
      { label: "Job Title", sub: "Your role at the company" },
      { label: "Phone Number", sub: "Used for interview coordination" },
      { label: "Language", sub: "Platform display language" }
    ].map((f) => /* @__PURE__ */ React.createElement("div", { key: f.label, className: "px-5 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0 mr-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, f.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, f.sub)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, accountEditing !== f.label && /* @__PURE__ */ React.createElement("span", { className: "text-sm text-muted-foreground text-right truncate max-w-[140px]" }, accountFields[f.label]), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (accountEditing === f.label) {
            setAccountFields((prev) => ({ ...prev, [f.label]: accountDraft }));
            setAccountEditing(null);
          } else {
            setAccountEditing(f.label);
            setAccountDraft(accountFields[f.label]);
          }
        },
        className: "text-primary text-xs font-medium whitespace-nowrap px-2.5 py-1 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
      },
      accountEditing === f.label ? "Save" : "Edit"
    ), accountEditing === f.label && /* @__PURE__ */ React.createElement("button", { onClick: () => setAccountEditing(null), className: "text-xs text-muted-foreground hover:text-foreground" }, "Cancel"))), accountEditing === f.label && /* @__PURE__ */ React.createElement(
      "input",
      {
        autoFocus: true,
        type: "text",
        value: accountDraft,
        onChange: (e) => setAccountDraft(e.target.value),
        className: "mt-3 w-full px-3 py-2 bg-background border border-primary rounded-xl text-sm outline-none"
      }
    ))))), settingsTab === "security" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Sign in & security"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Keep your account safe and secure")), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Password"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Last changed 3 months ago")), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setShowPwdForm((p) => !p);
      setPwdSaved(false);
      setPwdFields({ current: "", next: "", confirm: "" });
    }, className: "text-primary text-xs font-medium px-2.5 py-1 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors" }, showPwdForm ? "Cancel" : "Change")), showPwdForm && /* @__PURE__ */ React.createElement("div", { className: "mt-3 space-y-2.5" }, /* @__PURE__ */ React.createElement("input", { type: "password", placeholder: "Current password", value: pwdFields.current, onChange: (e) => setPwdFields((p) => ({ ...p, current: e.target.value })), className: "w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary" }), /* @__PURE__ */ React.createElement("input", { type: "password", placeholder: "New password", value: pwdFields.next, onChange: (e) => setPwdFields((p) => ({ ...p, next: e.target.value })), className: "w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary" }), /* @__PURE__ */ React.createElement("input", { type: "password", placeholder: "Confirm new password", value: pwdFields.confirm, onChange: (e) => setPwdFields((p) => ({ ...p, confirm: e.target.value })), className: "w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary" }), pwdSaved && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-emerald-600 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(CheckCircle, { className: "w-3 h-3" }), "Password updated successfully"), /* @__PURE__ */ React.createElement("button", { onClick: updatePassword, className: "px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" }, "Update Password"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Two-factor authentication"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Two-factor authentication is not available on this server.")), /* @__PURE__ */ React.createElement("button", { onClick: () => toast.info("Two-factor authentication is not available on this server."), className: `text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${twoFaEnabled ? "border-red-200 text-red-500 hover:bg-red-50" : "border-border text-foreground hover:border-primary hover:text-primary"}` }, "Unavailable")), /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Active sessions"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Devices currently signed into your account")), sessions.filter((s) => !s.current).length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: revokeOtherSessions, className: "text-xs text-red-500 hover:underline" }, "Sign out all")), sessions.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center justify-between py-2.5 border-b border-border last:border-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(Monitor, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-foreground" }, s.device, s.current && /* @__PURE__ */ React.createElement("span", { className: "ml-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px]" }, "Current")), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground" }, s.time))), !s.current && /* @__PURE__ */ React.createElement("button", { onClick: () => revokeSession(s.id), className: "text-xs text-red-500 hover:underline" }, "Sign out"))))))), settingsTab === "notifications" && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Notifications"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Choose what updates you want to receive")), [
      { group: "Applications", items: ["New application received", "Application status change"] },
      { group: "Interviews", items: ["Interview scheduled", "Interview reminder", "Interview cancelled"] },
      { group: "Messages", items: ["New message"] },
      { group: "Reports & Updates", items: ["Weekly hiring report", "Platform updates"] }
    ].map((group) => /* @__PURE__ */ React.createElement("div", { key: group.group }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-2.5 bg-background border-b border-border flex items-center gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-medium" }, group.group), /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-border" }), /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 pr-1" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground w-8 text-center" }, "Email"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground w-8 text-center" }, "Push"))), group.items.map((label) => {
      const n = notifSettings[label] ?? { email: false, push: false };
      const descs = {
        "New application received": "When a candidate applies to your listing",
        "Application status change": "Shortlist, reject or offer updates",
        "Interview scheduled": "Confirmation when an interview is booked",
        "Interview reminder": "15 minutes before interview start",
        "Interview cancelled": "When a candidate or interviewer cancels",
        "New message": "When a candidate sends you a message",
        "Weekly hiring report": "Summary of activity every Monday",
        "Platform updates": "New features and announcements"
      };
      return /* @__PURE__ */ React.createElement("div", { key: label, className: "flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0 hover:bg-background/30 transition-colors" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 mr-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-foreground" }, label), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, descs[label])), /* @__PURE__ */ React.createElement("div", { className: "flex gap-6" }, /* @__PURE__ */ React.createElement(Toggle, { on: n.email, onToggle: () => saveCompanyNotification(label, "email") }), /* @__PURE__ */ React.createElement(Toggle, { on: n.push, onToggle: () => saveCompanyNotification(label, "push") })));
    })))), settingsTab === "billing" && React.createElement("div", { className: "bg-card border border-border rounded-xl p-6" }, React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Billing"), React.createElement("p", { className: "text-sm text-muted-foreground mt-2" }, "No billing account is connected.")), settingsTab === "team" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Team & permissions"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Manage who has access to your employer account")), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowInviteForm((p) => !p), className: "flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors" }, /* @__PURE__ */ React.createElement(Plus, { className: "w-3 h-3" }), showInviteForm ? "Cancel" : "Invite")), showInviteForm && /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 bg-background/50 border-b border-border" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-3" }, "Invite team member"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3" }, /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "Full name", value: inviteDraft.name, onChange: (e) => setInviteDraft((p) => ({ ...p, name: e.target.value })), className: "px-3 py-2 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }), /* @__PURE__ */ React.createElement("input", { type: "email", placeholder: "Work email", value: inviteDraft.email, onChange: (e) => setInviteDraft((p) => ({ ...p, email: e.target.value })), className: "px-3 py-2 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }), /* @__PURE__ */ React.createElement("select", { value: inviteDraft.role, onChange: (e) => setInviteDraft((p) => ({ ...p, role: e.target.value })), className: "px-3 py-2 border border-border rounded-xl text-sm outline-none focus:border-primary bg-card" }, /* @__PURE__ */ React.createElement("option", null, "Recruiter"))), /* @__PURE__ */ React.createElement("button", { onClick: addTeamMember, className: "px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" }, "Send Invite")), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border" }, teamMembers.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-4 px-5 py-4 hover:bg-background/50 transition-colors" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-medium flex-shrink-0" }, m.name[0]), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground truncate" }, m.name), m.you && /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 bg-background border border-border rounded text-[10px] text-muted-foreground" }, "You")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, m.email, " \xB7 Joined ", m.joined)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-shrink-0" }, /* @__PURE__ */ React.createElement("select", { value: m.role, onChange: (e) => changeTeamMemberRole(m.id, e.target.value), className: "px-2 py-1 border border-border rounded-lg text-xs bg-card outline-none cursor-pointer", disabled: m.you }, /* @__PURE__ */ React.createElement("option", null, "Owner"), /* @__PURE__ */ React.createElement("option", null, "Recruiter")), !m.you && /* @__PURE__ */ React.createElement("button", { onClick: () => removeTeamMember(m.id), className: "text-xs text-red-500 hover:underline" }, "Remove"))))))), settingsTab === "privacy" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-foreground" }, "Data & privacy"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Control your data and account visibility")), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 hover:bg-background/50 transition-colors" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Profile visibility"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Your company profile is visible to all candidates")), /* @__PURE__ */ React.createElement(Toggle, { on: companyPrivacy.profileVisible ?? true, onToggle: () => saveCompanyPrivacy("profileVisible") })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 hover:bg-background/50 transition-colors" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Data sharing"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Allow InternDesk to use anonymized data for improving recommendations")), /* @__PURE__ */ React.createElement(Toggle, { on: companyPrivacy.dataSharing ?? false, onToggle: () => saveCompanyPrivacy("dataSharing") })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 hover:bg-background/50 transition-colors" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Export your data"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Download all data associated with your account")), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      const a = document.createElement("a");
      const exportData = { company: companyData, internships: companyJobs, applicants: companyApplicants, teamMembers, preferences: { notifications: notifSettings, privacy: companyPrivacy } };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      a.download = "interndesk-company-export.json";
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    }, className: "flex items-center gap-1.5 text-primary text-xs font-medium px-2.5 py-1 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors" }, /* @__PURE__ */ React.createElement(Download, { className: "w-3 h-3" }), "Export")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 hover:bg-background/50 transition-colors" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Cookie preferences"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Manage how we use cookies on your account")), /* @__PURE__ */ React.createElement(Toggle, { on: companyPrivacy.cookies ?? true, onToggle: () => saveCompanyPrivacy("cookies") })))), /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-red-100 rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-red-100" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-medium text-red-600" }, "Danger zone")), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-red-50" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Close employer account"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Deactivate your account. You can reactivate any time.")), /* @__PURE__ */ React.createElement("button", { onClick: () => setConfirmDanger("close"), className: "px-3 py-1.5 border border-border text-foreground rounded-lg text-xs hover:border-red-300 hover:text-red-500 transition-colors whitespace-nowrap ml-4" }, "Close Account")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Delete employer account"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Permanently delete your account and all data. This cannot be undone.")), /* @__PURE__ */ React.createElement("button", { onClick: () => setConfirmDanger("delete"), className: "px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors whitespace-nowrap ml-4" }, "Delete"))))))));
  })(), viewingResume && React.createElement(ApplicantResumeModal, { applicant: viewingResume, preview: resumePreview, loading: resumePreviewLoading, error: resumePreviewError, onClose: () => { setViewingResume(null); setResumePreview(null); setResumePreviewError(""); } }), directMessageModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-2xl max-w-lg w-full my-auto shadow-2xl overflow-hidden flex flex-col h-[520px]" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border flex items-center justify-between bg-card flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm" }, directMessageModal.name[0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-sm text-foreground" }, directMessageModal.name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, directMessageModal.role, " ", directMessageModal.college ? `\u2022 ${directMessageModal.college}` : ""))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setActiveMessageCandidate(String(directMessageModal.applicationId));
        setSection("messages");
        setDirectMessageModal(null);
      },
      className: "px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
    },
    "Open Full Inbox"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setDirectMessageModal(null),
      className: "p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-5 space-y-3 bg-background", style: { scrollbarWidth: "none" } }, (candidateChats[String(directMessageModal.applicationId)] || []).map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `flex ${m.from === "me" ? "justify-end" : "justify-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] px-4 py-2.5 rounded-2xl text-xs ${m.from === "me" ? "bg-primary text-white rounded-br-xs" : "bg-card border border-border text-foreground rounded-bl-xs shadow-2xs"}` }, /* @__PURE__ */ React.createElement("p", null, m.msg), /* @__PURE__ */ React.createElement("p", { className: `text-[9px] mt-1 ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}` }, m.time))))), /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-border bg-card flex-shrink-0" }, /* @__PURE__ */ React.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        if (!modalMsgText.trim()) return;
        sendMessageToCandidate(directMessageModal.applicationId, modalMsgText);
        setModalMsgText("");
      },
      className: "flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border focus-within:border-primary transition-colors"
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: `Message ${directMessageModal.name.split(" ")[0]}\u2026`,
        value: modalMsgText,
        onChange: (e) => setModalMsgText(e.target.value),
        className: "flex-1 bg-transparent text-xs outline-none"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 text-white hover:bg-primary/90 transition-colors cursor-pointer"
      },
      /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-3.5 h-3.5" })
    )
  )))))));
}
export {
  CompanyPortal
};
