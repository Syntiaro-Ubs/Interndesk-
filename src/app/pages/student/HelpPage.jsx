import React, { useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { Search, ChevronDown, ChevronRight, ArrowLeft, MessageCircle, Mail, Book, Video, FileText, Zap, Shield, CreditCard, User, HelpCircle, CheckCircle, ExternalLink, Phone, Clock, Star } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Getting Started",
    icon: Zap,
    color: "bg-blue-50 text-blue-600",
    questions: [
      { q: "How do I create my profile?", a: "After signing up, you'll be taken through a guided profile setup. Add your education, skills, and experience to get personalised internship recommendations. You can always update your profile from the Profile section." },
      { q: "How do I find internships that match my skills?", a: "Use the Search & Filter page to browse by role, location, stipend, and domain (IT or Non-IT). InternDesk also shows personalised recommendations on your home feed based on your profile." },
      { q: "What's the difference between 'Easy Apply' and regular applications?", a: "Easy Apply lets you apply to internships instantly using your saved profile. Regular applications may require uploading your resume or filling in a company-specific form." },
    ]
  },
  {
    category: "Applications",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    questions: [
      { q: "How can I track my applications?", a: "Go to the Applications tab in your navigation bar. You'll see all your active applications along with their statuses: Applied, Under Review, Shortlisted, Interview Scheduled, Hired, or Rejected." },
      { q: "Can I withdraw an application after submitting?", a: "Currently, you can reach out to the company directly through the Messages section to withdraw. Formal in-app withdrawal is coming soon." },
      { q: "Why was my application rejected?", a: "Rejections can happen for many reasons — fit, timing, or volume of applications. We recommend reviewing your resume and profile. Our Career Resources section has tips to improve your profile for future applications." },
    ]
  },
  {
    category: "Account & Privacy",
    icon: Shield,
    color: "bg-violet-50 text-violet-600",
    questions: [
      { q: "How do I change my password?", a: "Go to Settings & Privacy → Security → Password. Enter your current password and your new one, then click Update Password." },
      { q: "Who can see my profile?", a: "By default, your profile is visible to recruiters and companies on InternDesk. You can control visibility in Settings & Privacy → Privacy → Profile Visibility." },
      { q: "How do I delete my account?", a: "Go to Settings & Privacy → Privacy → Danger Zone → Delete Account. This action is permanent and cannot be undone." },
    ]
  },
  {
    category: "Technical Issues",
    icon: HelpCircle,
    color: "bg-amber-50 text-amber-600",
    questions: [
      { q: "The page isn't loading correctly. What do I do?", a: "Try clearing your browser cache and cookies, then refresh the page. If the issue persists, try a different browser or device. You can also contact our support team." },
      { q: "I'm not receiving OTP emails. What should I do?", a: "Check your spam/junk folder first. Also make sure the email address you entered is correct. If the problem continues, try resending the OTP using the 'Resend OTP' button after 60 seconds." },
      { q: "My profile changes aren't saving. What's wrong?", a: "This may be a connectivity issue. Make sure you're connected to the internet, then try saving again. If the problem persists, try logging out and back in." },
    ]
  }
];

const GUIDES = [
  { title: "How to Build a Winning Resume", icon: FileText, tag: "Career Prep", time: "8 min read", color: "bg-blue-50 text-blue-600", targetView: "resume-builder" },
  { title: "Cracking the Interview: Complete Playbook", icon: MessageCircle, tag: "Interviews", time: "12 min read", color: "bg-emerald-50 text-emerald-600", targetView: "career-resources" },
  { title: "Optimising Your InternDesk Profile", icon: User, tag: "Profile Tips", time: "5 min read", color: "bg-violet-50 text-violet-600", targetView: "profile" },
  { title: "Understanding Application Statuses", icon: CheckCircle, tag: "Applications", time: "3 min read", color: "bg-amber-50 text-amber-600", targetView: "applications" },
];

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "border-b border-border last:border-0" },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setOpen(p => !p),
        className: "flex items-center justify-between w-full px-5 py-4 text-left hover:bg-background/50 transition-colors"
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-foreground pr-4" }, question),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: `flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${open ? "bg-primary text-white" : "bg-background text-muted-foreground"}` },
        open
          ? /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-3 h-3" })
          : /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3 h-3" })
      )
    ),
    open && /* @__PURE__ */ React.createElement(
      "div",
      { className: "px-5 pb-4" },
      /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground leading-relaxed" }, answer)
    )
  );
}

