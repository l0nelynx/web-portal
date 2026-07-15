import { Alert, App, Button, Card, Col, Descriptions, Divider, Form, Input, Modal, Row, Space, Steps, Tag, Typography } from "antd";
import { CheckCircleOutlined, GiftOutlined, LinkOutlined, LockOutlined, LogoutOutlined, MailOutlined, SafetyCertificateOutlined, SendOutlined, WarningOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, email, password, promo, PromoState, sessions, setup, tgLink } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useLang } from "../../locale";

const { Title, Text } = Typography;

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  borderRadius: 10,
} as const;

/** Case A: no email, no password — set both via 2-step email verification */
function SetupEmailCard({ onSuccess }: { onSuccess: () => void }) {
  const { message: msg } = App.useApp();
  const { L } = useLang();
  const [form] = Form.useForm();
  const [step, setStep] = useState<0 | 1>(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRequest(values: { email: string; password: string }) {
    setLoading(true); setError(null);
    try {
      await setup.emailRequest(values.email, values.password);
      setPendingEmail(values.email.trim().toLowerCase());
      setStep(1);
      form.resetFields(["code"]);
    } catch (e) {
      const map: Record<string, string> = {
        email_taken: L.err_email_taken,
        email_already_set: L.err_email_already_set,
        email_send_failed: L.err_send_code,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_email) : L.err_setup_email);
    } finally { setLoading(false); }
  }

  async function onConfirm(values: { code: string }) {
    setLoading(true); setError(null);
    try {
      await setup.emailConfirm(values.code);
      msg.success(L.setup_success_email);
      onSuccess();
    } catch (e) {
      const map: Record<string, string> = {
        code_invalid: L.err_code_invalid,
        code_expired: L.err_code_expired,
        code_exhausted: L.err_rate_limited,
        email_taken: L.err_email_taken,
        http_429: L.err_rate_limited,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_email) : L.err_setup_email);
    } finally { setLoading(false); }
  }

  const cardTitle = <Text style={{ color: "#fff" }}><LockOutlined style={{ marginRight: 8 }} />{L.card_setup_email}</Text>;

  return (
    <Card title={cardTitle}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
      styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)" } }}>
      <Steps size="small" current={step} style={{ marginBottom: 20 }}
        items={[{ title: <Text style={{ color: "#fff", fontSize: 12 }}>{L.btn_setup_send_code}</Text> },
                { title: <Text style={{ color: "#fff", fontSize: 12 }}>{L.btn_setup_confirm}</Text> }]} />
      {error && <Alert type="error" message={error} style={{ marginBottom: 16, borderRadius: 10 }} showIcon closable onClose={() => setError(null)} />}
      {step === 0 ? (
        <Form form={form} layout="vertical" onFinish={onRequest}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, display: "block", marginBottom: 16 }}>{L.setup_email_hint}</Text>
          <Form.Item name="email" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.setup_email_label}</Text>}
            rules={[{ required: true, message: L.val_email_req }, { type: "email", message: L.val_email_format }]}>
            <Input style={inputStyle} autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.setup_pwd_new_label}</Text>}
            rules={[{ required: true, message: L.val_pwd_req }, { min: 8, message: L.val_pwd_min }]}>
            <Input.Password style={inputStyle} autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="confirm" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.setup_pwd_confirm_label}</Text>}
            dependencies={["password"]}
            rules={[{ required: true, message: L.val_confirm_req },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error(L.val_confirm_match));
                },
              })]}>
            <Input.Password style={inputStyle} autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}
            style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}>
            {L.btn_setup_send_code}
          </Button>
        </Form>
      ) : (
        <Form form={form} layout="vertical" onFinish={onConfirm}>
          <Alert type="info" message={L.setup_code_sent_hint(pendingEmail)} style={{ marginBottom: 16, borderRadius: 10 }} showIcon />
          <Form.Item name="code" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.setup_code_label}</Text>}
            rules={[{ required: true, message: L.val_code_req }, { len: 6, message: L.val_code_len }]}>
            <Input style={inputStyle} maxLength={6} autoComplete="one-time-code" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}
              style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}>
              {L.btn_setup_confirm}
            </Button>
            <Button onClick={() => { setStep(0); setError(null); }}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 10 }}>
              {L.btn_back}
            </Button>
          </Space>
        </Form>
      )}
    </Card>
  );
}

