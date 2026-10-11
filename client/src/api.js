// ── Central API configuration ──────────────────────────────────────────────
// All backend URLs come from here. Never hardcode localhost anywhere else.
// In production, set these in your hosting platform's environment variables.

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const ML_BASE  = import.meta.env.VITE_ML_URL  || "http://127.0.0.1:8000";
