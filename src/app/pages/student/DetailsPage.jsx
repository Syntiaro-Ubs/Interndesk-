import React, { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, Calendar, MapPin, Users } from "lucide-react";
import { api } from "../../api";
import { CategoryBadge, ModeBadge } from "../../components/ui/Badges";
import { EasyApplyModal } from "../../components/EasyApplyModal";

export function DetailsPage({ setView, internship: selectedInternship, userInfo }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  useEffect(() => {
    let active = true;
    if (userInfo?.id && selectedInternship?.id) {
      api.applications()
        .then((items) => { if (active) setIsApplied(items.some((item) => Number(item.jobId) === Number(selectedInternship.id))); })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [selectedInternship?.id, userInfo?.id]);

  if (!selectedInternship) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">No internship selected</h1>
        <p className="text-sm text-muted-foreground">Choose an opening to view its details.</p>
        <button onClick={() => setView("search")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Browse internships</button>
      </main>
    );
  }

  const skills = Array.isArray(selectedInternship.skills) ? selectedInternship.skills : [];
  const perks = Array.isArray(selectedInternship.perks) ? selectedInternship.perks : [];
  const responsibilities = String(selectedInternship.responsibilities || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const eligibility = String(selectedInternship.eligibility || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);

  return (
    <main className="min-h-screen bg-background">
      {showApplyModal && <EasyApplyModal internship={selectedInternship} userInfo={userInfo} onClose={() => setShowApplyModal(false)} onSuccess={() => setIsApplied(true)} />}
      <div className="max-w-[1128px] mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setView("search")} className="inline-flex items-center gap-2 text-sm text-primary mb-5"><ArrowLeft className="w-4 h-4" />Back to internships</button>
        <section className="bg-card border border-border rounded-xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div>
              <p className="text-sm text-muted-foreground">{selectedInternship.company}</p>
              <h1 className="text-2xl font-semibold text-foreground mt-1">{selectedInternship.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                {selectedInternship.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedInternship.location}</span>}
                {selectedInternship.mode && <ModeBadge mode={selectedInternship.mode} />}
                {selectedInternship.category && <CategoryBadge category={selectedInternship.category} />}
              </div>
            </div>
            {userInfo?.id && <button disabled={isApplied || selectedInternship.status === "Closed"} onClick={() => { setApplicationError(""); setShowApplyModal(true); }} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-60 cursor-pointer">{selectedInternship.status === "Closed" ? "Applications Closed" : isApplied ? "Applied" : "Apply"}</button>}
          </div>
          {applicationError && <p role="alert" className="mt-3 text-sm text-red-600">{applicationError}</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              [Briefcase, "Duration", selectedInternship.duration],
              [MapPin, "Work mode", selectedInternship.mode],
              [Users, "Openings", selectedInternship.openings],
              [Calendar, "Deadline", selectedInternship.deadline ? new Date(selectedInternship.deadline).toLocaleDateString() : ""],
            ].filter(([, , value]) => value !== undefined && value !== null && value !== "").map(([Icon, label, value]) => (
              <div key={label} className="rounded-lg bg-background p-3 text-center">
                <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground mt-1">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-[1fr_320px] gap-5 mt-5">
          <section className="bg-card border border-border rounded-xl p-5 sm:p-7 space-y-6">
            {selectedInternship.description && <div><h2 className="font-semibold text-foreground mb-2">About this internship</h2><p className="text-sm text-muted-foreground whitespace-pre-line">{selectedInternship.description}</p></div>}
            {responsibilities.length > 0 && <div><h2 className="font-semibold text-foreground mb-2">Responsibilities</h2><ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{responsibilities.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
            {eligibility.length > 0 && <div><h2 className="font-semibold text-foreground mb-2">Eligibility</h2><ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{eligibility.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
            {skills.length > 0 && <div><h2 className="font-semibold text-foreground mb-2">Skills</h2><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">{skill}</span>)}</div></div>}
            {perks.length > 0 && <div><h2 className="font-semibold text-foreground mb-2">Benefits</h2><div className="flex flex-wrap gap-2">{perks.map((perk) => <span key={perk} className="px-3 py-1 bg-background text-sm rounded-lg">{perk}</span>)}</div></div>}
            {!selectedInternship.description && responsibilities.length === 0 && eligibility.length === 0 && skills.length === 0 && perks.length === 0 && <p className="text-sm text-muted-foreground">No additional details have been provided for this opening.</p>}
          </section>
          <aside className="bg-card border border-border rounded-xl p-5 h-fit">
            <h2 className="font-semibold text-foreground mb-3">Compensation</h2>
            <p className="text-lg font-semibold text-primary">{selectedInternship.stipend || "Not specified"}</p>
            {selectedInternship.department && <p className="text-sm text-muted-foreground mt-3">Department: {selectedInternship.department}</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
