import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Bookmark,
  X,
  SlidersHorizontal,
  BriefcaseIcon,
  ChevronDown,
  Search,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
import { CategoryBadge, ModeBadge } from "../../components/ui/Badges";

const POSTED_OPTIONS = ["Any time", "Last 24 hours", "Last 3 days", "Last week", "Last month"];
const DEFAULT_IT_DEPTS = [
  "Software Development",
  "Data Science & AI",
  "Full Stack Development",
  "Cloud Computing & DevOps",
  "Cyber Security",
  "UI/UX Design",
  "Mobile App Development",
  "Database Administration"
];
const DEFAULT_NON_IT_DEPTS = [
  "Business Development",
  "Finance & Accounting",
  "Digital Marketing",
  "Human Resources",
  "Sales & Growth",
  "Supply Chain & Operations",
  "Graphic Design",
  "Content Strategy"
];

function FilterPanel({
  categories,
  departments,
  workModes,
  durations,
  selCat,
  setSelCat,
  selDept,
  setSelDept,
  selMode,
  setSelMode,
  selStipend,
  setSelStipend,
  selDuration,
  setSelDuration,
  selPosted,
  setSelPosted,
  activeCount,
  onClear
}) {
  const toggleArr = (arr, set, val) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const Section = ({ title, children }) => /* @__PURE__ */ React.createElement("div", { className: "py-4 border-b border-border last:border-b-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3" }, title), /* @__PURE__ */ React.createElement("div", { className: "space-y-2.5" }, children));
  const CheckRow = ({ label, checked, onChange }) => /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2.5 cursor-pointer group" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked,
      onChange,
      className: "w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: `text-sm leading-none transition-colors ${checked ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"}` }, label));
  const RadioRow = ({ label, name, checked, onChange }) => /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2.5 cursor-pointer group" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "radio",
      name,
      checked,
      onChange,
      className: "w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: `text-sm leading-none transition-colors ${checked ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"}` }, label));

  const availableDepts = departments && departments.length > 0
    ? departments
    : selCat.includes("IT") && !selCat.includes("NON IT")
      ? DEFAULT_IT_DEPTS
      : selCat.includes("NON IT") && !selCat.includes("IT")
        ? DEFAULT_NON_IT_DEPTS
        : [...new Set([...DEFAULT_IT_DEPTS, ...DEFAULT_NON_IT_DEPTS])];

  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-4 border-b border-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(SlidersHorizontal, { className: "w-4 h-4 text-primary" }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Filters"), activeCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "min-w-[18px] h-[18px] bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1" }, activeCount)), activeCount > 0 && /* @__PURE__ */ React.createElement("button", { onClick: onClear, className: "text-xs text-primary font-semibold hover:underline" }, "Clear all")), /* @__PURE__ */ React.createElement(Section, { title: "Category" }, (categories.length ? categories : ["IT", "NON IT"]).map((item) => /* @__PURE__ */ React.createElement(
    CheckRow,
    {
      key: item,
      label: item === "IT" ? "IT (Information Tech)" : "NON IT (Business & Mgmt)",
      checked: selCat.includes(item),
      onChange: () => toggleArr(selCat, setSelCat, item)
    }
  ))), /* @__PURE__ */ React.createElement(Section, { title: "Work Mode" }, (workModes.length ? workModes : ["Remote", "Hybrid", "On-site"]).map((item) => /* @__PURE__ */ React.createElement(
    CheckRow,
    {
      key: item,
      label: item,
      checked: selMode.includes(item),
      onChange: () => toggleArr(selMode, setSelMode, item)
    }
  ))), /* @__PURE__ */ React.createElement(Section, { title: "Duration" }, (durations.length ? durations : ["2 Months", "3 Months", "6 Months"]).map((d) => /* @__PURE__ */ React.createElement(
    CheckRow,
    {
      key: d,
      label: d,
      checked: selDuration.includes(d),
      onChange: () => toggleArr(selDuration, setSelDuration, d)
    }
  ))), /* @__PURE__ */ React.createElement(Section, { title: "Posted Within" }, POSTED_OPTIONS.map((p) => /* @__PURE__ */ React.createElement(
    RadioRow,
    {
      key: p,
      label: p,
      name: "posted",
      checked: selPosted === p,
      onChange: () => setSelPosted(p)
    }
  ))));
}

