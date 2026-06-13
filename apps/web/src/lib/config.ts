export const API_URL =
  process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";
export const XERO_CONNECT_URL = `${API_URL}/auth/xero/connect`;

// Public dashboard (separate Vercel app) — where users sign up / log in.
export const DASHBOARD_URL = "https://adconfirm-dashboard.vercel.app";
export const SIGNUP_URL = `${DASHBOARD_URL}/signup`;
export const LOGIN_URL = `${DASHBOARD_URL}/login`;
