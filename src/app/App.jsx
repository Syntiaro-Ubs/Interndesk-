import React, { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { BottomNav } from "./components/layout/BottomNav";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./pages/LandingPage";
import { SearchPage } from "./pages/student/SearchPage";
import { DetailsPage } from "./pages/student/DetailsPage";
import { StudentHome } from "./pages/student/StudentHome";
import { StudentProfile } from "./pages/student/StudentProfile";
import { PublicStudentProfile } from "./pages/student/PublicStudentProfile";
import { ApplicationsPage } from "./pages/student/ApplicationsPage";
import { CompanyPortal } from "./pages/company/CompanyPortal";
import { CareerResources } from "./pages/student/CareerResources";
import { AuthPage } from "./pages/AuthPage";
import { CompaniesPage } from "./pages/student/CompaniesPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { CompanyProfilePage } from "./pages/student/CompanyProfilePage";
import { SettingsPrivacyPage } from "./pages/student/SettingsPrivacyPage";
import { HelpPage } from "./pages/student/HelpPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ResumeBuilder } from "./pages/student/ResumeBuilder";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { api, saveCsrfToken } from "./api";
import { Toaster } from "sonner";

const EMPTY_USER_INFO = { firstName: "", lastName: "", email: "" };

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// ── Path to State resolution ──────────────────────────────────
function pathToState(pathname, search, currentRole) {
  const cleanPath = (pathname || "/").replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(search || "");

  if (params.has("profile")) {
    return { view: "public-profile", publicProfileId: params.get("profile") };
  }
  const pubMatch = cleanPath.match(/^\/profile\/(.+)$/);
  if (pubMatch && !["student", "company"].includes(pubMatch[1])) {
    return { view: "public-profile", publicProfileId: pubMatch[1] };
  }

  // Auth routes
  if (cleanPath === "/login/employer" || cleanPath === "/login/company") {
    return { view: "auth", authParams: { mode: "login", role: "company" } };
  }
  if (cleanPath === "/login/admin" || cleanPath === "/admin/login") {
    return { view: "auth", authParams: { mode: "login", role: "admin" } };
  }
  if (cleanPath === "/login" || cleanPath === "/signin") {
    return { view: "auth", authParams: { mode: "login", role: "student" } };
  }
  if (cleanPath === "/signup/employer" || cleanPath === "/register/company" || cleanPath === "/signup/company") {
    return { view: "auth", authParams: { mode: "register", role: "company" } };
  }
  if (cleanPath === "/signup" || cleanPath === "/register" || cleanPath === "/join") {
    return { view: "auth", authParams: { mode: "register", role: "student" } };
  }
  if (cleanPath === "/auth") {
    const mode = params.get("mode") === "signup" || params.get("mode") === "register" ? "register" : "login";
    const role = params.get("role") === "company" || params.get("role") === "employer" ? "company" : "student";
    return { view: "auth", authParams: { mode, role } };
  }

  // Admin routes
  if (cleanPath.startsWith("/admin")) {
    const rawSub = cleanPath.replace(/^\/admin/, "").replace(/^\//, "");
    let adminSec = "overview";
    if (["overview", "jobs", "internships", "companies", "students", "notifications", "settings"].includes(rawSub)) {
      adminSec = rawSub;
    }
    return { view: "admin", adminSection: adminSec };
  }

  // Company / Employer portal routes
  if (cleanPath.startsWith("/company") || cleanPath.startsWith("/employer")) {
    const rawSub = cleanPath.replace(/^\/(company|employer)/, "").replace(/^\//, "");
    let section = "dashboard";
    if (rawSub === "post" || rawSub === "post-internship") section = "post";
    else if (rawSub === "manage" || rawSub === "internships") section = "manage";
    else if (rawSub === "profile" || rawSub === "company-profile") section = "company-profile";
    else if (["dashboard", "applicants", "messages", "interviews", "analytics", "settings"].includes(rawSub)) {
      section = rawSub;
    }
    return { view: "company-portal", portalSection: section };
  }

  // Student routes
  if (cleanPath === "/student/dashboard" || cleanPath === "/student-home") {
    return { view: "student-home" };
  }
  if (cleanPath === "/student/applications" || cleanPath === "/applications") {
    return { view: "applications" };
  }
  if (cleanPath === "/student/profile") {
    return { view: "profile" };
  }
  if (cleanPath === "/dashboard") {
    if (currentRole === "company") return { view: "company-portal", portalSection: "dashboard" };
    if (currentRole === "student") return { view: "student-home" };
    if (currentRole === "admin") return { view: "admin" };
    return { view: "landing" };
  }
  if (cleanPath === "/profile") {
    if (currentRole === "company") return { view: "company-portal", portalSection: "company-profile" };
    return { view: "profile" };
  }

  // Internships
  const internshipMatch = cleanPath.match(/^\/internships\/(\d+)$/);
  if (internshipMatch) {
    return { view: "details", internshipId: Number(internshipMatch[1]) };
  }
  if (cleanPath === "/internships" || cleanPath === "/search") {
    return { view: "search" };
  }
  if (cleanPath === "/internships/details" || cleanPath === "/details") {
    return { view: "details" };
  }

  // Companies Directory
  const companyMatch = cleanPath.match(/^\/companies\/(\d+)$/);
  if (companyMatch) {
    return { view: "company-profile", companyId: Number(companyMatch[1]) };
  }
  if (cleanPath === "/companies") {
    return { view: "companies" };
  }
  if (cleanPath === "/company-profile") {
    return { view: "company-profile" };
  }

  // Content & Tools
  if (cleanPath === "/articles" || cleanPath === "/resources" || cleanPath === "/career-resources") {
    return { view: "career-resources" };
  }
  if (cleanPath === "/resume-builder") {
    return { view: "resume-builder" };
  }
  if (cleanPath === "/profile-setup") {
    return { view: "profile-setup" };
  }
  if (cleanPath === "/settings" || cleanPath === "/settings-privacy") {
    return { view: "settings-privacy" };
  }
  if (cleanPath === "/help" || cleanPath === "/contact") {
    return { view: "help" };
  }
  if (cleanPath === "/notifications") {
    return { view: "notifications" };
  }

  // Landing / Home
  if (cleanPath === "/" || cleanPath === "/home") {
    return { view: "landing" };
  }

  return { view: "landing" };
}

// ── State to Path resolution ──────────────────────────────────
function stateToPath({ view, portalSection, adminSection, authParams, selectedInternship, selectedCompany, publicProfileId }) {
  switch (view) {
    case "landing":
      return "/";
    case "search":
      return "/internships";
    case "details":
      return selectedInternship?.id ? `/internships/${selectedInternship.id}` : "/internships/details";
    case "companies":
      return "/companies";
    case "company-profile":
      return selectedCompany?.id ? `/companies/${selectedCompany.id}` : "/company-profile";
    case "career-resources":
      return "/articles";
    case "auth": {
      const mode = authParams?.mode === "signup" || authParams?.mode === "register" ? "signup" : "login";
      const isEmployer = authParams?.role === "company" || authParams?.role === "employer";
      const isAdmin = authParams?.role === "admin";
      if (isAdmin) return "/login/admin";
      if (mode === "signup") return isEmployer ? "/signup/employer" : "/signup";
      return isEmployer ? "/login/employer" : "/login";
    }
    case "student-home":
      return "/student/dashboard";
    case "profile":
      return "/student/profile";
    case "public-profile":
      return publicProfileId ? `/profile/${publicProfileId}` : "/profile";
    case "applications":
      return "/student/applications";
    case "resume-builder":
      return "/resume-builder";
    case "profile-setup":
      return "/profile-setup";
    case "settings-privacy":
      return "/settings";
    case "help":
      return "/help";
    case "notifications":
      return "/notifications";
    case "admin": {
      const aSec = adminSection || "overview";
      return `/admin/${aSec}`;
    }
    case "company-portal": {
      const sec = portalSection || "dashboard";
      return `/company/${sec}`;
    }
    default:
      return "/";
  }
}

function App() {
  const initialRole = loadFromStorage("id_role", null);
  const initialState = pathToState(window.location.pathname, window.location.search, initialRole);

  const [publicProfileId, setPublicProfileId] = useState(() => initialState.publicProfileId || new URLSearchParams(window.location.search).get("profile"));
  const [userRole, setUserRoleState] = useState(() => initialRole);
  const [sessionReady, setSessionReady] = useState(() => initialRole === null);
  const [userInfo, setUserInfoState] = useState(() => loadFromStorage("id_info", EMPTY_USER_INFO));

  const [view, setViewRaw] = useState(() => initialState.view);
  const [authParams, setAuthParamsState] = useState(() => initialState.authParams || { mode: "login", role: "student" });
  const [portalSection, setPortalSectionState] = useState(() => initialState.portalSection || "dashboard");
  const [adminSection, setAdminSectionState] = useState(() => initialState.adminSection || "overview");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Synchronize browser URL bar with current view/section
  const syncUrl = (nextView, nextSection, nextAuth, nextJob, nextComp, nextAdminSec) => {
    const v = nextView !== undefined ? nextView : view;
    const sec = nextSection !== undefined ? nextSection : portalSection;
    const aSec = nextAdminSec !== undefined ? nextAdminSec : adminSection;
    const auth = nextAuth !== undefined ? nextAuth : authParams;
    const job = nextJob !== undefined ? nextJob : selectedInternship;
    const comp = nextComp !== undefined ? nextComp : selectedCompany;
    const targetPath = stateToPath({
      view: v,
      portalSection: sec,
      adminSection: aSec,
      authParams: auth,
      selectedInternship: job,
      selectedCompany: comp,
      publicProfileId
    });
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: v, portalSection: sec, adminSection: aSec }, "", targetPath);
    }
  };

  const setView = (v) => {
    setViewRaw(v);
    syncUrl(v, portalSection, authParams, selectedInternship, selectedCompany);
  };

  const setPortalSection = (sec) => {
    setPortalSectionState(sec);
    syncUrl("company-portal", sec, authParams, selectedInternship, selectedCompany);
  };

  const setAdminSection = (sec) => {
    setAdminSectionState(sec);
    syncUrl("admin", portalSection, authParams, selectedInternship, selectedCompany, sec);
  };

  const setAuthParams = (params) => {
    setAuthParamsState(params);
    if (view === "auth") {
      syncUrl("auth", portalSection, params, selectedInternship, selectedCompany);
    }
  };

  const handleSelectInternship = (job) => {
    setSelectedInternship(job);
    setViewRaw("details");
    syncUrl("details", portalSection, authParams, job, selectedCompany);
  };

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setViewRaw("company-profile");
    syncUrl("company-profile", portalSection, authParams, selectedInternship, comp);
  };

  const setUserRole = (role) => {
    setUserRoleState(role);
    try {
      if (role) localStorage.setItem("id_role", JSON.stringify(role));
      else localStorage.removeItem("id_role");
    } catch {}
  };

  const setUserInfo = (info) => {
    setUserInfoState(info);
    try {
      localStorage.setItem("id_info", JSON.stringify(info));
    } catch {}
  };

  const logout = () => {
    api.logout().catch(() => {}).finally(() => saveCsrfToken(null));
    setUserRoleState(null);
    setUserInfoState(EMPTY_USER_INFO);
    setViewRaw("landing");
    if (window.location.pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
    try {
      localStorage.removeItem("id_role");
      localStorage.removeItem("id_info");
    } catch {}
  };

  const showFooter = view !== "company-portal" && view !== "auth" && view !== "profile-setup" && view !== "resume-builder" && view !== "admin";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, portalSection]);

  // Initial load: resolve deep-linked IDs if specified in URL
  useEffect(() => {
    if (initialState.internshipId && !selectedInternship) {
      api.internship(initialState.internshipId).then(setSelectedInternship).catch(() => {});
    }
    if (initialState.companyId && !selectedCompany) {
      api.company(initialState.companyId).then(setSelectedCompany).catch(() => {});
    }
    // Ensure initial URL matches state
    const currentCanonical = stateToPath({
      view,
      portalSection,
      authParams,
      selectedInternship,
      selectedCompany,
      publicProfileId
    });
    if (window.location.pathname !== currentCanonical && (window.location.pathname === "/dashboard" || window.location.pathname === "")) {
      window.history.replaceState({ view, portalSection }, "", currentCanonical);
    }
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const state = pathToState(window.location.pathname, window.location.search, userRole);
      if (state.view) setViewRaw(state.view);
      if (state.portalSection) setPortalSectionState(state.portalSection);
      if (state.adminSection) setAdminSectionState(state.adminSection);
      if (state.authParams) setAuthParamsState(state.authParams);
      if (state.publicProfileId) setPublicProfileId(state.publicProfileId);
      if (state.internshipId) {
        api.internship(state.internshipId).then(setSelectedInternship).catch(() => {});
      }
      if (state.companyId) {
        api.company(state.companyId).then(setSelectedCompany).catch(() => {});
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [userRole]);

  // Authenticate session
  useEffect(() => {
    if (publicProfileId) { setSessionReady(true); return; }
    let active = true;
    api.me().then(({ user, profile }) => {
      if (!active) return;
      const nextUser = { ...userInfo, ...user, ...(profile || {}), profileComplete: Boolean(user.profileComplete) };
      setUserRoleState(user.role);
      setUserInfoState(nextUser);
      try {
        localStorage.setItem("id_role", JSON.stringify(user.role));
        localStorage.setItem("id_info", JSON.stringify(nextUser));
      } catch {}
    }).catch(() => {
      if (!active) return;
      setUserRoleState(null);
      setUserInfoState(EMPTY_USER_INFO);
      saveCsrfToken(null);
      try { localStorage.removeItem("id_role"); localStorage.removeItem("id_info"); } catch {}
    }).finally(() => { if (active) setSessionReady(true); });
    return () => { active = false; };
  }, []);

  // Route Protection: If unauthenticated or wrong role, redirect protected views to login
  useEffect(() => {
    if (!sessionReady) return;

    if (view === "company-portal" && userRole !== "company") {
      setAuthParamsState({ mode: "login", role: "company" });
      setViewRaw("auth");
      if (window.location.pathname !== "/login/employer") {
        window.history.replaceState({ view: "auth" }, "", "/login/employer");
      }
    } else if ((view === "student-home" || view === "applications" || view === "profile") && userRole !== "student") {
      setAuthParamsState({ mode: "login", role: "student" });
      setViewRaw("auth");
      if (window.location.pathname !== "/login") {
        window.history.replaceState({ view: "auth" }, "", "/login");
      }
    }
  }, [sessionReady, view, userRole]);

  // Redirect admin users to admin portal
  useEffect(() => {
    if (!sessionReady) return;
    if (userRole === "admin" && view !== "admin" && view !== "auth") {
      setViewRaw("admin");
      if (!window.location.pathname.startsWith("/admin")) {
        window.history.replaceState({ view: "admin", adminSection: "overview" }, "", "/admin/overview");
      }
    }
  }, [sessionReady, userRole]);

  if (!sessionReady) return null;

  return (
    <div className={`min-h-screen bg-background md:pb-0 ${userRole !== "company" ? "pb-[calc(68px+env(safe-area-inset-bottom))]" : ""}`}>
      {view !== "auth" && view !== "profile-setup" && view !== "public-profile" && view !== "admin" && (
        <MobileHeader
          setView={setView}
          userRole={userRole}
          setAuthParams={setAuthParams}
          portalSection={portalSection}
          setPortalSection={setPortalSection}
          userInfo={userInfo}
          logout={logout}
        />
      )}
      {view !== "auth" && view !== "profile-setup" && view !== "public-profile" && view !== "admin" && (
        <Navbar
          view={view}
          setView={setView}
          userRole={userRole}
          setUserRole={setUserRole}
          setAuthParams={setAuthParams}
          userInfo={userInfo}
          logout={logout}
        />
      )}

      {view === "auth" && (
        <AuthPage
          setView={setView}
          setUserRole={setUserRole}
          setUserInfo={setUserInfo}
          initialMode={authParams.mode}
          initialRole={authParams.role}
        />
      )}
      {view === "profile-setup" && (
        <ProfileSetupPage
          userRole={userRole}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          setView={setView}
        />
      )}
      {view === "public-profile" && <PublicStudentProfile id={publicProfileId} />}
      {view === "landing" && (
        <LandingPage
          setView={setView}
          setAuthParams={setAuthParams}
          onSelectInternship={handleSelectInternship}
        />
      )}
      {view === "search" && (
        <SearchPage
          setView={setView}
          userRole={userRole}
          onSelectInternship={handleSelectInternship}
        />
      )}
      {view === "details" && (
        <DetailsPage
          setView={setView}
          internship={selectedInternship}
          userInfo={userInfo}
        />
      )}
      {view === "student-home" && userRole === "student" && (
        <StudentHome
          setView={setView}
          userInfo={userInfo}
          onSelectInternship={handleSelectInternship}
        />
      )}
      {view === "profile" && userRole === "student" && <StudentProfile setView={setView} userInfo={userInfo} />}
      {view === "applications" && userRole === "student" && (
        <ApplicationsPage
          setView={setView}
          userInfo={userInfo}
          onSelectInternship={handleSelectInternship}
        />
      )}
      {view === "company-portal" && userRole === "company" && (
        <CompanyPortal
          section={portalSection}
          setSection={setPortalSection}
          userInfo={userInfo}
          logout={logout}
        />
      )}
      {view === "career-resources" && <CareerResources setView={setView} />}
      {view === "companies" && (
        <CompaniesPage
          setView={setView}
          setSelectedCompany={handleSelectCompany}
        />
      )}
      {view === "company-profile" && selectedCompany && (
        <CompanyProfilePage
          company={selectedCompany}
          setView={setView}
          userInfo={userInfo}
        />
      )}
      {view === "settings-privacy" && <SettingsPrivacyPage setView={setView} userInfo={userInfo} logout={logout} />}
      {view === "help" && <HelpPage setView={setView} />}
      {view === "notifications" && <NotificationsPage userRole={userRole} />}
      {view === "resume-builder" && <ResumeBuilder setView={setView} userInfo={userInfo} />}
      {view === "admin" && userRole === "admin" && (
        <AdminDashboard
          section={adminSection}
          setSection={setAdminSection}
          userInfo={userInfo}
          logout={logout}
          setView={setView}
        />
      )}

      {showFooter && <Footer setView={setView} setAuthParams={setAuthParams} userRole={userRole} />}
      {showFooter && (
        <div className="md:hidden text-center py-3 text-xs text-muted-foreground bg-card border-t border-border">
          Powered By SYNTIARO
        </div>
      )}

      {view !== "auth" && view !== "profile-setup" && view !== "public-profile" && view !== "admin" && (
        <BottomNav
          view={view}
          setView={setView}
          userRole={userRole}
          setAuthParams={setAuthParams}
          logout={logout}
        />
      )}

      <Toaster position="top-center" richColors={true} />
    </div>
  );
}

export default App;
