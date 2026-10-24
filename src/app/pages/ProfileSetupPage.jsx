import React, { useState, useRef } from "react";
import {
  GraduationCap,
  User,
  MapPin,
  Phone,
  Linkedin,
  Globe,
  Plus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Building2,
  Users,
  BookOpen,
  Zap,
  Star,
  ArrowRight,
  Camera
} from "lucide-react";
import logoUrl from "../../assets/interndesknewlogos.png";
import { api } from "../api";
import { toast } from "sonner";
const SKILL_OPTIONS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "SQL",
  "Excel",
  "PowerPoint",
  "Data Analysis",
  "Machine Learning",
  "Marketing",
  "Finance",
  "Accounting",
  "Project Management",
  "Communication",
  "Leadership",
  "Java",
  "C++",
  "Figma",
  "UI/UX Design",
  "SEO",
  "Content Writing",
  "Business Development",
  "Sales",
  "Research",
  "Statistics",
  "R",
  "Tableau",
  "Power BI",
  "Google Analytics",
  "Digital Marketing"
];
const INTEREST_OPTIONS = [
  "IT - Software & Web",
  "IT - Data & AI",
  "IT - Cloud & Cyber",
  "NON IT - Finance",
  "NON IT - Marketing",
  "NON IT - Operations",
  "Healthcare",
  "Education",
  "E-Commerce",
  "Startup"
];
const INDUSTRY_OPTIONS = [
  "IT & Software Services",
  "NON IT / Finance & Banking",
  "NON IT / Consulting",
  "Healthcare",
  "Education",
  "E-Commerce",
  "Manufacturing",
  "Media & Entertainment",
  "FMCG",
  "Logistics"
];
const COMPANY_SIZE_OPTIONS = ["1\u201310", "11\u201350", "51\u2013200", "201\u2013500", "500\u20131000", "1000+"];
const DEGREE_OPTIONS = ["B.Tech / B.E.", "BBA / BMS", "B.Com", "BA", "B.Sc", "MBA", "M.Tech", "MCA", "CA", "LLB", "Other"];
const YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028", "2029"];
function StepBar({ current, total }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex gap-1.5 mb-6" }, Array.from({ length: total }).map((_, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      className: `h-1 flex-1 rounded-full transition-all duration-500 ${i < current ? "bg-primary" : i === current ? "bg-primary/60" : "bg-border"}`
    }
  )));
}
function Pill({ label, selected, onToggle }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onToggle,
      className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground"}`
    },
    selected && /* @__PURE__ */ React.createElement(Check, { className: "w-3 h-3 inline mr-1" }),
    label
  );
}
function Field({ label, children, optional }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-foreground mb-1.5" }, label, " ", optional && /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), children);
}
const inputCls = "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground";
const selectCls = "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors text-foreground";
function AvatarPicker({ value, onChange, name }) {
  const ref = useRef(null);
  return /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-2" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background cursor-pointer relative overflow-hidden hover:border-primary transition-colors",
      onClick: () => ref.current?.click()
    },
    value ? /* @__PURE__ */ React.createElement("img", { src: value, className: "w-full h-full object-cover rounded-full" }) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-1" }, /* @__PURE__ */ React.createElement(Camera, { className: "w-6 h-6 text-muted-foreground" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Photo"))
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, name), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => ref.current?.click(),
      className: "text-xs text-primary hover:underline mt-0.5"
    },
    value ? "Change photo" : "Upload photo"
  )), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref,
      type: "file",
      accept: "image/*",
      className: "hidden",
      onChange: (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/") && file.size <= 1_500_000) {
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result);
          reader.readAsDataURL(file);
        }
      }
    }
  ));
}
function StudentSetup({
  userInfo,
  onComplete,
  onBack
}) {
  const TOTAL = 4;
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [bio, setBio] = useState("");
  const toggleSkill = (s) => setSkills((prev2) => prev2.includes(s) ? prev2.filter((x) => x !== s) : [...prev2, s]);
  const toggleInterest = (i) => setInterests((prev2) => prev2.includes(i) ? prev2.filter((x) => x !== i) : [...prev2, i]);
  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills((prev2) => [...prev2, customSkill.trim()]);
      setCustomSkill("");
    }
  };
  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const finish = () => {
    onComplete({ avatar, headline, location, phone, linkedin, portfolio, university, degree, field, gradYear, cgpa, skills, interests, bio });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg mx-auto" }, /* @__PURE__ */ React.createElement(StepBar, { current: step, total: TOTAL }), step === 0 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "Welcome, ", userInfo.firstName, "! \u{1F44B}"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Let's set up your profile so employers can find you.")), /* @__PURE__ */ React.createElement(
    AvatarPicker,
    {
      value: avatar,
      onChange: setAvatar,
      name: `${userInfo.firstName} ${userInfo.lastName}`
    }
  ), /* @__PURE__ */ React.createElement(Field, { label: "Professional Headline" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: inputCls,
      placeholder: "Professional Headline",
      value: headline,
      onChange: (e) => setHeadline(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(Field, { label: "City / Location" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: `${inputCls} pl-9`,
      placeholder: "City / Location",
      value: location,
      onChange: (e) => setLocation(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement(Field, { label: "Phone" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Phone, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "tel",
      className: `${inputCls} pl-9`,
      placeholder: "Phone Number",
      value: phone,
      onChange: (e) => setPhone(e.target.value)
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(Field, { label: "LinkedIn URL", optional: true }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Linkedin, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "url",
      className: `${inputCls} pl-9`,
      placeholder: "LinkedIn URL",
      value: linkedin,
      onChange: (e) => setLinkedin(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement(Field, { label: "Portfolio / GitHub", optional: true }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Globe, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input", 
    {
      type: "url",
      className: `${inputCls} pl-9`,
      placeholder: "Portfolio / GitHub URL",
      value: portfolio,
      onChange: (e) => setPortfolio(e.target.value)
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onBack || prev,
      className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2"
    },
    /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }),
    " Back"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: next,
      disabled: !headline.trim() || !location.trim(),
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    },
    "Next ",
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  ))), step === 1 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "Your Education"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Tell employers where you're studying.")), /* @__PURE__ */ React.createElement(Field, { label: "University / College" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(GraduationCap, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: `${inputCls} pl-9`,
      placeholder: "University / College",
      value: university,
      onChange: (e) => setUniversity(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(Field, { label: "Degree" }, /* @__PURE__ */ React.createElement("select", { className: selectCls, value: degree, onChange: (e) => setDegree(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Select degree"), DEGREE_OPTIONS.map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d)))), /* @__PURE__ */ React.createElement(Field, { label: "Graduation Year" }, /* @__PURE__ */ React.createElement("select", { className: selectCls, value: gradYear, onChange: (e) => setGradYear(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Select year"), YEAR_OPTIONS.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, y))))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(Field, { label: "Field / Specialization" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: inputCls,
      placeholder: "Field / Specialization",
      value: field,
      onChange: (e) => setField(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement(Field, { label: "CGPA / Percentage", optional: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: inputCls,
      placeholder: "CGPA / Percentage",
      value: cgpa,
      onChange: (e) => setCgpa(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: prev, className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }), " Back"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: next,
      disabled: !university.trim() || !degree || !gradYear,
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    },
    "Next ",
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  ))), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "Skills & Interests"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Select at least 3 skills to get matched with relevant internships.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-2" }, "Skills ", /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground font-normal" }, "(", skills.length, " selected)")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mb-3" }, SKILL_OPTIONS.map((s) => /* @__PURE__ */ React.createElement(Pill, { key: s, label: s, selected: skills.includes(s), onToggle: () => toggleSkill(s) }))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: inputCls,
      placeholder: "Add a custom skill",
      value: customSkill,
      onChange: (e) => setCustomSkill(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: addCustomSkill,
      className: "px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" })
  )), skills.filter((s) => !SKILL_OPTIONS.includes(s)).length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mt-2" }, skills.filter((s) => !SKILL_OPTIONS.includes(s)).map((s) => /* @__PURE__ */ React.createElement("span", { key: s, className: "flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium" }, s, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => toggleSkill(s) }, /* @__PURE__ */ React.createElement(X, { className: "w-3 h-3" })))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-2" }, "Career Interests"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, INTEREST_OPTIONS.map((i) => /* @__PURE__ */ React.createElement(Pill, { key: i, label: i, selected: interests.includes(i), onToggle: () => toggleInterest(i) })))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: prev, className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }), " Back"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: next,
      disabled: skills.length < 3,
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    },
    "Next ",
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  ))), step === 3 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "About You"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Write a short bio that showcases who you are.")), /* @__PURE__ */ React.createElement(Field, { label: "Bio", optional: true }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: `${inputCls} resize-none min-h-[120px]`,
      placeholder: "Write a short bio about yourself...",
      value: bio,
      onChange: (e) => setBio(e.target.value),
      rows: 5
    }
  ), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-1 text-right" }, bio.length, "/500")), /* @__PURE__ */ React.createElement("div", { className: "bg-primary/5 border border-primary/20 rounded-xl p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement(Star, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "Profile strength tip"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "A clear bio helps employers understand your experience and interests.")))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: prev, className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }), " Back"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: finish,
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
    },
    "Finish Setup ",
    /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" })
  ))));
}
const DEPT_OPTIONS = [
  "IT - Software Development",
  "IT - Data Science & AI",
  "IT - Cloud & DevOps",
  "IT - Full Stack",
  "IT - Cyber Security",
  "IT - UI/UX Design",
  "NON IT - Business Development",
  "NON IT - Finance & Accounting",
  "NON IT - Digital Marketing",
  "NON IT - Human Resources",
  "NON IT - Sales & Growth",
  "NON IT - Operations"
];
function EmployerSetup({
  userInfo,
  onComplete,
  onBack
}) {
  const TOTAL = 3;
  const [step, setStep] = useState(0);
  const [logo, setLogo] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState(userInfo?.domain || userInfo?.website || "");
  const [hqLocation, setHqLocation] = useState("");
  const [founded, setFounded] = useState("");
  const [description, setDescription] = useState("");
  const [culture, setCulture] = useState("");
  const [perks, setPerks] = useState([]);
  const PERK_OPTIONS = [
    "Flexible Hours",
    "Remote / Hybrid",
    "Mentorship",
    "Stipend",
    "PPO Opportunity",
    "International Exposure",
    "Stock Options",
    "Health Benefits",
    "Learning Budget",
    "Fun Culture",
    "Startup Environment",
    "MNC Scale"
  ];
  const [departments, setDepartments] = useState([]);
  const [internshipType, setInternshipType] = useState([]);
  const TYPE_OPTIONS = ["Remote", "On-site", "Hybrid", "Full-time", "Part-time"];
  const toggleArr = (arr, setArr, val) => setArr((prev2) => prev2.includes(val) ? prev2.filter((x) => x !== val) : [...prev2, val]);
  const logoRef = useRef(null);
  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const finish = () => {
    onComplete({ logo, industry, companySize, website, hqLocation, founded, description, culture, perks, departments, internshipType });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg mx-auto" }, /* @__PURE__ */ React.createElement(StepBar, { current: step, total: TOTAL }), step === 0 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "Company Details"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Help students get to know ", userInfo.companyName || "your company", ".")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-background cursor-pointer relative overflow-hidden hover:border-primary transition-colors",
      onClick: () => logoRef.current?.click()
    },
    logo ? /* @__PURE__ */ React.createElement("img", { src: logo, className: "w-full h-full object-cover rounded-2xl" }) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-1" }, /* @__PURE__ */ React.createElement(Upload, { className: "w-5 h-5 text-muted-foreground" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Logo"))
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, userInfo.companyName || "Your Company"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => logoRef.current?.click(), className: "text-xs text-primary hover:underline mt-0.5" }, logo ? "Change logo" : "Upload logo")), /* @__PURE__ */ React.createElement("input", {
    ref: logoRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/") && file.size <= 1_500_000) {
        const reader = new FileReader();
        reader.onload = () => setLogo(reader.result);
        reader.readAsDataURL(file);
      }
    }
  })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(Field, { label: "Industry" }, /* @__PURE__ */ React.createElement("select", { className: selectCls, value: industry, onChange: (e) => setIndustry(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Select industry"), INDUSTRY_OPTIONS.map((i) => /* @__PURE__ */ React.createElement("option", { key: i, value: i }, i)))), /* @__PURE__ */ React.createElement(Field, { label: "Company Size" }, /* @__PURE__ */ React.createElement("select", { className: selectCls, value: companySize, onChange: (e) => setCompanySize(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Select size"), COMPANY_SIZE_OPTIONS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s, " employees"))))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(Field, { label: "HQ Location" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: `${inputCls} pl-9`,
      placeholder: "HQ Location",
      value: hqLocation,
      onChange: (e) => setHqLocation(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement(Field, { label: "Founded Year", optional: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: inputCls,
      placeholder: "Founded Year",
      min: 1900,
      max: 2024,
      value: founded,
      onChange: (e) => setFounded(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement(Field, { label: "Website", optional: true }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Globe, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "url",
      className: `${inputCls} pl-9`,
      placeholder: "Website URL",
      value: website,
      onChange: (e) => setWebsite(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onBack || prev,
      className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2"
    },
    /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }),
    " Back"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: next,
      disabled: !industry || !companySize || !hqLocation.trim(),
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    },
    "Next ",
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  ))), step === 1 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "About the Company"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "A great description attracts top interns.")), /* @__PURE__ */ React.createElement(Field, { label: "Company Description" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: `${inputCls} resize-none`,
      placeholder: "Company Description",
      value: description,
      onChange: (e) => setDescription(e.target.value),
      rows: 4
    }
  )), /* @__PURE__ */ React.createElement(Field, { label: "Culture & Work Environment", optional: true }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: `${inputCls} resize-none`,
      placeholder: "Culture & Work Environment",
      value: culture,
      onChange: (e) => setCulture(e.target.value),
      rows: 3
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-2" }, "Perks & Benefits"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, PERK_OPTIONS.map((p) => /* @__PURE__ */ React.createElement(Pill, { key: p, label: p, selected: perks.includes(p), onToggle: () => toggleArr(perks, setPerks, p) })))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: prev, className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }), " Back"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: next,
      disabled: !description.trim(),
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    },
    "Next ",
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  ))), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "Hiring Preferences"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Let us know what kinds of interns you're looking for.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-2" }, "Departments you hire for ", /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground font-normal" }, "(select all that apply)")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, DEPT_OPTIONS.map((d) => /* @__PURE__ */ React.createElement(Pill, { key: d, label: d, selected: departments.includes(d), onToggle: () => toggleArr(departments, setDepartments, d) })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground mb-2" }, "Internship Type"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, TYPE_OPTIONS.map((t) => /* @__PURE__ */ React.createElement(Pill, { key: t, label: t, selected: internshipType.includes(t), onToggle: () => toggleArr(internshipType, setInternshipType, t) })))), /* @__PURE__ */ React.createElement("div", { className: "bg-primary/5 border border-primary/20 rounded-xl p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-foreground" }, "You're almost there!"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "After setup, you can post your first internship and start receiving applications immediately.")))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: prev, className: "flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }), " Back"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: finish,
      disabled: departments.length === 0 || internshipType.length === 0,
      className: "flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    },
    "Finish Setup ",
    /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" })
  ))));
}
function CompletionScreen({ role, name, onGo }) {
  return React.createElement("div", { className: "w-full max-w-md mx-auto text-center space-y-6" },
    React.createElement("div", { className: "w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto" }, React.createElement(Check, { className: "w-12 h-12 text-emerald-500" })),
    React.createElement("div", null,
      React.createElement("h2", { className: "text-2xl font-medium text-foreground" }, "You're all set, ", name, "!"),
      React.createElement("p", { className: "text-sm text-muted-foreground mt-2" }, role === "student" ? "Your profile is ready. You can now browse and apply to internships." : "Your company profile is ready. You can now manage your internship listings.")
    ),
    React.createElement("button", { type: "button", onClick: onGo, className: "w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group" },
      role === "student" ? "Explore Internships" : "Go to Dashboard",
      React.createElement(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })
    )
  );
}
function ProfileSetupPage({
  userRole,
  userInfo,
  setUserInfo,
  setView
}) {
  const [done, setDone] = useState(false);
  const handleComplete = async (data) => {
    try {
    if (userRole === "student") {
      await api.updateStudentProfile({
        phone: data.phone, college: data.university, degree: data.degree,
        graduationYear: data.gradYear ? Number(data.gradYear) : undefined,
        cgpa: data.cgpa ? Number(data.cgpa) : undefined,
        bio: data.bio, location: data.location, skills: data.skills, interests: data.interests,
        profileData: { headline: data.headline, linkedin: data.linkedin, portfolio: data.portfolio, avatar: data.avatar },
      });
    } else {
      await api.updateCompanyProfile({
        industry: data.industry, size: data.companySize, description: data.description, website: data.website,
        profileData: { logo: data.logo, culture: data.culture, founded: data.founded, location: data.hqLocation, perks: data.perks, departments: data.departments, internshipType: data.internshipType },
      });
    }
    const updated = { ...userInfo, profileComplete: true };
    setUserInfo(updated);
    setDone(true);
    } catch (error) {
      toast.error(error.message || "Could not save your profile. Please try again.");
    }
  };
  const handleGo = () => {
    setView(userRole === "student" ? "student-home" : "company-portal");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background flex flex-col md:flex-row" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex md:w-80 lg:w-96 bg-[#0F2260] flex-col justify-between p-6 flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-6" }, /* @__PURE__ */ React.createElement("img", { src: logoUrl, alt: "InternDesk", className: "h-8 brightness-0 invert" })), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-medium text-white mb-2" }, userRole === "student" ? "Build a profile that stands out" : "Set up your employer profile"), /* @__PURE__ */ React.createElement("p", { className: "text-blue-200 text-sm leading-relaxed" }, userRole === "student" ? "A complete profile helps recruiters learn about you." : "Add company details so candidates can learn about your team."), /* @__PURE__ */ React.createElement("div", { className: "mt-6 space-y-4" }, (userRole === "student" ? [
    { icon: User, text: "Basic info & headline" },
    { icon: GraduationCap, text: "Education details" },
    { icon: Zap, text: "Skills & interests" },
    { icon: BookOpen, text: "About you" }
  ] : [
    { icon: Building2, text: "Company details" },
    { icon: BookOpen, text: "About the company" },
    { icon: Users, text: "Hiring preferences" }
  ]).map(({ icon: Icon, text }) => /* @__PURE__ */ React.createElement("div", { key: text, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icon, { className: "w-4 h-4 text-white" })), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-blue-100" }, text))))), /* @__PURE__ */ React.createElement("p", { className: "text-blue-300 text-xs" }, "You can always update your profile later.")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col items-center justify-center px-6 py-6 sm:px-10 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex md:hidden items-center gap-2 mb-6 self-start" }, /* @__PURE__ */ React.createElement("img", { src: logoUrl, alt: "InternDesk", className: "h-6" })), /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg" }, done ? /* @__PURE__ */ React.createElement(
    CompletionScreen,
    {
      role: userRole,
      name: userInfo.firstName,
      onGo: handleGo
    }
  ) : userRole === "student" ? /* @__PURE__ */ React.createElement(StudentSetup, { userInfo, onComplete: handleComplete, onBack: () => setView("auth") }) : /* @__PURE__ */ React.createElement(EmployerSetup, { userInfo, onComplete: handleComplete, onBack: () => setView("auth") }))));
}
export {
  ProfileSetupPage
};


