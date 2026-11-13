import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatDeadline(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr).trim();
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (dmyMatch) {
    const first = Number(dmyMatch[1]);
    const second = Number(dmyMatch[2]);
    let year = dmyMatch[3];
    if (year.length === 4) year = year.slice(-2);
    if (first > 12 && second <= 12) {
      return `${String(first).padStart(2, "0")}/${String(second).padStart(2, "0")}/${year}`;
    }
    if (first <= 12 && second > 12) {
      return `${String(second).padStart(2, "0")}/${String(first).padStart(2, "0")}/${year}`;
    }
    return `${String(first).padStart(2, "0")}/${String(second).padStart(2, "0")}/${year}`;
  }
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y.slice(-2)}`;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatExactDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    if (dateStr !== "Today" && dateStr !== "Just now") {
      return formatDeadline(dateStr);
    }
    return "";
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    if (dateStr !== "Just now" && dateStr !== "Today") return String(dateStr);
    return "Just now";
  }
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60 * 1000) return "Just now";
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 30) return `${diffDay} days ago`;
  if (diffMonth < 12) return `${diffMonth} ${diffMonth === 1 ? "month" : "months"} ago`;
  return `${diffYear} ${diffYear === 1 ? "year" : "years"} ago`;
}

function isInternshipOpen(job) {
  if (!job) return false;
  const status = String(job.status || "").toLowerCase();
  if (status === "closed" || status === "expired") return false;
  if (!job.deadline) return true;

  const str = String(job.deadline).trim();
  let deadlineDate = null;
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    deadlineDate = new Date(Number(ymdMatch[1]), Number(ymdMatch[2]) - 1, Number(ymdMatch[3]), 23, 59, 59, 999);
  } else {
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
    if (dmyMatch) {
      let year = Number(dmyMatch[3]);
      if (year < 100) year += 2000;
      deadlineDate = new Date(year, Number(dmyMatch[2]) - 1, Number(dmyMatch[1]), 23, 59, 59, 999);
    } else {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        deadlineDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);
      }
    }
  }
  if (deadlineDate && !isNaN(deadlineDate.getTime())) {
    return deadlineDate.getTime() >= Date.now();
  }
  return true;
}

export {
  cn,
  formatDeadline,
  formatExactDate,
  formatTimeAgo,
  isInternshipOpen
};