function SearchPage({ setView, userRole, onSelectInternship }) {
  const [allJobs, setAllJobs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ categories: [], departments: [], workModes: [], durations: [] });
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selCat, setSelCat] = useState([]);
  const [selDept, setSelDept] = useState([]);
  const [selMode, setSelMode] = useState([]);
  const [selStipend, setSelStipend] = useState("Any Stipend");
  const [selDuration, setSelDuration] = useState([]);
  const [selPosted, setSelPosted] = useState("Any time");
  const [sortBy, setSortBy] = useState("Newest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    let active = true;
    api.internshipFilters().then((options) => {
      if (active && options) {
        setFilterOptions({
          categories: options.categories || ["IT", "NON IT"],
          departments: options.departments || [...DEFAULT_IT_DEPTS, ...DEFAULT_NON_IT_DEPTS],
          workModes: options.workModes || ["Remote", "Hybrid", "On-site"],
          durations: options.durations || ["2 Months", "3 Months", "6 Months"]
        });
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchJobs = () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (locationTerm.trim()) params.set("location", locationTerm.trim());
      if (selCat.length) params.set("category", selCat.join(","));
      if (selDept.length) params.set("department", selDept.join(","));
      if (selMode.length) params.set("workMode", selMode.join(","));
      if (selStipend !== "Any Stipend") params.set("minStipend", String(Number(selStipend.replace(/[^0-9]/g, ""))));
      if (selDuration.length) params.set("duration", selDuration.join(","));
      const postedDays = { "Last 24 hours": 1, "Last 3 days": 3, "Last week": 7, "Last month": 30 }[selPosted];
      if (postedDays) params.set("postedWithin", String(postedDays));

      setLoading(true);
      setLoadError("");
      api.internships(params.toString()).then((items) => {
        if (active) { setAllJobs(items || []); setLoadError(""); }
      }).catch((error) => { if (active) setLoadError(error.message || "Could not load internships."); }).finally(() => { if (active) setLoading(false); });
    };

    fetchJobs();
    const handleSync = () => fetchJobs();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [searchTerm, locationTerm, selCat.join(","), selDept.join(","), selMode.join(","), selStipend, selDuration.join(","), selPosted]);

  useEffect(() => {
    if (userRole !== "student") return;
    let active = true;
    api.savedInternships().then((items) => { if (active) setSavedIds((items || []).map((item) => Number(item.id))); }).catch(() => {});
    return () => { active = false; };
  }, [userRole]);

  const clearAll = () => {
    setSelCat([]);
    setSelDept([]);
    setSelMode([]);
    setSelDuration([]);
    setSearchTerm("");
    setLocationTerm("");
    setSelStipend("Any Stipend");
    setSelPosted("Any time");
  };

  const handleQuickPill = (type, value) => {
    if (type === "all") {
      setSelCat([]);
      setSelDept([]);
    } else if (type === "category") {
      setSelCat([value]);
      setSelDept([]);
    } else if (type === "department") {
      const isIT = DEFAULT_IT_DEPTS.includes(value);
      setSelCat([isIT ? "IT" : "NON IT"]);
      setSelDept([value]);
    }
  };

  const activeFilters = [
    ...searchTerm ? [{ label: `Query: "${searchTerm}"`, onRemove: () => setSearchTerm("") }] : [],
    ...locationTerm ? [{ label: `Location: "${locationTerm}"`, onRemove: () => setLocationTerm("") }] : [],
    ...selCat.map((c) => ({ label: `Category: ${c}`, onRemove: () => setSelCat((p) => p.filter((x) => x !== c)) })),
    ...selDept.map((d) => ({ label: `Dept: ${d}`, onRemove: () => setSelDept((p) => p.filter((x) => x !== d)) })),
    ...selMode.map((m) => ({ label: m, onRemove: () => setSelMode((p) => p.filter((x) => x !== m)) })),
    ...selDuration.map((d) => ({ label: d, onRemove: () => setSelDuration((p) => p.filter((x) => x !== d)) })),
    ...selStipend !== "Any Stipend" ? [{ label: selStipend, onRemove: () => setSelStipend("Any Stipend") }] : [],
    ...selPosted !== "Any time" ? [{ label: selPosted, onRemove: () => setSelPosted("Any time") }] : []
  ];

  const filtered = allJobs.filter((i) => {
    if (selCat.length && !selCat.includes(i.category)) return false;
    if (selDept.length && !selDept.includes(i.department)) return false;
    if (selMode.length && !selMode.includes(i.mode)) return false;
    if (selDuration.length && !selDuration.includes(i.duration)) return false;
    if (selStipend !== "Any Stipend") {
      const min = parseInt(selStipend.replace(/[â‚¹,+]/g, ""));
      if ((i.stipendNum || 0) < min) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (i.title || "").toLowerCase().includes(q);
      const matchCompany = (i.company || "").toLowerCase().includes(q);
      const matchDept = (i.department || "").toLowerCase().includes(q);
      const matchCategory = (i.category || "").toLowerCase().includes(q);
      const matchSkills = (i.skills || []).some((s) => (s || "").toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchDept && !matchCategory && !matchSkills) return false;
    }
    if (locationTerm.trim()) {
      const loc = locationTerm.toLowerCase();
      if (!(i.location || "").toLowerCase().includes(loc) && !(i.mode || "").toLowerCase().includes(loc)) return false;
    }
    return true;
  });

  const filterProps = {
    ...filterOptions,
    selCat,
    setSelCat,
    selDept,
    setSelDept,
    selMode,
    setSelMode,
    selStipend,
    setSelStipend,
    selDuration,
    setSelDuration,
    selPosted,
    setSelPosted,
    activeCount: activeFilters.length,
    onClear: clearAll
  };

  const quickPills = [
    { label: "All Opportunities", type: "all", value: "all", active: selCat.length === 0 && selDept.length === 0 },
    { label: "ðŸ’» IT Department", type: "category", value: "IT", active: selCat.includes("IT") && selDept.length === 0 },
    { label: "ðŸ“ˆ NON IT Roles", type: "category", value: "NON IT", active: selCat.includes("NON IT") && selDept.length === 0 },
    { label: "Software Development", type: "department", value: "Software Development", active: selDept.includes("Software Development") },
    { label: "Data Science & AI", type: "department", value: "Data Science & AI", active: selDept.includes("Data Science & AI") },
    { label: "Full Stack Dev", type: "department", value: "Full Stack Development", active: selDept.includes("Full Stack Development") },
    { label: "UI/UX Design", type: "department", value: "UI/UX Design", active: selDept.includes("UI/UX Design") },
    { label: "Digital Marketing", type: "department", value: "Digital Marketing", active: selDept.includes("Digital Marketing") },
    { label: "Finance & Accounting", type: "department", value: "Finance & Accounting", active: selDept.includes("Finance & Accounting") },
    { label: "Human Resources", type: "department", value: "Human Resources", active: selDept.includes("Human Resources") }
  ];

  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background" }, drawerOpen && /* @__PURE__ */ React.createElement("div", { className: "lg:hidden fixed inset-0 z-[60] flex" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 bg-black/50", onClick: () => setDrawerOpen(false) }), /* @__PURE__ */ React.createElement("div", { className: "w-[300px] max-w-[85vw] bg-card h-full flex flex-col shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-border" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-sm text-foreground" }, "Filters"), /* @__PURE__ */ React.createElement("button", { onClick: () => setDrawerOpen(false), className: "p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "flex-1 overflow-y-auto px-5 py-1",
      style: { scrollbarWidth: "none", msOverflowStyle: "none" }
    },
    /* @__PURE__ */ React.createElement(FilterPanel, { ...filterProps })
  ), /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-t border-border" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setDrawerOpen(false),
      className: "w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
    },
    "Show ",
    filtered.length,
    " Results"
  )))), /* @__PURE__ */ React.createElement("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center gap-2 text-xs text-muted-foreground mb-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setView("landing"), className: "hover:text-primary transition-colors" }, "Home"), /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", { className: "text-foreground font-medium" }, "Internships")), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-foreground" }, "Explore Verified Internships"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Browse internships across IT & NON IT departments from top verified companies")), loadError && React.createElement("p", { role: "alert", className: "mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" }, loadError), loading && React.createElement("p", { className: "mb-4 text-sm text-muted-foreground" }, "Loading internships…"), activeFilters.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap mb-4" }, activeFilters.map((f, idx) => /* @__PURE__ */ React.createElement("span", { key: idx, className: "inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold" }, f.label, /* @__PURE__ */ React.createElement("button", { onClick: f.onRemove, className: "hover:bg-primary/20 rounded-full p-0.5" }, /* @__PURE__ */ React.createElement(X, { className: "w-3 h-3" })))), /* @__PURE__ */ React.createElement("button", { onClick: clearAll, className: "text-xs text-muted-foreground hover:text-primary font-semibold underline ml-1" }, "Reset all")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-5 mt-2 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "hidden lg:block w-64 flex-shrink-0 sticky top-[72px] bg-card border border-border rounded-2xl px-5 py-4" }, /* @__PURE__ */ React.createElement(FilterPanel, { ...filterProps })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground hidden md:block" }, "Showing ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-foreground" }, filtered.length), " internships"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setDrawerOpen(true),
      className: "lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-lg text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
    },
    /* @__PURE__ */ React.createElement(SlidersHorizontal, { className: "w-3.5 h-3.5" }),
    "Filters",
    activeFilters.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "min-w-[16px] h-4 bg-primary text-primary-foreground rounded-full text-[9px] font-bold flex items-center justify-center px-1" }, activeFilters.length)
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted-foreground hidden sm:inline" }, "Sort:"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: sortBy,
      onChange: (e) => setSortBy(e.target.value),
      className: "appearance-none text-xs font-semibold border border-border rounded-lg pl-3 pr-7 py-2 bg-card outline-none focus:border-primary cursor-pointer text-foreground"
    },
    ["Newest", "Highest Stipend", "Most Relevant", "Deadline"].map((o) => /* @__PURE__ */ React.createElement("option", { key: o }, o))
  ), /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" })))), !loading && !loadError && filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-2xl p-6" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 bg-background rounded-2xl flex items-center justify-center mb-4" }, /* @__PURE__ */ React.createElement(BriefcaseIcon, { className: "w-7 h-7 text-muted-foreground" })), /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-foreground mb-1" }, "No internships match your selected category or filters"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mb-5" }, "Try selecting another department or clearing your filters."), /* @__PURE__ */ React.createElement("button", { onClick: clearAll, className: "px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer" }, "Show All Internships")) : /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, filtered.map((internship) => {
    const isSaved = savedIds.includes(internship.id);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: internship.id,
        onClick: () => { onSelectInternship?.(internship); setView("details"); },
        className: "bg-white border border-[#e0dfdc] rounded-2xl p-5 hover:shadow-md hover:border-[#0a66c2]/40 transition-all group cursor-pointer"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 bg-[#f8fafc] border border-[#e0dfdc] flex items-center justify-center flex-shrink-0 rounded-xl", style: { backgroundColor: internship.logoColor } }, /* @__PURE__ */ React.createElement("span", { className: "text-white font-bold text-lg" }, internship.logo)), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap mb-1.5" }, /* @__PURE__ */ React.createElement(CategoryBadge, { category: internship.category }), internship.department && /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200" }, internship.department)), /* @__PURE__ */ React.createElement(
        "h3",
        {
          onClick: (e) => {
            e.stopPropagation();
            onSelectInternship?.(internship); setView("details");
          },
          className: "text-base font-semibold text-[#00BFEA] hover:underline cursor-pointer leading-snug"
        },
        internship.title
      ), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/90 font-medium mt-0.5" }, internship.company), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60 mb-2" }, internship.location, " (", internship.mode, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1 font-semibold" }, internship.duration), internship.stipend && /* @__PURE__ */ React.createElement("span", { className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100" }, internship.stipend))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-end gap-2 flex-shrink-0" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            (isSaved ? api.unsaveInternship(internship.id) : api.saveInternship(internship.id)).then(() => {
              setSavedIds((p) => isSaved ? p.filter((id) => id !== internship.id) : [...p, internship.id]);
            }).catch((error) => toast.error(error.message || "Sign in to save internships."));
          },
          className: `p-2 rounded-full transition-colors cursor-pointer ${isSaved ? "text-[#0a66c2] bg-[#0a66c2]/10" : "text-black/50 hover:text-black hover:bg-black/5"}`
        },
        /* @__PURE__ */ React.createElement(Bookmark, { className: `w-5 h-5 ${isSaved ? "fill-[#0a66c2]" : ""}` })
      ))),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mt-3 pt-3 border-t border-[#e0dfdc]" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 text-xs text-black/50" }, /* @__PURE__ */ React.createElement("span", null, "Posted ", internship.posted), internship.deadline && /* @__PURE__ */ React.createElement("span", null, "Apply by ", internship.deadline)), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            onSelectInternship?.(internship); setView("details");
          },
          className: "flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white border border-[#0a66c2] text-[#0a66c2] rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
        },
        "Easy Apply"
      ))
    );
  })), filtered.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5 mt-5 pb-2" }, /* @__PURE__ */ React.createElement("button", { className: "px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors" }, "â† Previous"), [1, 2, 3].map((p) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p,
      className: `w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === 1 ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary hover:text-primary"}`
    },
    p
  )), /* @__PURE__ */ React.createElement("button", { className: "px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:border-primary hover:text-primary transition-colors" }, "Next â†’"))))));
}

export {
  SearchPage
};

