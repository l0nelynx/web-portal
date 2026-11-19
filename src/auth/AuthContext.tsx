import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import {
  ApiError,
  auth,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  me,
  MeResponse,
  setTokens,
  TokenPair,
  UserSummary,
} from "../api/client";

interface AuthState {
  user: UserSummary | null;
  profile: MeResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUserAfterRegister: (user: UserSummary, tokens: TokenPair) => void;
}

const AuthContext = createContext<AuthState | null>(null);
const REFRESH_EARLY_SECONDS = 60;

function isAuthRejected(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

// Rotation is single-use. Another tab may finish renewing while we wait.
async function renewStoredSession(expectedRefresh: string) {
  async function rotate() {
    if (getRefreshToken() !== expectedRefresh) return;
    try {
      const pair = await auth.refresh(expectedRefresh);
      if (getRefreshToken() === expectedRefresh) {
        setTokens(pair.access_token, pair.refresh_token);
        return pair.expires_in;
      }
    } catch (error) {
      if (getRefreshToken() !== expectedRefresh) return;
      if (isAuthRejected(error)) clearTokens();
      throw error;
    }
  }
  return navigator.locks ? navigator.locks.request("web-auth-refresh", rotate) : rotate();
}

// The expiry only schedules renewal. The server authenticates the token via /me.
function secondsUntilExpiry(token: string) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof exp === "number" && Number.isFinite(exp)) return exp - Date.now() / 1000;
  } catch { /* Older sessions may lack a readable expiry. */ }
}

function summaryFromProfile(p: MeResponse): UserSummary {
  return {
    id: p.user.id,
    email: p.user.email,
    email_verified: p.user.email_verified,
    has_password: p.user.has_password,
    has_telegram: p.user.tg_id !== null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefreshIn = useCallback((seconds: number) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const ms = Math.max(seconds * 1000, 5_000);
    refreshTimer.current = setTimeout(async () => {
      const rt = getRefreshToken();
      if (!rt) return;
      try {
        const renewedFor = await renewStoredSession(rt);
        const token = getAccessToken();
        if (token) {
          const remaining = renewedFor ?? secondsUntilExpiry(token);
          if (remaining !== undefined) scheduleRefreshIn(remaining - REFRESH_EARLY_SECONDS);
        }
      } catch (error) {
        if (isAuthRejected(error)) {
          setUser(null);
          setProfile(null);
        } else if (getRefreshToken() === rt) {
          scheduleRefreshIn(30);
        }
      }
    }, ms);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await me.get();
      setProfile(data);
      setUser(summaryFromProfile(data));
    } catch {
      /* best effort */
    }
  }, []);

  // On mount: restore session from localStorage
  useEffect(() => {
    let current = true;
    async function restore() {
      try {
        const token = getAccessToken();
        const rt = getRefreshToken();
        if (!token && !rt) return;
        let data: MeResponse | undefined;
        let renewedFor: number | undefined;
        if (token) {
          try {
            data = await me.get();
          } catch (error) {
            if (!current || !isAuthRejected(error)) return;
            if (!rt) {
              if (getAccessToken() === token) clearTokens();
              return;
            }
          }
        }
        if (!data && rt) {
          renewedFor = await renewStoredSession(rt);
          if (!current || !getAccessToken()) return;
          data = await me.get();
        }
        const access = getAccessToken();
        if (!current || !data || !access) return;
        setProfile(data);
        setUser(summaryFromProfile(data));
        const remaining = renewedFor ?? secondsUntilExpiry(access);
        if (remaining !== undefined) scheduleRefreshIn(remaining - REFRESH_EARLY_SECONDS);
      } catch { /* Keep stored credentials on a temporary API failure. */ }
      finally { if (current) setLoading(false); }
    }
    void restore();
    return () => {
      current = false;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefreshIn]);

  const login = useCallback(
    async (emailAddr: string, passwordVal: string) => {
      const resp = await auth.login(emailAddr, passwordVal);
      trackEvent("login", { method: "email" });
      setTokens(resp.tokens.access_token, resp.tokens.refresh_token);
      scheduleRefreshIn(resp.tokens.expires_in - REFRESH_EARLY_SECONDS);
      setUser(resp.user);
      const data = await me.get();
      setProfile(data);
      setUser(summaryFromProfile(data));
    },
    [scheduleRefreshIn]
  );

  const logout = useCallback(async () => {
    const rt = getRefreshToken();
    if (rt) {
      try {
        await auth.logout(rt);
      } catch {
        /* best effort */
      }
    }
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    clearTokens();
    setUser(null);
    setProfile(null);
  }, []);

  const setUserAfterRegister = useCallback(
    (u: UserSummary, tokens: TokenPair) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      scheduleRefreshIn(tokens.expires_in - REFRESH_EARLY_SECONDS);
      setUser(u);
    },
    [scheduleRefreshIn]
  );

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, logout, refreshProfile, setUserAfterRegister }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
