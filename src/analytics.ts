import type { WebMenuInvoice } from "./api/client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const measurementId = import.meta.env.VITE_GA_ID?.trim() ?? "";
const enabled = /^G-[A-Z0-9]+$/.test(measurementId);
const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "gclid", "dclid", "gbraid", "wbraid"];
let initialized = false;
let lastPage = "";
let previousLocation = "";

// Only public routes and marketing parameters may leave the browser.
export function safeLocation(href: string): string {
  const url = new URL(href, window.location.origin);
  const query = new URLSearchParams();
  for (const key of campaignKeys) {
    const value = url.searchParams.get(key);
    if (value && value.length <= 200 && /^[\p{L}\p{N}_ .~+-]+$/u.test(value)) query.set(key, value);
  }
  const known = /^\/(?:login|register|claim|instruction|forgot-password|verify-email|auth\/callback|oauth\/authorize|policy|agreement|offer|dashboard(?:\/(?:subscription|buy|devices|support|settings))?)?\/?$/;
  const path = known.test(url.pathname) ? url.pathname : "/other";
  return `${url.origin}${path}${query.size ? `?${query}` : ""}`;
}

export function initAnalytics() {
  if (!enabled || initialized) return;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  const referrer = (() => { try { return document.referrer ? new URL(document.referrer).origin : ""; } catch { return ""; } })();
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    page_location: safeLocation(window.location.href),
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  previousLocation = referrer;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function pageView(path: string, title?: string) {
  if (!enabled) return;
  const location = safeLocation(`${window.location.origin}${path}${window.location.search}`);
  if (location === lastPage) return;
  trackEvent("page_view", { page_location: location, page_referrer: previousLocation, page_title: title || path });
  previousLocation = location;
  lastPage = location;
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!enabled) return;
  try {
    window.gtag?.("event", name, { page_location: safeLocation(window.location.href), ...params });
  } catch { /* Analytics must never break login or payment. */ }
}

export function paymentParams(invoice: WebMenuInvoice, renewal: boolean) {
  return {
    currency: invoice.currency,
    value: invoice.amount,
    payment_provider: invoice.provider,
    payment_type: invoice.method || invoice.provider,
    purchase_kind: renewal ? "renewal" : "new",
    items: [{ item_id: `${invoice.tariff_slug}:${invoice.days}`, item_name: invoice.tariff_slug,
      item_variant: String(invoice.days), price: invoice.amount, quantity: 1 }],
  };
}

export interface AnalyticsContext {
  client_id: string;
  session_id: string;
}

export async function getAnalyticsContext(): Promise<AnalyticsContext | undefined> {
  if (!enabled || !window.gtag) return undefined;
  // gtag callbacks never arrive when blocked; checkout must still continue.
  const get = (field: string) => new Promise<string | undefined>((resolve) => {
    const timer = setTimeout(() => resolve(undefined), 300);
    try {
      window.gtag!("get", measurementId, field, (value: unknown) => {
        clearTimeout(timer);
        resolve(typeof value === "string" || typeof value === "number" ? String(value) : undefined);
      });
    } catch { clearTimeout(timer); resolve(undefined); }
  });
  const [client_id, session_id] = await Promise.all([get("client_id"), get("session_id")]);
  return client_id && /^\d+\.\d+$/.test(client_id) && session_id && /^\d+$/.test(session_id)
    ? { client_id, session_id } : undefined;
}
