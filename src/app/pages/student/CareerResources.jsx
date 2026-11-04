import React, { useState } from "react";
import { BookOpen, Video, FileText, Sparkles, CheckCircle2, ArrowRight, Award, ExternalLink, Search, X, ChevronRight } from "lucide-react";

export const CAREER_RESOURCES = [
  {
    id: 1,
    title: "Mastering Technical & Coding Interviews",
    category: "interview",
    type: "Guide & Practice",
    level: "Intermediate",
    duration: "45 min read",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop&auto=format",
    desc: "Comprehensive roadmap for DSA, System Design fundamentals, and live coding interview patterns asked by tech companies.",
    topics: ["Data Structures", "Algorithms", "Live Problem Solving", "Mock Interview Rubrics"],
    content: [
      "1. Focus on core data structures: Arrays, Hash Maps, Two Pointers, Sliding Window, and Trees.",
      "2. Communicate your thought process out loud before writing any code in live technical rounds.",
      "3. Always analyze and state the Time and Space Complexity (Big-O) for every solution.",
      "4. Test your logic with edge cases: empty input, single element, negative numbers, and large scale data."
    ],
    actionLabel: "Practice with Coding Internships",
    actionView: "search"
  },
  {
    id: 2,
    title: "Building an ATS-Friendly Tech & Business Resume",
    category: "resume",
    type: "Toolkit",
    level: "All Levels",
    duration: "20 min read",
    img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=240&fit=crop&auto=format",
    desc: "Learn how Applicant Tracking Systems parse student resumes and how to structure bullet points using the XYZ impact formula.",
    topics: ["Action Verbs", "Quantifiable Metrics", "Keyword Optimization", "Formatting Rules"],
    content: [
      "1. Use standard single-column formatting without tables or multi-column text boxes.",
      "2. Formula: Accomplished [X] as measured by [Y], by doing [Z]. Example: 'Improved API latency by 35% by implementing Redis cache.'",
      "3. Include keywords matching the exact job requirements in your Technical Skills section.",
      "4. Save and submit your resume in standard PDF format generated directly from clean typography."
    ],
    actionLabel: "Launch Free ATS Resume Builder",
    actionView: "resume-builder"
  },
  {
    id: 3,
    title: "Behavioral Interview Prep: The STAR Framework",
    category: "interview",
    type: "Framework",
    level: "Beginner",
    duration: "30 min read",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop&auto=format",
    desc: "How to answer situational and behavioral questions with precision (Situation, Task, Action, Result) for top recruiter impressions.",
    topics: ["Leadership", "Conflict Resolution", "Project Ownership", "Culture Fit"],
    content: [
      "1. Situation: Set the scene and give the necessary details of your example.",
      "2. Task: Describe what your responsibility was in that situation.",
      "3. Action: Explain exactly what steps you took to address it (focus on 'I' rather than 'We').",
      "4. Result: Share what outcomes your actions achieved (use percentages or numbers where possible)."
    ],
    actionLabel: "Explore Hiring Companies",
    actionView: "companies"
  },
  {
    id: 4,
    title: "Stipend Negotiation & Offer Evaluation Guide",
    category: "career",
    type: "Strategy",
    level: "Advanced",
    duration: "15 min read",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=240&fit=crop&auto=format",
    desc: "Understanding internship compensation, PPO (Pre-Placement Offer) conversion metrics, and professional email negotiation scripts.",
    topics: ["PPO Conversion", "Stipend Benchmarks", "Offer Letter Verification", "Communication Scripts"],
    content: [
      "1. Benchmark current industry stipends across metros: INR 15k-40k/month for technical internships.",
      "2. Inquire respectfully about performance metrics required for Pre-Placement Offer (PPO) conversion.",
      "3. Always get all terms in writing: stipend amount, duration, working hours, and mentorship structure.",
      "4. Keep a positive and collaborative tone when negotiating or asking for clarification on compensation."
    ],
    actionLabel: "View Highest Stipend Roles",
    actionView: "search"
  },
  {
    id: 5,
    title: "Full-Stack Web Development Career Roadmap",
    category: "tech",
    type: "Roadmap",
    level: "Beginner to Intermediate",
    duration: "60 min read",
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=240&fit=crop&auto=format",
    desc: "Step-by-step learning guide covering React, Node.js, Express, Databases (SQL & NoSQL), REST APIs, and Cloud deployment.",
    topics: ["Frontend UI", "Backend Architecture", "Database Schema", "Production CI/CD"],
    content: [
      "1. Frontend: Semantic HTML5, CSS3/Tailwind, JavaScript ES6+, React Hooks & State Management.",
      "2. Backend: Node.js runtime, Express routing, middleware, authentication & JWT, secure REST design.",
      "3. Databases: Relational schema design with MySQL / PostgreSQL; document storage with MongoDB.",
      "4. Deployment: Deploying frontend on modern platforms and containerizing backends with Docker."
    ],
    actionLabel: "Browse Web Dev Internships",
    actionView: "search"
  },
  {
    id: 6,
    title: "Data Science & Machine Learning Foundations",
    category: "tech",
    type: "Roadmap",
    level: "Intermediate",
    duration: "55 min read",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop&auto=format",
    desc: "Curated learning pathway for Python, Pandas, NumPy, Scikit-Learn, data visualization, and portfolio project development.",
    topics: ["Data Wrangling", "Statistical Modeling", "ML Pipelines", "Portfolio Case Studies"],
    content: [
      "1. Master Python data science libraries: Pandas, NumPy, Matplotlib, and Seaborn.",
      "2. Practice on real-world datasets: Kaggle competitions, open government data, and API scrapers.",
      "3. Understand evaluation metrics thoroughly: Precision, Recall, F1-Score, ROC-AUC, and RMSE.",
      "4. Build end-to-end deployed projects using Streamlit or FastAPI to stand out to recruiters."
    ],
    actionLabel: "Browse Data Science Roles",
    actionView: "search"
  }
];

export function CareerResources({ setView, userRole }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);

  const resources = CAREER_RESOURCES;

  const filtered = resources.filter((item) => {
    const matchTab = activeTab === "all" || item.category === activeTab;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleBack = () => {
    if (userRole === "company") setView("company-portal");
    else if (userRole === "student") setView("student-home");
    else setView("landing");
  };

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-8">
      <div className="max-w-[1128px] mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs font-semibold text-primary hover:underline mb-4 inline-flex items-center gap-1 cursor-pointer"
        >
          &larr; Back to {userRole === "company" ? "Portal" : userRole === "student" ? "Dashboard" : "Home"}
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
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
              onClick={() => setSelectedModule(r)}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-[11px] font-semibold">
                    {r.type}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{r.duration}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">{r.title}</h3>
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
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
            type="button"
            onClick={() => setView("resume-builder")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors whitespace-nowrap cursor-pointer"
          >
            Launch Resume Builder
          </button>
        </div>

        {/* Module Detail Modal */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold">
                  {selectedModule.type}
                </span>
                <span className="text-xs text-muted-foreground">&bull; {selectedModule.duration}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">{selectedModule.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{selectedModule.desc}</p>
              
              <div className="space-y-3 mb-6 bg-background p-4 rounded-xl border border-border">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Key Takeaways &amp; Action Plan</h4>
                <ul className="space-y-2">
                  {selectedModule.content?.map((point, index) => (
                    <li key={index} className="text-xs text-foreground/90 leading-relaxed flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedModule(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-medium text-foreground hover:bg-background cursor-pointer"
                >
                  Close
                </button>
                {selectedModule.actionView && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedModule.actionView;
                      setSelectedModule(null);
                      setView(target);
                    }}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{selectedModule.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
