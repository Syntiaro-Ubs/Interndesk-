import React, { useState, useEffect } from "react";
import { Bell, User, Menu, X, LayoutDashboard, Plus, Briefcase as BriefcaseIcon, Users, MessageSquare, Calendar, Building2, BarChart3, Settings, LogOut } from "lucide-react";
import { api } from "../../api";
import logoUrl from "../../../assets/interndesknewlogos.png";
const portalNavItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "post", icon: Plus, label: "Post Internship" },
  { id: "manage", icon: BriefcaseIcon, label: "Manage Internships" },
  { id: "applicants", icon: Users, label: "Applicants" },
  { id: "messages", icon: MessageSquare, label: "Messages" },
  { id: "interviews", icon: Calendar, label: "Interviews" },
  { id: "company-profile", icon: Building2, label: "Company Profile" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "settings", icon: Settings, label: "Settings" }
];
function MobileHeader({
  setView,
  userRole,
  setAuthParams,
  portalSection,
  setPortalSection,
  userInfo,
  logout
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, [userRole]);

  const homeView = "landing";
  const studentName = userInfo && (userInfo.firstName || userInfo.lastName) ? `${userInfo.firstName} ${userInfo.lastName}`.trim() : "My Profile";
  const studentInitials = userInfo?.firstName ? userInfo.firstName[0].toUpperCase() : "S";
  const companyName = userInfo?.companyName || "Your Company";
  const recruiterName = userInfo && (userInfo.firstName || userInfo.lastName) ? `${userInfo.firstName} ${userInfo.lastName}`.trim() : "Recruiter";
  const recruiterSubtitle = [recruiterName, userInfo?.designation].filter(Boolean).join(" · ");
  const companyInitials = userInfo?.companyName ? userInfo.companyName[0].toUpperCase() : userInfo?.firstName ? userInfo.firstName[0].toUpperCase() : "C";
  const handlePortalNav = (id) => {
    setPortalSection?.(id);
    setView("company-portal");
    setDrawerOpen(false);
  };
  const handleLogout = () => {
    logout?.();
    setDrawerOpen(false);
    setProfileMenuOpen(false);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "md:hidden sticky top-0 z-50 bg-card border-b border-border shadow-sm px-4 h-14 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setView("landing"), className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("img", { src: logoUrl, alt: "InternDesk", className: "h-6" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, userRole === "company" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setDrawerOpen(true),
      className: "w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border hover:border-primary hover:text-primary transition-colors text-foreground"
    },
    /* @__PURE__ */ React.createElement(Menu, { className: "w-4 h-4" })
  ) : userRole === "student" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("notifications"),
      className: "relative w-9 h-9 rounded-lg flex items-center justify-center bg-background border border-border hover:border-primary hover:text-primary transition-colors text-foreground cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(Bell, { className: "w-4 h-4" }),
    unreadCount > 0 && /* @__PURE__ */ React.createElement(
      "span",
      { className: "absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs animate-pulse" },
      unreadCount > 9 ? "9+" : unreadCount
    )
  ) : (
    /* Logged-out: Join now and Sign in buttons */
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setAuthParams({ mode: "register", role: "student" });
          setView("auth");
        },
        className: "text-black/75 font-semibold text-xs px-2.5 py-1 hover:bg-black/5 rounded-full transition-colors"
      },
      "Join now"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setAuthParams({ mode: "login", role: "student" });
          setView("auth");
        },
        className: "text-[#0a66c2] border border-[#0a66c2] font-semibold text-xs px-3 py-1 rounded-full hover:bg-[#f4faff] transition-colors"
      },
      "Sign in"
    ))
  ))), drawerOpen && userRole === "company" && /* @__PURE__ */ React.createElement("div", { className: "md:hidden fixed inset-0 z-[60] flex" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 bg-black/40", onClick: () => setDrawerOpen(false) }), /* @__PURE__ */ React.createElement("div", { className: "w-64 bg-card h-full flex flex-col shadow-2xl border-l border-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-4 py-4 border-b border-border" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold" }, companyInitials), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-foreground" }, companyName), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground" }, recruiterSubtitle))), /* @__PURE__ */ React.createElement("button", { onClick: () => setDrawerOpen(false), className: "p-1.5 text-muted-foreground hover:text-foreground rounded-lg" }, /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" }))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-3 space-y-0.5", style: { scrollbarWidth: "none" } }, portalNavItems.map((item) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: item.id,
      onClick: () => handlePortalNav(item.id),
      className: `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${portalSection === item.id ? "bg-primary text-white" : "text-foreground hover:bg-background"}`
    },
    /* @__PURE__ */ React.createElement(item.icon, { className: "w-4 h-4 flex-shrink-0" }),
    item.label
  ))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-border p-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleLogout,
      className: "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
    },
    /* @__PURE__ */ React.createElement(LogOut, { className: "w-4 h-4 flex-shrink-0" }),
    "Sign Out"
  )))));
}
export {
  MobileHeader
};
