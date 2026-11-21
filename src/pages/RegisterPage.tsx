import { useForm } from "react-hook-form";
import { Turnstile } from "@marsidev/react-turnstile";
import { trackEvent } from "../analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, XCircle, Gift, Lock, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ApiError, auth, invite, ValidateInviteResponse } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { usePageMeta } from "../seo";
import {
  clearLegacySubscriptionContext,
  isSubscriptionPageReturnTo,
  legacySubscriptionContext,
  safeLocalReturnTo,
} from "../lib/return-to";

interface InviteStatus {
  checked: boolean;
  valid: boolean | null;
  data: ValidateInviteResponse | null;
  checking: boolean;
}

function buildSchema(L: ReturnType<typeof useLang>["L"]) {
  return z
    .object({
      invite_code: z.string(),
      email: z.string().min(1, L.val_email_req).email(L.val_email_format),
      password: z.string().min(1, L.val_pwd_req).min(8, L.val_pwd_min),
      confirm: z.string().min(1, L.val_confirm_req),
    })
    .refine((v) => v.password === v.confirm, {
      message: L.val_confirm_match,
      path: ["confirm"],
    });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function RegisterPage() {
  const { setUserAfterRegister } = useAuth();
  const { L, lang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToRaw = searchParams.get("return_to");
  const returnTo = safeLocalReturnTo(returnToRaw);
  const subscriptionFlow = isSubscriptionPageReturnTo(returnTo);
  const subscriptionContext = legacySubscriptionContext(returnTo);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ApiError["challenge"]>();
  const [captchaToken, setCaptchaToken] = useState("");
  const [widgetAttempt, setWidgetAttempt] = useState(0);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [widgetFailed, setWidgetFailed] = useState(false);
  usePageMeta({ title: `${L.reg_title} | ${BRAND_NAME}`, robots: "noindex, follow" });
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>({
    checked: false, valid: null, data: null, checking: false,
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schema = buildSchema(L);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onInviteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.trim().toUpperCase();
    if (!code) {
      setInviteStatus({ checked: false, valid: null, data: null, checking: false });
      return;
    }
    if (code.length < 4) return;
    setInviteStatus((s) => ({ ...s, checking: true }));
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const result = await invite.validate(code);
        setInviteStatus({ checked: true, valid: result.valid, data: result, checking: false });
      } catch (e) {
        if (e instanceof ApiError && (e.status === 429 || e.code === "rate_limited")) {
          setError(L.err_rate_limited);
        }
        setInviteStatus({ checked: true, valid: false, data: null, checking: false });
      }
    }, 600);
  }

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, []);

  async function onFinish(values: FormValues) {
    if (challenge && !captchaToken) return;
    const email = values.email.trim().toLowerCase();
    const trimmedInvite = values.invite_code.trim().toUpperCase();
    if (trimmedInvite && !inviteStatus.valid) {
      setError(L.err_req_invite);
      return;
    }
    setError(null);
    try {
      const resp = await auth.register(
        email,
        values.password,
        {
          ...(captchaToken && { captcha_token: captchaToken }),
          ...(subscriptionFlow && { subscription_flow: true }),
          ...(subscriptionFlow && subscriptionContext && { subscription_context: subscriptionContext }),
          ...(!subscriptionFlow && trimmedInvite && { invite_code: trimmedInvite }),
        }
      );
      clearLegacySubscriptionContext(returnTo);
      trackEvent("sign_up", { method: "email" });
      setUserAfterRegister(resp.user, resp.tokens);
      navigate(
        returnTo
          ? `/verify-email?return_to=${encodeURIComponent(returnTo)}`
          : "/verify-email",
        { replace: true },
      );
    } catch (e) {
      setCaptchaToken("");
      setWidgetAttempt((attempt) => attempt + 1);
      if (e instanceof ApiError) {
        if (e.challenge) {
          if (getValues("email").trim().toLowerCase() === email) setChallenge(e.challenge);
          return;
        }
        const map: Record<string, string> = {
          challenge_unavailable: L.err_challenge_unavailable,
          email_taken: L.err_email_taken,
          invalid_invite: L.err_invalid_invite,
          rate_limited: L.err_rate_limited,
          http_429: L.err_rate_limited,
        };
        setError(map[e.code] || L.err_reg);
      } else {
        setError(L.err_network);
      }
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
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
          <h3 className="mb-2 text-center text-2xl font-semibold text-foreground">{L.reg_title}</h3>
          <p className="mb-7 text-center text-sm text-muted-foreground">{L.reg_subtitle}</p>

          {error && (
            <Alert variant="destructive" className="mb-5 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {inviteStatus.valid && (inviteStatus.data?.credit_grant ?? 0) > 0 && (
            <Alert variant="success" className="mb-5 rounded-lg">
              <Gift className="h-4 w-4" />
              <AlertDescription className="flex flex-wrap items-center gap-2">
                <span>{L.discount_accepted}</span>
                <Badge variant="success">{L.credit_grant_text(inviteStatus.data!.credit_grant!)}</Badge>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onFinish)} className="flex flex-col gap-4">
            {subscriptionFlow ? (
              <Alert className="rounded-lg border-emerald-500/30 bg-emerald-500/5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <AlertDescription>{L.register_from_subscription_hint}</AlertDescription>
              </Alert>
            ) : (
              <div>
                <Label className="mb-1.5 block text-muted-foreground">{L.invite_label}</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={L.invite_placeholder}
                    maxLength={20}
                    className="h-12 rounded-xl pl-9 uppercase tracking-wider"
                    {...register("invite_code")}
                    onChange={(e) => {
                      register("invite_code").onChange(e);
                      onInviteChange(e);
                    }}
                  />
                </div>
                {errors.invite_code ? (
                  <p className="mt-1 text-xs text-destructive">{errors.invite_code.message}</p>
                ) : inviteStatus.checking ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Spinner className="h-3 w-3" /> {L.invite_checking}
                  </p>
                ) : inviteStatus.checked && !inviteStatus.valid ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> {L.invite_invalid}
                  </p>
                ) : inviteStatus.valid ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {L.invite_valid}
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <Label className="mb-1.5 block text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="h-12 rounded-xl pl-9"
                  {...register("email", { onChange: () => {
                    setChallenge(undefined);
                    setCaptchaToken("");
                    setWidgetFailed(false);
                    setError(null);
                  } })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block text-muted-foreground">{L.pwd_label}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={L.pwd_placeholder}
                  autoComplete="new-password"
                  className="h-12 rounded-xl pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block text-muted-foreground">{L.confirm_label}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={L.confirm_placeholder}
                  autoComplete="new-password"
                  className="h-12 rounded-xl pl-9"
                  {...register("confirm")}
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm.message}</p>}
            </div>

            {challenge && (
              <div className="space-y-2">
                <p role="status" className="text-sm text-muted-foreground">{L.reg_challenge}</p>
                <Turnstile
                  key={widgetAttempt}
                  siteKey={challenge.site_key}
                  options={{ action: "web_register", cData: challenge.cdata, language: lang, size: "compact" }}
                  onSuccess={(token) => { setCaptchaToken(token); setWidgetFailed(false); }}
                  onExpire={() => setCaptchaToken("")}
                  onError={() => { setCaptchaToken(""); setWidgetFailed(true); }}
                  onUnsupported={() => { setCaptchaToken(""); setWidgetFailed(true); }}
                  scriptOptions={{ onError: () => {
                    setScriptFailed(true);
                    setCaptchaToken("");
                    setWidgetFailed(true);
                  } }}
                />
                {(widgetFailed || scriptFailed) && (
                  <>
                    <p role="alert" className="text-sm text-destructive">{L.err_challenge_unavailable}</p>
                    <Button type="button" variant="outline" onClick={() => {
                      if (scriptFailed) {
                        window.location.reload();
                        return;
                      }
                      setWidgetFailed(false);
                      setWidgetAttempt((attempt) => attempt + 1);
                    }}>{L.btn_retry_app}</Button>
                  </>
                )}
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || (!!challenge && !captchaToken) || (!!inviteStatus.checked && inviteStatus.valid === false)}
              className="h-12 rounded-xl text-base font-semibold"
            >
              {L.btn_create}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-muted-foreground">
              {L.have_account}{" "}
              <Link
                to={returnTo ? `/login?return_to=${encodeURIComponent(returnTo)}` : "/login"}
                className="text-primary underline-offset-4 hover:underline"
              >{L.sign_in}</Link>
            </span>
          </div>
        </Card>
        <div className="mt-4 text-center">
          <Link to="/instruction" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {L.instruction_link}
          </Link>
        </div>
      </div>
    </div>
  );
}
