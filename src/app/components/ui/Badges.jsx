import React from "react";
import { Star } from "lucide-react";
function ModeBadge({ mode }) {
  const s = { Remote: "bg-emerald-50 text-emerald-700 border-emerald-200", Hybrid: "bg-blue-50 text-blue-700 border-blue-200", "On-site": "bg-gray-100 text-gray-600 border-gray-200" };
  return /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s[mode]}` }, mode);
}
function CategoryBadge({ category }) {
  return /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${category === "IT" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"}` }, category);
}
function StatusBadge({ status }) {
  const map = {
    Applied: "bg-blue-50 text-blue-700 border-blue-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
    "Interview Scheduled": "bg-violet-50 text-violet-700 border-violet-200",
    Shortlisted: "bg-sky-50 text-sky-700 border-sky-200",
    Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
    "Offer Received": "bg-emerald-100 text-emerald-800 border-emerald-300"
  };
  return /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}` }, status);
}
function LogoMark({ logo, color, size = "md" }) {
  const sizes = { sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-14 h-14 text-sm" };
  return /* @__PURE__ */ React.createElement("div", { className: `${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`, style: { backgroundColor: color } }, logo);
}
function StarRating({ rating }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Star, { className: "w-3.5 h-3.5 fill-amber-400 text-amber-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-foreground" }, rating));
}
export {
  CategoryBadge,
  LogoMark,
  ModeBadge,
  StarRating,
  StatusBadge
};