/** Case B: has email but no password — set password via email code */
function SetupPasswordCard({ email: userEmail, onSuccess }: { email: string; onSuccess: () => void }) {
  const { message: msg } = App.useApp();
  const { L } = useLang();
  const [form] = Form.useForm();
  const [step, setStep] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRequest() {
    setLoading(true); setError(null);
    try {
      await setup.passwordRequest();
      setStep(1);
      form.resetFields();
    } catch (e) {
      const map: Record<string, string> = {
        password_already_set: L.err_password_already_set,
        email_send_failed: L.err_send_code,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_password) : L.err_setup_password);
    } finally { setLoading(false); }
  }

  async function onConfirm(values: { new_password: string; code: string }) {
    setLoading(true); setError(null);
    try {
      await setup.passwordConfirm(values.new_password, values.code);
      msg.success(L.setup_success_password);
      onSuccess();
    } catch (e) {
      const map: Record<string, string> = {
        code_invalid: L.err_code_invalid,
        code_expired: L.err_code_expired,
        code_exhausted: L.err_rate_limited,
        http_429: L.err_rate_limited,
      };
      setError(e instanceof ApiError ? (map[e.code] ?? L.err_setup_password) : L.err_setup_password);
    } finally { setLoading(false); }
  }

  const cardTitle = <Text style={{ color: "#fff" }}><LockOutlined style={{ marginRight: 8 }} />{L.card_setup_password}</Text>;

  return (
    <Card title={cardTitle}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
      styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)" } }}>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16, borderRadius: 10 }} showIcon closable onClose={() => setError(null)} />}
      {step === 0 ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{L.setup_password_hint(userEmail)}</Text>
          <Button type="primary" loading={loading} onClick={onRequest}
            style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10, marginTop: 8 }}>
            {L.btn_setup_pwd_send_code}
          </Button>
        </Space>
      ) : (
        <Form form={form} layout="vertical" onFinish={onConfirm}>
          <Alert type="info" message={L.setup_pwd_code_sent_hint} style={{ marginBottom: 16, borderRadius: 10 }} showIcon />
          <Form.Item name="code" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.setup_code_label}</Text>}
            rules={[{ required: true, message: L.val_code_req }, { len: 6, message: L.val_code_len }]}>
            <Input style={inputStyle} maxLength={6} autoComplete="one-time-code" />
          </Form.Item>
          <Form.Item name="new_password" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.pwd_new}</Text>}
            rules={[{ required: true, message: L.val_pwd_new_req }, { min: 8, message: L.val_pwd_new_min }]}>
            <Input.Password style={inputStyle} autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="confirm" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.pwd_confirm_field}</Text>}
            dependencies={["new_password"]}
            rules={[{ required: true, message: L.val_pwd_confirm_req },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                  return Promise.reject(new Error(L.val_pwd_confirm_match));
                },
              })]}>
            <Input.Password style={inputStyle} autoComplete="new-password" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}
              style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}>
              {L.btn_setup_confirm}
            </Button>
            <Button onClick={() => { setStep(0); setError(null); }}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 10 }}>
              {L.btn_back}
            </Button>
          </Space>
        </Form>
      )}
    </Card>
  );
}

