import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { auth, AuthResponse, ApiError } from "../api/client";

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

  async function openPopup() {
    if (!BOT_ID || loading) return;
    setLoading(true);

    let authUrl: string;
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { auth_url } = await auth.telegramInit(redirectUri);
      authUrl = auth_url;
    } catch (e) {
      setLoading(false);
      onError(e instanceof ApiError ? e.code : "init_failed");
      return;
    }

    const w = 550, h = 470;
    const left = Math.round((screen.width - w) / 2);
    const top = Math.round((screen.height - h) / 2);
    const popup = window.open(
      authUrl,
      "tg_auth",
      `width=${w},height=${h},left=${left},top=${top}`
    );
    if (!popup) {
      setLoading(false);
      return;
    }
    popupRef.current = popup;

    const onMessage = (e: MessageEvent) => {
      if (e.data?.event !== "tg_auth") return;
      cleanup();
      popup.close();
      if (e.data.error) {
        onError(e.data.error as string);
        setLoading(false);
      } else {
        onSuccess(e.data.resp as AuthResponse);
      }
    };

    listenerRef.current = onMessage;
    window.addEventListener("message", onMessage);

    // Detect manual popup close
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
      type="button"
      variant="outline"
      className="h-12 w-full rounded-xl border-[#34AADF]/30 bg-[#34AADF]/10 text-[15px] font-semibold text-white hover:bg-[#34AADF]/20"
      disabled={loading}
      onClick={openPopup}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#34AADF" className="inline-block align-middle">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      )}
      {label}
    </Button>
  );
}
