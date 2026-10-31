import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Building2,
  ChevronLeft,
  GraduationCap,
  ArrowRight,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";
import { OTPInput } from "input-otp";
import { toast } from "sonner";
import { api, saveCsrfToken } from "../api";
import logoUrl from "../../assets/interndesknewlogos.png";
import studentAuthImg from "../../assets/auth_student.jpg";
import employerAuthImg from "../../assets/auth_employer.jpg";

const FREE_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "hotmail.com", 
  "outlook.com", "live.com", "msn.com", "icloud.com", "me.com", "mac.com", 
  "aol.com", "zoho.com", "mail.com", "proton.me", "protonmail.com", "gmx.com", "yandex.com"
];

function cleanDomain(input) {
  if (!input) return "";
  let d = input.trim().toLowerCase();
  d = d.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  d = d.split("/")[0].split("?")[0].split("#")[0].trim();
  return d;
}

function getEmailDomain(email) {
  if (!email || !email.includes("@")) return "";
  return email.split("@")[1]?.toLowerCase().trim() || "";
}

function OtpSlot({ slot }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `w-12 h-14 flex items-center justify-center rounded-xl border-2 text-xl font-semibold transition-all duration-200 ${slot.isActive ? "border-primary bg-primary/5 text-foreground shadow-sm shadow-primary/20" : slot.char ? "border-primary/50 bg-card text-foreground" : "border-border bg-background text-muted-foreground"}`
    },
    slot.char ?? (slot.isActive ? /* @__PURE__ */ React.createElement("span", { className: "animate-pulse text-primary" }, "|") : "")
  );
}
function useCountdown(initial) {
  const [count, setCount] = useState(initial);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    if (count <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1e3);
    return () => clearTimeout(t);
  }, [count, running]);
  const restart = () => {
    setCount(initial);
    setRunning(true);
  };
  return { count, expired: count <= 0, restart };
}
function OtpScreen({
  type,
  target,
  onVerify,
  onVerified,
  onResend,
  onBack
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastAttemptedOtpRef = useRef("");
  const { count, expired, restart } = useCountdown(45);

  const doVerify = useCallback(async (code) => {
    const trimmed = String(code || "").trim();
    if (trimmed.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setVerifying(true);
    setError("");

    try {
      lastAttemptedOtpRef.current = trimmed;
      const result = await onVerify(trimmed);
      setVerified(true);
      setTimeout(() => onVerified(result), 800);
    } catch (requestError) {
      setError(requestError.message || "Invalid verification code. Please try again.");
    } finally {
      isSubmittingRef.current = false;
      setVerifying(false);
    }
  }, [onVerify, onVerified]);

  const handleVerifySubmit = (e) => {
    if (e) e.preventDefault();
    doVerify(value);
  };

  const handleResend = async () => {
    try {
      lastAttemptedOtpRef.current = "";
      setValue("");
      setError("");
      await onResend();
      restart();
    } catch (requestError) {
      setError(requestError.message || "Unable to send verification email. Please try again later.");
    }
  };

  const handleComplete = useCallback((val) => {
    if (val.length === 6 && !isSubmittingRef.current && lastAttemptedOtpRef.current !== val) {
      doVerify(val);
    }
  }, [doVerify]);

  return /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md mx-auto text-center" },
    /* @__PURE__ */ React.createElement("div", { className: `w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${verified ? "bg-emerald-100 text-emerald-500" : "bg-primary/10 text-primary"}` },
      verified ? /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-8 h-8" }) : /* @__PURE__ */ React.createElement(Mail, { className: "w-8 h-8" })
    ),
    /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground mb-1" },
      verified ? "Email verified successfully!" : "Verify your email"
    ),
    /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mb-4" },
      verified ? "Your email has been verified. Redirecting..." : /* @__PURE__ */ React.createElement(React.Fragment, null, "We've sent a 6-digit verification code to:", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-foreground" }, target))
    ),
    !verified && /* @__PURE__ */ React.createElement("form", { onSubmit: handleVerifySubmit, className: "space-y-4" },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-center my-3" },
        /* @__PURE__ */ React.createElement(OTPInput, {
          maxLength: 6,
          value,
          onChange: (val) => {
            setValue(val);
            setError("");
            if (val !== lastAttemptedOtpRef.current) {
              lastAttemptedOtpRef.current = "";
            }
          },
          onComplete: handleComplete,
          containerClassName: "flex gap-2",
          render: ({ slots }) => /* @__PURE__ */ React.createElement(React.Fragment, null, slots.map((slot, i) => /* @__PURE__ */ React.createElement(OtpSlot, { key: i, slot })))
        })
      ),
      error && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500 font-medium flex items-center justify-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u2715"), " ", error),
      /* @__PURE__ */ React.createElement("button", {
        type: "submit",
        disabled: verifying || value.length !== 6,
        className: "w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
      }, verifying ? "Verifying..." : "Verify Email"),
      /* @__PURE__ */ React.createElement("div", { className: "pt-2 text-sm text-muted-foreground" },
        /* @__PURE__ */ React.createElement("p", { className: "mb-1 text-xs" }, "Didn't receive the code?"),
        expired ? /* @__PURE__ */ React.createElement("button", {
          type: "button",
          onClick: handleResend,
          className: "inline-flex items-center gap-1.5 text-primary font-semibold hover:underline cursor-pointer text-sm"
        }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4" }), " Resend Code") : /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-foreground" }, "Resend code in ", count, "s")
      )
    ),
    /* @__PURE__ */ React.createElement("button", {
      type: "button",
      onClick: onBack,
      className: "mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }), " Back")
  );
}
function AuthPage({
  setView,
  setUserRole,
  setUserInfo,
  initialMode,
  initialRole
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleError, setGoogleError] = useState("");

  if (step === "email-verification") return React.createElement("div", { className: "min-h-screen bg-background flex items-center px-4" }, React.createElement(OtpScreen, {
    type: "email",
    target: email,
    onVerify: async (code) => {
      const result = await api.verifyEmail({
        email,
        password,
        otp: code,
        role,
        firstName,
        lastName,
        companyName,
        companyDomain: cleanDomain(companyDomain),
        designation
      });
      return result;
    },
    onVerified: (result) => {
      if (!result?.user) return;
      saveCsrfToken(result.csrfToken);
      const { user } = result;
      setUserInfo({ ...user, profileComplete: Boolean(user.profileComplete) });
      setUserRole(user.role);
      setView(user.role === "admin" ? "admin" : user.role === "student" ? "student-home" : "company-portal");
      toast.success(
        user.role === "company"
          ? "Company account registered successfully! Welcome to the Employer Portal."
          : "Email verified. Your account is ready.",
        { duration: 3000 }
      );
    },
    onResend: async () => {
      const res = await api.resendVerificationCode(email);
      toast.success("New verification code sent to your email.", { duration: 4000 });
      return res;
    },
    onBack: () => setStep("form")
  }));

  const validateEmployerEmailAndDomain = (dom, em) => {
    const cd = cleanDomain(dom);
    const ed = getEmailDomain(em);
    if (!cd) {
      return "Official company domain is required (e.g. acmecorp.com).";
    }
    if (FREE_EMAIL_DOMAINS.includes(cd)) {
      return `Personal/free domains (@${cd}) cannot be used. Please enter your official company domain.`;
    }
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cd)) {
      return "Please enter a valid company domain (e.g. acmecorp.com).";
    }
    if (!em || !em.includes("@")) {
      return "Please enter a valid corporate work email.";
    }
    if (FREE_EMAIL_DOMAINS.includes(ed)) {
      return `Public email providers (@${ed}) are not permitted. Please use your official corporate email (@${cd}).`;
    }
    if (ed !== cd && !ed.endsWith("." + cd)) {
      return `Your work email domain (@${ed}) must match your company domain (@${cd}).`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "register") {
        if (role === "company") {
          const err = validateEmployerEmailAndDomain(companyDomain, email);
          if (err) {
            setDomainError(err);
            toast.error(err, { duration: 4e3 });
            return;
          }
        }
        await api.sendVerificationCode(email);
        toast.success(`Verification code sent to ${email}. Please check your inbox.`, { duration: 5000 });
        setStep("email-verification");
      } else {
        const result = await api.login({ email, password, role });
        saveCsrfToken(result.csrfToken);
        const { user } = result;
        setUserInfo({ ...user, profileComplete: Boolean(user.profileComplete) });
        setUserRole(user.role);
        setView(user.role === "admin" ? "admin" : user.role === "student" ? "student-home" : "company-portal");
      }
    } catch (requestError) {
      if (mode === "register" && requestError.code === "EMAIL_DELIVERY_FAILED") setStep("email-verification");
      toast.error(requestError.message || "Unable to complete request.", { duration: 4e3 });
    }
  };
  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    setGoogleModalOpen(false);
    setGoogleError("");
    toast.error("Google sign-in is not configured. Use your email and password.");
  };
  const authImage = role === "student" ? studentAuthImg : employerAuthImg;
  const brandTitle = role === "student"
    ? (mode === "login" ? "Step into your future." : "Launch your career journey.")
    : (mode === "login" ? "Connecting forward-thinking companies." : "Build your dream team with top campus talent.");
  const brandDesc = role === "student"
    ? (mode === "login" ? "Find the perfect internship, track applications, and unlock exclusive opportunities." : "Join students discovering verified internship opportunities.")
    : (mode === "login" ? "Access your candidate pipeline, post new roles, and hire pre-vetted interns." : "Connect with candidates and manage your internship listings.");

  const brandLeft = /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex md:w-1/2 relative flex-col justify-between overflow-hidden bg-[#0F2260]" },
    /* Background Image with smooth transition */
    /* @__PURE__ */ React.createElement(
      "div",
      {
        key: `${role}-${mode}`,
        className: "absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 animate-in fade-in zoom-in-95 duration-500",
        style: {
          backgroundImage: `url(${authImage})`
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" })
    ),
    /* Content over image */
    /* @__PURE__ */ React.createElement("div", { className: "relative z-10 p-10 lg:p-14 flex flex-col h-full justify-between" },
      React.createElement("div", { className: "inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/20 shadow-sm" },
        role === "student" ? React.createElement(GraduationCap, { className: "w-4 h-4 text-white" }) : React.createElement(Building2, { className: "w-4 h-4 text-white" }),
        role === "student" ? "Student & Graduate Portal" : role === "admin" ? "Administration & Control Portal" : "Recruiter & Employer Portal"
      ),
      /* @__PURE__ */ React.createElement("div", { className: "mt-auto mb-8" },
        /* @__PURE__ */ React.createElement("h1", { className: "text-3xl lg:text-4xl font-light text-white mb-2 leading-tight tracking-wide drop-shadow-md" }, brandTitle),
        /* @__PURE__ */ React.createElement("p", { className: "text-sm font-light text-white/85 drop-shadow-sm max-w-md leading-relaxed" }, brandDesc)
      )
    )
  );

  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background flex flex-col md:flex-row" },
    brandLeft,
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col justify-start md:justify-center px-6 pt-8 pb-6 sm:py-6 sm:px-10 md:px-12 lg:px-16 bg-card relative" },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => step !== "form" ? setStep("form") : setView("landing"),
          className: "absolute top-5 left-5 p-2 bg-background rounded-full text-muted-foreground shadow-xs z-20 hover:bg-background/80 transition-colors"
        },
        /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-5 h-5" })
      ),
      /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md mx-auto" },
        /* Mobile banner header preview */
        /* @__PURE__ */ React.createElement("div", { className: "md:hidden w-full h-32 relative rounded-2xl overflow-hidden mb-5 shadow-sm border border-border/60" },
          /* @__PURE__ */ React.createElement("img", { src: authImage, alt: role, className: "w-full h-full object-cover object-top" }),
          /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3.5" },
            /* @__PURE__ */ React.createElement("span", { className: "text-white text-[11px] font-medium tracking-wide uppercase text-primary/90 opacity-90" }, role === "student" ? "Student Access" : "Employer Access"),
            /* @__PURE__ */ React.createElement("h3", { className: "text-white text-sm font-semibold leading-snug drop-shadow-sm" }, brandTitle)
          )
        ),
        /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-6" },
          /* @__PURE__ */ React.createElement("button", { onClick: () => setView("landing"), className: "hover:opacity-80 transition-opacity cursor-pointer" },
            /* @__PURE__ */ React.createElement("img", { src: logoUrl, alt: "InternDesk", className: "h-8" })
          )
        ), /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "mb-3 sm:mb-5 text-center" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground mb-1 sm:mb-2" }, mode === "login" ? "Welcome back" : "Create an account"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, mode === "login" ? "Enter your details to access your account." : "Join InternDesk and start your journey.")), /* @__PURE__ */ React.createElement("div", { className: "flex p-1 bg-background rounded-xl mb-3 sm:mb-5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setRole("student"),
      className: `flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === "student" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ React.createElement(GraduationCap, { className: "w-4 h-4" }),
    " Student"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setRole("company"),
      className: `flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === "company" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ React.createElement(Building2, { className: "w-4 h-4" }),
    " Employer"
  ), mode === "login" && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setRole("admin"),
      className: `flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === "admin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground cursor-pointer"}`
    },
    /* @__PURE__ */ React.createElement(ShieldCheck, { className: "w-4 h-4" }),
    " Admin"
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mb-3 sm:mb-5" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => { setGoogleEmailInput(""); setGoogleError(""); setGoogleModalOpen(true); }, className: "w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-background transition-colors" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", width: "20", height: "20", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), /* @__PURE__ */ React.createElement("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), /* @__PURE__ */ React.createElement("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })), "Continue with Google")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-3 sm:mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-border" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted-foreground uppercase tracking-wider font-medium" }, "Or"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-border" })), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-3 sm:space-y-4" }, mode === "register" && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "First Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: firstName,
      onChange: (e) => setFirstName(e.target.value),
      className: "w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: "First Name"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Last Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: lastName,
      onChange: (e) => setLastName(e.target.value),
      className: "w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: "Last Name"
    }
  ))), role === "company" && mode === "register" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Company Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: companyName,
      onChange: (e) => setCompanyName(e.target.value),
      className: "w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: "Company Name"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Designation"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: designation,
      onChange: (e) => setDesignation(e.target.value),
      className: "w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: "e.g. HR Manager, Recruiter"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground" }, "Official Company Domain / Website"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full" }, "Anti-Fraud Verification")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Globe, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: companyDomain,
      onChange: (e) => {
        setCompanyDomain(e.target.value);
        setDomainError("");
      },
      className: "w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: "e.g. infosys.com, google.com, acmecorp.io"
    }
  )), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, "Official company domain to prevent unauthorized or fake company enrollments.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, "Official Work Email"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Mail, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      required: true,
      value: email,
      onChange: (e) => {
        setEmail(e.target.value);
        setDomainError("");
      },
      className: `w-full pl-10 pr-4 py-2.5 bg-background border ${domainError ? "border-red-500" : "border-border"} focus:border-primary rounded-xl text-sm outline-none transition-colors`,
      placeholder: companyDomain ? `name@${cleanDomain(companyDomain) || "company.com"}` : "name@company.com"
    }
  )), domainError ? /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium" }, /* @__PURE__ */ React.createElement("span", null, "\u2715"), " ", domainError) : /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, "Must match your official corporate domain (personal email providers not allowed)."))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, role === "company" ? "Work Email" : "Email Address"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Mail, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      required: true,
      value: email,
      onChange: (e) => setEmail(e.target.value),
      className: "w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: role === "company" ? "Work Email" : "Email Address"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground" }, "Password"), mode === "login" && /* @__PURE__ */ React.createElement("a", { href: "#", className: "text-xs text-primary font-medium hover:underline" }, "Forgot?")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showPassword ? "text" : "password",
      required: true,
      value: password,
      onChange: (e) => setPassword(e.target.value),
      className: "w-full px-4 pr-11 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
      placeholder: "Password"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowPassword((s) => !s),
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
    },
    showPassword ? /* @__PURE__ */ React.createElement(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(Eye, { className: "w-4 h-4" })
  ))), mode === "register" && /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/20 rounded-xl" }, /* @__PURE__ */ React.createElement(ShieldCheck, { className: "w-4 h-4 text-primary flex-shrink-0 mt-0.5" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground leading-relaxed" }, "We'll send a verification OTP to your ", /* @__PURE__ */ React.createElement("span", { className: "text-foreground font-medium" }, "email"), " to confirm your identity.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "w-1/2 mx-auto py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center gap-2 group"
    },
    mode === "login" ? "Sign In" : "Verify & Continue",
    /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })
  )), /* @__PURE__ */ React.createElement("p", { className: "text-center text-sm text-muted-foreground mt-3 sm:mt-5" }, mode === "login" ? "Don't have an account?" : "Already have an account?", " ", /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setMode(mode === "login" ? "register" : "login"),
      className: "font-medium text-primary hover:underline"
    },
    mode === "login" ? "Sign up" : "Log in"
  ))))), googleModalOpen && /* @__PURE__ */ React.createElement(
    "div",
    { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "bg-card border border-border rounded-2xl shadow-xl max-w-sm w-full p-6 sm:p-8 flex flex-col items-center animate-scale-up" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "w-12 h-12 flex items-center justify-center mb-4" },
        /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", width: "32", height: "32", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), /* @__PURE__ */ React.createElement("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), /* @__PURE__ */ React.createElement("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" }))
      ),
      /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-medium text-foreground text-center" }, "Sign in with Google"),
      /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-1 mb-6 text-center" }, "to continue to InternDesk"),
      /* @__PURE__ */ React.createElement(
        "form",
        { onSubmit: handleGoogleSubmit, className: "w-full space-y-4" },
        /* @__PURE__ */ React.createElement(
          "div",
          null,
          /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-foreground mb-1.5" }, "Google Account Email"),
          /* @__PURE__ */ React.createElement("input", {
            type: "email",
            required: true,
            value: googleEmailInput,
            onChange: (e) => setGoogleEmailInput(e.target.value),
            className: "w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-sm outline-none transition-colors",
            placeholder: "example@gmail.com",
            autoFocus: true
          }),
          googleError && /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-red-500 mt-1.5" }, googleError)
        ),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "flex items-center gap-3 pt-2" },
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setGoogleModalOpen(false),
              className: "flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-background transition-colors"
            },
            "Cancel"
          ),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "submit",
              className: "flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            },
            "Continue"
          )
        )
      )
    )
  ));
}
export {
  AuthPage
};
