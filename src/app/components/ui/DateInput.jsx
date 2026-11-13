import React, { useRef, useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { formatDeadline } from "./utils";

export function DateInput({
  value,
  onChange,
  min,
  placeholder = "dd/mm/yy",
  className = ""
}) {
  const hiddenRef = useRef(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped(value ? formatDeadline(value) : "");
  }, [value]);

  const handleBlur = () => {
    if (!typed.trim()) {
      onChange("");
      return;
    }
    const match = typed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
    if (match) {
      const d = match[1].padStart(2, "0");
      const m = match[2].padStart(2, "0");
      let y = match[3];
      if (y.length === 2) y = `20${y}`;
      const iso = `${y}-${m}-${d}`;
      onChange(iso);
      setTyped(formatDeadline(iso));
    } else {
      // Revert if invalid format
      setTyped(value ? formatDeadline(value) : "");
    }
  };

  const openPicker = () => {
    if (hiddenRef.current) {
      if (typeof hiddenRef.current.showPicker === "function") {
        try {
          hiddenRef.current.showPicker();
        } catch {
          hiddenRef.current.focus();
        }
      } else {
        hiddenRef.current.focus();
      }
    }
  };

  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      <input
        type="text"
        value={typed}
        placeholder={placeholder}
        onChange={(e) => setTyped(e.target.value)}
        onBlur={handleBlur}
        onClick={openPicker}
        className={
          className ||
          "w-full pl-4 pr-10 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors bg-card cursor-pointer"
        }
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
        title="Open calendar"
      >
        <Calendar className="w-4 h-4" />
      </button>
      <input
        ref={hiddenRef}
        type="date"
        min={min || todayIso}
        value={value ? (value.includes("T") ? value.split("T")[0] : value) : ""}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="sr-only absolute pointer-events-none opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}

