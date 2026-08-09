import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import BrandLogo from "../components/BrandLogo";
import { ApiError, subscriptionSso } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { BRAND_NAME } from "../branding";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

export default function OAuthAuthorizePage() {
  const { user, loading } = useAuth();
  const { L } = useLang();
  const location = useLocation();
  const [params] = useSearchParams();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [fragmentCaptured, setFragmentCaptured] = useState(!location.hash);
  usePageMeta({ title: `${L.login_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const challenge = params.get("code_challenge") ?? "";
  const method = params.get("code_challenge_method") ?? "S256";
  const state = params.get("state") ?? "";
  const valid = Boolean(clientId && redirectUri && challenge && state);
  const identityVerified = Boolean(user?.email_verified || user?.has_telegram);

  useLayoutEffect(() => {
    if (!location.hash) {
      setFragmentCaptured(true);
      return;
    }
    const context = new URLSearchParams(location.hash.replace(/^#/, ""))
      .get("subscription_context");
    if (context && state) {
      sessionStorage.setItem(`subscription_context:${state}`, context);
    }
    window.history.replaceState(null, "", `${location.pathname}${location.search}`);
    setFragmentCaptured(true);
  }, [location.hash, location.pathname, location.search, state]);

  useEffect(() => {
    if (!fragmentCaptured || loading || !user || !identityVerified || !valid || started.current) return;
    started.current = true;
    subscriptionSso.authorize({
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: challenge,
      code_challenge_method: method,
      state,
    }).then(({ redirect_url }) => {
      window.location.assign(redirect_url);
    }).catch((reason: unknown) => {
      const code = reason instanceof ApiError ? reason.code : "authorization_failed";
      setError(code === "invalid_redirect_uri" ? "Invalid subscription-page callback." : L.err_login);
    });
  }, [fragmentCaptured, loading, user, identityVerified, valid, clientId, redirectUri, challenge, method, state, L.err_login]);

  if (!fragmentCaptured) return null;
  if (!valid) return <Navigate to="/instruction" replace />;
  if (!loading && !user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?return_to=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (!loading && user && !identityVerified) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/verify-email?return_to=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[420px] border border-border bg-card p-8 text-center">
        <div className="mb-6 inline-flex items-center gap-2.5">
          <BrandLogo size={34} />
          <span className="font-semibold">{BRAND_NAME}</span>
        </div>
        {error ? (
          <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-7 w-7" />
            <p className="text-sm text-muted-foreground">{L.oauth_authorize_loading}</p>
          </div>
        )}
      </div>
    </div>
  );
}
