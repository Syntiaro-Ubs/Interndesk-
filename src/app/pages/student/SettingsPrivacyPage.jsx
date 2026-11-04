import React, { useEffect, useState } from "react";
import { User, Lock, Bell, Eye, Shield, Trash2, ChevronRight, Check, X, Mail, Phone, Globe, Moon, Sun, Monitor, ArrowLeft, Camera, KeyRound, Smartphone, ToggleLeft, ToggleRight } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";

function Toggle({ enabled, onToggle }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onToggle,
      className: `relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`
    },
    /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow-sm ${enabled ? "translate-x-6" : "translate-x-1"}`
      }
    )
  );
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "bg-card border border-border rounded-2xl overflow-hidden mb-5" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "px-6 py-4 border-b border-border flex items-center gap-3" },
      Icon && /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center" },
        /* @__PURE__ */ React.createElement(Icon, { className: "w-4 h-4 text-primary" })
      ),
      /* @__PURE__ */ React.createElement("div", null,
        /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-semibold text-foreground" }, title),
        subtitle && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, subtitle)
      )
    ),
    children
  );
}

function SettingsRow({ label, subtitle, action, danger }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "flex items-center justify-between px-6 py-4 border-b border-border last:border-0 hover:bg-background/50 transition-colors" },
    /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("p", { className: `text-sm font-medium ${danger ? "text-red-500" : "text-foreground"}` }, label),
      subtitle && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, subtitle)
    ),
    action
  );
}

export function SettingsPrivacyPage({ setView, userInfo, logout }) {
  const [activeTab, setActiveTab] = useState("account");
  const [notifications, setNotifications] = useState({});
  const [privacy, setPrivacy] = useState({});
  const [theme, setTheme] = useState("");
  const [twoFa] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [passwordFields, setPasswordFields] = useState({ current: "", next: "", confirm: "" });
  const [showDangerConfirm, setShowDangerConfirm] = useState(null);

  useEffect(() => {
    let active = true;
    api.settings().then((settings) => {
      if (!active) return;
      setNotifications(settings.notifications || {});
      setPrivacy(settings.privacy || {});
      setTheme(settings.theme || "");
    }).catch((error) => { if (active) toast.error(error.message || "Could not load your settings."); });
    api.sessions().then((items) => { if (active) setSessions(items); }).catch((error) => { if (active) toast.error(error.message || "Could not load sessions."); });
    return () => { active = false; };
  }, []);

  const resolvedName = userInfo && (userInfo.firstName || userInfo.lastName)
    ? `${userInfo.firstName} ${userInfo.lastName}`.trim()
    : "";
  const resolvedEmail = userInfo?.email || "";
  const initials = resolvedName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Monitor },
  ];

  const savePreference = async (key, value) => {
    try {
      const updated = await api.updateSettings({ [key]: value });
      setNotifications(updated.notifications || {});
      setPrivacy(updated.privacy || {});
      setTheme(updated.theme || "");
    } catch (error) { toast.error(error.message || "Could not save this setting."); }
  };
  const toggleNotif = (key) => savePreference("notifications", { ...notifications, [key]: !notifications[key] });
  const togglePrivacy = (key) => savePreference("privacy", { ...privacy, [key]: !privacy[key] });
  const revokeSession = async (id) => {
    try {
      await api.revokeSession(id);
      setSessions((items) => items.filter((session) => session.id !== id));
    } catch (error) { toast.error(error.message || "Could not revoke this session."); }
  };
  const updatePassword = async () => {
    if (passwordFields.next !== passwordFields.confirm) return toast.error("New passwords do not match.");
    try {
      await api.changePassword({ currentPassword: passwordFields.current, newPassword: passwordFields.next });
      setPasswordFields({ current: "", next: "", confirm: "" });
      toast.success("Password updated. Other active sessions were signed out.");
    } catch (error) { toast.error(error.message || "Could not update your password."); }
  };

  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "min-h-screen bg-background" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "max-w-[1128px] mx-auto px-4 sm:px-6 py-6" },

      /* Header */
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex items-center gap-3 mb-6" },
        /* @__PURE__ */ React.createElement(
          "button",
          { onClick: () => setView("student-home"), className: "p-2 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all" },
          /* @__PURE__ */ React.createElement(ArrowLeft, { className: "w-4 h-4 text-muted-foreground" })
        ),
        /* @__PURE__ */ React.createElement("div", null,
          /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-semibold text-foreground" }, "Settings & Privacy"),
          /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Manage your account preferences and privacy settings")
        )
      ),

      /* Layout */
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex flex-col md:flex-row gap-5" },

        /* Sidebar tabs */
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "md:w-56 flex-shrink-0" },
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "bg-card border border-border rounded-2xl p-2 sticky top-20" },
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "flex items-center gap-3 p-3 mb-2 border-b border-border" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0" },
                initials
              ),
              /* @__PURE__ */ React.createElement("div", { className: "min-w-0" },
                /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-foreground truncate" }, resolvedName),
                /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-muted-foreground truncate" }, resolvedEmail)
              )
            ),
            tabs.map(tab =>
              /* @__PURE__ */ React.createElement(
                "button",
                {
                  key: tab.id,
                  onClick: () => setActiveTab(tab.id),
                  className: `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${activeTab === tab.id ? "bg-primary text-white" : "text-foreground hover:bg-background"}`
                },
                /* @__PURE__ */ React.createElement(tab.icon, { className: "w-4 h-4 flex-shrink-0" }),
                tab.label
              )
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "border-t border-border mt-2 pt-2" },
              /* @__PURE__ */ React.createElement(
                "button",
                {
                  onClick: logout,
                  className: "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                },
                /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" }),
                "Sign Out"
              )
            )
          )
        ),

        /* Main content */
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "flex-1 min-w-0" },

          /* Account Tab */
          activeTab === "account" && /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Profile Information", subtitle: "Update your personal details", icon: User },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "px-6 py-5" },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center gap-4 mb-6" },
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "relative" },
                    /* @__PURE__ */ React.createElement(
                      "div",
                      { className: "w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold" },
                      initials
                    ),
                    /* @__PURE__ */ React.createElement(
                      "button",
                      { className: "absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-card flex items-center justify-center" },
                      /* @__PURE__ */ React.createElement(Camera, { className: "w-3 h-3 text-white" })
                    )
                  ),
                  /* @__PURE__ */ React.createElement("div", null,
                    /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground" }, resolvedName),
                    /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, resolvedEmail),
                    /* @__PURE__ */ React.createElement(
                      "button",
                      { className: "text-xs text-primary font-medium mt-1 hover:underline" },
                      "Change photo"
                    )
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                  [
                    { label: "First Name", value: userInfo?.firstName || "Student", icon: User },
                    { label: "Last Name", value: userInfo?.lastName || "", icon: User },
                    { label: "Email Address", value: resolvedEmail, icon: Mail },
                    { label: "Phone Number", value: userInfo?.phone || "+91 XXXXX XXXXX", icon: Phone },
                  ].map(field =>
                    /* @__PURE__ */ React.createElement(
                      "div",
                      { key: field.label },
                      /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-muted-foreground mb-1.5" }, field.label),
                      /* @__PURE__ */ React.createElement(
                        "div",
                        { className: "flex items-center gap-2 px-3 py-2.5 bg-background border border-border rounded-xl" },
                        /* @__PURE__ */ React.createElement(field.icon, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }),
                        /* @__PURE__ */ React.createElement("span", { className: "text-sm text-foreground flex-1 truncate" }, field.value || "â€”"),
                        /* @__PURE__ */ React.createElement("button", {
  type: "button",
  onClick: () => setView("profile"),
  className: "text-primary text-xs font-medium hover:underline flex-shrink-0 cursor-pointer"
}, "Edit")
                      )
                    )
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: () => toast.success("Account preferences updated successfully."),
                    className: "mt-5 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                  },
                  "Save Changes"
                )
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Language & Region", subtitle: "Set your language preferences", icon: Globe },
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Language",
                  subtitle: "English (India)",
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    { className: "flex items-center gap-1.5 text-xs text-primary font-medium" },
                    "Change",
                    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3.5 h-3.5" })
                  )
                }
              ),
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Time Zone",
                  subtitle: "Asia/Kolkata (IST, UTC+5:30)",
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    { className: "flex items-center gap-1.5 text-xs text-primary font-medium" },
                    "Change",
                    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3.5 h-3.5" })
                  )
                }
              )
            )
          ),

          /* Security Tab */
          activeTab === "security" && /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Password", subtitle: "Update your login password", icon: KeyRound },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "px-6 py-5 space-y-4" },
                ["Current Password", "New Password", "Confirm New Password"].map(label =>
                  /* @__PURE__ */ React.createElement("div", { key: label },
                    /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-muted-foreground mb-1.5" }, label),
                    /* @__PURE__ */ React.createElement(
                      "input",
                      {
                        type: "password",
                        placeholder: "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢",
                        value: label === "Current Password" ? passwordFields.current : label === "New Password" ? passwordFields.next : passwordFields.confirm,
                        onChange: (event) => setPasswordFields((current) => ({ ...current, [label === "Current Password" ? "current" : label === "New Password" ? "next" : "confirm"]: event.target.value })),
                        className: "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                      }
                    )
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "button",
                  { type: "button", onClick: updatePassword, className: "px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors" },
                  "Update Password"
                )
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Two-Factor Authentication", subtitle: "Add an extra layer of security", icon: Smartphone },
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Authenticator App",
                  subtitle: "Two-factor authentication is not available on this server.",
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      onClick: () => toast.info("Two-factor authentication is not available on this server."),
                      className: `text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${twoFa ? "border-red-200 text-red-500 hover:bg-red-50" : "border-border text-foreground hover:border-primary hover:text-primary"}`
                    },
                    "Unavailable"
                  )
                }
              ),
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "SMS Authentication",
                  subtitle: "SMS authentication is not available on this server.",
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    { onClick: () => toast.info("SMS authentication is not available on this server."), className: "text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-foreground hover:border-primary hover:text-primary transition-colors" },
                    "Unavailable"
                  )
                }
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Active Sessions", subtitle: "Devices logged into your account", icon: Monitor },
              sessions.map((s, i) =>
                /* @__PURE__ */ React.createElement(
                  "div",
                  { key: i, className: "flex items-center justify-between px-6 py-4 border-b border-border last:border-0" },
                  /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" },
                    /* @__PURE__ */ React.createElement(
                      "div",
                      { className: `w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.current ? "bg-emerald-100" : "bg-background"}` },
                      /* @__PURE__ */ React.createElement(Monitor, { className: `w-4 h-4 ${s.current ? "text-emerald-600" : "text-muted-foreground"}` })
                    ),
                    /* @__PURE__ */ React.createElement("div", null,
                      /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" },
                        s.current ? "Current session" : "Signed-in session",
                        s.current && /* @__PURE__ */ React.createElement("span", { className: "ml-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium" }, "Current")
                      ),
                      /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, s.createdAt ? new Date(s.createdAt).toLocaleString() : "")
                    )
                  ),
                  !s.current && /* @__PURE__ */ React.createElement(
                    "button",
                    { onClick: () => revokeSession(s.id), className: "text-xs text-red-500 hover:underline font-medium" },
                    "Sign out"
                  )
                )
              )
            )
          ),

          /* Privacy Tab */
          activeTab === "privacy" && /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Profile Visibility", subtitle: "Control who can see your profile", icon: Eye },
              [
                { key: "profileVisible", label: "Public Profile", subtitle: "Your profile is visible to recruiters and companies" },
                { key: "showEmail", label: "Show Email Address", subtitle: "Allow employers to see your email on your profile" },
                { key: "showPhone", label: "Show Phone Number", subtitle: "Allow employers to see your phone number" },
                { key: "searchable", label: "Appear in Search", subtitle: "Let companies discover your profile in talent searches" },
                { key: "activityStatus", label: "Show Activity Status", subtitle: "Let others see when you were last active" },
              ].map(item =>
                /* @__PURE__ */ React.createElement(
                  SettingsRow,
                  {
                    key: item.key,
                    label: item.label,
                    subtitle: item.subtitle,
                    action: /* @__PURE__ */ React.createElement(Toggle, { enabled: privacy[item.key], onToggle: () => togglePrivacy(item.key) })
                  }
                )
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Data & Privacy", subtitle: "Manage how we use your data", icon: Shield },
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Data Sharing",
                  subtitle: "Allow InternDesk to use anonymised data for improving recommendations",
                  action: /* @__PURE__ */ React.createElement(Toggle, { enabled: privacy.dataSharing, onToggle: () => togglePrivacy("dataSharing") })
                }
              ),
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Download My Data",
                  subtitle: "Export all data associated with your account",
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    { className: "text-xs text-primary font-medium px-3 py-1.5 border border-border rounded-lg hover:border-primary transition-colors" },
                    "Export"
                  )
                }
              ),
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Cookie Preferences",
                  subtitle: "Manage how we use cookies on your device",
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    { className: "flex items-center gap-1 text-xs text-primary font-medium" },
                    "Manage",
                    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3.5 h-3.5" })
                  )
                }
              )
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "bg-red-50 border border-red-200 rounded-2xl overflow-hidden" },
              /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 border-b border-red-200" },
                /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-semibold text-red-600" }, "Danger Zone")
              ),
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Close Account",
                  subtitle: "Deactivate your account. You can reactivate any time.",
                  danger: true,
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      onClick: () => setShowDangerConfirm("close"),
                      className: "text-xs font-medium px-3 py-1.5 border border-red-300 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    },
                    "Close Account"
                  )
                }
              ),
              /* @__PURE__ */ React.createElement(
                SettingsRow,
                {
                  label: "Delete Account",
                  subtitle: "Permanently delete your account and all data. This cannot be undone.",
                  danger: true,
                  action: /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      onClick: () => setShowDangerConfirm("delete"),
                      className: "text-xs font-medium px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    },
                    "Delete"
                  )
                }
              )
            )
          ),

          /* Notifications Tab */
          activeTab === "notifications" && /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Internship Alerts", subtitle: "Get notified about new opportunities", icon: Bell },
              [
                { key: "newMatches", label: "New Internship Matches", subtitle: "Internships that match your skills and preferences" },
                { key: "applicationUpdates", label: "Application Status Updates", subtitle: "When your application status changes" },
                { key: "interviewReminders", label: "Interview Reminders", subtitle: "Reminders before your scheduled interviews" },
                { key: "deadlineReminders", label: "Application Deadlines", subtitle: "Alerts before internship application deadlines" },
              ].map(item =>
                /* @__PURE__ */ React.createElement(
                  SettingsRow,
                  {
                    key: item.key,
                    label: item.label,
                    subtitle: item.subtitle,
                    action: /* @__PURE__ */ React.createElement(Toggle, { enabled: notifications[item.key], onToggle: () => toggleNotif(item.key) })
                  }
                )
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Messages & Interactions", subtitle: "Control social notifications", icon: Bell },
              [
                { key: "messageAlerts", label: "New Messages", subtitle: "When a recruiter or company sends you a message" },
                { key: "profileViews", label: "Profile Views", subtitle: "When a company views your profile" },
              ].map(item =>
                /* @__PURE__ */ React.createElement(
                  SettingsRow,
                  {
                    key: item.key,
                    label: item.label,
                    subtitle: item.subtitle,
                    action: /* @__PURE__ */ React.createElement(Toggle, { enabled: notifications[item.key], onToggle: () => toggleNotif(item.key) })
                  }
                )
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Email Preferences", subtitle: "Manage emails from InternDesk", icon: Mail },
              [
                { key: "weeklyDigest", label: "Weekly Digest", subtitle: "A weekly summary of top internships and activity" },
                { key: "marketingEmails", label: "Marketing & Promotions", subtitle: "Tips, product updates, and special offers" },
              ].map(item =>
                /* @__PURE__ */ React.createElement(
                  SettingsRow,
                  {
                    key: item.key,
                    label: item.label,
                    subtitle: item.subtitle,
                    action: /* @__PURE__ */ React.createElement(Toggle, { enabled: notifications[item.key], onToggle: () => toggleNotif(item.key) })
                  }
                )
              )
            )
          ),

          /* Appearance Tab */
          activeTab === "appearance" && /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Theme", subtitle: "Choose your preferred display theme", icon: Sun },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "p-5 grid grid-cols-3 gap-3" },
                [
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map(t =>
                  /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      key: t.id,
                      onClick: () => savePreference("theme", t.id),
                      className: `flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${theme === t.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 hover:bg-background"}`
                    },
                    /* @__PURE__ */ React.createElement(
                      "div",
                      { className: `w-10 h-10 rounded-xl flex items-center justify-center ${theme === t.id ? "bg-primary text-white" : "bg-background text-muted-foreground"}` },
                      /* @__PURE__ */ React.createElement(t.icon, { className: "w-5 h-5" })
                    ),
                    /* @__PURE__ */ React.createElement("span", { className: `text-sm font-medium ${theme === t.id ? "text-primary" : "text-foreground"}` }, t.label),
                    theme === t.id && /* @__PURE__ */ React.createElement(
                      "span",
                      { className: "w-5 h-5 rounded-full bg-primary flex items-center justify-center" },
                      /* @__PURE__ */ React.createElement(Check, { className: "w-3 h-3 text-white" })
                    )
                  )
                )
              )
            ),
            /* @__PURE__ */ React.createElement(
              SectionCard,
              { title: "Display Density", subtitle: "Adjust how compact the interface looks", icon: Monitor },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "p-5 grid grid-cols-3 gap-3" },
                ["Compact", "Default", "Comfortable"].map((d, i) =>
                  /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      key: d,
                      className: `p-4 rounded-xl border-2 text-sm font-medium transition-all ${i === 1 ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-muted-foreground/40 hover:bg-background"}`
                    },
                    d,
                    i === 1 && /* @__PURE__ */ React.createElement("span", { className: "block text-[10px] text-primary mt-1 font-normal" }, "Active")
                  )
                )
              )
            )
          )
        )
      )
    ),

    /* Danger Confirm Modal */
    showDangerConfirm && /* @__PURE__ */ React.createElement(
      "div",
      { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-card border border-border rounded-2xl shadow-xl max-w-sm w-full p-6" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4" },
          /* @__PURE__ */ React.createElement(Trash2, { className: "w-6 h-6 text-red-500" })
        ),
        /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-foreground text-center" }, showDangerConfirm === "delete" ? "Delete Account?" : "Close Account?"),
        /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground text-center mt-2 mb-6" },
          showDangerConfirm === "delete"
            ? "This action is permanent and cannot be undone. All your data, applications, and profile will be erased."
            : "Your account will be deactivated. You can reactivate it by logging in again."
        ),
        /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" },
          /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setShowDangerConfirm(null),
              className: "flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-background transition-colors"
            },
            "Cancel"
          ),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => { logout?.(); setShowDangerConfirm(null); },
              className: "flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
            },
            showDangerConfirm === "delete" ? "Delete Forever" : "Close Account"
          )
        )
      )
    )
  );
}
