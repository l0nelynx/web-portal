import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, email } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";

function buildSchema(L: ReturnType<typeof useLang>["L"]) {
  return z.object({
    code: z.string().min(1, L.val_code_req).length(6, L.val_code_len),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function VerifyEmailPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { L } = useLang();
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(buildSchema(L)) });

  async function sendCode() {
    setSendLoading(true);
    setError(null);
    try {
      await email.sendCode();
      setSent(true);
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          code_invalid: L.err_code_invalid,
          code_expired: L.err_code_expired,
          rate_limited: L.err_rate_limited,
          http_429: L.err_rate_limited,
        };
        setError(map[e.code] || L.err_send_code);
      } else {
        setError(L.err_network);
      }
    } finally {
      setSendLoading(false);
    }
  }

  async function onFinish(values: FormValues) {
    setError(null);
    try {
      await email.verify(values.code.trim());
      await refreshProfile();
      setVerified(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          code_invalid: L.err_code_invalid,
          code_expired: L.err_code_expired,
          rate_limited: L.err_rate_limited,
          http_429: L.err_rate_limited,
        };
        setError(map[e.code] || L.err_verify);
      } else {
        setError(L.err_network);
      }
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h3 className="text-2xl font-semibold text-foreground">{L.verify_success_title}</h3>
          <span className="text-muted-foreground">{L.verify_success_text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <Link to="/" className="no-underline">
            <div className="inline-flex items-center gap-2.5">
              <BrandLogo size={38} />
              <span className="text-xl font-bold text-foreground">{BRAND_NAME}</span>
            </div>
          </Link>
        </div>

        <Card className="p-9">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-foreground">{L.verify_title}</h3>
            <span className="text-sm text-muted-foreground">
              {user?.email ? (
                <>
                  {L.verify_send_to} <span className="text-foreground">{user.email}</span>
                </>
              ) : (
                L.verify_confirm_fallback
              )}
            </span>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!sent ? (
            <Button
              disabled={sendLoading}
              onClick={sendCode}
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              {L.btn_send_code}
            </Button>
          ) : (
            <>
              <Alert variant="info" className="mb-5 rounded-lg">
                <AlertDescription>{L.verify_sent_hint}</AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit(onFinish)} className="flex flex-col gap-3">
                <div className="mb-1">
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    className="h-14 rounded-xl text-center text-2xl tracking-[8px]"
                    {...register("code")}
                  />
                  {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 rounded-xl text-base font-semibold"
                >
                  {L.btn_confirm}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={sendLoading}
                  onClick={sendCode}
                  className="h-12 rounded-xl"
                >
                  {L.btn_resend}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
