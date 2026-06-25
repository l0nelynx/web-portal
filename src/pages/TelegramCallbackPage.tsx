import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Typography } from "antd";
import { auth, AuthResponse, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const { Text } = Typography;

/**
 * Landing page for the Telegram OpenID Connect redirect.
 *
 * Telegram redirects the user here after authorization with ?code=...&state=...
 * If this page is loaded inside a popup (window.opener exists), it exchanges the
 * code on the backend, then postMessages the result to the opener and closes.
 * If opened directly (no opener), it handles the full login itself and navigates
 * to /dashboard on success or /login on error.
 */
export default function TelegramCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUserAfterRegister } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    // Telegram can redirect with ?error=... if the user cancelled
    if (error || !code || !state) {
      const errCode = error || "cancelled";
      if (window.opener) {
        window.opener.postMessage({ event: "tg_auth", error: errCode }, "*");
        window.close();
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    auth
      .telegramExchange(code, state)
      .then((resp: AuthResponse) => {
        if (window.opener) {
          window.opener.postMessage({ event: "tg_auth", resp }, "*");
          window.close();
        } else {
          setUserAfterRegister(resp.user, resp.tokens);
          navigate("/dashboard", { replace: true });
        }
      })
      .catch((e: unknown) => {
        const errCode = e instanceof ApiError ? e.code : "exchange_failed";
        if (window.opener) {
          window.opener.postMessage({ event: "tg_auth", error: errCode }, "*");
          window.close();
        } else {
          navigate(`/login?tg_error=${encodeURIComponent(errCode)}`, { replace: true });
        }
      });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <Spin size="large" />
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        Signing in with Telegram…
      </Text>
    </div>
  );
}
