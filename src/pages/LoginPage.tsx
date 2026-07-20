import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import BrandLogo from "../components/BrandLogo";
import TelegramLoginButton from "../components/TelegramLoginButton";
import { BRAND_NAME } from "../branding";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, setUserAfterRegister } = useAuth();
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  usePageMeta({ title: `${L.login_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  useEffect(() => {
    const tgError = searchParams.get("tg_error");
    if (!tgError || tgError === "cancelled") return;
    const map: Record<string, string> = {
      tg_not_registered: L.err_tg_not_registered,
      banned: L.err_banned,
    };
    setError(map[tgError] ?? L.err_tg_login);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFinish(values: { email: string; password: string }) {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

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

      {/* Language toggle */}
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

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
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

        <Card
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
          }}
          styles={{ body: { padding: 36 } }}
        >
          <Title level={3} style={{ color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {L.login_title}
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              display: "block",
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            {L.login_subtitle}
          </Text>

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

          <Form layout="vertical" onFinish={onFinish} size="large">
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
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  borderRadius: 12,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: L.val_pwd_req }]}
              style={{ marginBottom: 24 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                placeholder={L.pwd_label}
                autoComplete="current-password"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  borderRadius: 12,
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
                border: "none",
                height: 48,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {L.btn_login}
            </Button>
          </Form>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Link to="/forgot-password" style={{ color: "#7C9CFF", fontSize: 13 }}>
              {L.forgot_link}
            </Link>
          </div>

          {/* Telegram login */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>or</Text>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
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

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              {L.no_account}{" "}
              <Link to="/register" style={{ color: "#7C9CFF", fontWeight: 500 }}>
                {L.btn_register}
              </Link>
            </Text>
          </div>
        </Card>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            {L.login_invite_hint}
          </Text>
        </div>
      </div>
    </div>
  );
}