export default function SettingsTab() {
  const { message: msg } = App.useApp();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { L } = useLang();
  const navigate = useNavigate();
  const [pwdForm] = Form.useForm();
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [tgLinkOpened, setTgLinkOpened] = useState(false);
  const [promoState, setPromoState] = useState<PromoState | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    promo.getState().then(setPromoState).catch(() => {});
  }, []);

  async function onPasswordChange(values: { current: string; next: string }) {
    setPwdLoading(true);
    setPwdError(null);
    try {
      await password.change(values.current, values.next);
      msg.success(L.msg_pwd_changed);
      pwdForm.resetFields();
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          invalid_credentials: L.err_wrong_pwd,
          rate_limited: L.err_rate_limited_pwd,
          http_429: L.err_rate_limited_pwd,
        };
        setPwdError(map[e.code] || L.err_change_pwd);
      } else {
        setPwdError(L.err_change_pwd);
      }
    } finally {
      setPwdLoading(false);
    }
  }

  async function revokeAllSessions() {
    Modal.confirm({
      title: L.confirm_revoke_title,
      content: L.confirm_revoke_content,
      okText: L.ok_revoke,
      cancelText: L.cancel,
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        setRevokeLoading(true);
        try {
          await sessions.revokeAll();
          msg.success(L.msg_sessions_revoked);
          await logout();
          navigate("/login", { replace: true });
        } catch {
          msg.error(L.err_revoke_sessions);
        } finally {
          setRevokeLoading(false);
        }
      },
    });
  }

  async function sendVerifyEmail() {
    setVerifyLoading(true);
    try {
      await email.sendCode();
      msg.success(L.msg_code_sent);
      navigate("/verify-email");
    } catch {
      msg.error(L.err_send_code);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleLinkTelegram() {
    setLinkLoading(true);
    try {
      const resp = await tgLink.start();
      window.open(resp.deep_link, "_blank", "noopener");
      setTgLinkOpened(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === "already_linked") {
        await refreshProfile();
      } else {
        msg.error(L.err_tg_link);
      }
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleUnlinkTelegram() {
    Modal.confirm({
      title: L.confirm_unlink_tg,
      content: L.confirm_unlink_tg_body,
      okText: L.btn_unlink_telegram,
      cancelText: L.cancel,
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        setUnlinkLoading(true);
        try {
          await tgLink.unlink();
          await refreshProfile();
        } catch {
          msg.error(L.err_tg_unlink);
        } finally {
          setUnlinkLoading(false);
        }
      },
    });
  }

  async function handleActivatePromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await promo.activate(promoCode.trim());
      msg.success(L.msg_promo_activated(res.credit_grant, res.balance));
      setPromoCode("");
      setPromoState((prev) =>
        prev
          ? { ...prev, balance: res.balance, last_promo_code: res.promo_code }
          : { balance: res.balance, last_promo_code: res.promo_code, default_credit_grant: res.credit_grant }
      );
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          invalid_promo_code: L.err_promo_invalid,
          "invalid promo code": L.err_promo_invalid,
          "cannot use your own promo code": L.err_promo_own,
          "you have already used this promo code": L.err_promo_already_used,
          "you have already used a referral code": L.err_promo_referral_only_one,
          "referral codes are for new users only": L.err_promo_referral_not_new,
        };
        setPromoError(map[e.code] || map[e.message] || L.err_promo_activate);
      } else {
        setPromoError(L.err_promo_activate);
      }
    } finally {
      setPromoLoading(false);
    }
  }

  return (
    <div>
      <Title level={4} style={{ color: "#fff", marginBottom: 24 }}>
        <SafetyCertificateOutlined style={{ marginRight: 8 }} />{L.settings_title}
      </Title>

      <Row gutter={[24, 24]}>
        {/* Account info */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text style={{ color: "#fff" }}><MailOutlined style={{ marginRight: 8 }} />{L.card_account}</Text>}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#fff" } }}
          >
            <Descriptions column={1} size="small" colon={false} styles={{ label: { color: "rgba(255,255,255,0.5)", width: 140 } }}>
              <Descriptions.Item label="Email">
                <Text style={{ color: "#fff" }}>{user?.email || "—"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={L.label_email_status}>
                {user?.email_verified ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>{L.status_verified}</Tag>
                ) : (
                  <Space>
                    <Tag color="warning" icon={<WarningOutlined />}>{L.status_not_verified}</Tag>
                    <Button size="small" loading={verifyLoading} onClick={sendVerifyEmail}
                      style={{ fontSize: 11, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                      {L.btn_verify}
                    </Button>
                  </Space>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={L.label_telegram}>
                <Space wrap>
                  {profile?.user.tg_id
                    ? <Tag color="processing" icon={<SendOutlined />}>{L.tg_linked}</Tag>
                    : <Tag>{L.tg_not_linked}</Tag>}
                  {profile?.user.tg_id ? (
                    <Button size="small" danger loading={unlinkLoading} onClick={handleUnlinkTelegram}
                      style={{ fontSize: 11, borderRadius: 6 }}>
                      {L.btn_unlink_telegram}
                    </Button>
                  ) : (
                    <Button size="small" loading={linkLoading} onClick={handleLinkTelegram}
                      icon={<LinkOutlined />}
                      style={{ fontSize: 11, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                      {L.btn_link_telegram}
                    </Button>
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>
            {tgLinkOpened && (
              <Alert
                type="info"
                message={L.tg_link_opened}
                style={{ marginTop: 12, borderRadius: 10 }}
                showIcon
                closable
                onClose={() => setTgLinkOpened(false)}
                action={
                  <Button size="small" onClick={() => refreshProfile().then(() => setTgLinkOpened(false))}
                    style={{ borderRadius: 6, fontSize: 11 }}>
                    {L.btn_refresh}
                  </Button>
                }
              />
            )}
          </Card>
        </Col>

        {/* Password card — conditional on account state */}
        <Col xs={24} lg={12}>
          {!user?.email ? (
            // Case A: no email at all — set up email + password
            <SetupEmailCard onSuccess={refreshProfile} />
          ) : !user?.has_password ? (
            // Case B: has email but no password
            <SetupPasswordCard email={user.email} onSuccess={refreshProfile} />
          ) : (
            // Case C: normal change-password form
            <Card
              title={<Text style={{ color: "#fff" }}><LockOutlined style={{ marginRight: 8 }} />{L.card_password}</Text>}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
              styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)" } }}
            >
              {pwdError && (
                <Alert type="error" message={pwdError} style={{ marginBottom: 16, borderRadius: 10 }} showIcon closable onClose={() => setPwdError(null)} />
              )}
              <Form form={pwdForm} layout="vertical" onFinish={onPasswordChange}>
                <Form.Item name="current" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.pwd_current}</Text>}
                  rules={[{ required: true, message: L.val_pwd_current_req }]}>
                  <Input.Password style={inputStyle} />
                </Form.Item>
                <Form.Item name="next" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.pwd_new}</Text>}
                  rules={[{ required: true, message: L.val_pwd_new_req }, { min: 8, message: L.val_pwd_new_min }]}>
                  <Input.Password style={inputStyle} />
                </Form.Item>
                <Form.Item name="confirm" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.pwd_confirm_field}</Text>}
                  dependencies={["next"]}
                  rules={[
                    { required: true, message: L.val_pwd_confirm_req },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("next") === value) return Promise.resolve();
                        return Promise.reject(new Error(L.val_pwd_confirm_match));
                      },
                    }),
                  ]}>
                  <Input.Password style={inputStyle} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={pwdLoading}
                  style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}>
                  {L.btn_change_pwd}
                </Button>
              </Form>
            </Card>
          )}
        </Col>

        {/* Promo code */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text style={{ color: "#fff" }}><GiftOutlined style={{ marginRight: 8 }} />{L.promo_title}</Text>}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)" } }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              <Space wrap>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>{L.promo_balance_label}:</Text>
                <Tag color="blue">{promoState?.balance ?? 0}</Tag>
              </Space>
              {promoState?.last_promo_code && (
                <Space wrap>
                  <Text style={{ color: "rgba(255,255,255,0.5)" }}>{L.promo_last_code_label}:</Text>
                  <Tag color="success">{promoState.last_promo_code}</Tag>
                </Space>
              )}
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{L.promo_balance_hint}</Text>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); }}
                  onPressEnter={handleActivatePromo}
                  placeholder={L.promo_code_placeholder}
                  maxLength={20}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px 0 0 10px", color: "#fff" }}
                  disabled={promoLoading}
                />
                <Button
                  type="primary"
                  loading={promoLoading}
                  onClick={handleActivatePromo}
                  style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: "0 10px 10px 0" }}
                >
                  {L.btn_activate_promo}
                </Button>
              </Space.Compact>
            </Space>
            {promoError && (
              <Alert type="error" message={promoError} style={{ marginTop: 12, borderRadius: 10 }} showIcon closable onClose={() => setPromoError(null)} />
            )}
          </Card>
        </Col>

        {/* Security */}
        <Col xs={24}>
          <Card
            title={<Text style={{ color: "#fff" }}>{L.card_security}</Text>}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)" } }}
          >
            <Space wrap>
              <Button danger icon={<LogoutOutlined />} loading={revokeLoading} onClick={revokeAllSessions} style={{ borderRadius: 10 }}>
                {L.btn_revoke_sessions}
              </Button>
              <Button icon={<LogoutOutlined />}
                onClick={() => { logout(); navigate("/login", { replace: true }); }}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", borderRadius: 10 }}>
                {L.btn_logout_settings}
              </Button>
            </Space>
            <Divider style={{ borderColor: "rgba(255,255,255,0.07)" }} />
            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{L.revoke_security_note}</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
