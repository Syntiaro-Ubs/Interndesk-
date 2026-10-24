import React, { useState } from "react";
import { MapPin, Clock, CheckCircle, Calendar, Bookmark } from "lucide-react";
import { ModeBadge, CategoryBadge, LogoMark, StarRating } from "./Badges";
import { EasyApplyModal } from "../EasyApplyModal";

function InternshipCard({ internship, onNavigate, onSelectInternship, userInfo, isSaved = false, onToggleSaved, isApplied = false, onSuccess }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const openDetails = () => onSelectInternship ? onSelectInternship(internship) : onNavigate?.("details");

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
      {showApplyModal && <EasyApplyModal internship={internship} userInfo={userInfo} onClose={() => setShowApplyModal(false)} onSuccess={(id) => { onSuccess?.(id); setShowApplyModal(false); }} />}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <LogoMark logo={internship.logo} color={internship.logoColor} />
          <div><p className="text-xs text-muted-foreground">{internship.company}</p><button onClick={openDetails} className="text-sm font-semibold text-[#00BFEA] hover:underline transition-colors text-left mt-0.5">{internship.title}</button></div>
        </div>
        <button type="button" onClick={() => onToggleSaved?.(internship)} disabled={!onToggleSaved} aria-pressed={isSaved} aria-label={isSaved ? "Remove saved internship" : "Save internship"} className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary" : ""}`} />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{internship.location}</span><span className="text-border">·</span><ModeBadge mode={internship.mode} /><span className="text-border">·</span><CategoryBadge category={internship.category} /></div>
      <div className="flex items-center gap-4 mb-3 text-xs"><span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />{internship.duration}</span></div>
      <div className="flex items-center justify-between pt-3 border-t border-border"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />Deadline: {internship.deadline}</span>{isApplied ? <span className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#00CC00] text-white font-bold rounded-lg text-xs"><CheckCircle className="w-3.5 h-3.5" />Applied</span> : <button onClick={() => setShowApplyModal(true)} className="px-3 py-1.5 bg-white border border-[#0a66c2] text-[#0a66c2] rounded-lg text-xs font-semibold hover:bg-emerald-50 transition-colors cursor-pointer">Easy Apply</button>}</div>
      <p className="text-xs text-muted-foreground mt-2">Posted {internship.posted}</p>
    </div>
  );
}

function CompanyCard({ company, onNavigate, onViewCompany }) {
  return <div className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3 mb-3">{company.logoUrl ? <img src={company.logoUrl} className="w-10 h-10 rounded-xl object-cover border border-border flex-shrink-0" alt={company.name} /> : <LogoMark logo={company.logo} color={company.logoColor} size="lg" />}<div><h3 className="font-semibold text-foreground text-sm">{company.name}</h3><p className="text-xs text-muted-foreground">{company.industry}</p>{company.rating !== undefined && Number.isFinite(Number(company.rating)) && <StarRating rating={Number(company.rating)} />}</div></div>
    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{company.description}</p>
    <div className="flex items-center justify-between pt-3 border-t border-border"><span className="text-xs font-semibold text-primary">{company.openings} Open Internships</span><button onClick={() => onViewCompany ? onViewCompany() : onNavigate?.("companies")} className="px-3 py-1.5 border border-primary text-primary rounded-lg text-xs font-medium hover:bg-primary/5 transition-colors">View Company</button></div>
  </div>;
}

export { CompanyCard, InternshipCard };
