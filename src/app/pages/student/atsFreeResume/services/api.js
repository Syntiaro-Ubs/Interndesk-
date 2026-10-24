function tidyText(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

// These small, local helpers only clean up text. They do not invent resume facts
// or send student content to a third-party AI service.
export const api = {
  improveBullet: async (text) => ({ improved: tidyText(text) }),
  improveProject: async (text) => ({ improved: tidyText(text) }),
  improveSummary: async (text) => ({ improved: tidyText(text) }),
};
