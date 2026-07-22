import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { ApiError, password } from "../api/client";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

function requestSchema(L: ReturnType<typeof useLang>["L"]) {
  return z.object({
    email: z.string().min(1, L.val_email_req).email(L.val_email_format),
  });
}

function confirmSchema(L: ReturnType<typeof useLang>["L"]) {
  return z
    .object({
      code: z.string().min(1, L.val_code_req).length(6, L.val_code_len),
      password: z.string().min(1, L.val_pwd_req).min(8, L.val_pwd_min),
      confirm: z.string().min(1, L.val_confirm_req),
    })
    .refine((v) => v.password === v.confirm, { message: L.val_confirm_match, path: ["confirm"] });
}

type RequestValues = z.infer<ReturnType<typeof requestSchema>>;
type ConfirmValues = z.infer<ReturnType<typeof confirmSchema>>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [emailAddr, setEmailAddr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  usePageMeta({ title: `${L.forgot_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  const requestForm = useForm<RequestValues>({ resolver: zodResolver(requestSchema(L)) });
  const confirmForm = useForm<ConfirmValues>({ resolver: zodResolver(confirmSchema(L)) });

  function mapError(e: unknown): string {
    if (e instanceof ApiError) {
      const map: Record<string, string> = {
        code_invalid: L.err_code_invalid,
        code_expired: L.err_code_expired,
        code_exhausted: L.err_code_expired,
        rate_limited: L.err_rate_limited,
        http_429: L.err_rate_limited,
      };
      return map[e.code] || L.err_network;
    }
    return L.err_network;
  }

  async function onRequest(values: RequestValues) {
    setError(null);
    try {
      const addr = values.email.trim().toLowerCase();
      await password.resetRequest(addr);
      setEmailAddr(addr);
      setInfo(L.forgot_code_sent);
      setStep("confirm");
    } catch (e) {
      setError(mapError(e));
    }
  }

  async function onConfirm(values: ConfirmValues) {
    setError(null);
    try {
      await password.resetConfirm(emailAddr, values.code.trim(), values.password);
      setInfo(L.reset_success);
      setStep("done");
    } catch (e) {
      setError(mapError(e));
    }
  }

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

      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <Link to="/" className="no-underline">
            <div className="inline-flex items-center gap-2.5">
              <BrandLogo size={38} />
              <span className="text-xl font-bold text-foreground">{BRAND_NAME}</span>
            </div>
          </Link>
        </div>

        <Card className="p-9">
          <h3 className="mb-2 text-center text-2xl font-semibold text-foreground">{L.forgot_title}</h3>
          <p className="mb-7 text-center text-muted-foreground">{L.forgot_subtitle}</p>

          {error && (
            <Alert variant="destructive" className="mb-5 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {info && !error && (
            <Alert variant="info" className="mb-5 rounded-lg">
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}

          {step === "done" ? (
            <Button
              className="h-12 w-full rounded-xl text-base font-semibold"
              onClick={() => navigate("/login", { replace: true })}
            >
              {L.btn_login}
            </Button>
          ) : step === "request" ? (
            <form onSubmit={requestForm.handleSubmit(onRequest)} className="flex flex-col gap-4">
              <div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Email"
                    autoComplete="email"
                    className="h-12 rounded-xl pl-9"
                    {...requestForm.register("email")}
                  />
                </div>
                {requestForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">{requestForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={requestForm.formState.isSubmitting}
                className="h-12 rounded-xl text-base font-semibold"
              >
                {L.btn_send_code}
              </Button>
            </form>
          ) : (
            <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="flex flex-col gap-4">
              <div>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={L.verify_code_label}
                    maxLength={6}
                    className="h-12 rounded-xl pl-9"
                    {...confirmForm.register("code")}
                  />
                </div>
                {confirmForm.formState.errors.code && (
                  <p className="mt-1 text-xs text-destructive">{confirmForm.formState.errors.code.message}</p>
                )}
              </div>
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={L.new_pwd_label}
                    autoComplete="new-password"
                    className="h-12 rounded-xl pl-9"
                    {...confirmForm.register("password")}
                  />
                </div>
                {confirmForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">{confirmForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={L.confirm_placeholder}
                    autoComplete="new-password"
                    className="h-12 rounded-xl pl-9"
                    {...confirmForm.register("confirm")}
                  />
                </div>
                {confirmForm.formState.errors.confirm && (
                  <p className="mt-1 text-xs text-destructive">{confirmForm.formState.errors.confirm.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={confirmForm.formState.isSubmitting}
                className="h-12 rounded-xl text-base font-semibold"
              >
                {L.btn_reset_password}
              </Button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {L.back_to_login}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
