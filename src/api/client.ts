/**
 * JWT-based API client for the web portal.
 * All auth/data endpoints are the existing /api/android/* routes.
 * Web-specific endpoints are at /api/web/*.
 *
 * VITE_API_URL — full API base, e.g. https://api.domain.com/bot/miniapp/api
 * When unset (local dev) falls back to relative path, proxied by vite dev server.
 */

// Strip any trailing slash so `${API_BASE}${path}` (path starts with "/") never
// produces a double slash — a VITE_API_URL set as ".../bot/miniapp/api/" would
// otherwise hit ".../api//android/..." and 404.
const API_BASE: string = (import.meta.env.VITE_API_URL ?? "/bot/miniapp/api").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message?: string) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem("web_access_token");
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem("web_access_token", access);
  localStorage.setItem("web_refresh_token", refresh);
}

export function clearTokens(): void {
  localStorage.removeItem("web_access_token");
  localStorage.removeItem("web_refresh_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("web_refresh_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (requireAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // A real API call reached the backend on this origin → mark it healthy so the
  // mirror failover in main.tsx never bounces away from a working mirror.
  try { sessionStorage.setItem("_api_ok", "1"); } catch { /* ignore */ }

  if (!res.ok) {
    let code = `http_${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail?.code) code = data.detail.code;
      else if (typeof data?.detail === "string") code = data.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const get = <T>(path: string, auth = true) => request<T>("GET", path, undefined, auth);
const post = <T>(path: string, body?: unknown, auth = true) => request<T>("POST", path, body, auth);
const del = <T>(path: string) => request<T>("DELETE", path);

async function postForm<T>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: form,
  });

  try { sessionStorage.setItem("_api_ok", "1"); } catch { /* ignore */ }

  if (!res.ok) {
    let code = `http_${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail?.code) code = data.detail.code;
      else if (typeof data?.detail === "string") code = data.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Fetches an attachment as a blob with the same Bearer-token auth — a plain
 * <img src> can't carry Authorization headers, so callers build an object URL
 * from this instead (see useAuthedImage). */
export async function fetchAuthedBlob(url: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { headers });
  if (!res.ok) throw new ApiError(res.status, `http_${res.status}`);
  return res.blob();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface UserSummary {
  id: number;
  email: string | null;
  email_verified: boolean;
  has_password: boolean;
  has_telegram: boolean;
}

export interface AuthResponse {
  tokens: TokenPair;
  user: UserSummary;
}

export const auth = {
  login: (email: string, password: string) =>
    post<AuthResponse>("/android/auth/login", { email, password }, false),

  register: (email: string, password: string, invite_code: string) =>
    post<AuthResponse>("/web/register", { email, password, invite_code }, false),

  refresh: (refresh_token: string) =>
    post<TokenPair>("/android/auth/refresh", { refresh_token }, false),

  logout: (refresh_token: string) =>
    post<{ status: string }>("/android/auth/logout", { refresh_token }),

  telegramInit: (redirect_uri: string) =>
    get<{ auth_url: string }>(
      `/web/auth/telegram/init?redirect_uri=${encodeURIComponent(redirect_uri)}`,
      false
    ),

  telegramExchange: (code: string, state: string) =>
    post<AuthResponse>("/web/auth/telegram/exchange", { code, state }, false),
};

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export const email = {
  sendCode: () => post<{ status: string }>("/android/auth/email/send-code"),
  verify: (code: string) =>
    post<{ status: string }>("/android/auth/email/verify", { code }),
};

// ---------------------------------------------------------------------------
// User data
// ---------------------------------------------------------------------------

export interface AndroidUserSummary {
  id: number;
  email: string | null;
  email_verified: boolean;
  tg_id: number | null;
  language: string | null;
  has_password: boolean;
}

export interface SubscriptionInfo {
  tariff: string;
  status: string | null;
  days_left: number;
  expire_iso: string | null;
  data_limit_gb: number | null;
  traffic_used_gb: number;
  devices_count: number;
  subscription_url: string | null;
  source: string;
}

export interface MeResponse {
  user: AndroidUserSummary;
  subscription: SubscriptionInfo | null;
  links: {
    bot_url: string;
    policy_url: string;
    agreement_url: string;
    news_url: string;
    branding_name: string;
    support_bot_link: string;
  };
}

export const me = {
  get: () => get<MeResponse>("/android/me"),
};

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

export interface DeviceItem {
  hwid: string;
  platform: string | null;
  os_version: string | null;
  device_model: string | null;
  user_agent: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DevicesResponse {
  total: number;
  devices: DeviceItem[];
}

export const devices = {
  list: () => get<DevicesResponse>("/android/devices"),
  remove: (hwid: string) => del<{ status: string }>(`/android/devices/${hwid}`),
};

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export interface SessionInfo {
  id: number;
  issued_at: string;
  expires_at: string;
  user_agent: string | null;
  ip: string | null;
  current: boolean | null;
}

export interface SessionsResponse {
  total: number;
  sessions: SessionInfo[];
}

export const sessions = {
  list: () => get<SessionsResponse>("/android/sessions"),
  revoke: (id: number) => del<{ status: string }>(`/android/sessions/${id}`),
  revokeAll: () => post<{ status: string }>("/android/sessions/revoke-all"),
};

// ---------------------------------------------------------------------------
// Payments (web-specific, discount-aware)
// ---------------------------------------------------------------------------

export interface WebMenuInvoice {
  provider: string;
  amount: number;
  original_amount: number;
  currency: string;
  method: string | null;
  days: number;
  tariff_slug: string;
  points_cost: number;
}

export interface WebMenuNode {
  id: number;
  parent_id: number | null;
  text: string;
  action: string | null;
  invoice: WebMenuInvoice | null;
  children: WebMenuNode[];
}

export interface WebMenuResponse {
  tree: WebMenuNode[];
  balance: number;
}

export interface WebInvoiceResponse {
  provider: string;
  invoice_id: string;
  url: string;
  amount: number;
  original_amount: number;
  currency: string;
  transaction_id: string;
  payment_method: string;
}

export interface WebPayCreditsResponse {
  ok: boolean;
  transaction_id?: string;
  points_spent?: number;
  points_cost?: number;
  credits_spent?: number;
  balance_after?: number;
  subscription_url?: string | null;
  message?: string | null;
}

export const webPayments = {
  getMenu: () => get<WebMenuResponse>("/web/payments/menu"),
  createInvoice: (node_id: number, description?: string) =>
    post<WebInvoiceResponse>("/web/payments/invoice", { node_id, description }),
  payWithCredits: (node_id: number) =>
    post<WebPayCreditsResponse>("/web/payments/pay-credits", { node_id }),
};

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export interface TransactionInfo {
  transaction_id: string;
  status: string;
  delivery_status: number;
  payment_method: string | null;
  amount: number | null;
  days_ordered: number;
  created_at: string | null;
}

export interface TransactionsResponse {
  transactions: TransactionInfo[];
}

export const transactions = {
  list: () => get<TransactionsResponse>("/android/payments/transactions"),
};

// ---------------------------------------------------------------------------
// Invite validation (unauthenticated)
// ---------------------------------------------------------------------------

export interface ValidateInviteResponse {
  valid: boolean;
  credit_grant: number | null;
  promo_type: string | null;
}

export const invite = {
  validate: (invite_code: string) =>
    post<ValidateInviteResponse>("/web/validate-invite", { invite_code }, false),
};

// ---------------------------------------------------------------------------
// Partnership inquiry (unauthenticated)
// ---------------------------------------------------------------------------

export interface PartnershipInquiry {
  goal: string;
  description: string;
  contact: string;
}

export const partnership = {
  submit: (body: PartnershipInquiry) =>
    post<{ ok: boolean }>("/web/partnership-inquiry", body, false),
};

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

export const password = {
  change: (current_password: string, new_password: string) =>
    post<{ status: string }>("/android/auth/password/change", {
      current_password,
      new_password,
    }),
  resetRequest: (emailAddr: string) =>
    post<{ status: string }>(
      "/android/auth/password/reset-request",
      { email: emailAddr },
      false
    ),
  resetConfirm: (emailAddr: string, code: string, new_password: string) =>
    post<{ status: string }>(
      "/android/auth/password/reset-confirm",
      { email: emailAddr, code, new_password },
      false
    ),
};

// ---------------------------------------------------------------------------
// Subscription claim (shortID-first onboarding, unauthenticated)
// ---------------------------------------------------------------------------

export type ClaimStatus = "ready_login" | "needs_password" | "rw_only" | "no_email";

export interface ClaimResolveResponse {
  status: ClaimStatus;
  email_hint: string | null;
  has_telegram: boolean;
  claim_token: string;
  subscription_url: string | null;
}

export const claim = {
  resolve: (url: string) =>
    post<ClaimResolveResponse>("/android/claim/resolve", { url }, false),
  otpRequest: (claim_token: string) =>
    post<{ status: string }>("/android/claim/otp-request", { claim_token }, false),
  complete: (
    claim_token: string,
    code: string,
    new_password: string,
    acc_email?: string
  ) =>
    post<AuthResponse>(
      "/android/claim/complete",
      { claim_token, code, new_password, ...(acc_email ? { acc_email } : {}) },
      false
    ),
};

// ---------------------------------------------------------------------------
// One-time app login (web → installed app handoff via cheezy://login/<token>)
// ---------------------------------------------------------------------------

export interface AppLoginToken {
  token: string;
  expires_in: number;
}

export const appLogin = {
  create: () => post<AppLoginToken>("/android/auth/app-login/create"),
};

// ---------------------------------------------------------------------------
// Credential setup for users without email/password (Telegram-only accounts)
// ---------------------------------------------------------------------------

export const setup = {
  // Case A: no email — set email + password (2-step: request code → confirm)
  emailRequest: (emailAddr: string, new_password: string) =>
    post<{ status: string }>("/web/auth/setup/email-request", {
      email: emailAddr,
      new_password,
    }),
  emailConfirm: (code: string) =>
    post<{ status: string }>("/web/auth/setup/email-confirm", { code }),

  // Case B: has email but no password (2-step: request code → confirm with new pwd)
  passwordRequest: () =>
    post<{ status: string }>("/web/auth/setup/password-request", {}),
  passwordConfirm: (new_password: string, code: string) =>
    post<{ status: string }>("/web/auth/setup/password-confirm", {
      new_password,
      code,
    }),
};

// ---------------------------------------------------------------------------
// Promo codes
// ---------------------------------------------------------------------------

export interface PromoState {
  balance: number;
  last_promo_code: string | null;
  default_credit_grant: number;
}

export interface PromoActivateResponse {
  ok: boolean;
  promo_code: string;
  credit_grant: number;
  balance: number;
}

export const promo = {
  getState: () => get<PromoState>("/android/promo"),
  activate: (promo_code: string) =>
    post<PromoActivateResponse>("/android/promo", { promo_code }),
};

// ---------------------------------------------------------------------------
// Support tickets
// ---------------------------------------------------------------------------

export interface TicketSummary {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_preview: string;
}

export interface AttachmentOut {
  id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  url: string;
}

export interface MessageItem {
  id: number;
  sender: string;
  text: string;
  created_at: string;
  attachments: AttachmentOut[];
}

export interface TicketDetail {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: MessageItem[];
}

export const support = {
  listTickets: () => get<TicketSummary[]>("/android/support/tickets"),
  getTicket: (id: number) => get<TicketDetail>(`/android/support/tickets/${id}`),
  createTicket: (subject: string, message: string) =>
    post<TicketDetail>("/android/support/tickets", { subject, message }),
  addMessage: (ticket_id: number, text: string, images: File[] = []) => {
    const form = new FormData();
    form.append("text", text);
    for (const img of images) form.append("images", img);
    return postForm<MessageItem>(`/android/support/tickets/${ticket_id}/messages`, form);
  },
};

// ---------------------------------------------------------------------------
// Telegram link
// ---------------------------------------------------------------------------

export interface LinkStartResponse {
  code: string;
  expires_in: number;
  deep_link: string;
}

export const tgLink = {
  start: () => post<LinkStartResponse>("/android/link/start"),
  unlink: () => del<void>("/android/link/telegram"),
};
