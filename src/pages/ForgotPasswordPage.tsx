import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined, NumberOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { ApiError, password } from "../api/client";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

const { Title, Text } = Typography;

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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [emailAddr, setEmailAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  usePageMeta({ title: `${L.forgot_title} | ${BRAND_NAME}`, robots: "noindex, follow" });

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

  async function onRequest(values: { email: string }) {
    setLoading(true);
    setError(null);
    try {
      const addr = values.email.trim().toLowerCase();
      await password.resetRequest(addr);
      setEmailAddr(addr);
      setInfo(L.forgot_code_sent);
      setStep("confirm");
    } catch (e) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm(values: { code: string; password: string }) {
    setLoading(true);
    setError(null);
    try {
      await password.resetConfirm(emailAddr, values.code.trim(), values.password);
      setInfo(L.reset_success);
      setStep("done");
    } catch (e) {
      setError(mapError(e));
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

      <div style={{ width: "100%", maxWidth: 420 }}>
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
            {L.forgot_title}
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              display: "block",
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            {L.forgot_subtitle}
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
          {info && !error && (
            <Alert
              type="info"
              message={info}
              style={{ marginBottom: 20, borderRadius: 10 }}
              showIcon
            />
          )}

          {step === "done" ? (
            <Button
              type="primary"
              block
              style={primaryBtnStyle}
              onClick={() => navigate("/login", { replace: true })}
            >
              {L.btn_login}
            </Button>
          ) : step === "request" ? (
            <Form layout="vertical" size="large" onFinish={onRequest}>
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
              <Button type="primary" htmlType="submit" block loading={loading} style={primaryBtnStyle}>
                {L.btn_send_code}
              </Button>
            </Form>
          ) : (
            <Form layout="vertical" size="large" onFinish={onConfirm}>
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
                {L.btn_reset_password}
              </Button>
            </Form>
          )}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link to="/login" style={{ color: "#7C9CFF", fontWeight: 500 }}>
              {L.back_to_login}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
