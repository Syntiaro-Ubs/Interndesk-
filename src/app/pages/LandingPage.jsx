import React, { useEffect, useState } from "react";
import { Search, MapPin, Building2, ChevronRight, ArrowRight, GraduationCap, BookOpen, Users, Play, ChevronDown, ChevronUp, CheckCircle, Home as HomeIcon, Briefcase, BarChart3, Glasses, Heart, UserCheck, PenTool, DollarSign, TrendingUp, Settings, Code, Sparkles, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import { api } from "../api";
import heroBannerImg from "../../assets/home_hero_banner.jpg";
function LandingPage({ setView, setAuthParams, onSelectInternship, onSearch }) {
  const [internships, setInternships] = useState([]);
  const [internshipError, setInternshipError] = useState("");
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState("IT");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState("");

  useEffect(() => {
    let active = true;
    const fetchInternships = () => {
      setInternshipsLoading(true);
      api.internships()
        .then((items) => {
          if (active) {
            setInternships(items || []);
            setInternshipError("");
          }
        })
        .catch((error) => {
          if (active) setInternshipError(error.message || "Could not load internships.");
        })
        .finally(() => {
          if (active) setInternshipsLoading(false);
        });
    };

    fetchInternships();
    const handleSync = () => fetchInternships();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const experienceOptions = [
    "All Experience Levels",
    "Entry Level / Fresher",
    "1st & 2nd Year Student",
    "Pre-final Year Student",
    "Final Year Student",
    "Recent Graduate"
  ];

  const categoryGroups = (category) => {
    const groups = new Map();
    internships
      .filter((job) => (job.category || "").toUpperCase() === category.toUpperCase())
      .forEach((job) => {
        const name = job.department || job.category;
        const group = groups.get(name) || { name, count: 0, skills: new Set() };
        group.count += 1;
        (job.skills || []).forEach((skill) => group.skills.add(skill));
        groups.set(name, group);
      });
    return [...groups.values()]
      .map((group) => ({ ...group, skills: [...group.skills], icon: Briefcase }))
      .sort((a, b) => b.count - a.count);
  };

  const itCategories = categoryGroups("IT");
  const nonItCategories = categoryGroups("NON IT");
  const heroCategories = [...new Set(internships.map((job) => job.department || job.category).filter(Boolean))].slice(0, 5).map((label) => ({ label, icon: Briefcase }));
  const quickSearches = [...itCategories, ...nonItCategories].slice(0, 3).map((item) => ({ label: item.name, count: `${item.count} open internships` }));

  const filteredTrackJobs = internships.filter((job) => {
    if (activeCategoryTab === "ALL") return true;
    const cat = (job.category || "").toUpperCase();
    if (activeCategoryTab === "IT") return cat === "IT";
    if (activeCategoryTab === "NON IT") return cat === "NON IT";
    return true;
  });
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[#f3f2ef] min-h-screen text-[#1f2937] font-sans antialiased selection:bg-[#0a66c2]/20" },

  /* â”€â”€ HERO SECTION WITH BANNER BACKGROUND â”€â”€ */
  React.createElement("section", { className: "relative overflow-hidden border-b border-[#e0dfdc] pt-14 pb-12 lg:pt-20 lg:pb-16" },

    /* Banner Background Image with balanced lighting overlays */
    React.createElement("div", { className: "absolute inset-0 z-0 pointer-events-none overflow-hidden" },
      React.createElement("img", {
        src: heroBannerImg,
        alt: "Campus and Career Opportunity Banner",
        className: "w-full h-full object-cover object-center scale-[1.01]"
      }),
      /* Lighter overlay so the campus background is clearly visible */
      React.createElement("div", {
        className: "absolute inset-0 bg-gradient-to-b from-white/45 via-white/35 to-[#f3f2ef]/80"
      }),
      /* Gentle radial centre-fade for readability */
      React.createElement("div", {
        className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.35)_0%,_transparent_70%)]"
      })
    ),

    React.createElement("div", { className: "max-w-[840px] mx-auto px-4 sm:px-6 relative z-10 text-center" },


      /* Heading */
      React.createElement("h1", { className: "text-3xl sm:text-4xl lg:text-[48px] lg:leading-[1.18] font-normal text-[#0f172a] tracking-tight" },
        "Where ambition meets ",
        React.createElement("span", { className: "font-semibold text-[#4a3aff]" }, "opportunity")
      ),

      /* Subtitle */
      React.createElement("p", { className: "mt-3 text-base sm:text-lg text-[#334155] font-medium max-w-xl mx-auto" },
        "Explore curated roles from top companies â€” your next chapter starts here"
      ),

      /* Search Bar */
      React.createElement("div", { className: "mt-8 bg-white/95 backdrop-blur-md rounded-full border border-[#cbd5e1] shadow-xl shadow-slate-900/10 hover:shadow-2xl transition-shadow flex items-center px-2 py-1.5 sm:px-3 sm:py-2 gap-0 relative" },

        /* Skills / Designation input */
        React.createElement("div", { className: "flex items-center gap-2 flex-1 min-w-0 px-3" },
          React.createElement(Search, { className: "w-5 h-5 text-black/40 flex-shrink-0" }),
          React.createElement("input", {
            type: "text",
            placeholder: "Enter skills / designations / companies",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "w-full bg-transparent text-sm sm:text-[15px] text-[#1a1a2e] placeholder:text-black/45 outline-none py-2"
          })
        ),

        /* Divider */
        React.createElement("div", { className: "hidden sm:block w-px h-7 bg-[#d4d2cf] flex-shrink-0" }),

        /* Experience dropdown */
        React.createElement("div", { className: "hidden sm:block relative" },
          React.createElement("button", {
            type: "button",
            onClick: () => setExperienceOpen(!experienceOpen),
            className: "flex items-center gap-1.5 px-4 py-2 text-sm text-black/65 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
          },
            React.createElement("span", null, selectedExperience || "Select experience"),
            React.createElement(ChevronDown, { className: `w-4 h-4 transition-transform ${experienceOpen ? "rotate-180" : ""}` })
          ),
          experienceOpen && React.createElement("div", { className: "absolute top-full left-0 mt-2 w-44 bg-white border border-[#e0dfdc] rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200" },
            experienceOptions.map((opt) =>
              React.createElement("button", {
                key: opt,
                type: "button",
                onClick: () => { setSelectedExperience(opt); setExperienceOpen(false); },
                className: `w-full text-left px-4 py-2.5 text-sm hover:bg-[#f3f2ef] transition-colors cursor-pointer ${selectedExperience === opt ? "text-[#4a3aff] font-semibold bg-[#f3f0ff]" : "text-black/70"}`
              }, opt)
            )
          )
        ),

        /* Divider */
        React.createElement("div", { className: "hidden sm:block w-px h-7 bg-[#d4d2cf] flex-shrink-0" }),

        /* Location input */
        React.createElement("div", { className: "hidden sm:flex items-center gap-2 px-3 min-w-0" },
          React.createElement(MapPin, { className: "w-4 h-4 text-black/40 flex-shrink-0" }),
          React.createElement("input", {
            type: "text",
            placeholder: "Enter location",
            value: locationQuery,
            onChange: (e) => setLocationQuery(e.target.value),
            className: "w-24 lg:w-28 bg-transparent text-sm text-[#1a1a2e] placeholder:text-black/45 outline-none py-2"
          })
        ),

        /* Search button */
        React.createElement("button", {
          type: "button",
          onClick: () => {
            const exp = selectedExperience && selectedExperience !== "All Experience Levels" ? selectedExperience : "";
            if (onSearch) onSearch({ query: searchQuery, location: locationQuery, category: exp });
            else setView("search");
          },
          className: "ml-1 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#4a3aff] hover:bg-[#3d2fd6] text-white text-sm sm:text-[15px] font-bold rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer flex-shrink-0 active:scale-95"
        }, "Search")
      ),

      /* Category chips */
      React.createElement("div", { className: "mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3" },
        heroCategories.map((cat) =>
          React.createElement("button", {
            key: cat.label,
            type: "button",
            onClick: () => {
              if (onSearch) onSearch({ query: cat.label, department: cat.label });
              else setView("search");
            },
            className: "group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-[#d8d6d2] rounded-full text-sm text-black/75 font-medium hover:border-[#4a3aff]/60 hover:text-[#4a3aff] hover:bg-white hover:shadow-md transition-all cursor-pointer"
          },
            React.createElement(cat.icon, { className: "w-4 h-4 text-black/45 group-hover:text-[#4a3aff] transition-colors" }),
            React.createElement("span", null, cat.label),
            React.createElement(ChevronRight, { className: "w-3.5 h-3.5 text-black/35 group-hover:text-[#4a3aff] transition-colors" })
          )
        )
      )
    )
  ),

  /* Close the experience dropdown when clicking outside */
  experienceOpen && React.createElement("div", {
    className: "fixed inset-0 z-40",
    onClick: () => setExperienceOpen(false)
  }),

  /* @__PURE__ */ React.createElement("section", { className: "py-6 bg-[#f3f2ef] border-b border-[#e0dfdc]" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl sm:text-3xl font-extralight text-foreground" }, "Find the right internship or job for you"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60 mt-1" }, "Browse open roles by domain specialties")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("search"),
      className: "text-sm font-semibold text-[#00BFEA] hover:underline flex items-center gap-1 self-start cursor-pointer"
    },
    "See all categories ",
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  )), internshipError && React.createElement("p", { role: "alert", className: "mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" }, internshipError), internshipsLoading ? React.createElement("p", { className: "py-6 text-center text-sm text-muted-foreground" }, "Loading current internshipsâ€¦") : internshipError ? null : quickSearches.length === 0 ? React.createElement("p", { className: "py-6 text-center text-sm text-muted-foreground" }, "No published internships are available yet.") : React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" }, quickSearches.map((item) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: item.label,
      onClick: () => setView("search"),
      className: "flex items-center justify-between p-4 bg-white hover:bg-[#edf3f8] border border-[#e0dfdc] hover:border-[#0a66c2]/40 rounded-2xl transition-all text-left group shadow-2xs cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-sm text-foreground group-hover:text-[#0a66c2] transition-colors" }, item.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/50 mt-0.5" }, item.count)),
    /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-full bg-[#f3f2ef] group-hover:bg-[#0a66c2] text-black/50 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0" }, /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-4 h-4" }))
  ))), /* @__PURE__ */ React.createElement("div", { className: "pt-6 border-t border-[#e0dfdc]" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-foreground" }, "Browse Opportunities by Track"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/60 mt-0.5" }, "Explore specialized roles across IT and NON IT sectors")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center p-1 bg-white rounded-full border border-[#e0dfdc] self-start flex-wrap gap-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveCategoryTab("IT"),
      className: `px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeCategoryTab === "IT" ? "bg-[#0a66c2] text-white shadow-xs" : "text-black/60 hover:text-foreground"}`
    },
    `IT Categories (${internships.filter((j) => (j.category || "").toUpperCase() === "IT").length})`
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveCategoryTab("NON IT"),
      className: `px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeCategoryTab === "NON IT" ? "bg-[#0a66c2] text-white shadow-xs" : "text-black/60 hover:text-foreground"}`
    },
    `NON IT Categories (${internships.filter((j) => (j.category || "").toUpperCase() === "NON IT").length})`
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveCategoryTab("ALL"),
      className: `px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeCategoryTab === "ALL" ? "bg-[#0a66c2] text-white shadow-xs" : "text-black/60 hover:text-foreground"}`
    },
    `All Roles (${internships.length})`
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, filteredTrackJobs.length === 0 ? /* @__PURE__ */ React.createElement(
    "div",
    { className: "col-span-full py-12 px-6 bg-white border border-[#e0dfdc] rounded-2xl text-center" },
    /* @__PURE__ */ React.createElement(Briefcase, { className: "w-10 h-10 text-black/30 mx-auto mb-3" }),
    /* @__PURE__ */ React.createElement("h4", { className: "text-base font-semibold text-foreground mb-1" }, `No ${activeCategoryTab === "ALL" ? "" : activeCategoryTab} internships posted yet`),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/60 max-w-md mx-auto mb-4" }, "Opportunities posted from the employer dashboard will appear dynamically here in real-time."),
    activeCategoryTab !== "ALL" && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveCategoryTab("ALL"),
        className: "px-4 py-2 bg-[#0a66c2] text-white rounded-full text-xs font-semibold hover:bg-[#004182] transition-colors cursor-pointer"
      },
      "View All Opportunities"
    )
  ) : filteredTrackJobs.map((job) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: job.id,
      onClick: () => {
        if (onSelectInternship) onSelectInternship(job);
        else setView("search");
      },
      className: "bg-white border border-[#e0dfdc] rounded-2xl p-5 text-left hover:border-[#0a66c2] hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
    },
    /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2 mb-3" },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" },
          /* @__PURE__ */ React.createElement(
            "div",
            {
              className: "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-2xs",
              style: { backgroundColor: job.logoColor || "#0a66c2" }
            },
            job.logo || (job.company ? job.company.slice(0, 2).toUpperCase() : "ID")
          ),
          /* @__PURE__ */ React.createElement("div", { className: "min-w-0" },
            /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-black/60 truncate" }, job.company || "Company"),
            /* @__PURE__ */ React.createElement(
              "span",
              { className: "inline-block text-[10px] font-semibold text-[#0a66c2] bg-[#0a66c2]/10 px-2 py-0.5 rounded-full mt-0.5 truncate max-w-[130px]" },
              job.department || `${job.category || "General"} Track`
            )
          )
        ),
        /* @__PURE__ */ React.createElement(
          "span",
          { className: "text-[10px] text-black/50 bg-[#f3f2ef] px-2 py-0.5 rounded font-medium flex-shrink-0" },
          job.posted || job.ago || "Recent"
        )
      ),
      /* @__PURE__ */ React.createElement(
        "h4",
        { className: "font-bold text-foreground text-sm mb-1.5 group-hover:text-[#0a66c2] transition-colors line-clamp-2" },
        job.title
      ),
      /* @__PURE__ */ React.createElement("div", { className: "space-y-1 mb-3 text-xs text-black/60" },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 truncate" },
          /* @__PURE__ */ React.createElement(MapPin, { className: "w-3.5 h-3.5 text-black/40 flex-shrink-0" }),
          /* @__PURE__ */ React.createElement("span", { className: "truncate" }, job.location || "Remote"),
          /* @__PURE__ */ React.createElement("span", { className: "text-black/30" }, "·"),
          /* @__PURE__ */ React.createElement("span", { className: "font-medium text-black/80" }, job.workMode || job.mode || "Hybrid")
        ),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs pt-1" },
          /* @__PURE__ */ React.createElement(
            "span",
            { className: "font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100" },
            job.stipend || (job.stipendAmount ? `₹${Number(job.stipendAmount).toLocaleString("en-IN")}/mo` : "Paid")
          ),
          /* @__PURE__ */ React.createElement("span", { className: "text-black/50 text-[11px] font-medium" }, job.duration || "3 Months")
        )
      ),
      Array.isArray(job.skills) && job.skills.length > 0 && /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex flex-wrap gap-1 mt-2" },
        job.skills.slice(0, 3).map((skill) => /* @__PURE__ */ React.createElement(
          "span",
          { key: skill, className: "px-2 py-0.5 bg-[#f3f2ef] rounded text-[10px] text-black/70 font-medium" },
          skill
        )),
        job.skills.length > 3 && /* @__PURE__ */ React.createElement(
          "span",
          { className: "px-1.5 py-0.5 bg-[#f3f2ef] rounded text-[10px] text-black/50 font-medium" },
          `+${job.skills.length - 3}`
        )
      )
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "mt-4 pt-3 border-t border-[#f3f2ef] flex items-center justify-between text-xs font-semibold text-[#0a66c2]" },
      /* @__PURE__ */ React.createElement("span", null, "View Opportunity & Apply"),
      /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" })
    )
  )))))),

  /* â”€â”€ HOW INTERNDESK WORKS & SUCCESS HIGHLIGHTS (NEW SECTION) â”€â”€ */
  React.createElement("section", { className: "py-10 lg:py-14 bg-white border-b border-[#e0dfdc]" },
    React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6" },
      /* Section Header */
      React.createElement("div", { className: "text-center max-w-2xl mx-auto mb-10" },
        React.createElement("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4a3aff]/10 text-[#4a3aff] text-xs font-semibold mb-3" },
          React.createElement(Sparkles, { className: "w-3.5 h-3.5" }),
          React.createElement("span", null, "Simple, Direct & Fast")
        ),
        React.createElement("h2", { className: "text-2xl sm:text-4xl font-light text-foreground tracking-tight" },
          "How to land your dream internship in ",
          React.createElement("span", { className: "font-semibold text-[#4a3aff]" }, "3 simple steps")
        ),
        React.createElement("p", { className: "mt-2.5 text-sm sm:text-base text-black/60" },
          "We cut out the noise so you can connect directly with hiring managers faster than ever."
        )
      ),

      /* 3 Step Cards */
      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
        [
          {
            step: "01",
            title: "Build Your Smart Profile",
            desc: "Create your student profile in under 2 minutes. Add your skills, projects, and college details to get verified instantly.",
            badge: "2-Min Setup",
            color: "text-blue-600",
            bg: "bg-blue-50"
          },
          {
            step: "02",
            title: "1-Click Direct Applications",
            desc: "Filter verified internships by domain, location, and stipend. Apply directly without external redirects.",
            badge: "Verified Stipends",
            color: "text-violet-600",
            bg: "bg-violet-50"
          },
          {
            step: "03",
            title: "Interview & Get Hired",
            desc: "Track status updates in real-time on your dashboard. Receive interview invites and verified offers directly.",
            badge: "Fast Turnaround",
            color: "text-emerald-600",
            bg: "bg-emerald-50"
          }
        ].map((item) =>
          React.createElement("div", {
            key: item.step,
            className: "relative bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#4a3aff]/50 rounded-2xl p-6 transition-all hover:shadow-md group flex flex-col justify-between"
          },
            React.createElement("div", null,
              React.createElement("div", { className: "flex items-center justify-between mb-4" },
                React.createElement("span", { className: `text-2xl font-black ${item.color} tracking-tight` }, item.step),
                React.createElement("span", { className: `text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${item.bg} ${item.color}` }, item.badge)
              ),
              React.createElement("h3", { className: "text-lg font-semibold text-foreground mb-2 group-hover:text-[#4a3aff] transition-colors" }, item.title),
              React.createElement("p", { className: "text-xs sm:text-sm text-black/60 leading-relaxed" }, item.desc)
            ),
            React.createElement("div", { className: "mt-5 pt-4 border-t border-[#e2e8f0]/60 flex items-center gap-1.5 text-xs font-semibold text-[#4a3aff]" },
              React.createElement(CheckCircle2, { className: "w-4 h-4 text-emerald-500" }),
              React.createElement("span", null, "100% Free for Students")
            )
          )
        )
      )
    )
  ),

  /* @__PURE__ */ React.createElement("section", { className: "py-6 bg-white border-b border-[#e0dfdc]" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#f3f2ef] border border-[#e0dfdc] rounded-3xl p-6 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-7 space-y-4" }, /* @__PURE__ */ React.createElement("span", { className: "inline-block text-xs font-bold tracking-wider text-[#0a66c2] uppercase" }, "Employers & Recruiters"), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl sm:text-4xl font-extralight text-foreground leading-tight" }, "Post your internship for free and connect with qualified students"), /* @__PURE__ */ React.createElement("p", { className: "text-sm sm:text-base text-black/60 leading-relaxed" }, "Reach students across engineering, business, finance, and design."), /* @__PURE__ */ React.createElement("div", { className: "pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setAuthParams({ mode: "register", role: "company" });
        setView("auth");
      },
      className: "px-8 py-3.5 bg-[#0a66c2] text-white hover:bg-[#004182] font-semibold text-base rounded-full transition-colors shadow-xs cursor-pointer"
    },
    "Post an internship for free"
  ))), /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-5 flex justify-center" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=350&fit=crop&auto=format",
      alt: "Recruiters hiring candidates",
      className: "rounded-2xl object-cover shadow-sm w-full max-h-[280px] border border-[#e0dfdc]"
    }
  ))))), /* @__PURE__ */ React.createElement("section", { className: "py-6 bg-white border-b border-[#e0dfdc]" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center max-w-2xl mx-auto mb-6 space-y-2" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-extralight text-foreground" }, "Who is InternDesk for?"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60" }, "Anyone looking to navigate their professional life")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex flex-col justify-between space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center mb-5" }, /* @__PURE__ */ React.createElement(GraduationCap, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-xl text-foreground mb-2" }, "Students & Graduates"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/60 leading-relaxed" }, "Discover thousands of verified internships across engineering, business, design, and marketing. Build a professional resume and apply directly.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("search"),
      className: "w-full py-3 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#f4faff] font-semibold text-xs rounded-full transition-colors cursor-pointer"
    },
    "Find an Internship"
  )), /* @__PURE__ */ React.createElement("div", { className: "p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex flex-col justify-between space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center mb-5" }, /* @__PURE__ */ React.createElement(Building2, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-xl text-foreground mb-2" }, "Employers & Hiring Managers"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/60 leading-relaxed" }, "Post internship positions, evaluate student applications, manage hiring pipelines, and hire top campus talent seamlessly.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setAuthParams({ mode: "register", role: "company" });
        setView("auth");
      },
      className: "w-full py-3 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#f4faff] font-semibold text-xs rounded-full transition-colors cursor-pointer"
    },
    "Post an Opportunity"
  )), /* @__PURE__ */ React.createElement("div", { className: "p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex flex-col justify-between space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center mb-5" }, /* @__PURE__ */ React.createElement(BookOpen, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-xl text-foreground mb-2" }, "Colleges & Universities"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/60 leading-relaxed" }, "Connect your students with top hiring partners, track placement statistics, and provide career resources to elevate student success.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("career-resources"),
      className: "w-full py-3 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#f4faff] font-semibold text-xs rounded-full transition-colors cursor-pointer"
    },
    "Explore Resources"
  ))))), /* @__PURE__ */ React.createElement("section", { className: "py-6 bg-[#f3f2ef]" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1128px] mx-auto px-4 sm:px-6 text-center space-y-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl sm:text-5xl font-extralight text-foreground max-w-2xl mx-auto leading-tight" }, "Join your classmates, colleagues, and top employers on InternDesk."), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4 pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setAuthParams({ mode: "register", role: "student" });
        setView("auth");
      },
      className: "w-full sm:w-auto px-10 py-4 bg-[#0a66c2] text-white hover:bg-[#004182] font-semibold text-base rounded-full transition-colors shadow-xs cursor-pointer"
    },
    "Get started"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setAuthParams({ mode: "login", role: "student" });
        setView("auth");
      },
      className: "w-full sm:w-auto px-10 py-4 bg-white border border-black/60 text-black/80 hover:bg-black/5 font-semibold text-base rounded-full transition-colors cursor-pointer"
    },
    "Sign in"
  )))));
}
export {
  LandingPage
};
