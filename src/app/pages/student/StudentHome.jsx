import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, ChevronDown, CheckCircle, Calendar, FileText, Bookmark, Monitor, AlertCircle } from "lucide-react";
import { api } from "../../api";
import { InternshipCard } from "../../components/ui/Cards";
import { EasyApplyModal } from "../../components/EasyApplyModal";
import { CAREER_RESOURCES } from "./CareerResources";
import logoUrl from "../../../assets/interndesknewlogos.png";
import { toast } from "sonner";

function StudentHome({ setView, userInfo, onSelectInternship, onSearch }) {
  const [internships, setInternships] = useState([]);
  const [tabletSearchQuery, setTabletSearchQuery] = useState("");
  const [tabletLocationQuery, setTabletLocationQuery] = useState("");
  const [profileSkills, setProfileSkills] = useState([]);
  const [selectedForApply, setSelectedForApply] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [internshipError, setInternshipError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [savedError, setSavedError] = useState("");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchHomeData = () => {
      api.internships().then((items) => { if (active) { setInternships(items || []); setInternshipError(""); } }).catch((error) => { if (active) setInternshipError(error.message || "Could not load internships."); }).finally(() => { if (active) setInternshipsLoading(false); });
      api.companies().then((items) => { if (active) setCompanies(items || []); }).catch(() => {});
      if (userInfo?.id) api.studentProfile().then((profile) => { if (active) setProfileSkills(profile.skills || []); }).catch((error) => { if (active) setProfileError(error.message || "Could not load your profile."); });
      if (userInfo?.id) api.applications().then((items) => { if (active) setAppliedIds(items.map((item) => Number(item.jobId))); }).catch((error) => { if (active) setApplicationsError(error.message || "Could not load your applications."); });
      if (userInfo?.id) api.savedInternships().then((items) => { if (active) setSavedIds(items.map((item) => Number(item.id))); }).catch((error) => { if (active) setSavedError(error.message || "Could not load saved internships."); });
    };

    fetchHomeData();
    const handleSync = () => fetchHomeData();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [userInfo?.id]);

  const toggleSaved = async (internship) => {
    const saved = savedIds.includes(Number(internship.id));
    try {
      if (saved) await api.unsaveInternship(internship.id);
      else await api.saveInternship(internship.id);
      setSavedIds((current) => saved ? current.filter((id) => id !== Number(internship.id)) : [...current, Number(internship.id)]);
      setSavedError("");
    } catch (error) {
      toast.error(error.message || "Could not update saved internships.");
    }
  };

  const filteredMatches = internships.filter((i) => {
    if (selectedCategoryTab === "IT") return (i.category || "").toUpperCase() === "IT";
    if (selectedCategoryTab === "NON IT") return (i.category || "").toUpperCase() === "NON IT";
    if (profileSkills.length > 0) {
      const skillsLower = profileSkills.map((s) => s.toLowerCase());
      const hasSkillMatch = (i.skills || []).some((s) => skillsLower.includes(s.toLowerCase()));
      if (hasSkillMatch) return true;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1128px] mx-auto px-4 sm:px-6 py-4">
        {selectedForApply && (
          <EasyApplyModal
            internship={selectedForApply}
            userInfo={userInfo}
            onClose={() => setSelectedForApply(null)}
            onSuccess={(id) => setAppliedIds((prev) => [...prev, id])}
          />
        )}

        {/* Search bar (tablet only) */}
        <div className="bg-card border border-border rounded-lg p-4 mb-4 shadow-sm hidden md:block lg:hidden">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 bg-background rounded-lg">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input type="text" value={tabletSearchQuery} onChange={(e) => setTabletSearchQuery(e.target.value)} placeholder="Search internships, companies, or skills" className="bg-transparent text-sm outline-none w-full min-w-0" />
            </div>
            <div className="flex items-center gap-2 sm:w-64 px-4 py-3 bg-background rounded-lg">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input type="text" value={tabletLocationQuery} onChange={(e) => setTabletLocationQuery(e.target.value)} placeholder="City, state, or remote" className="bg-transparent text-sm outline-none w-full min-w-0" />
            </div>
            <button onClick={() => { if (onSearch) onSearch({ query: tabletSearchQuery, location: tabletLocationQuery }); else setView("search"); }} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">Search</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 space-y-4 min-w-0">

            {/* Recommended internships */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-medium text-foreground">Recommended for you</h2>
                  <p className="text-sm text-muted-foreground mt-1">Current openings from verified companies</p>
                </div>
              </div>
              {internshipError && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{internshipError}</p>}
              {internshipsLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading internships…</p>
              ) : !internshipError && internships.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center my-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-1">No internships posted yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    When registered companies post new internship opportunities, they will appear here in real-time.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {!internshipsLoading && !internshipError && internships.slice(0, 6).map((i) => (
                  <InternshipCard key={i.id} internship={i} onNavigate={setView} onSelectInternship={(item) => { onSelectInternship?.(item); setView("details"); }} userInfo={userInfo} isSaved={savedIds.includes(Number(i.id))} onToggleSaved={toggleSaved} isApplied={appliedIds.includes(Number(i.id))} onSuccess={(id) => setAppliedIds((current) => [...new Set([...current, Number(id)])])} />
                ))}
              </div>
            </div>

            {/* Quick-access cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Applications */}
              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setView("applications")}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-background rounded-lg text-xs font-medium text-foreground">{appliedIds.length} Applications</span>
                </div>
                <h3 className="text-base font-medium text-foreground">Continue Applications</h3>
                <p className="text-sm text-muted-foreground mt-1">{applicationsError || `${appliedIds.length} applications submitted.`}</p>
              </div>

              {/* Saved Internships */}
              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setView("search")}>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-medium text-foreground">Saved Internships</h3>
                <p className="text-sm text-muted-foreground mt-1">{savedError || "Saved internships from your account."}</p>
              </div>

              {/* ATS Resume Builder */}
              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setView("resume-builder")}>
                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-medium text-foreground">Free ATS Resume Builder</h3>
                <p className="text-sm text-muted-foreground mt-1">Build, preview, and save a resume in an ATS-friendly format.</p>
              </div>
            </div>

            {/* Top matches */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-foreground">Top matches for your department &amp; skills</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profileSkills.length ? `Skills: ${profileSkills.join(", ")}` : "Select a category below to explore matching department internships."}
                  </p>
                  {profileError && <p role="alert" className="mt-1 text-xs text-red-600">{profileError}</p>}
                </div>
                <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border flex-wrap">
                  {[{ id: "All", label: "All Roles" }, { id: "IT", label: "IT Department" }, { id: "NON IT", label: "NON IT Roles" }].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategoryTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategoryTab === tab.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-border">
                {filteredMatches.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm font-medium text-foreground">No {selectedCategoryTab === "All" ? "" : selectedCategoryTab} internships found right now.</p>
                    <button onClick={() => setSelectedCategoryTab("All")} className="mt-2 text-xs text-primary font-semibold hover:underline">View all internships</button>
                  </div>
                ) : filteredMatches.map((i) => (
                  <div key={i.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 hover:bg-background/50 transition-colors">
                    <div className="w-14 h-14 bg-[#f8fafc] border border-[#e0dfdc] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: i.logoColor }}>
                      <span className="text-white font-bold text-lg">{i.logo}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${i.category === "IT" ? "bg-sky-100 text-sky-800" : "bg-violet-100 text-violet-800"}`}>{i.category || "General"}</span>
                        {i.department && <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">{i.department}</span>}
                      </div>
                      <h3 onClick={() => { onSelectInternship?.(i); setView("details"); }} className="text-base font-semibold text-[#00BFEA] hover:underline cursor-pointer truncate">{i.title}</h3>
                      <p className="text-sm text-black/90 mt-0.5">{i.company}</p>
                      <p className="text-sm text-black/60 mb-1.5">{i.location} ({i.mode})</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">{i.duration}</span>
                        {i.stipend && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{i.stipend}</span>}
                      </div>
                      <p className="text-xs text-black/50 mb-2">Posted {i.posted}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {appliedIds.includes(i.id) ? (
                        <span className="flex items-center justify-center gap-1.5 px-6 py-1.5 bg-[#00CC00] text-white font-bold rounded-lg text-sm transition-colors">
                          <CheckCircle className="w-4 h-4" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedForApply(i)}
                          className="px-6 py-1.5 bg-white border border-[#0a66c2] text-[#0a66c2] rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          Easy Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-background text-center">
                <button onClick={() => setView("search")} className="text-sm font-medium text-primary hover:underline">Show all internships</button>
              </div>
            </div>

            {/* Career Insights */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-medium text-foreground">Career Insights &amp; Prep</h2>
                <button onClick={() => setView("career-resources")} className="text-sm font-medium text-primary hidden sm:block">View all resources</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "How to Ace Your Technical Internship Interview: 5 Proven Strategies",
                    cat: "Interview Prep",
                    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop&auto=format"
                  },
                  {
                    title: "Building an ATS-Friendly Resume that Gets Shortlisted by Tech Recruiters",
                    cat: "Resume Guide",
                    img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=240&fit=crop&auto=format"
                  },
                  {
                    title: "Understanding PPOs and Stipend Benchmarks Across Top Tech Hubs",
                    cat: "Career Strategy",
                    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop&auto=format"
                  }
                ].map((article) => (
                  <div key={article.title} onClick={() => setView("career-resources")} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <img src={article.img} alt={article.title} className="w-full h-32 object-cover bg-background" />
                    <div className="p-4">
                      <span className="text-xs font-medium text-primary">{article.cat}</span>
                      <h3 className="text-sm font-medium text-foreground mt-1.5 line-clamp-2 leading-snug">{article.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-[300px] flex-shrink-0 space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-foreground">Hiring Companies</h3>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline" onClick={() => setView("companies")}>View all</span>
              </div>
              {companies.filter((c) => (c.openPositionsCount || 0) > 0).length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No active hiring companies.</p>
              ) : (
                <ul className="space-y-3">
                  {companies.filter((c) => (c.openPositionsCount || 0) > 0).slice(0, 5).map((comp) => (
                    <li key={comp.id} onClick={() => setView("companies")} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: comp.logoColor || "#0a66c2" }}>
                        {(comp.name || "C").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{comp.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{comp.industry || comp.domain || "Technology"} • {comp.openPositionsCount || 0} open</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="hidden lg:flex flex-wrap justify-center gap-x-4 gap-y-2 px-6 py-4 text-center">
              {[
                { label: "About", view: "landing" },
                { label: "Accessibility", view: "help" },
                { label: "Help Center", view: "help" },
                { label: "Privacy & Terms", view: "settings-privacy" },
                { label: "Ad Choices", view: "help" },
                { label: "Advertising", view: "companies" },
                { label: "Business Services", view: "company-portal" }
              ].map((l) => (
                <button
                  type="button"
                  key={l.label}
                  onClick={() => setView(l.view)}
                  className="text-[12px] text-muted-foreground hover:text-primary cursor-pointer hover:underline bg-transparent border-0 p-0"
                >
                  {l.label}
                </button>
              ))}
              <div className="w-full flex items-center justify-center gap-2 mt-2">
                <img src={logoUrl} alt="InternDesk" className="h-4" />
                <span className="text-[12px] text-muted-foreground">Corporation &copy; 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StudentHome };
