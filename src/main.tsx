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
    // Reachability probe, not a data call: use no-cors so an opaque response
    // still resolves. This keeps cross-origin CORS quirks and trailing-slash
    // 301s (the edge nginx 301s the bare /bot/miniapp/api -> /bot/miniapp/api/
    // WITHOUT CORS headers) from being mis-read as "API down" and triggering a
    // mirror redirect loop. Only a real network failure/timeout rejects here.
    await fetch(apiUrl, { method: "HEAD", mode: "no-cors", signal: AbortSignal.timeout(2500) });
    sessionStorage.setItem("_api_ok", "1");
  } catch {
    // Network failure — API unreachable, go to next mirror
    location.replace(candidates[0] + location.pathname + location.search + location.hash);
  }
}

tryFailover();
