import React, { useEffect, useState } from "react";
import { Search, Building2, ChevronRight, Filter } from "lucide-react";
import { api } from "../../api";
import { CompanyCard } from "../../components/ui/Cards";

function CompaniesPage({ setView, setSelectedCompany }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchCompanies = () => {
      api.companies().then((items) => {
        if (active) setCompanies((items || []).map((company) => ({
          ...company,
          industry: company.industry || company.domain || "Software & Technology",
          logo: (company.name || "").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CO",
          logoColor: company.logoColor || "#0a66c2",
        })));
      }).catch((requestError) => {
        if (active) setError(requestError.message || "Could not load companies.");
      }).finally(() => { if (active) setLoading(false); });
    };

    fetchCompanies();
    const handleSync = () => fetchCompanies();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const filtered = companies.filter((company) => {
    const query = search.toLowerCase();
    const compIndustry = company.industry || company.domain || "";
    const matchesSearch = (company.name || "").toLowerCase().includes(query) || compIndustry.toLowerCase().includes(query);
    return matchesSearch && (industry === "All" || compIndustry.includes(industry));
  });
  const industries = ["All", ...new Set(companies.map((company) => company.industry || company.domain).filter(Boolean))];

  return <div className="min-h-screen bg-background"><div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mb-5"><button onClick={() => setView("landing")} className="hover:text-primary">Home</button><ChevronRight className="w-3 h-3" /><span className="text-foreground font-medium">Companies</span></div>
    <div className="mb-5"><h1 className="text-2xl font-medium text-foreground">Top Hiring Companies</h1><p className="text-sm text-muted-foreground mt-1.5">Explore companies actively hiring across Business and Technology domains</p></div>
    <div className="bg-card border border-border rounded-xl p-4 mb-6"><div className="flex gap-2">
      <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-background rounded-xl min-w-0"><Search className="w-4 h-4 text-muted-foreground flex-shrink-0" /><input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search companies..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" /></div>
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-background rounded-xl flex-shrink-0"><Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" /><select value={industry} onChange={(event) => setIndustry(event.target.value)} className="bg-transparent text-sm outline-none text-foreground cursor-pointer max-w-[100px] sm:max-w-[160px]">{industries.map((item) => <option key={item} value={item}>{item === "All" ? "All Industries" : item}</option>)}</select></div>
    </div></div>
    {!loading && !error && <p className="text-sm text-muted-foreground mb-5">Showing <span className="font-medium text-foreground">{filtered.length}</span> companies</p>}
    {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading companies…</p> : error ? null : filtered.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map((company) => <CompanyCard key={company.id} company={company} onNavigate={setView} onViewCompany={() => { setSelectedCompany(company); setView("company-profile"); }} />)}</div> : <div className="flex flex-col items-center justify-center py-12 text-center"><div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4"><Building2 className="w-8 h-8 text-muted-foreground" /></div><h3 className="text-base font-medium text-foreground mb-1">{companies.length === 0 ? "No companies registered yet" : "No companies found"}</h3><p className="text-sm text-muted-foreground max-w-sm">{companies.length === 0 ? "When employers register their companies, they will be listed here." : "Try adjusting your search or industry filter."}</p></div>}
    <div className="mt-5 bg-card border border-border rounded-xl p-4 sm:p-5"><h2 className="text-lg font-medium text-foreground mb-4 text-center">Why Companies Choose InternDesk</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"><div><p className="text-2xl font-medium text-primary">{companies.length}</p><p className="text-xs text-muted-foreground mt-1">Verified Companies</p></div></div></div>
  </div></div>;
}

export { CompaniesPage };
