import {
  CheckCircle2,
  Gift,
  Link2,
  Lock,
  LogOut,
  Mail,
  Send,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiError, email, password, promo, PromoState, sessions, setup, tgLink } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useLang } from "../../locale";

/** Case A: no email, no password — set both via 2-step email verification */
function SetupEmailCard({ onSuccess }: { onSuccess: () => void }) {
  const { L } = useLang();
  const [step, setStep] = useState<0 | 1>(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSchema = z.object({
    email: z.string().min(1, L.val_email_req).email(L.val_email_format),
    password: z.string().min(1, L.val_pwd_req).min(8, L.val_pwd_min),
    confirm: z.string().min(1, L.val_confirm_req),
  }).refine((d) => d.password === d.confirm, { message: L.val_confirm_match, path: ["confirm"] });
  const confirmSchema = z.object({
    code: z.string().length(6, L.val_code_len),
  });

  const requestForm = useForm<z.infer<typeof requestSchema>>({ resolver: zodResolver(requestSchema) });
  const confirmForm = useForm<z.infer<typeof confirmSchema>>({ resolver: zodResolver(confirmSchema) });

  async function onRequest(values: z.infer<typeof requestSchema>) {
    setLoading(true); setError(null);
    try {
      await setup.emailRequest(values.email, values.password);
      setPendingEmail(values.email.trim().toLowerCase());
      setStep(1);
      confirmForm.reset();
    } catch (e) {
      const map: Record<string, string> = {
        email_taken: L.err_email_taken,
        email_already_set: L.err_email_already_set,
        email_send_failed: L.err_send_code,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_email) : L.err_setup_email);
    } finally { setLoading(false); }
  }

  async function onConfirm(values: z.infer<typeof confirmSchema>) {
    setLoading(true); setError(null);
    try {
      await setup.emailConfirm(values.code);
      toast.success(L.setup_success_email);
      onSuccess();
    } catch (e) {
      const map: Record<string, string> = {
        code_invalid: L.err_code_invalid,
        code_expired: L.err_code_expired,
        code_exhausted: L.err_rate_limited,
        email_taken: L.err_email_taken,
        http_429: L.err_rate_limited,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_email) : L.err_setup_email);
    } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lock size={16} />{L.card_setup_email}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-5 flex gap-2 text-xs">
          <span className={step === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}>1. {L.btn_setup_send_code}</span>
          <span className="text-muted-foreground">→</span>
          <span className={step === 1 ? "font-semibold text-foreground" : "text-muted-foreground"}>2. {L.btn_setup_confirm}</span>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4 rounded-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {step === 0 ? (
          <form onSubmit={requestForm.handleSubmit(onRequest)} className="flex flex-col gap-4">
            <span className="text-[13px] text-muted-foreground">{L.setup_email_hint}</span>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.setup_email_label}</Label>
              <Input autoComplete="email" {...requestForm.register("email")} />
              {requestForm.formState.errors.email && (
                <span className="text-xs text-destructive">{requestForm.formState.errors.email.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.setup_pwd_new_label}</Label>
              <Input type="password" autoComplete="new-password" {...requestForm.register("password")} />
              {requestForm.formState.errors.password && (
                <span className="text-xs text-destructive">{requestForm.formState.errors.password.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.setup_pwd_confirm_label}</Label>
              <Input type="password" autoComplete="new-password" {...requestForm.register("confirm")} />
              {requestForm.formState.errors.confirm && (
                <span className="text-xs text-destructive">{requestForm.formState.errors.confirm.message}</span>
              )}
            </div>
            <Button type="submit" disabled={loading} className="rounded-lg">
              {loading && <Spinner className="h-4 w-4" />}
              {L.btn_setup_send_code}
            </Button>
          </form>
        ) : (
          <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="flex flex-col gap-4">
            <Alert variant="info" className="rounded-lg">
              <AlertDescription>{L.setup_code_sent_hint(pendingEmail)}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.setup_code_label}</Label>
              <Input maxLength={6} autoComplete="one-time-code" {...confirmForm.register("code")} />
              {confirmForm.formState.errors.code && (
                <span className="text-xs text-destructive">{confirmForm.formState.errors.code.message}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="rounded-lg">
                {loading && <Spinner className="h-4 w-4" />}
                {L.btn_setup_confirm}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setStep(0); setError(null); }} className="rounded-lg">
                {L.btn_back}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/** Case B: has email but no password — set password via email code */
function SetupPasswordCard({ email: userEmail, onSuccess }: { email: string; onSuccess: () => void }) {
  const { L } = useLang();
  const [step, setStep] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmSchema = z.object({
    code: z.string().length(6, L.val_code_len),
    new_password: z.string().min(1, L.val_pwd_new_req).min(8, L.val_pwd_new_min),
    confirm: z.string().min(1, L.val_pwd_confirm_req),
  }).refine((d) => d.new_password === d.confirm, { message: L.val_pwd_confirm_match, path: ["confirm"] });

  const confirmForm = useForm<z.infer<typeof confirmSchema>>({ resolver: zodResolver(confirmSchema) });

  async function onRequest() {
    setLoading(true); setError(null);
    try {
      await setup.passwordRequest();
      setStep(1);
      confirmForm.reset();
    } catch (e) {
      const map: Record<string, string> = {
        password_already_set: L.err_password_already_set,
        email_send_failed: L.err_send_code,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_password) : L.err_setup_password);
    } finally { setLoading(false); }
  }

  async function onConfirm(values: z.infer<typeof confirmSchema>) {
    setLoading(true); setError(null);
    try {
      await setup.passwordConfirm(values.new_password, values.code);
      toast.success(L.setup_success_password);
      onSuccess();
    } catch (e) {
      const map: Record<string, string> = {
        code_invalid: L.err_code_invalid,
        code_expired: L.err_code_expired,
        code_exhausted: L.err_rate_limited,
        http_429: L.err_rate_limited,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_password) : L.err_setup_password);
    } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lock size={16} />{L.card_setup_password}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4 rounded-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {step === 0 ? (
          <div className="flex flex-col gap-3">
            <span className="text-[13px] text-muted-foreground">{L.setup_password_hint(userEmail)}</span>
            <Button disabled={loading} onClick={onRequest} className="w-fit rounded-lg">
              {loading && <Spinner className="h-4 w-4" />}
              {L.btn_setup_pwd_send_code}
            </Button>
          </div>
        ) : (
          <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="flex flex-col gap-4">
            <Alert variant="info" className="rounded-lg">
              <AlertDescription>{L.setup_pwd_code_sent_hint}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.setup_code_label}</Label>
              <Input maxLength={6} autoComplete="one-time-code" {...confirmForm.register("code")} />
              {confirmForm.formState.errors.code && (
                <span className="text-xs text-destructive">{confirmForm.formState.errors.code.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.pwd_new}</Label>
              <Input type="password" autoComplete="new-password" {...confirmForm.register("new_password")} />
              {confirmForm.formState.errors.new_password && (
                <span className="text-xs text-destructive">{confirmForm.formState.errors.new_password.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">{L.pwd_confirm_field}</Label>
              <Input type="password" autoComplete="new-password" {...confirmForm.register("confirm")} />
              {confirmForm.formState.errors.confirm && (
                <span className="text-xs text-destructive">{confirmForm.formState.errors.confirm.message}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="rounded-lg">
                {loading && <Spinner className="h-4 w-4" />}
                {L.btn_setup_confirm}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setStep(0); setError(null); }} className="rounded-lg">
                {L.btn_back}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsTab() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { L } = useLang();
  const navigate = useNavigate();
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [tgLinkOpened, setTgLinkOpened] = useState(false);
  const [promoState, setPromoState] = useState<PromoState | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const pwdSchema = z.object({
    current: z.string().min(1, L.val_pwd_current_req),
    next: z.string().min(1, L.val_pwd_new_req).min(8, L.val_pwd_new_min),
    confirm: z.string().min(1, L.val_pwd_confirm_req),
  }).refine((d) => d.next === d.confirm, { message: L.val_pwd_confirm_match, path: ["confirm"] });
  const pwdForm = useForm<z.infer<typeof pwdSchema>>({ resolver: zodResolver(pwdSchema) });

  useEffect(() => {
    promo.getState().then(setPromoState).catch(() => {});
  }, []);

  async function onPasswordChange(values: z.infer<typeof pwdSchema>) {
    setPwdLoading(true);
    setPwdError(null);
    try {
      await password.change(values.current, values.next);
      toast.success(L.msg_pwd_changed);
      pwdForm.reset();
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          invalid_credentials: L.err_wrong_pwd,
          rate_limited: L.err_rate_limited_pwd,
          http_429: L.err_rate_limited_pwd,
        };
        setPwdError(map[e.code] || L.err_change_pwd);
      } else {
        setPwdError(L.err_change_pwd);
      }
    } finally {
      setPwdLoading(false);
    }
  }

  async function revokeAllSessions() {
    setRevokeLoading(true);
    try {
      await sessions.revokeAll();
      toast.success(L.msg_sessions_revoked);
      await logout();
      navigate("/login", { replace: true });
    } catch {
      toast.error(L.err_revoke_sessions);
    } finally {
      setRevokeLoading(false);
    }
  }

  async function sendVerifyEmail() {
    setVerifyLoading(true);
    try {
      await email.sendCode();
      toast.success(L.msg_code_sent);
      navigate("/verify-email");
    } catch {
      toast.error(L.err_send_code);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleLinkTelegram() {
    setLinkLoading(true);
    try {
      const resp = await tgLink.start();
      window.open(resp.deep_link, "_blank", "noopener");
      setTgLinkOpened(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === "already_linked") {
        await refreshProfile();
      } else {
        toast.error(L.err_tg_link);
      }
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleUnlinkTelegram() {
    setUnlinkLoading(true);
    try {
      await tgLink.unlink();
      await refreshProfile();
    } catch {
      toast.error(L.err_tg_unlink);
    } finally {
      setUnlinkLoading(false);
    }
  }

  async function handleActivatePromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await promo.activate(promoCode.trim());
      toast.success(L.msg_promo_activated(res.credit_grant, res.balance));
      setPromoCode("");
      setPromoState((prev) =>
        prev
          ? { ...prev, balance: res.balance, last_promo_code: res.promo_code }
          : { balance: res.balance, last_promo_code: res.promo_code, default_credit_grant: res.credit_grant }
      );
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          invalid_promo_code: L.err_promo_invalid,
          "invalid promo code": L.err_promo_invalid,
          "cannot use your own promo code": L.err_promo_own,
          "you have already used this promo code": L.err_promo_already_used,
          "you have already used a referral code": L.err_promo_referral_only_one,
          "referral codes are for new users only": L.err_promo_referral_not_new,
        };
        setPromoError(map[e.code] || map[e.message] || L.err_promo_activate);
      } else {
        setPromoError(L.err_promo_activate);
      }
    } finally {
      setPromoLoading(false);
    }
  }

  return (
    <div>
      <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
        <ShieldCheck size={18} />{L.settings_title}
      </h4>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account info */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Mail size={16} />{L.card_account}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6 text-sm">
            <div className="flex items-baseline gap-3">
              <span className="w-[140px] shrink-0 text-muted-foreground">Email</span>
              <span className="text-foreground">{user?.email || "—"}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-[140px] shrink-0 text-muted-foreground">{L.label_email_status}</span>
              {user?.email_verified ? (
                <Badge variant="success" className="gap-1"><CheckCircle2 size={12} />{L.status_verified}</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="gap-1"><TriangleAlert size={12} />{L.status_not_verified}</Badge>
                  <Button size="sm" variant="outline" disabled={verifyLoading} onClick={sendVerifyEmail} className="h-6 rounded-md text-[11px]">
                    {verifyLoading && <Spinner className="h-3 w-3" />}
                    {L.btn_verify}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-[140px] shrink-0 text-muted-foreground">{L.label_telegram}</span>
              <div className="flex flex-wrap items-center gap-2">
                {profile?.user.tg_id
                  ? <Badge variant="default" className="gap-1"><Send size={12} />{L.tg_linked}</Badge>
                  : <Badge variant="secondary">{L.tg_not_linked}</Badge>}
                {profile?.user.tg_id ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={unlinkLoading} className="h-6 rounded-md text-[11px]">
                        {unlinkLoading && <Spinner className="h-3 w-3" />}
                        {L.btn_unlink_telegram}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{L.confirm_unlink_tg}</AlertDialogTitle>
                        <AlertDialogDescription>{L.confirm_unlink_tg_body}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{L.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                          onClick={handleUnlinkTelegram}
                        >
                          {L.btn_unlink_telegram}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button size="sm" variant="outline" disabled={linkLoading} onClick={handleLinkTelegram} className="h-6 gap-1 rounded-md text-[11px]">
                    {linkLoading ? <Spinner className="h-3 w-3" /> : <Link2 size={12} />}
                    {L.btn_link_telegram}
                  </Button>
                )}
              </div>
            </div>
            {tgLinkOpened && (
              <Alert variant="info" className="mt-3 rounded-lg">
                <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                  <span>{L.tg_link_opened}</span>
                  <Button size="sm" variant="outline" className="h-6 rounded-md text-[11px]"
                    onClick={() => refreshProfile().then(() => setTgLinkOpened(false))}>
                    {L.btn_refresh}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Password card — conditional on account state */}
        {!user?.email ? (
          <SetupEmailCard onSuccess={refreshProfile} />
        ) : !user?.has_password ? (
          <SetupPasswordCard email={user.email} onSuccess={refreshProfile} />
        ) : (
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lock size={16} />{L.card_password}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {pwdError && (
                <Alert variant="destructive" className="mb-4 rounded-lg">
                  <AlertDescription>{pwdError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={pwdForm.handleSubmit(onPasswordChange)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-foreground">{L.pwd_current}</Label>
                  <Input type="password" {...pwdForm.register("current")} />
                  {pwdForm.formState.errors.current && (
                    <span className="text-xs text-destructive">{pwdForm.formState.errors.current.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-foreground">{L.pwd_new}</Label>
                  <Input type="password" {...pwdForm.register("next")} />
                  {pwdForm.formState.errors.next && (
                    <span className="text-xs text-destructive">{pwdForm.formState.errors.next.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-foreground">{L.pwd_confirm_field}</Label>
                  <Input type="password" {...pwdForm.register("confirm")} />
                  {pwdForm.formState.errors.confirm && (
                    <span className="text-xs text-destructive">{pwdForm.formState.errors.confirm.message}</span>
                  )}
                </div>
                <Button type="submit" disabled={pwdLoading} className="w-fit rounded-lg">
                  {pwdLoading && <Spinner className="h-4 w-4" />}
                  {L.btn_change_pwd}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Promo code */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Gift size={16} />{L.promo_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">{L.promo_balance_label}:</span>
              <Badge variant="secondary">{promoState?.balance ?? 0}</Badge>
            </div>
            {promoState?.last_promo_code && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{L.promo_last_code_label}:</span>
                <Badge variant="success">{promoState.last_promo_code}</Badge>
              </div>
            )}
            <span className="text-xs text-muted-foreground">{L.promo_balance_hint}</span>
            <div className="flex">
              <Input
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleActivatePromo(); }}
                placeholder={L.promo_code_placeholder}
                maxLength={20}
                disabled={promoLoading}
                className="rounded-r-none"
              />
              <Button
                disabled={promoLoading}
                onClick={handleActivatePromo}
                className="rounded-l-none"
              >
                {promoLoading && <Spinner className="h-4 w-4" />}
                {L.btn_activate_promo}
              </Button>
            </div>
            {promoError && (
              <Alert variant="destructive" className="mt-1 rounded-lg">
                <AlertDescription>{promoError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">{L.card_security}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={revokeLoading} className="gap-2 rounded-lg">
                    {revokeLoading ? <Spinner className="h-4 w-4" /> : <LogOut size={16} />}
                    {L.btn_revoke_sessions}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{L.confirm_revoke_title}</AlertDialogTitle>
                    <AlertDialogDescription>{L.confirm_revoke_content}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{L.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                      onClick={revokeAllSessions}
                    >
                      {L.ok_revoke}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                onClick={() => { logout(); navigate("/login", { replace: true }); }}
                className="gap-2 rounded-lg"
              >
                <LogOut size={16} />
                {L.btn_logout_settings}
              </Button>
            </div>
            <Separator className="my-4 bg-border" />
            <span className="text-xs text-muted-foreground">{L.revoke_security_note}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
