import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { LogOut, Home, FileText, Building2, Users, Bell, Settings, Search } from "lucide-react";

export function AdminDashboard({ section, setSection, userInfo, logout, setView }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobFilter, setJobFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companiesTotal, setCompaniesTotal] = useState(0);
  const [companySearch, setCompanySearch] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const firstName = userInfo?.firstName || userInfo?.name?.split(" ")[0] || "Admin";

  useEffect(() => {
    if (section !== "overview") return;
    setLoading(true);
    api.adminStats()
      .then(data => setStats(data))
      .catch(() => toast.error("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, [section]);

  const loadJobs = useCallback(() => {
    setJobsLoading(true);
    api.adminJobs({ status: jobFilter === "all" ? undefined : jobFilter, search: jobSearch || undefined, page: jobPage, limit: 10 })
      .then(data => { setJobs(data.jobs || []); setJobsTotal(data.total || 0); })
      .catch(() => toast.error("Failed to load jobs"))
      .finally(() => setJobsLoading(false));
  }, [jobFilter, jobSearch, jobPage]);

  useEffect(() => { if (section === "jobs") loadJobs(); }, [section, loadJobs]);

  const loadCompanies = useCallback(() => {
    setCompaniesLoading(true);
    api.adminCompanies({ search: companySearch || undefined, page: companyPage, limit: 10 })
      .then(data => { setCompanies(data.companies || []); setCompaniesTotal(data.total || 0); })
      .catch(() => toast.error("Failed to load companies"))
      .finally(() => setCompaniesLoading(false));
  }, [companySearch, companyPage]);

  useEffect(() => { if (section === "companies") loadCompanies(); }, [section, loadCompanies]);

  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    api.adminStudents({ search: studentSearch || undefined, page: studentPage, limit: 10 })
      .then(data => { setStudents(data.students || []); setStudentsTotal(data.total || 0); })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setStudentsLoading(false));
  }, [studentSearch, studentPage]);

  useEffect(() => { if (section === "students") loadStudents(); }, [section, loadStudents]);

  const loadNotifications = useCallback(() => {
    setNotificationsLoading(true);
    api.adminNotifications({ category: notificationFilter === "all" ? undefined : notificationFilter })
      .then(data => { 
        setNotifications(data.notifications || []); 
      })
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setNotificationsLoading(false));
  }, [notificationFilter]);

  useEffect(() => { if (section === "notifications") loadNotifications(); }, [section, loadNotifications]);

  const loadSettings = useCallback(() => {
    setSettingsLoading(true);
    api.adminSettings()
      .then(data => { setSettings(data); })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => { if (section === "settings") loadSettings(); }, [section, loadSettings]);

  const handleJobAction = async (id, status) => {
    setActionLoading(id);
    try {
      await api.adminUpdateJobStatus(id, status);
      toast.success(`Job ${status === "Active" ? "approved" : "rejected"}`);
      loadJobs();
    } catch {
      toast.error("Failed to update job status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyCompany = async (id, isVerified) => {
    setActionLoading(id);
    try {
      await api.adminVerifyCompany(id, isVerified);
      toast.success(`Company ${isVerified ? "verified" : "unverified"}`);
      loadCompanies();
    } catch {
      toast.error("Failed to update company");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      toast.success("All notifications marked as read");
      loadNotifications();
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await api.adminUpdateSettings(settings);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const toggleSetting = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const S = {
    container: { display: "flex", minHeight: "100vh", background: "#f5f5f7" },
    sidebar: { width: 160, flexShrink: 0, background: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", padding: "16px 12px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
    main: { flex: 1, overflow: "auto", padding: "24px 32px" },
    card: { background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "20px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: 11, color: "#717182", fontWeight: 600, padding: "12px 0", borderBottom: "1px solid #e0e0e0", textTransform: "uppercase" },
    td: { padding: "14px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13, color: "#030213" },
    input: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 6, padding: "10px 12px", fontSize: 13, outline: "none", width: "100%" },
    btn: (variant = "md") => ({ padding: variant === "sm" ? "6px 14px" : "10px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: variant === "sm" ? 12 : 13 }),
    statCard: { background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px", textAlign: "center" }
  };

  return (
    <div style={S.container}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        {/* Logo Section */}
        <div style={{ marginBottom: 24 }}>
          <img src="/src/assets/interndesknewlogos.png" alt="Interndesk" style={{ height: 24, marginBottom: 6, objectFit: "contain" }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: "#030213", letterSpacing: "1px" }}>ADMIN CONSOLE</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
          {/* MAIN Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#717182", letterSpacing: "0.5px", marginBottom: 8, paddingLeft: 10 }}>MAIN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: Home, label: "Overview", key: "overview" },
                { icon: FileText, label: "Job Reviews", key: "jobs", badge: stats?.stats?.pendingReview },
                { icon: FileText, label: "All Internships", key: "internships" },
                { icon: Building2, label: "Companies", key: "companies" },
                { icon: Users, label: "Students", key: "students" },
              ].map(item => (
                <button key={item.key} onClick={() => setSection(item.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: section === item.key ? "#e8f1f8" : "transparent", color: section === item.key ? "#0a66c2" : "#717182", fontWeight: section === item.key ? 600 : 500, fontSize: 12, position: "relative" }}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.badge > 0 && <span style={{ position: "absolute", right: 8, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{item.badge}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* SYSTEM Section */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#717182", letterSpacing: "0.5px", marginBottom: 8, paddingLeft: 10 }}>SYSTEM</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: Bell, label: "Notifications", key: "notifications" },
                { icon: Settings, label: "Settings", key: "settings" },
              ].map(item => (
                <button key={item.key} onClick={() => setSection(item.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: section === item.key ? "#e8f1f8" : "transparent", color: section === item.key ? "#0a66c2" : "#717182", fontWeight: section === item.key ? 600 : 500, fontSize: 12, position: "relative" }}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Admin Profile Section */}
        <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{firstName[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#030213", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</div>
              <div style={{ fontSize: 9, color: "#717182", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>admin@interndesk.in</div>
            </div>
          </div>
          <button onClick={logout} style={{ ...S.btn("sm"), width: "100%", background: "transparent", border: "1px solid #e0e0e0", color: "#030213", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11 }}>
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </aside>

      <main style={S.main}>
        {/* ═══ OVERVIEW ═══ */}
        {section === "overview" && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60 }}>Loading...</div>
            ) : (
              <>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>Good morning, Admin 👋</h1>
                      <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>Here's what's happening on Interndesk today - Fri, {new Date().getDate()} Oct 2026</p>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>↓ Export report</button>
                      <button style={{ ...S.btn(), background: "#0a66c2", color: "#ffffff" }}>✓ Review {stats?.stats?.pendingReview || 0} pending</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                  <div style={S.statCard}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#030213" }}>{stats?.stats?.totalStudents?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "#717182", marginTop: 4 }}>Total Students</div>
                    <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>+{stats?.stats?.newStudents} last 30 days</div>
                  </div>
                  <div style={S.statCard}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#030213" }}>{stats?.stats?.totalCompanies?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "#717182", marginTop: 4 }}>Companies</div>
                    <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>+{stats?.stats?.newCompanies} last 30 days</div>
                  </div>
                  <div style={S.statCard}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#030213" }}>{stats?.stats?.totalJobs?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "#717182", marginTop: 4 }}>Internships Posted</div>
                    <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 4 }}>{stats?.stats?.pendingReview} in review</div>
                  </div>
                  <div style={S.statCard}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#030213" }}>{stats?.stats?.totalApplications?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "#717182", marginTop: 4 }}>Applications</div>
                    <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>+1,584 last 30 days</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                  <div style={S.card}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#030213", marginBottom: 4 }}>New sign-ups</h3>
                    <p style={{ fontSize: 12, color: "#717182", marginBottom: 16 }}>Students vs companies - last 6 months</p>
                    <div style={{ height: 160, background: "#f5f5f7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#717182", fontSize: 12 }}>[Chart Visualization]</div>
                  </div>
                  <div style={S.card}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#030213", marginBottom: 4 }}>Internship status</h3>
                    <p style={{ fontSize: 12, color: "#717182", marginBottom: 16 }}>Across all {stats?.stats?.totalJobs?.toLocaleString()} postings</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: "#0a66c2" }}>{stats?.stats?.activeJobs || 0}</div>
                        <div style={{ fontSize: 12, color: "#717182" }}>Active</div>
                      </div>
                      <div>
                        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>🟢 Active</span><span style={{ fontWeight: 700 }}>{stats?.stats?.activeJobs}</span></div>
                        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>🟡 In Review</span><span style={{ fontWeight: 700 }}>{stats?.stats?.pendingReview}</span></div>
                        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>🔴 Rejected</span><span style={{ fontWeight: 700 }}>{stats?.stats?.rejectedJobs}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>⚪ Closed</span><span style={{ fontWeight: 700 }}>{stats?.stats?.closedJobs}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                  <div style={S.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#030213", marginBottom: 14 }}>Top internships</h3>
                    {(stats?.topJobs || []).slice(0, 4).map((job, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? "1px solid #e0e0e0" : "none" }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: "#030213", marginBottom: 2 }}>{job.title}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#717182" }}>
                          <span>{job.company}</span>
                          <span style={{ color: "#0a66c2", fontWeight: 700 }}>{job.applicants}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={S.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#030213", marginBottom: 14 }}>Recent companies</h3>
                    {(stats?.recentCompanies || []).slice(0, 4).map((c, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? "1px solid #e0e0e0" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 3, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 9 }}>{(c.name || "C").substring(0, 1)}</div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: "#030213" }}>{c.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={S.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#030213", marginBottom: 14 }}>New students</h3>
                    {(stats?.recentStudents || []).slice(0, 4).map((s, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? "1px solid #e0e0e0" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 3, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 9 }}>{(s.firstName || "S")[0].toUpperCase()}</div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: "#030213" }}>{s.firstName || s.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ═══ ALL INTERNSHIPS ═══ */}
        {section === "internships" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>All Internships</h1>
                  <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>Every internship posted on the platform</p>
                </div>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>↓ Export CSV</button>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <input style={{ ...S.input, flex: 1, maxWidth: 400 }} placeholder="Search internships or companies..." value={jobSearch} onChange={e => { setJobSearch(e.target.value); setJobPage(1); }} />
                <button style={{ ...S.btn(), background: "#0a66c2", color: "#fff" }}>All</button>
                <button onClick={() => { setJobFilter("Active"); setJobPage(1); }} style={{ ...S.btn(), background: jobFilter === "Active" ? "#0a66c2" : "#ffffff", color: jobFilter === "Active" ? "#fff" : "#0a66c2", border: "1px solid #0a66c2" }}>Active</button>
                <button onClick={() => { setJobFilter("Review"); setJobPage(1); }} style={{ ...S.btn(), background: jobFilter === "Review" ? "#0a66c2" : "#ffffff", color: jobFilter === "Review" ? "#fff" : "#0a66c2", border: "1px solid #0a66c2" }}>In Review</button>
                <button onClick={() => { setJobFilter("Rejected"); setJobPage(1); }} style={{ ...S.btn(), background: jobFilter === "Rejected" ? "#0a66c2" : "#ffffff", color: jobFilter === "Rejected" ? "#fff" : "#0a66c2", border: "1px solid #0a66c2" }}>Rejected</button>
                <button onClick={() => { setJobFilter("Closed"); setJobPage(1); }} style={{ ...S.btn(), background: jobFilter === "Closed" ? "#0a66c2" : "#ffffff", color: jobFilter === "Closed" ? "#fff" : "#0a66c2", border: "1px solid #0a66c2" }}>Closed</button>
              </div>
            </div>

            {jobsLoading ? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : (
              <div style={S.card}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>INTERNSHIP</th>
                      <th style={S.th}>CATEGORY</th>
                      <th style={S.th}>LOCATION</th>
                      <th style={S.th}>APPLICANTS</th>
                      <th style={S.th}>STATUS</th>
                      <th style={S.th}>POSTED</th>
                      <th style={S.th}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 4, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{(job.company || "CO").substring(0, 1)}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12, color: "#030213" }}>{job.title}</div>
                              <div style={{ fontSize: 11, color: "#717182" }}>{job.company}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...S.td, color: "#0a66c2", fontWeight: 600 }}>{job.category}</td>
                        <td style={S.td}>{job.location || "Remote"}</td>
                        <td style={S.td}>{job.applicants || 0}</td>
                        <td style={S.td}>
                          <span style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: job.status === "Active" ? "#e8f5e9" : job.status === "Review" ? "#fff3cd" : "#ffebee", color: job.status === "Active" ? "#22c55e" : job.status === "Review" ? "#fbbf24" : "#ef4444" }}>
                            {job.status}
                          </span>
                        </td>
                        <td style={S.td}>{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td style={S.td}>
                          <button style={{ ...S.btn("sm"), background: "transparent", border: "1px solid #0a66c2", color: "#0a66c2", marginRight: 6 }}>View</button>
                          <button style={{ ...S.btn("sm"), background: "transparent", border: "1px solid #717182", color: "#717182" }}>Close</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══ JOB REVIEWS ═══ */}
        {section === "jobs" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>Job Reviews</h1>
                  <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>Approve or reject internships before students can see them</p>
                </div>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>Bulk approve</button>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", borderBottom: "1px solid #e0e0e0", paddingBottom: 16 }}>
                <button onClick={() => { setJobFilter("Review"); setJobPage(1); }} style={{ fontSize: 13, fontWeight: jobFilter === "Review" ? 700 : 500, color: jobFilter === "Review" ? "#0a66c2" : "#717182", border: "none", background: "none", cursor: "pointer", paddingBottom: 4, borderBottom: jobFilter === "Review" ? "3px solid #0a66c2" : "none" }}>
                  Pending review <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "2px 8px", marginLeft: 6, fontSize: 11, fontWeight: 700 }}>{stats?.stats?.pendingReview || 0}</span>
                </button>
                <button onClick={() => { setJobFilter("Active"); setJobPage(1); }} style={{ fontSize: 13, fontWeight: jobFilter === "Active" ? 700 : 500, color: jobFilter === "Active" ? "#0a66c2" : "#717182", border: "none", background: "none", cursor: "pointer", paddingBottom: 4, borderBottom: jobFilter === "Active" ? "3px solid #0a66c2" : "none" }}>
                  Active <span style={{ color: "#030213", fontWeight: 700, marginLeft: 6 }}>{stats?.stats?.activeJobs || 0}</span>
                </button>
                <button onClick={() => { setJobFilter("Rejected"); setJobPage(1); }} style={{ fontSize: 13, fontWeight: jobFilter === "Rejected" ? 700 : 500, color: jobFilter === "Rejected" ? "#0a66c2" : "#717182", border: "none", background: "none", cursor: "pointer", paddingBottom: 4, borderBottom: jobFilter === "Rejected" ? "3px solid #0a66c2" : "none" }}>
                  Rejected <span style={{ color: "#030213", fontWeight: 700, marginLeft: 6 }}>{stats?.stats?.rejectedJobs || 0}</span>
                </button>
                <button onClick={() => { setJobFilter("Closed"); setJobPage(1); }} style={{ fontSize: 13, fontWeight: jobFilter === "Closed" ? 700 : 500, color: jobFilter === "Closed" ? "#0a66c2" : "#717182", border: "none", background: "none", cursor: "pointer", paddingBottom: 4, borderBottom: jobFilter === "Closed" ? "3px solid #0a66c2" : "none" }}>
                  Closed <span style={{ color: "#030213", fontWeight: 700, marginLeft: 6 }}>{stats?.stats?.closedJobs || 0}</span>
                </button>
                <button onClick={() => { setJobFilter("all"); setJobPage(1); }} style={{ fontSize: 13, fontWeight: jobFilter === "all" ? 700 : 500, color: jobFilter === "all" ? "#0a66c2" : "#717182", border: "none", background: "none", cursor: "pointer", paddingBottom: 4, borderBottom: jobFilter === "all" ? "3px solid #0a66c2" : "none" }}>
                  All <span style={{ color: "#030213", fontWeight: 700, marginLeft: 6 }}>{jobsTotal}</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input style={{ ...S.input, flex: 1, maxWidth: 400 }} placeholder="Search by title or company..." value={jobSearch} onChange={e => { setJobSearch(e.target.value); setJobPage(1); }} />
                <button style={{ ...S.btn(), background: "#0a66c2", color: "#fff" }}>All categories</button>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>Newest first</button>
              </div>
            </div>

            {jobsLoading ? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {jobs.map(job => (
                  <div key={job.id} style={S.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{(job.company || "CO").substring(0, 1)}</div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#030213", margin: 0 }}>{job.title}</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                            <span style={{ fontSize: 11, color: "#717182" }}>{job.company}</span>
                            <span style={{ fontSize: 11, background: "rgba(10, 102, 194, 0.1)", color: "#0a66c2", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{job.category}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>Awaiting review · 2h ago</span>
                    </div>
                    <div style={{ display: "flex", gap: 24, marginBottom: 12, fontSize: 12, color: "#717182" }}>
                      <div><span style={{ color: "#030213", fontWeight: 600 }}>Stipend</span><div>₹{job.stipend}</div></div>
                      <div><span style={{ color: "#030213", fontWeight: 600 }}>Location</span><div>{job.location || "Remote"}</div></div>
                      <div><span style={{ color: "#030213", fontWeight: 600 }}>Openings</span><div>{job.openings}</div></div>
                      <div><span style={{ color: "#030213", fontWeight: 600 }}>Duration</span><div>3 months</div></div>
                    </div>
                    <p style={{ fontSize: 12, color: "#717182", lineHeight: 1.5, marginBottom: 10 }}>{job.description || "Work with our team..."}</p>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                      {["React", "JavaScript", "Node.js"].map(tag => <span key={tag} style={{ fontSize: 10, background: "#f0f0f0", color: "#717182", padding: "3px 8px", borderRadius: 4 }}>{tag}</span>)}
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => handleJobAction(job.id, "Active")} disabled={actionLoading === job.id} style={{ ...S.btn(), background: "#0a66c2", color: "#fff" }}>Approve</button>
                      <button onClick={() => handleJobAction(job.id, "Rejected")} disabled={actionLoading === job.id} style={{ ...S.btn(), background: "transparent", border: "2px solid #ef4444", color: "#ef4444" }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ COMPANIES ═══ */}
        {section === "companies" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>Companies</h1>
                  <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>Review and verify employer accounts</p>
                </div>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>↓ Export CSV</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#030213" }}>436</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>Total companies</div>
                </div>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>371</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>Verified</div>
                </div>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>65</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>Awaiting verification</div>
                </div>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#030213" }}>+28</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>New · 30 days</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input style={{ ...S.input, flex: 1, maxWidth: 400 }} placeholder="Search by company or recruiter email..." value={companySearch} onChange={e => { setCompanySearch(e.target.value); setCompanyPage(1); }} />
                <button style={{ ...S.btn(), background: "#0a66c2", color: "#fff" }}>All</button>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>Verified</button>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>Unverified</button>
              </div>
            </div>

            {companiesLoading ? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : (
              <div style={S.card}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>COMPANY</th>
                      <th style={S.th}>INDUSTRY</th>
                      <th style={S.th}>LOCATION</th>
                      <th style={S.th}>RECRUITER EMAIL</th>
                      <th style={S.th}>OPEN ROLES</th>
                      <th style={S.th}>STATUS</th>
                      <th style={S.th}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(c => (
                      <tr key={c.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 4, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{(c.name || "CO").substring(0, 1)}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12, color: "#030213" }}>{c.name}</div>
                              <div style={{ fontSize: 10, color: "#717182" }}>Joined 20 Sep 2028</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>{c.industry}</td>
                        <td style={S.td}>{c.location}</td>
                        <td style={{ ...S.td, color: "#0a66c2", fontWeight: 500 }}>{c.recruiterEmail}</td>
                        <td style={S.td}>{c.openPositionsCount}</td>
                        <td style={S.td}>
                          <span style={{ color: c.isVerified ? "#22c55e" : "#f59e0b", fontWeight: 600, fontSize: 12 }}>
                            {c.isVerified ? "✓ Verified" : "⚠ Unverified"}
                          </span>
                        </td>
                        <td style={S.td}>
                          <button onClick={() => handleVerifyCompany(c.id, !c.isVerified)} disabled={actionLoading === c.id} style={{ ...S.btn("sm"), background: c.isVerified ? "transparent" : "#0a66c2", color: c.isVerified ? "#717182" : "#fff", border: c.isVerified ? "1px solid #717182" : "none" }}>
                            {c.isVerified ? "Revoke" : "Verify"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══ STUDENTS ═══ */}
        {section === "students" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>Students</h1>
                  <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>All registered students on Interndesk</p>
                </div>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>↓ Export CSV</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#030213" }}>8,452</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>Total students</div>
                </div>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>+312</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>New · 30 days</div>
                </div>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#030213" }}>6,108</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>Profiles completed</div>
                </div>
                <div style={S.statCard}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#030213" }}>2.3</div>
                  <div style={{ fontSize: 11, color: "#717182", marginTop: 4 }}>Avg. applications / student</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input style={{ ...S.input, flex: 1, maxWidth: 400 }} placeholder="Search by name or email..." value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }} />
                <button style={{ ...S.btn(), background: "#0a66c2", color: "#fff" }}>All</button>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>New this week</button>
                <button style={{ ...S.btn(), background: "#ffffff", border: "1px solid #0a66c2", color: "#0a66c2" }}>Profile incomplete</button>
              </div>
            </div>

            {studentsLoading ? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : (
              <div style={S.card}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>STUDENT</th>
                      <th style={S.th}>COLLEGE</th>
                      <th style={S.th}>COURSE</th>
                      <th style={S.th}>APPLICATIONS</th>
                      <th style={S.th}>PROFILE</th>
                      <th style={S.th}>JOINED</th>
                      <th style={S.th}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 4, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{(s.firstName || "S")[0].toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12, color: "#030213" }}>{s.firstName || s.name}</div>
                              <div style={{ fontSize: 10, color: "#717182" }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>—</td>
                        <td style={S.td}>—</td>
                        <td style={S.td}>8</td>
                        <td style={S.td}>
                          <div style={{ width: 100, height: 6, background: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: "100%", height: "100%", background: "#0a66c2" }} />
                          </div>
                        </td>
                        <td style={S.td}>Today</td>
                        <td style={S.td}>
                          <button style={{ ...S.btn("sm"), background: "transparent", border: "1px solid #0a66c2", color: "#0a66c2" }}>View profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══ NOTIFICATIONS ═══ */}
        {section === "notifications" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>Notifications</h1>
                  <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>Platform activity that needs your attention</p>
                </div>
                <button onClick={handleMarkAllRead} style={{ ...S.btn(), background: "#ffffff", border: "2px solid #0a66c2", color: "#0a66c2", borderRadius: 20 }}>✓ Mark all as read</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #e0e0e0", paddingBottom: 16, overflowX: "auto" }}>
                {[
                  { label: "All", value: "all" },
                  { label: "Unread", value: "unread" },
                  { label: "Jobs", value: "jobs" },
                  { label: "Companies", value: "companies" },
                  { label: "Students", value: "students" }
                ].map(tab => (
                  <button 
                    key={tab.value} 
                    onClick={() => { setNotificationFilter(tab.value); }}
                    style={{ 
                      fontSize: 12, 
                      fontWeight: 600, 
                      color: notificationFilter === tab.value ? "#0a66c2" : "#717182", 
                      border: "none", 
                      background: "none", 
                      cursor: "pointer", 
                      paddingBottom: 4, 
                      borderBottom: notificationFilter === tab.value ? "3px solid #0a66c2" : "none", 
                      whiteSpace: "nowrap" 
                    }}
                  >
                    {tab.label} {tab.label === "All" && <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 4 }}>{notifications.length}</span>}
                  </button>
                ))}
              </div>
            </div>

            {notificationsLoading ? (
              <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
                <p style={{ fontSize: 14, color: "#717182" }}>No notifications yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {notifications.map((notif, i) => (
                  <div key={notif.id || i} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", paddingLeft: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ fontSize: 20, opacity: 0.7 }}>
                        {notif.type === "job" ? "📄" : notif.type === "company" ? "🏢" : notif.type === "student" ? "👥" : "📢"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#030213", margin: 0 }}>{notif.title || notif.message}</h4>
                        <p style={{ fontSize: 12, color: "#717182", margin: "2px 0 0 0" }}>{notif.body || notif.details || ""}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#717182", whiteSpace: "nowrap" }}>
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "Recently"}
                      </span>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: notif.isRead ? "transparent" : "#0a66c2", flexShrink: 0 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ SETTINGS ═══ */}
        {section === "settings" && (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#030213", margin: 0 }}>Settings</h1>
              <p style={{ fontSize: 13, color: "#717182", margin: "6px 0 0 0" }}>Manage your admin account and platform rules</p>
            </div>

            {settingsLoading ? (
              <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
            ) : !settings ? (
              <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
                <p style={{ fontSize: 14, color: "#717182" }}>Failed to load settings</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Admin Profile Card */}
                <div style={S.card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#030213", margin: "0 0 16px 0" }}>Admin profile</h3>
                  <p style={{ fontSize: 12, color: "#717182", margin: "0 0 16px 0" }}>Your account details</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e0e0e0" }}>
                    <div style={{ width: 60, height: 60, borderRadius: 8, background: "#0a66c2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{(settings.profile?.firstName || "A")[0]}</div>
                    <button style={{ ...S.btn("sm"), background: "#ffffff", border: "2px solid #0a66c2", color: "#0a66c2" }}>Change photo</button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#717182", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full name</label>
                    <input style={{ ...S.input, fontSize: 12 }} value={settings.profile?.name || ""} onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#717182", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
                    <input style={{ ...S.input, fontSize: 12 }} value={settings.profile?.email || ""} readOnly />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#717182", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Role</label>
                    <input style={{ ...S.input, fontSize: 12 }} value={settings.profile?.role || "Super admin"} readOnly />
                  </div>

                  <button onClick={handleSaveSettings} disabled={settingsSaving} style={{ ...S.btn(), background: "#0a66c2", color: "#fff", width: "100%" }}>
                    {settingsSaving ? "Saving..." : "Save changes"}
                  </button>
                </div>

                {/* Review Rules Card */}
                <div style={S.card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#030213", margin: "0 0 16px 0" }}>Review rules</h3>
                  <p style={{ fontSize: 12, color: "#717182", margin: "0 0 16px 0" }}>Control how new postings are handled</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #e0e0e0" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#030213", margin: 0 }}>Require approval for new jobs</p>
                        <p style={{ fontSize: 11, color: "#717182", margin: "2px 0 0 0" }}>Postings stay hidden until approved</p>
                      </div>
                      <div onClick={() => toggleSetting("reviewRules", "requireApproval")} style={{ width: 44, height: 24, borderRadius: 12, background: settings.reviewRules?.requireApproval ? "#0a66c2" : "#e0e0e0", position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", right: settings.reviewRules?.requireApproval ? 2 : "auto", left: settings.reviewRules?.requireApproval ? "auto" : 2, top: 2, transition: "all 0.2s" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #e0e0e0" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#030213", margin: 0 }}>Auto-verify known companies</p>
                        <p style={{ fontSize: 11, color: "#717182", margin: "2px 0 0 0" }}>Skip manual verification for returning employers</p>
                      </div>
                      <div onClick={() => toggleSetting("reviewRules", "autoVerifyKnown")} style={{ width: 44, height: 24, borderRadius: 12, background: settings.reviewRules?.autoVerifyKnown ? "#0a66c2" : "#e0e0e0", position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", right: settings.reviewRules?.autoVerifyKnown ? 2 : "auto", left: settings.reviewRules?.autoVerifyKnown ? "auto" : 2, top: 2, transition: "all 0.2s" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #e0e0e0" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#030213", margin: 0 }}>Require rejection reason</p>
                        <p style={{ fontSize: 11, color: "#717182", margin: "2px 0 0 0" }}>Admin must explain why a job is rejected</p>
                      </div>
                      <div onClick={() => toggleSetting("reviewRules", "requireRejectionReason")} style={{ width: 44, height: 24, borderRadius: 12, background: settings.reviewRules?.requireRejectionReason ? "#0a66c2" : "#e0e0e0", position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", right: settings.reviewRules?.requireRejectionReason ? 2 : "auto", left: settings.reviewRules?.requireRejectionReason ? "auto" : 2, top: 2, transition: "all 0.2s" }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#030213", margin: "0 0 12px 0" }}>Email alerts</p>
                      <p style={{ fontSize: 11, color: "#717182", margin: "0 0 12px 0" }}>Choose what lands in your inbox</p>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #e0e0e0", marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: "#717182" }}>New job submitted<br/><span style={{ fontSize: 10 }}>Email me when a company posts a job</span></span>
                        <div onClick={() => toggleSetting("emailAlerts", "newJobSubmitted")} style={{ width: 44, height: 24, borderRadius: 12, background: settings.emailAlerts?.newJobSubmitted ? "#0a66c2" : "#e0e0e0", position: "relative", cursor: "pointer" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", right: settings.emailAlerts?.newJobSubmitted ? 2 : "auto", left: settings.emailAlerts?.newJobSubmitted ? "auto" : 2, top: 2, transition: "all 0.2s" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #e0e0e0", marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: "#717182" }}>New company signup<br/><span style={{ fontSize: 10 }}>Email me when a company needs verification</span></span>
                        <div onClick={() => toggleSetting("emailAlerts", "newCompanySignup")} style={{ width: 44, height: 24, borderRadius: 12, background: settings.emailAlerts?.newCompanySignup ? "#0a66c2" : "#e0e0e0", position: "relative", cursor: "pointer" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", right: settings.emailAlerts?.newCompanySignup ? 2 : "auto", left: settings.emailAlerts?.newCompanySignup ? "auto" : 2, top: 2, transition: "all 0.2s" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#717182" }}>Weekly summary<br/><span style={{ fontSize: 10 }}>Sunday digest of platform stats</span></span>
                        <div onClick={() => toggleSetting("emailAlerts", "weeklySummary")} style={{ width: 44, height: 24, borderRadius: 12, background: settings.emailAlerts?.weeklySummary ? "#0a66c2" : "#e0e0e0", position: "relative", cursor: "pointer" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", right: settings.emailAlerts?.weeklySummary ? 2 : "auto", left: settings.emailAlerts?.weeklySummary ? "auto" : 2, top: 2, transition: "all 0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
