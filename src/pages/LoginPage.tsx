import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BrandLogo from "../components/BrandLogo";
import TelegramLoginButton from "../components/TelegramLoginButton";
import { BRAND_NAME } from "../branding";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

function buildSchema(L: ReturnType<typeof useLang>["L"]) {
  return z.object({
    email: z.string().min(1, L.val_email_req).email(L.val_email_format),
    password: z.string().min(1, L.val_pwd_req),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function LoginPage() {
  const { login, setUserAfterRegister } = useAuth();
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  usePageMeta({ title: `${L.login_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  const schema = buildSchema(L);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const tgError = searchParams.get("tg_error");
    if (!tgError || tgError === "cancelled") return;
    const map: Record<string, string> = {
      tg_not_registered: L.err_tg_not_registered,
      banned: L.err_banned,
    };
    setError(map[tgError] ?? L.err_tg_login);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFinish(values: FormValues) {
    setError(null);
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          invalid_credentials: L.err_invalid_login,
          banned: L.err_banned,
          rate_limited: L.err_rate_limited,
          http_429: L.err_rate_limited,
        };
        setError(map[e.code] || L.err_login);
      } else {
        setError(L.err_network);
      }
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
          <h3 className="mb-2 text-center text-2xl font-semibold text-foreground">{L.login_title}</h3>
          <p className="mb-7 block text-center text-muted-foreground">{L.login_subtitle}</p>

          {error && (
            <Alert variant="destructive" className="mb-5 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onFinish)} className="flex flex-col gap-4">
            <div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Email"
                  autoComplete="email"
                  className="h-12 rounded-xl pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={L.pwd_label}
                  autoComplete="current-password"
                  className="h-12 rounded-xl pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl text-base font-semibold"
            >
              {L.btn_login}
            </Button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/forgot-password" className="text-[13px] text-primary underline-offset-4 hover:underline">
              {L.forgot_link}
            </Link>
          </div>

          {/* Telegram login */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <TelegramLoginButton
            label={L.btn_tg_login}
            onSuccess={(resp) => {
              setUserAfterRegister(resp.user, resp.tokens);
              navigate("/dashboard", { replace: true });
            }}
            onError={(code) => {
              if (code === "tg_not_registered") {
                setError(L.err_tg_not_registered);
              } else if (code === "banned") {
                setError(L.err_banned);
              } else {
                setError(L.err_tg_login);
              }
            }}
          />

          <div className="mt-5 text-center">
            <span className="text-[13px] text-muted-foreground">
              {L.no_account}{" "}
              <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                {L.btn_register}
              </Link>
            </span>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <span className="text-xs text-muted-foreground">{L.login_invite_hint}</span>
        </div>
      </div>
    </div>
  );
}
