import React, { useEffect, useState } from "react";
import { X, Check, CheckCircle2, FileText, Upload, Briefcase, Clock, Building2 } from "lucide-react";
import { api } from "../api";
import { toast } from "sonner";
function EasyApplyModal({
  internship,
  userInfo,
  onClose,
  onSuccess
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const firstName = userInfo?.firstName || "";
  const lastName = userInfo?.lastName || "";
  const candidateEmail = userInfo?.email || "";
  const [phone, setPhone] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeKey, setResumeKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!userInfo?.id) return;
    api.studentProfile().then((profile) => {
      setResumeKey(profile.resumeKey || null);
      if (profile.resumeKey) setResumeName("Resume on your profile");
    }).catch(() => {});
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setResumeFile(file); setResumeName(file.name); }
  };
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo?.id) {
      toast.error("Please sign in with a student account before applying.");
      return;
    }
    const normalizedPhone = phone.replace(/[\s()-]/g, "");
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(normalizedPhone)) {
      toast.error("Enter a valid 10-digit Indian mobile number, optionally with +91.");
      return;
    }
    try {
      setSubmitting(true);
      let selectedResumeKey = resumeKey;
      if (resumeFile) {
        if (resumeFile.size > 5 * 1024 * 1024) throw new Error("Resume must be 5 MB or smaller.");
        const dataBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(new Error("Could not read the selected resume."));
          reader.readAsDataURL(resumeFile);
        });
        const uploaded = await api.uploadResume({ fileName: resumeFile.name, mimeType: resumeFile.type, dataBase64 });
        selectedResumeKey = uploaded.resumeKey;
      }
      if (!selectedResumeKey) throw new Error("Upload a resume to continue.");
      await api.apply(internship.id, {
        resumeKey: selectedResumeKey,
        resumeName: resumeName || "Resume.pdf",
        coverNote: "",
        candidateName: `${firstName} ${lastName}`.trim() || userInfo?.name || "Student Applicant",
        candidateEmail: candidateEmail || userInfo?.email || "student@example.com",
        phone: normalizedPhone,
        studentId: userInfo?.id
      });
      setIsSubmitted(true);
      setTimeout(() => onSuccess(internship.id), 2e3);
    } catch (error) {
      toast.error(error.message || "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl w-full max-w-[900px] shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh]" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/5 hover:bg-black/10 text-black/60 hover:text-black rounded-full transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" })
  ), isSubmitted ? /* @__PURE__ */ React.createElement("div", { className: "w-full py-20 px-8 text-center flex flex-col items-center justify-center space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-10 h-10 text-emerald-600" })), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 max-w-md mx-auto" }, /* @__PURE__ */ React.createElement("h3", { className: "text-3xl font-bold text-foreground" }, "Application Sent!"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60 leading-relaxed" }, "Your application for ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-black" }, internship.title), " has been securely submitted to ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-[#0a66c2]" }, internship.company), ".")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "mt-6 px-8 py-3 bg-[#0a66c2] text-white font-semibold text-sm rounded-full hover:bg-[#004182] transition-colors"
    },
    "Done"
  )) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-[45%] bg-[#f8fafc] p-6 sm:p-8 border-r border-[#e0dfdc] overflow-y-auto hidden md:block" }, /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm mb-4", style: { backgroundColor: internship.logoColor || "#0a66c2" } }, internship.logo), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-foreground leading-tight" }, internship.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm text-black/60 mt-1.5" }, /* @__PURE__ */ React.createElement(Building2, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-foreground" }, internship.company), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, internship.location)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mt-4" }, /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-1 bg-white border border-[#e0dfdc] text-xs font-semibold rounded-md text-foreground flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Briefcase, { className: "w-3.5 h-3.5 text-[#0a66c2]" }), " ", internship.mode), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-1 bg-white border border-[#e0dfdc] text-xs font-semibold rounded-md text-foreground flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-3.5 h-3.5 text-[#0a66c2]" }), " ", internship.duration))), /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-foreground mb-2" }, "About the role"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/70 leading-relaxed" }, "As a ", internship.title, " at ", internship.company, ", you will work closely with our experts to deliver high-quality solutions. This role is designed to provide you with hands-on experience in a fast-paced environment where your contributions directly impact our goals.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-foreground mb-2" }, "Key Responsibilities"), /* @__PURE__ */ React.createElement("ul", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("li", { className: "flex items-start gap-2 text-sm text-black/70" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" }), " Execute day-to-day tasks relevant to the ", internship.department, " department."), /* @__PURE__ */ React.createElement("li", { className: "flex items-start gap-2 text-sm text-black/70" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" }), " Collaborate with cross-functional teams to identify and solve problems."), /* @__PURE__ */ React.createElement("li", { className: "flex items-start gap-2 text-sm text-black/70" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" }), " Take ownership of specific project modules under mentorship."))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-foreground mb-2" }, "Eligibility Criteria"), /* @__PURE__ */ React.createElement("ul", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("li", { className: "flex items-start gap-2 text-sm text-black/70" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" }), " Pursuing a Bachelor's or Master's degree in a relevant field."), /* @__PURE__ */ React.createElement("li", { className: "flex items-start gap-2 text-sm text-black/70" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" }), " Hands-on familiarity with ", internship.skills.slice(0, 2).join(" and ") || "core concepts", "."), /* @__PURE__ */ React.createElement("li", { className: "flex items-start gap-2 text-sm text-black/70" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" }), " Strong analytical, communication, and teamwork skills."))))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-[55%] p-4 sm:p-8 overflow-y-auto bg-white relative" }, /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold text-foreground" }, "Apply for ", internship.title), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-black/60 mt-1" }, "Submit your application to ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-foreground" }, internship.company))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleFinalSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-foreground mb-1.5" }, "First Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      defaultValue: firstName,
      className: "w-full h-11 px-3.5 bg-white border border-[#e0dfdc] focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-xl text-sm outline-none transition-colors",
      placeholder: "First Name"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-foreground mb-1.5" }, "Last Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      defaultValue: lastName,
      className: "w-full h-11 px-3.5 bg-white border border-[#e0dfdc] focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-xl text-sm outline-none transition-colors",
      placeholder: "Last Name"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-foreground mb-1.5" }, "Email Address *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      required: true,
      defaultValue: candidateEmail,
      className: "w-full h-11 px-3.5 bg-white border border-[#e0dfdc] focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-xl text-sm outline-none transition-colors",
      placeholder: "Email Address"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-foreground mb-1.5" }, "Phone Number *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "tel",
      required: true,
      inputMode: "tel",
      autoComplete: "tel",
      pattern: "(?:\\+91[\\s-]?)?[6-9][0-9]{9}",
      title: "Enter a valid 10-digit Indian mobile number, optionally with +91.",
      value: phone,
      onChange: (e) => setPhone(e.target.value),
      className: "w-full h-11 px-3.5 bg-white border border-[#e0dfdc] focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-xl text-sm outline-none transition-colors",
      placeholder: "Phone Number"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "pt-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-foreground mb-1.5" }, "Resume / CV *"), resumeName ? /* @__PURE__ */ React.createElement("div", { className: "p-3.5 border-2 border-[#0a66c2]/20 bg-[#f4faff] rounded-xl flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-lg bg-white shadow-sm text-[#0a66c2] flex items-center justify-center flex-shrink-0" }, /* @__PURE__ */ React.createElement(FileText, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-foreground truncate" }, resumeName), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-black/50" }, "PDF / DOCX (Max 5MB)"))), /* @__PURE__ */ React.createElement("label", { className: "text-xs font-semibold text-[#0a66c2] hover:underline cursor-pointer ml-2 flex-shrink-0" }, "Replace", /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".pdf,.doc,.docx", className: "hidden", onChange: handleFileChange }))) : /* @__PURE__ */ React.createElement("label", { className: "flex flex-col items-center justify-center gap-2 h-28 px-4 border-2 border-dashed border-[#e0dfdc] hover:border-[#0a66c2] hover:bg-[#f4faff] rounded-xl cursor-pointer transition-colors group" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center group-hover:scale-110 transition-transform" }, /* @__PURE__ */ React.createElement(Upload, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-foreground" }, "Click to upload resume"), /* @__PURE__ */ React.createElement("input", { type: "file", required: true, accept: ".pdf,.doc,.docx", className: "hidden", onChange: handleFileChange }))), /* @__PURE__ */ React.createElement("div", { className: "pt-4 mt-4 border-t border-[#e0dfdc]" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "w-full h-12 bg-[#0a66c2] text-white font-bold text-sm rounded-xl hover:bg-[#004182] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
    },
    "Submit Application"
  ), /* @__PURE__ */ React.createElement("p", { className: "text-center text-[11px] text-black/50 mt-3" }, "By submitting, you agree to InternDesk's Terms of Service and Privacy Policy.")))))));
}
export {
  EasyApplyModal
};
