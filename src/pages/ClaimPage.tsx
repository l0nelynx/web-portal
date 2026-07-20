import { Alert, Button, Card, Form, Input, Spin, Typography } from "antd";
import {
  CheckCircleOutlined,
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const { Title, Text } = Typography;

type Step =
  | "url"
  | "checking"
  | "login"
  | "setup"
  | "register"
  | "no_email"
  | "done"
  | "foreign";

/** Subscription URL arrives in the fragment (`/claim#url=...`) so it never
 * reaches server logs — same trick as the MiniApp connect-open redirector. */
function urlFromFragment(): string | null {
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

function shortUuidOf(url: string): string | null {
  try {
    const path = new URL(url.trim()).pathname.replace(/\/+$/, "");
    const slug = path.substring(path.lastIndexOf("/") + 1);
    return /^[A-Za-z0-9_-]{6,64}$/.test(slug) ? slug : null;
  } catch {
    return null;
  }
}

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 20,
} as const;

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  borderRadius: 12,
} as const;

const primaryBtnStyle = {
  background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
  border: "none",
  height: 48,
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
} as const;

export default function ClaimPage() {
  const { user, profile, loading: authLoading, login, setUserAfterRegister } = useAuth();
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  usePageMeta({ title: `${L.claim_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  const [step, setStep] = useState<Step>("url");
  const [subUrl, setSubUrl] = useState("");
  const [resolved, setResolved] = useState<ClaimResolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appLinkPending, setAppLinkPending] = useState(false);
  const bootstrapped = useRef(false);

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
          setStep("login");
          break;
        case "needs_password":
        case "rw_only":
          try {
            await claim.otpRequest(res.claim_token);
          } catch (e) {
            setError(mapError(e));
          }
          setStep(res.status === "needs_password" ? "setup" : "register");
          break;
        default:
          setStep("no_email");
      }
    } catch (e) {
      setError(mapError(e));
      setStep("url");
    }
  }

  // Bootstrap: read the fragment once auth state is known.
  useEffect(() => {
    if (authLoading || bootstrapped.current) return;
    bootstrapped.current = true;
    const fromHash = urlFromFragment();
    if (fromHash) setSubUrl(fromHash);
    if (user) {
      // Already signed in: same subscription → done, foreign → transfer notice.
      const own = profile?.subscription?.subscription_url ?? null;
      if (!fromHash || (own && shortUuidOf(own) === shortUuidOf(fromHash))) {
        setStep("done");
      } else {
        setStep("foreign");
      }
      return;
    }
    if (fromHash) void startClaim(fromHash);
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onLogin(values: { email: string; password: string }) {
    setLoading(true);
    setError(null);
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      setStep("done");
    } catch (e) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onComplete(values: { code: string; password: string; acc_email?: string }) {
    if (!resolved) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await claim.complete(
        resolved.claim_token,
        values.code.trim(),
        values.password,
        values.acc_email?.trim().toLowerCase()
      );
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Button
        size="small"
        onClick={toggle}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.6)",
          borderRadius: 6,
          fontSize: 12,
          minWidth: 34,
          zIndex: 10,
        }}
      >
        {L.lang_toggle}
      </Button>

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <BrandLogo size={38} />
              <Text strong style={{ fontSize: 20, color: "#fff" }}>
                {BRAND_NAME}
              </Text>
            </div>
          </Link>
        </div>

        <Card style={cardStyle} styles={{ body: { padding: 36 } }}>
          <Title level={3} style={{ color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {step === "done" ? L.claim_done_title : step === "foreign" ? L.claim_foreign_title : L.claim_title}
          </Title>
          {step !== "done" && step !== "foreign" && (
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                display: "block",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              {L.claim_subtitle}
            </Text>
          )}

          {error && (
            <Alert
              type="error"
              message={error}
              style={{ marginBottom: 20, borderRadius: 10 }}
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {step === "url" && (
            <Form
              layout="vertical"
              size="large"
              onFinish={(v: { url: string }) => {
                setSubUrl(v.url.trim());
                void startClaim(v.url.trim());
              }}
              initialValues={{ url: subUrl }}
            >
              <Form.Item
                name="url"
                label={<Text style={{ color: "rgba(255,255,255,0.6)" }}>{L.claim_url_label}</Text>}
                rules={[{ required: true, message: L.err_claim_bad_url }]}
              >
                <Input
                  prefix={<LinkOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                  placeholder={L.claim_url_placeholder}
                  style={inputStyle}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={primaryBtnStyle}>
                {L.btn_claim_check}
              </Button>
            </Form>
          )}

          {step === "checking" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>{L.claim_checking}</Text>
              </div>
            </div>
          )}

          {step === "login" && resolved && (
            <>
              <Alert
                type="info"
                message={L.claim_login_hint(hint)}
                style={{ marginBottom: 20, borderRadius: 10 }}
                showIcon
              />
              <Form layout="vertical" size="large" onFinish={onLogin}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: L.val_email_req },
                    { type: "email", message: L.val_email_format },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                    placeholder="Email"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: L.val_pwd_req }]}>
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                    placeholder={L.pwd_label}
                    autoComplete="current-password"
                    style={inputStyle}
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} style={primaryBtnStyle}>
                  {L.btn_login}
                </Button>
              </Form>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Link to="/forgot-password" style={{ color: "#7C9CFF", fontSize: 13 }}>
                  {L.forgot_link}
                </Link>
              </div>
              {resolved.has_telegram && (
                <div style={{ marginTop: 16 }}>
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
              <Alert
                type="info"
                message={step === "setup" ? L.claim_setup_hint(hint) : L.claim_register_hint(hint)}
                style={{ marginBottom: 20, borderRadius: 10 }}
                showIcon
              />
              <Form layout="vertical" size="large" onFinish={onComplete}>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: L.val_code_req },
                    { len: 6, message: L.val_code_len },
                  ]}
                >
                  <Input
                    prefix={<NumberOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                    placeholder={L.verify_code_label}
                    maxLength={6}
                    style={inputStyle}
                  />
                </Form.Item>
                {step === "register" && (
                  <Form.Item
                    name="acc_email"
                    rules={[
                      { required: true, message: L.val_email_req },
                      { type: "email", message: L.val_email_format },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                      placeholder={L.claim_acc_email_label}
                      autoComplete="email"
                      style={inputStyle}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: L.val_pwd_req },
                    { min: 8, message: L.val_pwd_min },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                    placeholder={L.new_pwd_label}
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                </Form.Item>
                <Form.Item
                  name="confirm"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: L.val_confirm_req },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) return Promise.resolve();
                        return Promise.reject(new Error(L.val_confirm_match));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                    placeholder={L.confirm_placeholder}
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} style={primaryBtnStyle}>
                  {L.btn_confirm}
                </Button>
              </Form>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button
                  type="link"
                  style={{ color: "#7C9CFF", fontSize: 13 }}
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
            </>
          )}

          {step === "no_email" && (
            <>
              <Alert
                type="warning"
                message={L.claim_no_email_title}
                description={L.claim_no_email_text}
                style={{ marginBottom: 20, borderRadius: 10 }}
                showIcon
              />
              <TelegramLoginButton
                label={L.btn_tg_login}
                onSuccess={(resp) => {
                  setUserAfterRegister(resp.user, resp.tokens);
                  setStep("done");
                }}
                onError={() => setError(L.err_tg_login)}
              />
              <Button block style={{ ...primaryBtnStyle, marginTop: 12 }} onClick={importOnly}>
                {L.btn_import_only}
              </Button>
            </>
          )}

          {(step === "done" || step === "foreign") && (
            <>
              {step === "done" ? (
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <CheckCircleOutlined style={{ fontSize: 44, color: "#6EE7A0" }} />
                  <div style={{ marginTop: 12 }}>
                    <Text style={{ color: "rgba(255,255,255,0.6)" }}>{L.claim_done_text}</Text>
                  </div>
                </div>
              ) : (
                <Alert
                  type="warning"
                  message={L.claim_foreign_text}
                  style={{ marginBottom: 20, borderRadius: 10 }}
                  showIcon
                />
              )}
              {step === "done" && (
                <>
                  <Button
                    type="primary"
                    block
                    loading={appLinkPending}
                    style={primaryBtnStyle}
                    onClick={openInApp}
                  >
                    {L.btn_open_in_app}
                  </Button>
                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                      {L.claim_open_app_hint}
                    </Text>
                  </div>
                </>
              )}
              {(resolved?.subscription_url || subUrl) && (
                <Button
                  block
                  style={{
                    marginTop: 12,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.75)",
                  }}
                  onClick={importOnly}
                >
                  {L.btn_import_only}
                </Button>
              )}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Link to="/dashboard" style={{ color: "#7C9CFF", fontWeight: 500 }}>
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
