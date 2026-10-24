import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Check,
  ExternalLink,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { EasyApplyModal } from "../../components/EasyApplyModal";
import { api } from "../../api";
function CompanyProfilePage({ company: initialCompany, setView, userInfo }) {
  const [company, setCompany] = useState(initialCompany);
  const [companyInternships, setCompanyInternships] = useState([]);
  const [applyTarget, setApplyTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [appliedIds, setAppliedIds] = useState([]);
  useEffect(() => {
    let active = true;
    const fetchCompanyDetails = () => {
      if (initialCompany?.id) {
        api.company(initialCompany.id).then((data) => {
          if (!active) return;
          setCompany((current) => ({ ...current, ...data, ...(data.profileData || {}), logoUrl: data.logoUrl || data.profileData?.logo || "" }));
          setCompanyInternships((data.internships || []).map((job) => ({
            ...job,
            company: data.name,
            logo: (data.name || "").slice(0, 2).toUpperCase(),
            logoColor: data.logoColor || job.logoColor || "#0a66c2",
            mode: job.mode || job.workMode || "Remote",
            stipend: job.stipend || (job.stipendAmount ? `${job.stipendCurrency || "INR"} ${job.stipendAmount}/${job.stipendPeriod || "month"}` : "Unpaid"),
            deadline: job.deadline,
            duration: job.duration,
            category: job.category,
            skills: job.skills || [],
            posted: job.posted || job.postedDate || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"),
          })));
        }).catch(() => {});
      }
      if (userInfo?.id) {
        api.applications().then((items) => {
          if (active) setAppliedIds((items || []).map((item) => Number(item.jobId)));
        }).catch(() => {});
      }
    };

    fetchCompanyDetails();
    const handleSync = () => fetchCompanyDetails();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [initialCompany?.id, userInfo?.id]);
  const perks = Array.isArray(company.perks) ? company.perks : company.perks ? String(company.perks).split(",").map((s) => s.trim()) : [];
  const departments = Array.isArray(company.departments) ? company.departments : [];
  const handleApplySuccess = (id) => {
    const updated = [...appliedIds, id];
    setAppliedIds(updated);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-[#f3f2ef]" }, applyTarget && /* @__PURE__ */ React.createElement(
    EasyApplyModal,
    {
      internship: applyTarget,
      userInfo,
      onClose: () => setApplyTarget(null),
      onSuccess: (id) => {
        handleApplySuccess(id);
        setApplyTarget(null);
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center gap-2 text-xs text-black/60 mb-4 font-semibold" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setView("companies"), className: "hover:text-black hover:underline flex items-center gap-1" }, "Companies"), /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ React.createElement("span", { className: "text-black" }, company.name)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl overflow-hidden border border-[#e0dfdc] relative" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "h-32 sm:h-48 w-full bg-gradient-to-r from-slate-200 to-slate-100"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "px-6 pb-6 relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute -top-12 sm:-top-16 left-6" }, company.logoUrl ? /* @__PURE__ */ React.createElement(
    "img",
    {
      src: company.logoUrl,
      alt: company.name,
      className: "w-24 h-24 sm:w-32 sm:h-32 rounded bg-white object-cover border-4 border-white shadow-sm"
    }
  ) : /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "w-24 h-24 sm:w-32 sm:h-32 rounded border-4 border-white shadow-sm flex items-center justify-center text-white text-3xl font-bold bg-white"
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center rounded-sm", style: { backgroundColor: company.logoColor } }, company.logo)
  )), /* @__PURE__ */ React.createElement("div", { className: "pt-16 sm:pt-20" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-semibold text-black leading-none" }, company.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/90 font-medium" }, company.tagline), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60" }, company.industry, company.location ? ` Â· ${company.location}` : "")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mt-5" }, /* @__PURE__ */ null, company.website && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: company.website.startsWith("http") ? company.website : `https://${company.website}`,
      target: "_blank",
      rel: "noreferrer",
      className: "flex items-center gap-1.5 px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-full font-semibold text-sm transition-colors"
    },
    "Visit website ",
    /* @__PURE__ */ React.createElement(ExternalLink, { className: "w-3.5 h-3.5" })
  ), /* @__PURE__ */ React.createElement("button", { className: "w-9 h-9 border border-black/60 rounded-full flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 hover:border-black transition-colors" }, /* @__PURE__ */ React.createElement(MoreHorizontal, { className: "w-5 h-5" }))))), /* @__PURE__ */ React.createElement("div", { className: "px-6 border-t border-[#e0dfdc] flex items-center gap-6 overflow-x-auto" }, ["Home", "About", "Posts", "Jobs", "Life"].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab,
      onClick: () => setActiveTab(tab),
      className: `py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${activeTab === tab ? "border-[#0a66c2] text-[#0a66c2]" : "border-transparent text-black/60 hover:text-black"}`
    },
    tab
  )))), (activeTab === "Home" || activeTab === "About") && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-[#e0dfdc] p-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-black mb-4" }, "About"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/90 leading-relaxed whitespace-pre-line mb-4" }, company.description), company.culture && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/90 leading-relaxed mb-6" }, /* @__PURE__ */ React.createElement("strong", null, "Culture & Workplace: "), " ", company.culture), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, company.website && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-black mb-0.5" }, "Website"), /* @__PURE__ */ React.createElement("a", { href: company.website.startsWith("http") ? company.website : `https://${company.website}`, className: "text-sm text-[#0a66c2] hover:underline", target: "_blank", rel: "noreferrer" }, company.website)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-black mb-0.5" }, "Industry"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60" }, company.industry)), company.size && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-black mb-0.5" }, "Company size"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60" }, company.size, " employees")), company.location && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-black mb-0.5" }, "Headquarters"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60" }, company.location)), company.founded && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-black mb-0.5" }, "Founded"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60" }, company.founded)))), (activeTab === "Home" || activeTab === "Jobs") && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-[#e0dfdc] p-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-black mb-4" }, "Recently posted jobs"), companyInternships.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-6 text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-black" }, "No recent job openings"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60 mt-1" }, "Check back soon for new opportunities.")) : /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, companyInternships.map((internship, index) => {
    const applied = appliedIds.includes(internship.id);
    return /* @__PURE__ */ React.createElement("div", { key: internship.id }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-4 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 bg-[#f8fafc] border border-[#e0dfdc] flex items-center justify-center flex-shrink-0", style: { backgroundColor: internship.logoColor } }, /* @__PURE__ */ React.createElement("span", { className: "text-white font-bold text-lg" }, internship.logo)), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-base text-[#00BFEA] hover:underline cursor-pointer" }, internship.title), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/90" }, internship.company), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60 mb-1" }, internship.location, " (", internship.mode, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1 font-semibold" }, internship.duration)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/50 mb-2" }, "Posted ", internship.posted), applied ? /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#00CC00] text-white font-bold rounded-lg text-sm transition-colors" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" }), " Applied") : /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setApplyTarget(internship),
        className: "px-4 py-1.5 bg-white border border-[#0a66c2] text-[#0a66c2] rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
      },
      "Easy Apply"
    ))), index < companyInternships.length - 1 && /* @__PURE__ */ React.createElement("hr", { className: "border-[#e0dfdc]" }));
  })), companyInternships.length > 0 && /* @__PURE__ */ React.createElement("button", { className: "w-full mt-2 py-2 border-t border-[#e0dfdc] text-center text-[#0a66c2] font-semibold text-sm hover:bg-[#0a66c2]/5 transition-colors" }, "Show all jobs")), (activeTab === "Home" || activeTab === "Life") && perks.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-[#e0dfdc] p-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold text-black mb-4" }, "Life at ", company.name), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, perks.map((p) => /* @__PURE__ */ React.createElement("span", { key: p, className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#f3f2ef] border border-[#e0dfdc] text-black/80 rounded-full text-sm font-medium" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-4 h-4 text-amber-500" }), " ", p))))), /* @__PURE__ */ React.createElement("div", { className: "hidden lg:block space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-[#e0dfdc] p-5" }, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-black mb-4" }, "Similar pages"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, [].map((sim) => /* @__PURE__ */ React.createElement("div", { key: sim.name, className: "flex gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded bg-[#f8fafc] flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0", style: { backgroundColor: sim.color } }, sim.logo), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-sm text-black hover:text-[#0a66c2] cursor-pointer" }, sim.name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/60" }, sim.industry), /* @__PURE__ */ React.createElement("button", { className: "mt-1 px-3 py-1 border border-black/60 rounded-full text-black/60 font-semibold text-xs hover:bg-black/5 transition-colors" }, "Follow")))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-[#e0dfdc] p-4 text-center sticky top-20" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/50 text-right mb-2" }, "Ad \u2022\u2022\u2022"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/70 mb-3" }, "See who you know at ", /* @__PURE__ */ React.createElement("strong", null, company.name)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-4" }, /* @__PURE__ */ React.createElement("img", { src: company.logoUrl, className: "w-16 h-16 rounded-full border border-[#e0dfdc]", alt: "Profile" })), /* @__PURE__ */ React.createElement("p", { className: "text-sm mb-3" }, "Unlock your network and get hired."), /* @__PURE__ */ React.createElement("button", { className: "px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] rounded-full font-semibold text-sm hover:bg-[#0a66c2]/10 transition-colors" }, "Try Premium for free"))))));
}
export {
  CompanyProfilePage
};


