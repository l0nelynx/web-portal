import { useEffect } from "react";
import { BRAND_NAME } from "./branding";

export const HOME_TITLE = `${BRAND_NAME} — Private & Secure VPN`;

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Sync <title> and robots meta for the current route (SPA). */
export function usePageMeta(opts: {
  title: string;
  robots?: "index, follow" | "noindex, follow";
  description?: string;
}) {
  useEffect(() => {
    document.title = opts.title;
    setMeta("robots", opts.robots ?? "index, follow");
    if (opts.description) setMeta("description", opts.description);
  }, [opts.title, opts.robots, opts.description]);
}