export function HelpPage({ setView }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [messageSent, setMessageSent] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });

  const filteredFaq = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => !search || q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => (activeCategory === "all" || cat.category === activeCategory) && cat.questions.length > 0);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createNotification({
        title: contactForm.subject || "Support Inquiry",
        message: contactForm.message,
        type: "support"
      });
      setMessageSent(true);
      toast.success("Your message has been sent to support! We will respond shortly.");
      setContactForm({ subject: "", message: "" });
      setTimeout(() => setMessageSent(false), 4000);
    } catch (err) {
      toast.error(err.message || "Failed to send support message.");
    }
  };

  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "min-h-screen bg-background" },

    /* Hero banner */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-white" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "max-w-[1128px] mx-auto px-4 sm:px-6 py-10 sm:py-14" },
        /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setView("student-home"),
            className: "flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          },
          /* @__PURE__ */ React.createElement(ArrowLeft, { className: "w-4 h-4" }),
          "Back to Home"
        ),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "max-w-2xl mx-auto text-center" },
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4" },
            /* @__PURE__ */ React.createElement(HelpCircle, { className: "w-7 h-7 text-white" })
          ),
          /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-semibold mb-2" }, "How can we help you?"),
          /* @__PURE__ */ React.createElement("p", { className: "text-white/75 text-sm mb-6" }, "Search our help centre or browse topics below"),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "relative" },
            /* @__PURE__ */ React.createElement(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }),
            /* @__PURE__ */ React.createElement(
              "input",
              {
                type: "text",
                placeholder: "Search for help topics, guides, FAQs…",
                value: search,
                onChange: e => setSearch(e.target.value),
                className: "w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-foreground text-sm outline-none border-none shadow-lg placeholder:text-muted-foreground"
              }
            )
          )
        )
      )
    ),

    /* Stats bar */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "bg-card border-b border-border" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "max-w-[1128px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 overflow-x-auto" },
        [
          { icon: Clock, text: "Avg. response in 2h", color: "text-emerald-500" },
          { icon: Star, text: "4.9/5 support rating", color: "text-amber-500" },
          { icon: CheckCircle, text: "98% issues resolved", color: "text-primary" },
        ].map((s, i) =>
          /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap" },
            /* @__PURE__ */ React.createElement(s.icon, { className: `w-3.5 h-3.5 ${s.color}` }),
            s.text
          )
        )
      )
    ),

    /* Main content */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "max-w-[1128px] mx-auto px-4 sm:px-6 py-8" },

      /* Popular guides */
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mb-10" },
        /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-semibold text-foreground mb-4" }, "Popular Guides"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
          GUIDES.map(guide =>
            /* @__PURE__ */ React.createElement(
              "div",
              {
                key: guide.title,
                onClick: () => setView(guide.targetView || "career-resources"),
                className: "bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group hover:border-primary/30"
              },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: `w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${guide.color}` },
                /* @__PURE__ */ React.createElement(guide.icon, { className: "w-5 h-5" })
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-medium text-primary mb-1" }, guide.tag),
              /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors" }, guide.title),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground flex items-center gap-1" },
                /* @__PURE__ */ React.createElement(Clock, { className: "w-3 h-3" }), guide.time
              )
            )
          )
        )
      ),

      /* FAQ + Contact layout */
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex flex-col lg:flex-row gap-6" },

        /* FAQ column */
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "flex-1 min-w-0" },
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex items-center justify-between mb-4" },
            /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-semibold text-foreground" }, "Frequently Asked Questions"),
          ),

          /* Category filter */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex gap-2 overflow-x-auto pb-2 mb-4" },
            [{ id: "all", label: "All Topics" }, ...FAQ_DATA.map(c => ({ id: c.category, label: c.category }))].map(cat =>
              /* @__PURE__ */ React.createElement(
                "button",
                {
                  key: cat.id,
                  onClick: () => setActiveCategory(cat.id),
                  className: `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id ? "bg-primary text-white" : "bg-card border border-border text-foreground hover:border-primary/50"}`
                },
                cat.label
              )
            )
          ),

          filteredFaq.length === 0
            ? /* @__PURE__ */ React.createElement(
              "div",
              { className: "bg-card border border-border rounded-xl p-10 text-center" },
              /* @__PURE__ */ React.createElement(Search, { className: "w-10 h-10 text-muted-foreground mx-auto mb-3" }),
              /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "No results found"),
              /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Try a different search term or browse all topics")
            )
            : filteredFaq.map(cat =>
              /* @__PURE__ */ React.createElement(
                "div",
                { key: cat.category, className: "bg-card border border-border rounded-xl overflow-hidden mb-4" },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center gap-3 px-5 py-4 border-b border-border" },
                  /* @__PURE__ */ React.createElement("div", { className: `w-8 h-8 rounded-xl flex items-center justify-center ${cat.color}` },
                    /* @__PURE__ */ React.createElement(cat.icon, { className: "w-4 h-4" })
                  ),
                  /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-foreground" }, cat.category)
                ),
                cat.questions.map((qa, i) =>
                  /* @__PURE__ */ React.createElement(AccordionItem, { key: i, question: qa.q, answer: qa.a })
                )
              )
            )
        ),

        /* Contact sidebar */
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "lg:w-80 flex-shrink-0 space-y-4" },

          /* Contact form */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "bg-card border border-border rounded-xl overflow-hidden" },
            /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border" },
              /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-foreground" }, "Contact Support"),
              /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Our team typically replies within 2 hours")
            ),
            messageSent
              ? /* @__PURE__ */ React.createElement(
                "div",
                { className: "p-6 text-center" },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3" },
                  /* @__PURE__ */ React.createElement(CheckCircle, { className: "w-6 h-6 text-emerald-500" })
                ),
                /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Message Sent!"),
                /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "We'll get back to you shortly at your registered email.")
              )
              : /* @__PURE__ */ React.createElement(
                "form",
                { onSubmit: handleContactSubmit, className: "p-5 space-y-4" },
                /* @__PURE__ */ React.createElement("div", null,
                  /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-foreground mb-1.5" }, "Subject"),
                  /* @__PURE__ */ React.createElement(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: contactForm.subject,
                      onChange: e => setContactForm(p => ({ ...p, subject: e.target.value })),
                      placeholder: "What do you need help with?",
                      className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    }
                  )
                ),
                /* @__PURE__ */ React.createElement("div", null,
                  /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-foreground mb-1.5" }, "Message"),
                  /* @__PURE__ */ React.createElement(
                    "textarea",
                    {
                      rows: 4,
                      required: true,
                      value: contactForm.message,
                      onChange: e => setContactForm(p => ({ ...p, message: e.target.value })),
                      placeholder: "Describe your issue in detail…",
                      className: "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground"
                    }
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "button",
                  {
                    type: "submit",
                    className: "w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  },
                  /* @__PURE__ */ React.createElement(Mail, { className: "w-4 h-4" }),
                  "Send Message"
                )
              )
          ),

          /* Quick links */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "bg-card border border-border rounded-xl overflow-hidden" },
            /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-border" },
              /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-foreground" }, "Quick Links")
            ),
            [
              { label: "View Your Applications", icon: FileText, view: "applications" },
              { label: "Career Resources & Guides", icon: Book, view: "career-resources" },
              { label: "Your Profile", icon: User, view: "profile" },
              { label: "Settings & Privacy", icon: Shield, view: "settings-privacy" },
            ].map(link =>
              /* @__PURE__ */ React.createElement(
                "button",
                {
                  key: link.label,
                  onClick: () => setView(link.view),
                  className: "flex items-center gap-3 w-full px-5 py-3.5 border-b border-border last:border-0 hover:bg-background transition-colors text-left"
                },
                /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 rounded-lg bg-background flex items-center justify-center flex-shrink-0" },
                  /* @__PURE__ */ React.createElement(link.icon, { className: "w-3.5 h-3.5 text-muted-foreground" })
                ),
                /* @__PURE__ */ React.createElement("span", { className: "text-sm text-foreground" }, link.label),
                /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3.5 h-3.5 text-muted-foreground ml-auto" })
              )
            )
          )
        )
      )
    )
  );
}
