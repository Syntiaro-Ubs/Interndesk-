import React, { useEffect, useState } from "react";
import { MapPin, GraduationCap, User } from "lucide-react";
import { api } from "../../api";

export function PublicStudentProfile({ id }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.publicStudentProfile(id)
      .then((data) => { if (active) setProfile(data); })
      .catch((requestError) => { if (active) setError(requestError.message || "This profile is unavailable."); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="max-w-3xl mx-auto px-5 py-12 text-center text-muted-foreground">{error}</main>;
  if (!profile) return <main className="max-w-3xl mx-auto px-5 py-12 text-center text-muted-foreground">Loading profile…</main>;

  const details = profile.profileData || {};
  const education = details.education || (profile.college ? [{ inst: profile.college, degree: profile.degree, year: profile.graduationYear }] : []);
  const skills = details.skillLevels || (profile.skills || []).map((name) => ({ name }));

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <article className="max-w-3xl mx-auto space-y-5">
        <header className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-5">
            {details.avatar ? <img src={details.avatar} alt="" className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center"><User className="w-8 h-8" /></div>}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-foreground">{profile.fullName}</h1>
              {details.headline && <p className="text-muted-foreground mt-1">{details.headline}</p>}
              {profile.location && <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2"><MapPin className="w-4 h-4" />{profile.location}</p>}
            </div>
          </div>
          {profile.bio && <p className="text-sm leading-relaxed mt-6 whitespace-pre-line">{profile.bio}</p>}
        </header>

        {education.length > 0 && <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4"><GraduationCap className="w-5 h-5 text-primary" />Education</h2>
          <div className="space-y-3">{education.map((item, index) => <div key={`${item.inst}-${index}`}>
            <p className="font-medium">{item.degree}</p>
            <p className="text-sm text-muted-foreground">{item.inst}{item.year ? ` · ${item.year}` : ""}</p>
          </div>)}</div>
        </section>}

        {skills.length > 0 && <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">{skills.map((skill, index) => <span key={`${skill.name}-${index}`} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">{skill.name}</span>)}</div>
        </section>}

        {(details.projects || []).length > 0 && <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Projects</h2>
          <div className="space-y-4">{details.projects.map((project, index) => <div key={`${project.title}-${index}`}>
            <h3 className="font-medium">{project.title}</h3>
            {project.desc && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{project.desc}</p>}
          </div>)}</div>
        </section>}

        {(details.linkedin || details.portfolio) && <footer className="flex gap-4 text-sm text-primary">
          {details.linkedin && <a href={details.linkedin.startsWith("http") ? details.linkedin : `https://${details.linkedin}`} target="_blank" rel="noreferrer">LinkedIn</a>}
          {details.portfolio && <a href={details.portfolio.startsWith("http") ? details.portfolio : `https://${details.portfolio}`} target="_blank" rel="noreferrer">Portfolio</a>}
        </footer>}
      </article>
    </main>
  );
}
