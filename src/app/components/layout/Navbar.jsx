import React, { useState, useEffect } from "react";
import { Bell, Briefcase, Building2, ChevronDown, FileText, Home, ScrollText, Shield } from "lucide-react";
import { api } from "../../api";
import logoUrl from "../../../assets/interndesknewlogos.png";

function Navbar({ view, setView, userRole, setAuthParams, userInfo, logout }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isStudent = userRole === "student";
  const isCompany = userRole === "company";
  const isAdmin = userRole === "admin";
  const displayName = isCompany
    ? userInfo?.companyName || "Your Company"
    : isAdmin
    ? "Site Admin"
    : [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(" ") || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    let active = true;
    const fetchUnread = () => {
      api.notifications().then((notifs) => {
        if (!active) return;
        const unread = (notifs || []).filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(() => {});
    };
    fetchUnread();
    const handleSync = () => fetchUnread();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [view]);

  const navigate = (nextView) => {
    setView(nextView);
    setUserMenuOpen(false);
  };

  const navItem = (targetView, Icon, label, badgeCount = 0) => (
    <button type="button" onClick={() => navigate(targetView)} className={`relative flex h-full flex-col items-center justify-center whitespace-nowrap border-b-2 px-3 transition-colors ${view === targetView ? "border-[#0a66c2] font-semibold text-foreground" : "border-transparent text-black/60 hover:text-black cursor-pointer"}`}>
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs animate-pulse">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </div>
      <span className="mt-0.5 hidden text-[11px] font-normal lg:block">{label}</span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 hidden border-b border-[#e0dfdc] bg-white shadow-xs md:block">
      <div className="mx-auto h-[56px] max-w-[1128px] px-4 md:px-6">
        <div className="flex h-full w-full items-center justify-between">
          <button type="button" onClick={() => { navigate("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center cursor-pointer" aria-label="InternDesk home">
            <img src={logoUrl} alt="InternDesk" className="h-11" />
          </button>
          {userRole === null ? (
            <div className="flex h-full items-center gap-1 xl:gap-3">
              {navItem("search", Briefcase, "Internships")}
              {navItem("companies", Building2, "Companies")}
              {navItem("career-resources", FileText, "Articles")}
              <div className="mx-2 h-8 w-px bg-[#e0dfdc]" />
              <button
                type="button"
                onClick={() => { setAuthParams({ mode: "register", role: "company" }); navigate("auth"); }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                Employer
              </button>
              <button
                type="button"
                onClick={() => { setAuthParams({ mode: "register", role: "student" }); navigate("auth"); }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-black/75 hover:bg-black/5 hover:text-black transition-colors cursor-pointer"
              >
                Join now
              </button>
              <button
                type="button"
                onClick={() => { setAuthParams({ mode: "login", role: "student" }); navigate("auth"); }}
                className="rounded-full border border-[#0a66c2] px-5 py-1.5 text-sm font-semibold text-[#0a66c2] hover:bg-[#f4faff] transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </div>
          ) : isStudent ? (
            <div className="flex h-full items-center">
              {navItem("student-home", Home, "Home")}
              {navItem("search", Briefcase, "Internships")}
              {navItem("companies", Building2, "Companies")}
              {navItem("applications", FileText, "Applications")}
              {navItem("notifications", Bell, "Notifications", unreadCount)}
              {navItem("resume-builder", ScrollText, "Resume")}
              <UserMenu displayName={displayName} initial={initial} userInfo={userInfo} navigate={navigate} logout={logout} open={userMenuOpen} setOpen={setUserMenuOpen} student />
            </div>
          ) : isCompany ? (
            <div className="flex h-full items-center gap-1 xl:gap-2">
              {navItem("landing", Home, "Home")}
              {navItem("search", Briefcase, "Internships")}
              {navItem("companies", Building2, "Companies")}
              {navItem("career-resources", FileText, "Articles")}
              <div className="mx-2 h-8 w-px bg-[#e0dfdc]" />
              <button
                type="button"
                onClick={() => navigate("company-portal")}
                className="rounded-full bg-[#0a66c2] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#004182] transition-colors cursor-pointer"
              >
                Employer Portal
              </button>
              <UserMenu displayName={displayName} initial={initial} userInfo={userInfo} navigate={navigate} logout={logout} open={userMenuOpen} setOpen={setUserMenuOpen} student={false} />
            </div>
          ) : isAdmin ? (
            <div className="flex h-full items-center gap-3">
              {navItem("landing", Home, "Live Site")}
              <button
                type="button"
                onClick={() => navigate("admin")}
                className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Dashboard
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

function UserMenu({ displayName, initial, userInfo, navigate, logout, open, setOpen, student = false }) {
  return (
    <div className="relative flex h-full items-center">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex h-full flex-col items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground cursor-pointer" aria-expanded={open} aria-label="Open account menu">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a66c2] text-[9px] font-bold text-white">{initial}</span>
        <span className="mt-0.5 hidden items-center text-[11px] font-normal lg:flex">Me <ChevronDown className="ml-0.5 h-3 w-3" /></span>
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            {userInfo?.email && <p className="mt-1 text-xs text-muted-foreground">{userInfo.email}</p>}
          </div>
          <div className="p-2 space-y-1">
            <button type="button" onClick={() => navigate(student ? "profile" : "company-portal")} className="w-full rounded-full border border-[#0a66c2] px-4 py-1 text-center text-sm font-semibold text-[#0a66c2] hover:bg-[#f4faff] cursor-pointer">{student ? "View Profile" : "Open Portal"}</button>
            {student && (
              <button type="button" onClick={() => navigate("settings-privacy")} className="w-full px-3 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors cursor-pointer">
                Settings &amp; Privacy
              </button>
            )}
            <button type="button" onClick={() => navigate("help")} className="w-full px-3 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors cursor-pointer">
              Help &amp; Support
            </button>
          </div>
          <div className="border-t border-border p-2">
            <button type="button" onClick={logout} className="w-full px-2 py-1 text-left text-sm text-red-600 hover:underline cursor-pointer">Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Navbar };
