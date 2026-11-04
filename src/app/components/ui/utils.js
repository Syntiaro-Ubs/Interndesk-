import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatDeadline(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr).trim();
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const first = Number(dmyMatch[1]);
    const second = Number(dmyMatch[2]);
    const year = dmyMatch[3];
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
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export {
  cn,
  formatDeadline
};
