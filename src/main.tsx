import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import WebApp from "./App";
import "./theme.css";

// GitHub Pages SPA redirect: 404.html encodes the real path as /?p=/some/path
const ghRedirect = new URLSearchParams(window.location.search).get("p");
if (ghRedirect) {
  window.history.replaceState(null, "", ghRedirect);
}


// Render immediately — failover check runs in background
ReactDOM.createRoot(document.getElementById("web-root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider>
        <WebApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

/**
 * Mirror failover: if API is unreachable, redirect to the next mirror.
 *
 * VITE_MIRRORS — comma-separated list of ALL mirror origins, e.g.:
 *   https://web.domain.com,https://repo.vercel.app,https://user.github.io
 *
 * Current origin is excluded automatically so mirrors don't redirect to themselves.
 * Result is cached in sessionStorage — check runs once per tab session.
 */
async function tryFailover() {
  const mirrorsRaw = (import.meta.env.VITE_MIRRORS as string | undefined) ?? "";
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

  if (!mirrorsRaw || !apiUrl) return;
  if (sessionStorage.getItem("_api_ok")) return;

  // Build candidate list: all mirrors except the one we're currently on
  const candidates = mirrorsRaw
    .split(",")
    .map(s => s.trim().replace(/\/$/, ""))
    .filter(s => s && s !== location.origin);

  if (candidates.length === 0) return;

  try {
    await fetch(apiUrl, { method: "HEAD", signal: AbortSignal.timeout(2500) });
    // Any HTTP response means network is reachable (401, 404 etc. are fine)
    sessionStorage.setItem("_api_ok", "1");
  } catch {
    // Network failure — API unreachable, go to next mirror
    location.replace(candidates[0] + location.pathname + location.search + location.hash);
  }
}

tryFailover();
