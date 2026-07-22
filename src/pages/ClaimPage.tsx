import { useForm } from "react-hook-form";
import { CheckCircle2, Link2, Lock, Mail, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import BrandLogo from "../components/BrandLogo";
import TelegramLoginButton from "../components/TelegramLoginButton";
import { BRAND_NAME } from "../branding";
import {
  ApiError,
  appLogin,
  claim,
  ClaimResolveResponse,
} from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

type Step =
  | "url"
  | "checking"
  | "login"
  | "setup"
  | "register"
  | "done"
  | "foreign";

/** Subscription URL from `?url=` (Remnawave / catalog) or legacy `#url=`. */
function urlFromLocation(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get("url");
  if (fromQuery) {
    try {
      return decodeURIComponent(fromQuery);
    } catch {
      return fromQuery;
    }
  }
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const raw = params.get("url");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function stripClaimUrlFromLocation() {
  if (!window.location.search && !window.location.hash) return;
  window.history.replaceState(null, "", "/claim");
}

function shortUuidOf(url: string): string | null {
  try {
    const path = new URL(url.trim()).pathname.replace(/\/+$/, "");
    const slug = path.substring(path.lastIndexOf("/") + 1);
    return /^[A-Za-z0-9_-]{6,64}$/.test(slug) ? slug : null;
  } catch {
    return null;
  }
}

export default function ClaimPage() {
  const { user, profile, loading: authLoading, setUserAfterRegister } = useAuth();
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  usePageMeta({ title: `${L.claim_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  const [step, setStep] = useState<Step>("url");
  const [subUrl, setSubUrl] = useState("");
  const [resolved, setResolved] = useState<ClaimResolveResponse | null>(null);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appLinkPending, setAppLinkPending] = useState(false);
  const bootstrapped = useRef(false);

  const urlForm = useForm<{ url: string }>();
  const loginForm = useForm<{ password: string }>();
  const completeForm = useForm<{ code?: string; password: string; confirm: string; acc_email?: string }>();

  function mapError(e: unknown): string {
    if (e instanceof ApiError) {
      const map: Record<string, string> = {
        not_found: L.err_claim_not_found,
        invalid_url: L.err_claim_bad_url,
        bad_short_uuid: L.err_claim_bad_url,
        bad_claim_token: L.err_claim_expired,
        code_invalid: L.err_code_invalid,
        code_expired: L.err_code_expired,
        code_exhausted: L.err_code_expired,
        email_taken: L.err_email_taken,
        already_registered: L.err_invalid_login,
        invalid_credentials: L.err_invalid_login,
        banned: L.err_banned,
        rate_limited: L.err_rate_limited,
        http_429: L.err_rate_limited,
      };
      return map[e.code] || L.err_claim;
    }
    return L.err_network;
  }

  async function startClaim(url: string) {
    setError(null);
    if (!shortUuidOf(url)) {
      setError(L.err_claim_bad_url);
      setStep("url");
      return;
    }
    setStep("checking");
    try {
      const res = await claim.resolve(url.trim());
      setResolved(res);
      switch (res.status) {
        case "ready_login":
          setNeedsOtp(false);
          setStep("login");
          break;
        case "needs_password":
        case "rw_only":
        case "no_email": {
          const otp =
            res.status === "needs_password" || Boolean(res.email_hint);
          setNeedsOtp(otp);
          if (otp) {
            try {
              await claim.otpRequest(res.claim_token);
            } catch (e) {
              setError(mapError(e));
            }
          }
          setStep(res.status === "needs_password" ? "setup" : "register");
          break;
        }
        default:
          setNeedsOtp(false);
          setStep("register");
      }
    } catch (e) {
      setError(mapError(e));
      setStep("url");
    }
  }

  // Bootstrap: read query/fragment once auth state is known.
  useEffect(() => {
    if (authLoading || bootstrapped.current) return;
    bootstrapped.current = true;
    const fromLoc = urlFromLocation();
    if (fromLoc) {
      setSubUrl(fromLoc);
      urlForm.setValue("url", fromLoc);
      stripClaimUrlFromLocation();
    }
    if (user) {
      // Already signed in: same subscription → done, foreign → transfer notice.
      const own = profile?.subscription?.subscription_url ?? null;
      if (!fromLoc || (own && shortUuidOf(own) === shortUuidOf(fromLoc))) {
        setStep("done");
      } else {
        setStep("foreign");
      }
      return;
    }
    if (fromLoc) void startClaim(fromLoc);
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onLogin(values: { password: string }) {
    if (!resolved) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await claim.login(resolved.claim_token, values.password);
      setUserAfterRegister(resp.user, resp.tokens);
      if (!resp.user.email_verified) {
        navigate("/verify-email", { replace: true });
        return;
      }
      setStep("done");
    } catch (e) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onComplete(values: {
    code?: string;
    password: string;
    confirm: string;
    acc_email?: string;
  }) {
    if (!resolved) return;
    if (values.password !== values.confirm) {
      setError(L.val_confirm_match);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await claim.complete(resolved.claim_token, values.password, {
        code: needsOtp ? values.code?.trim() : undefined,
        acc_email: values.acc_email?.trim().toLowerCase(),
      });
      setUserAfterRegister(resp.user, resp.tokens);
      if (!resp.user.email_verified) {
        navigate("/verify-email", { replace: true });
        return;
      }
      setStep("done");
    } catch (e) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }

  async function openInApp() {
    setAppLinkPending(true);
    setError(null);
    try {
      const { token } = await appLogin.create();
      window.location.href = `cheezy://login/${token}`;
    } catch {
      setError(L.err_app_login);
    } finally {
      setAppLinkPending(false);
    }
  }

  function importOnly() {
    const url = resolved?.subscription_url || subUrl;
    if (url) window.location.href = `cheezy://add/${encodeURIComponent(url)}`;
  }

  const hint = resolved?.email_hint ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Button
        size="sm"
        variant="outline"
        className="fixed right-4 top-4 z-10 min-w-[34px] rounded-md border-border bg-secondary text-xs text-muted-foreground"
        onClick={toggle}
      >
        {L.lang_toggle}
      </Button>

      <div className="relative w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link to="/" className="no-underline">
            <div className="inline-flex items-center gap-2.5">
              <BrandLogo size={38} />
              <span className="text-xl font-bold text-foreground">{BRAND_NAME}</span>
            </div>
          </Link>
        </div>

        <Card className="p-9">
          <h3 className="mb-2 text-center text-2xl font-semibold text-foreground">
            {step === "done" ? L.claim_done_title : step === "foreign" ? L.claim_foreign_title : L.claim_title}
          </h3>
          {step !== "done" && step !== "foreign" && (
            <span className="mb-7 block text-center text-muted-foreground">{L.claim_subtitle}</span>
          )}

          {error && (
            <Alert variant="destructive" className="mb-5 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "url" && (
            <form
              onSubmit={urlForm.handleSubmit((v) => {
                setSubUrl(v.url.trim());
                void startClaim(v.url.trim());
              })}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="mb-1.5 block text-sm text-muted-foreground">{L.claim_url_label}</label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={L.claim_url_placeholder}
                    className="h-12 rounded-xl pl-9"
                    {...urlForm.register("url", { required: true })}
                  />
                </div>
              </div>
              <Button type="submit" className="h-12 rounded-xl text-base font-semibold">
                {L.btn_claim_check}
              </Button>
            </form>
          )}

          {step === "checking" && (
            <div className="py-8 text-center">
              <Spinner className="mx-auto h-8 w-8" />
              <div className="mt-4">
                <span className="text-muted-foreground">{L.claim_checking}</span>
              </div>
            </div>
          )}

          {step === "login" && resolved && (
            <>
              <Alert variant="info" className="mb-5 rounded-lg">
                <AlertDescription>{L.claim_login_hint(hint)}</AlertDescription>
              </Alert>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={L.pwd_label}
                    autoComplete="current-password"
                    className="h-12 rounded-xl pl-9"
                    {...loginForm.register("password", { required: true })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 rounded-xl text-base font-semibold">
                  {L.btn_login}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/forgot-password" className="text-[13px] text-primary underline-offset-4 hover:underline">
                  {L.forgot_link}
                </Link>
              </div>
              {resolved.email_verified === false && (
                <div className="mt-3 text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-[13px] text-muted-foreground"
                    onClick={() => {
                      setNeedsOtp(false);
                      setError(null);
                      setStep("register");
                    }}
                  >
                    {L.claim_use_other_email}
                  </Button>
                </div>
              )}
              {resolved.has_telegram && (
                <div className="mt-4">
                  <TelegramLoginButton
                    label={L.btn_tg_login}
                    onSuccess={(resp) => {
                      setUserAfterRegister(resp.user, resp.tokens);
                      setStep("done");
                    }}
                    onError={() => setError(L.err_tg_login)}
                  />
                </div>
              )}
            </>
          )}

          {(step === "setup" || step === "register") && resolved && (
            <>
              <Alert variant="info" className="mb-5 rounded-lg">
                <AlertDescription>
                  {step === "setup"
                    ? L.claim_setup_hint(hint)
                    : needsOtp
                      ? L.claim_register_hint(hint)
                      : L.claim_register_bind_hint}
                </AlertDescription>
              </Alert>
              <form onSubmit={completeForm.handleSubmit(onComplete)} className="flex flex-col gap-4">
                {needsOtp && (
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={L.verify_code_label}
                      maxLength={6}
                      className="h-12 rounded-xl pl-9"
                      {...completeForm.register("code", { required: true, minLength: 6, maxLength: 6 })}
                    />
                  </div>
                )}
                {step === "register" && (
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={L.claim_acc_email_label}
                      autoComplete="email"
                      className="h-12 rounded-xl pl-9"
                      {...completeForm.register("acc_email", { required: true })}
                    />
                  </div>
                )}
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={L.new_pwd_label}
                    autoComplete="new-password"
                    className="h-12 rounded-xl pl-9"
                    {...completeForm.register("password", { required: true, minLength: 8 })}
                  />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={L.confirm_placeholder}
                    autoComplete="new-password"
                    className="h-12 rounded-xl pl-9"
                    {...completeForm.register("confirm", { required: true })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 rounded-xl text-base font-semibold">
                  {L.btn_confirm}
                </Button>
              </form>
              {needsOtp && (
                <div className="mt-4 text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-[13px] text-primary"
                    onClick={async () => {
                      try {
                        await claim.otpRequest(resolved.claim_token);
                        setError(null);
                      } catch (e) {
                        setError(mapError(e));
                      }
                    }}
                  >
                    {L.btn_resend}
                  </Button>
                </div>
              )}
            </>
          )}

          {(step === "done" || step === "foreign") && (
            <>
              {step === "done" ? (
                <div className="mb-6 text-center">
                  <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-500" />
                  <div className="mt-3">
                    <span className="text-muted-foreground">{L.claim_done_text}</span>
                  </div>
                </div>
              ) : (
                <Alert variant="warning" className="mb-5 rounded-lg">
                  <AlertDescription>{L.claim_foreign_text}</AlertDescription>
                </Alert>
              )}
              {step === "done" && (
                <>
                  <Button
                    disabled={appLinkPending}
                    onClick={openInApp}
                    className="h-12 w-full rounded-xl text-base font-semibold"
                  >
                    {L.btn_open_in_app}
                  </Button>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-muted-foreground">{L.claim_open_app_hint}</span>
                  </div>
                </>
              )}
              {(resolved?.subscription_url || subUrl) && (
                <Button
                  variant="outline"
                  className="mt-3 h-11 w-full rounded-xl"
                  onClick={importOnly}
                >
                  {L.btn_import_only}
                </Button>
              )}
              <div className="mt-5 text-center">
                <Link to="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
                  {L.btn_go_dashboard}
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
