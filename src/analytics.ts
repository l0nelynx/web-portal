declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function pageView(path: string, title?: string) {
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: title,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.("event", name, params);
}
