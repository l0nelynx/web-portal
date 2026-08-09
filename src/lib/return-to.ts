export function safeLocalReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function isSubscriptionPageReturnTo(value: string | null): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value, window.location.origin);
    return (
      parsed.origin === window.location.origin &&
      parsed.pathname === "/oauth/authorize" &&
      parsed.searchParams.get("client_id") === "subscription-page"
    );
  } catch {
    return false;
  }
}

export function legacySubscriptionContext(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value, window.location.origin);
    const direct = parsed.searchParams.get("subscription_context")
      ?? new URLSearchParams(parsed.hash.replace(/^#/, "")).get("subscription_context");
    if (direct) return direct;
    const state = parsed.searchParams.get("state");
    return state ? sessionStorage.getItem(`subscription_context:${state}`) : null;
  } catch {
    return null;
  }
}

export function clearLegacySubscriptionContext(value: string | null): void {
  if (!value) return;
  try {
    const state = new URL(value, window.location.origin).searchParams.get("state");
    if (state) sessionStorage.removeItem(`subscription_context:${state}`);
  } catch {
    // Invalid return_to is already rejected by safeLocalReturnTo.
  }
}
