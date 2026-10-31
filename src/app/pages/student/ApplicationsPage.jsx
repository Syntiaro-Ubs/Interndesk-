import React, { useEffect, useState } from "react";
import { ArrowRight, FileText, MessageSquare, AlertCircle, X, ChevronRight } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
import { CategoryBadge, StatusBadge, LogoMark } from "../../components/ui/Badges";
function ApplicationsPage({ setView, userInfo, onSelectInternship }) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeChatApp, setActiveChatApp] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [appMessages, setAppMessages] = useState({});
  const [allApplications, setAllApplications] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const fetchApplications = () => {
      if (!userInfo?.id) { setLoading(false); return; }
      setLoading(true);
      api.applications().then((items) => {
        if (!active) return;
        setAllApplications((items || []).map((app) => ({
          id: app.id, company: app.company, logo: (app.company || "").slice(0, 2).toUpperCase(), logoColor: app.logoColor || "#0a66c2",
          title: app.jobTitle || app.title || "Internship", appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently",
          status: app.status || "Applied", nextStep: app.nextStep || `Application status: ${app.status || "Submitted"}`, category: app.category || "IT", jobId: app.jobId,
        })));
        setLoadError("");
      }).catch((error) => { if (active) setLoadError(error.message || "Could not load applications."); }).finally(() => { if (active) setLoading(false); });
    };

    fetchApplications();
    const handleSync = () => fetchApplications();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [userInfo?.id]);
  const statuses = ["All", ...new Set(allApplications.map((application) => application.status).filter(Boolean))];
  const filtered = filterStatus === "All" ? allApplications : allApplications.filter((a) => a.status === filterStatus);
  const viewInternship = async (id) => {
    try {
      const internship = await api.internship(id);
      onSelectInternship?.(internship);
      setView("details");
    } catch (error) { toast.error(error.message || "Could not load this internship."); }
  };
  const openChat = async (application) => {
    const chat = { id: application.id, company: application.company, title: application.title, recruiter: "Recruiter" };
    setActiveChatApp(chat);
    try {
      const messages = await api.applicationMessages(application.id);
      setAppMessages((current) => ({ ...current, [application.id]: messages.map((message) => ({ ...message, from: message.from === "me" ? "me" : "them", msg: message.message, time: new Date(message.createdAt).toLocaleTimeString() })) }));
    } catch (error) { toast.error(error.message || "Could not load this conversation."); }
  };
  const handleSendMessage = async () => {
    if (!activeChatApp || !chatMessage.trim()) return;
    try {
      const sent = await api.sendApplicationMessage(activeChatApp.id, chatMessage.trim());
      setAppMessages((prev) => ({ ...prev, [activeChatApp.id]: [...(prev[activeChatApp.id] || []), { ...sent, from: sent.from === "me" ? "me" : "them", msg: sent.message, time: new Date(sent.createdAt).toLocaleTimeString() }] }));
      setChatMessage("");
    } catch (error) { toast.error(error.message || "Could not send your message."); }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-foreground tracking-tight" }, "My Applications"), /* @__PURE__ */ React.createElement("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1" }, "Track application status and recruiter responses in real-time")), loadError && /* @__PURE__ */ React.createElement("p", { role: "alert", className: "mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" }, loadError), loading && /* @__PURE__ */ React.createElement("p", { className: "mb-4 text-sm text-muted-foreground" }, "Loading applicationsâ€¦"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("search"), className: "px-4 py-2 bg-[#0a66c2] text-white font-semibold text-xs rounded-full hover:bg-[#004182] transition-colors self-start cursor-pointer" }, "+ Search More Internships")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-6 gap-3 mb-5" }, [
    ["Total", allApplications.length, "text-foreground"],
    ["Applied", allApplications.filter((a) => a.status === "Applied").length, "text-blue-600"],
    ["Under Review", allApplications.filter((a) => a.status === "Under Review").length, "text-amber-600"],
    ["Interviews", allApplications.filter((a) => a.status === "Interview Scheduled").length, "text-violet-600"],
    ["Selected", allApplications.filter((a) => a.status === "Selected" || a.status === "Offer Received").length, "text-emerald-600"],
    ["Rejected", allApplications.filter((a) => a.status === "Rejected").length, "text-red-600"]
  ].map(([label, value, color]) => /* @__PURE__ */ React.createElement("div", { key: label, className: "bg-card border border-border rounded-2xl p-3.5 text-center shadow-2xs" }, /* @__PURE__ */ React.createElement("p", { className: `text-xl font-bold ${color}` }, value), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5 font-medium" }, label)))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 flex-wrap mb-6" }, statuses.map((status) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: status,
      onClick: () => setFilterStatus(status),
      className: `px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${filterStatus === status ? "bg-[#0a66c2] text-white shadow-xs" : "bg-card border border-border text-foreground hover:border-[#0a66c2] hover:text-[#0a66c2]"}`
    },
    status
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-2xl p-6 text-center space-y-3" }, /* @__PURE__ */ React.createElement(FileText, { className: "w-10 h-10 text-muted-foreground mx-auto" }), /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-foreground" }, loadError ? "Applications are unavailable." : loading ? "Loading applicationsâ€¦" : allApplications.length === 0 ? "No applications yet." : "No applications match filter"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, "Try selecting a different status filter above.")) : filtered.map((app, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "bg-card border border-border rounded-2xl p-5 sm:p-6 hover:shadow-md transition-all space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-4" }, /* @__PURE__ */ React.createElement(LogoMark, { logo: app.logo, color: app.logoColor, size: "lg" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement(
    "h3",
    {
      onClick: () => viewInternship(app.jobId),
      className: "text-base sm:text-lg font-bold text-foreground hover:text-[#00BFEA] cursor-pointer transition-colors truncate"
    },
    app.title
  ), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground font-medium mt-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-foreground" }, app.company), " \u2022 Applied on ", app.appliedDate)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 self-start sm:self-auto flex-shrink-0" }, /* @__PURE__ */ React.createElement(CategoryBadge, { category: app.category }), /* @__PURE__ */ React.createElement(StatusBadge, { status: app.status }))))), /* @__PURE__ */ React.createElement("div", { className: "bg-[#f8fafc] border border-[#e0dfdc] rounded-xl p-4 space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-foreground flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(AlertCircle, { className: "w-4 h-4 text-[#0a66c2]" }), "Recruiter Update & Next Steps"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-muted-foreground font-medium" }, "Updated recently")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/70 leading-relaxed font-medium pl-5" }, app.nextStep)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => viewInternship(app.jobId),
      className: "text-xs font-bold text-[#0a66c2] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("span", null, "View Internship Details"),
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 self-end sm:self-auto" }, app.status === "Offer Received" && /* @__PURE__ */ React.createElement("button", {
  onClick: async () => {
    try {
      await api.updateApplicationStatus(app.id, { status: "Hired", statusLabel: "Offer Accepted" });
      toast.success("Congratulations! Offer accepted.");
      window.dispatchEvent(new CustomEvent("interndesk:sync"));
    } catch (err) {
      toast.error(err.message || "Could not accept offer.");
    }
  },
  className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
}, "Accept Offer"), app.status === "Interview Scheduled" && /* @__PURE__ */ React.createElement("button", {
  onClick: () => openChat(app),
  className: "px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
}, "View Interview Schedule"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => openChat(app),
      className: "flex items-center justify-center gap-1.5 px-4 py-2 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#f4faff] font-bold text-xs rounded-full transition-colors cursor-pointer whitespace-nowrap"
    },
    /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-3.5 h-3.5" }),
    " Message Recruiter"
  )))))), activeChatApp && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col h-[480px]" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border flex items-center justify-between bg-card flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-sm text-foreground" }, activeChatApp.recruiter), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, activeChatApp.title, " \u2022 ", activeChatApp.company)), /* @__PURE__ */ React.createElement("button", { onClick: () => setActiveChatApp(null), className: "p-1.5 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer" }, /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-background" }, (appMessages[activeChatApp.id] || []).map((m, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: `flex ${m.from === "me" ? "justify-end" : "justify-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] px-4 py-2.5 rounded-2xl text-xs ${m.from === "me" ? "bg-[#0a66c2] text-white rounded-br-xs" : "bg-card border border-border text-foreground rounded-bl-xs"}` }, /* @__PURE__ */ React.createElement("p", null, m.msg), /* @__PURE__ */ React.createElement("p", { className: `text-[9px] mt-1 ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}` }, m.time))))), /* @__PURE__ */ React.createElement("div", { className: "p-3 border-t border-border bg-card flex-shrink-0" }, /* @__PURE__ */ React.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        handleSendMessage();
      },
      className: "flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border focus-within:border-[#0a66c2]"
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: `Write a message to ${activeChatApp.company} recruiter\u2026`,
        value: chatMessage,
        onChange: (e) => setChatMessage(e.target.value),
        className: "flex-1 bg-transparent text-xs outline-none"
      }
    ),
    /* @__PURE__ */ React.createElement("button", { type: "submit", className: "w-7 h-7 bg-[#0a66c2] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#004182]" }, /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-3.5 h-3.5" }))
  ))))));
}
export {
  ApplicationsPage
};
