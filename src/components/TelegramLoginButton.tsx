import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { auth, AuthResponse, ApiError } from "../api/client";

export interface TelegramUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface Props {
  label: string;
  onSuccess: (resp: AuthResponse) => void;
  onError: (code: string) => void;
}

const BOT_ID = import.meta.env.VITE_TG_BOT_ID || "";

export default function TelegramLoginButton({ label, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenerRef = useRef<((e: MessageEvent) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (listenerRef.current) {
      window.removeEventListener("message", listenerRef.current);
      listenerRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  async function handleTgData(user: TelegramUser) {
    setLoading(true);
    try {
      const resp = await auth.telegramLogin({
        id: Number(user.id),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: user.auth_date,
        hash: user.hash,
      });
      onSuccess(resp);
    } catch (e) {
      onError(e instanceof ApiError ? e.code : "unknown");
      setLoading(false);
    }
  }

  function openPopup() {
    if (!BOT_ID) return;

    const origin = encodeURIComponent(window.location.origin);
    const url = `https://oauth.telegram.org/auth?bot_id=${BOT_ID}&origin=${origin}&request_access=write`;
    const w = 550, h = 470;
    const left = Math.round((screen.width - w) / 2);
    const top = Math.round((screen.height - h) / 2);
    const popup = window.open(url, "tg_auth", `width=${w},height=${h},left=${left},top=${top}`);
    if (!popup) return;

    popupRef.current = popup;
    setLoading(true);

    const onMessage = (e: MessageEvent) => {
      if (e.source !== popup) return;
      if (e.data?.event !== "auth_result") return;
      cleanup();
      popup.close();
      const user = e.data?.result as TelegramUser | null;
      if (user?.id) {
        handleTgData(user);
      } else {
        setLoading(false);
      }
    };

    listenerRef.current = onMessage;
    window.addEventListener("message", onMessage);

    timerRef.current = setInterval(() => {
      if (popup.closed) {
        cleanup();
        setLoading(false);
      }
    }, 500);
  }

  if (!BOT_ID) return null;

  return (
    <Button
      block
      size="large"
      loading={loading}
      onClick={openPopup}
      icon={
        !loading ? (
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="#34AADF"
            style={{ display: "inline-block", verticalAlign: "middle" }}
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        ) : undefined
      }
      style={{
        background: "rgba(52,170,223,0.10)",
        border: "1px solid rgba(52,170,223,0.28)",
        color: "#fff",
        height: 48,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {label}
    </Button>
  );
}
