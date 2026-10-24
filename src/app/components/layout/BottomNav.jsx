import React from "react";
import { Briefcase, User, FileText, Home, BookOpen, ScrollText } from "lucide-react";

function BottomNav({ view, setView, userRole, setAuthParams, logout }) {
  const navItem = (v, Icon, label) => {
    const isActive = view === v;
    return (
      <button
        type="button"
        onClick={() => setView(v)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20 text-primary" : ""}`} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 h-[calc(68px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {userRole === null && (
        <>
          {navItem("landing", Home, "Home")}
          {navItem("search", Briefcase, "Internships")}
          {navItem("career-resources", BookOpen, "Resources")}
          <button
            type="button"
            onClick={() => {
              setAuthParams({ mode: "login", role: "student" });
              setView("auth");
            }}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              view === "auth" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className={`w-5 h-5 ${view === "auth" ? "fill-primary/20 text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </>
      )}

      {userRole === "student" && (
        <>
          {navItem("student-home", Home, "Home")}
          {navItem("search", Briefcase, "Jobs")}
          {navItem("resume-builder", ScrollText, "Resume")}
          {navItem("applications", FileText, "Applied")}
          {navItem("profile", User, "Profile")}
        </>
      )}
    </div>
  );
}

export { BottomNav };
