import React, { useState } from "react";
import { BookOpen, Video, FileText, Sparkles, CheckCircle2, ArrowRight, Award, ExternalLink, Search } from "lucide-react";

export function CareerResources({ setView }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const resources = [
    {
      id: 1,
      title: "Mastering Technical & Coding Interviews",
      category: "interview",
      type: "Guide & Practice",
      level: "Intermediate",
      duration: "45 min read",
      desc: "Comprehensive roadmap for DSA, System Design fundamentals, and live coding interview patterns asked by tech companies.",
      topics: ["Data Structures", "Algorithms", "Live Problem Solving", "Mock Interview Rubrics"]
    },
    {
      id: 2,
      title: "Building an ATS-Friendly Tech & Business Resume",
      category: "resume",
      type: "Toolkit",
      level: "All Levels",
      duration: "20 min read",
      desc: "Learn how Applicant Tracking Systems parse student resumes and how to structure bullet points using the XYZ impact formula.",
      topics: ["Action Verbs", "Quantifiable Metrics", "Keyword Optimization", "Formatting Rules"]
    },
    {
      id: 3,
      title: "Behavioral Interview Prep: The STAR Framework",
      category: "interview",
      type: "Framework",
      level: "Beginner",
      duration: "30 min read",
      desc: "How to answer situational and behavioral questions with precision (Situation, Task, Action, Result) for top recruiter impressions.",
      topics: ["Leadership", "Conflict Resolution", "Project Ownership", "Culture Fit"]
    },
    {
      id: 4,
      title: "Stipend Negotiation & Offer Evaluation Guide",
      category: "career",
      type: "Strategy",
      level: "Advanced",
      duration: "15 min read",
      desc: "Understanding internship compensation, PPO (Pre-Placement Offer) conversion metrics, and professional email negotiation scripts.",
      topics: ["PPO Conversion", "Stipend Benchmarks", "Offer Letter Verification", "Communication Scripts"]
    },
    {
      id: 5,
      title: "Full-Stack Web Development Career Roadmap",
      category: "tech",
      type: "Roadmap",
      level: "Beginner to Intermediate",
      duration: "60 min read",
      desc: "Step-by-step learning guide covering React, Node.js, Express, Databases (SQL & NoSQL), REST APIs, and Cloud deployment.",
      topics: ["Frontend UI", "Backend Architecture", "Database Schema", "Production CI/CD"]
    },
    {
      id: 6,
      title: "Data Science & Machine Learning Internship Playbook",
      category: "tech",
      type: "Roadmap",
      level: "Intermediate",
      duration: "50 min read",
      desc: "Essential Python libraries (Pandas, Scikit-Learn, PyTorch), EDA workflows, and portfolio project ideas that catch recruiters' eyes.",
      topics: ["EDA Workflows", "ML Pipelines", "Portfolio Projects", "Model Evaluation"]
    }
  ];

  const filtered = resources.filter((item) => {
    const matchTab = activeTab === "all" || item.category === activeTab;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-8">
      <div className="max-w-[1128px] mx-auto">
        <button
          onClick={() => setView("student-home")}
          className="text-xs font-semibold text-primary hover:underline mb-4 inline-flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Career &amp; Interview Resources</h1>
            <p className="text-sm text-muted-foreground mt-1">Curated playbooks, roadmaps, and guides to fast-track your internship journey.</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search resources & topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { id: "all", label: "All Guides" },
            { id: "interview", label: "Interview Prep" },
            { id: "resume", label: "Resume & ATS" },
            { id: "tech", label: "Tech Roadmaps" },
            { id: "career", label: "Career Strategy" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-xs" : "bg-card border border-border text-foreground hover:border-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-[11px] font-semibold">
                    {r.type}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{r.duration}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{r.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {r.topics.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-background border border-border rounded text-[10px] text-foreground font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                <span>Explore Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tools Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Need a clean, verified ATS resume?</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Use our built-in ATS resume creator with instant PDF export and recruiter scoring.</p>
            </div>
          </div>
          <button
            onClick={() => setView("resume-builder")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Launch Resume Builder
          </button>
        </div>
      </div>
    </main>
  );
}
