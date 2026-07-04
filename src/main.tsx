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
// Search-engine renderers (Google's Web Rendering Service, Bing, Yandex, ...) execute
// this script when indexing. A client-side location.replace() here reads to them as a
// page redirect and the prerendered content underneath never gets indexed. Crawlers
// don't need live API connectivity to see the marketing/auth pages, so skip failover
// entirely for known bot UAs.
const CRAWLER_UA = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|whatsapp|telegrambot/i;

async function tryFailover() {
  if (CRAWLER_UA.test(navigator.userAgent)) return;

  const mirrorsRaw = (import.meta.env.VITE_MIRRORS as string | undefined) ?? "";
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

  if (!mirrorsRaw || !apiUrl) return;

  // Loop guard: `_fo` marks a page we already failed over to. sessionStorage does
  // not survive the cross-origin redirect, so the marker rides in the URL. Strip
  // it on arrival (cosmetic) but remember it so a still-broken mirror can't bounce
  // us again — that ping-pong is exactly the "reloads every few seconds" symptom.
  const here = new URL(location.href);
  const cameFromFailover = here.searchParams.has("_fo");
  if (cameFromFailover) {
    here.searchParams.delete("_fo");
    window.history.replaceState(null, "", here.pathname + here.search + here.hash);
  }

  if (sessionStorage.getItem("_api_ok")) return;

  // Build candidate list: all mirrors except the one we're currently on
  const candidates = mirrorsRaw
    .split(",")
    .map(s => s.trim().replace(/\/$/, ""))
    .filter(s => s && s !== location.origin);

  if (candidates.length === 0) return;

  try {
    // Reachability probe, not a data call.
    //  - `no-cors`: an opaque response still resolves (no CORS headers needed).
    //  - `redirect: "manual"`: a 3xx resolves as an opaqueredirect INSTEAD of being
    //    followed. The edge 301s the bare base (/bot/miniapp/api -> .../api/) with an
    //    absolute Location carrying the backend's internal port (:8443), which the
    //    browser can't reach directly; following it would make the probe throw and be
    //    mis-read as "API down". A redirect is a response → the API is reachable.
    // Only a genuine network failure/timeout rejects here.
    await fetch(apiUrl, {
      method: "HEAD",
      mode: "no-cors",
      redirect: "manual",
      signal: AbortSignal.timeout(2500),
    });
    sessionStorage.setItem("_api_ok", "1");
  } catch {
    // Already bounced once — don't ping-pong between mirrors.
    if (cameFromFailover) return;
    // Genuine network failure: fail over to the next mirror, tagged so it won't bounce back.
    const dest = new URL(candidates[0] + location.pathname + location.search + location.hash);
    dest.searchParams.set("_fo", "1");
    location.replace(dest.toString());
  }
}

tryFailover();
