import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, email } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";

const { Title, Text } = Typography;

export default function VerifyEmailPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { L } = useLang();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);

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

  async function onFinish(values: { code: string }) {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div
        style={{
          minHeight: "100vh",
                    display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: "#7C9CFF", marginBottom: 16 }} />
          <Title level={3} style={{ color: "#fff" }}>
            {L.verify_success_title}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.5)" }}>
            {L.verify_success_text}
          </Text>
        </div>
      </div>
    );
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
      <div
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 300,
          background: "radial-gradient(ellipse, rgba(6,214,160,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
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
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(6,214,160,0.12)",
                border: "1px solid rgba(6,214,160,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <MailOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />
            </div>
            <Title level={3} style={{ color: "#fff", margin: "0 0 8px" }}>
              {L.verify_title}
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              {user?.email ? (
                <>
                  {L.verify_send_to}{" "}
                  <Text style={{ color: "rgba(255,255,255,0.75)" }}>{user.email}</Text>
                </>
              ) : (
                L.verify_confirm_fallback
              )}
            </Text>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              style={{ marginBottom: 16, borderRadius: 10 }}
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {!sent ? (
            <Button
              type="primary"
              block
              size="large"
              loading={sendLoading}
              onClick={sendCode}
              style={{
                background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
                border: "none",
                height: 48,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {L.btn_send_code}
            </Button>
          ) : (
            <>
              <Alert
                type="info"
                message={L.verify_sent_hint}
                style={{ marginBottom: 20, borderRadius: 10 }}
                showIcon
              />

              <Form layout="vertical" onFinish={onFinish} size="large">
                <Form.Item
                  name="code"
                  label={
                    <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                      {L.verify_code_label}
                    </Text>
                  }
                  rules={[
                    { required: true, message: L.val_code_req },
                    { len: 6, message: L.val_code_len },
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      borderRadius: 12,
                      textAlign: "center",
                      fontSize: 24,
                      letterSpacing: "8px",
                    }}
                  />
                </Form.Item>

                <Space direction="vertical" style={{ width: "100%" }}>
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
                    {L.btn_confirm}
                  </Button>
                  <Button
                    block
                    size="large"
                    loading={sendLoading}
                    onClick={sendCode}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.5)",
                      borderRadius: 12,
                    }}
                  >
                    {L.btn_resend}
                  </Button>
                </Space>
              </Form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
