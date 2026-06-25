import { Alert, App, Button, Card, Col, Descriptions, Divider, Form, Input, Modal, Row, Space, Tag, Typography } from "antd";
import { CheckCircleOutlined, GiftOutlined, LinkOutlined, LockOutlined, LogoutOutlined, MailOutlined, SafetyCertificateOutlined, SendOutlined, WarningOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, email, password, promo, PromoState, sessions, tgLink } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useLang } from "../../locale";

const { Title, Text } = Typography;

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
      msg.success(L.msg_promo_activated(res.discount_percent));
      setPromoCode("");
      setPromoState((prev) =>
        prev ? { ...prev, can_activate: false, active_promo: res.active_promo, discount_percent: res.discount_percent } : prev
      );
    } catch (e) {
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          invalid_promo_code: L.err_promo_invalid,
          "invalid promo code": L.err_promo_invalid,
          "cannot use your own promo code": L.err_promo_own,
          "you have already used this promo code": L.err_promo_already_used,
          "a promo is already active — use it first": L.err_promo_active_exists,
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

        {/* Change password */}
        <Col xs={24} lg={12}>
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
                <Input.Password style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10 }} />
              </Form.Item>
              <Form.Item name="next" label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.pwd_new}</Text>}
                rules={[{ required: true, message: L.val_pwd_new_req }, { min: 8, message: L.val_pwd_new_min }]}>
                <Input.Password style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10 }} />
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
                <Input.Password style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10 }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={pwdLoading}
                style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}>
                {L.btn_change_pwd}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Promo code */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text style={{ color: "#fff" }}><GiftOutlined style={{ marginRight: 8 }} />{L.promo_title}</Text>}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
            styles={{ header: { borderBottom: "1px solid rgba(255,255,255,0.07)" } }}
          >
            {promoState?.active_promo ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <Text style={{ color: "rgba(255,255,255,0.5)" }}>{L.promo_active_label}</Text>
                  <Tag color="success">{promoState.active_promo}</Tag>
                  {promoState.discount_percent > 0 && (
                    <Tag color="blue">{promoState.discount_percent}%</Tag>
                  )}
                </Space>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{L.promo_cant_activate}</Text>
              </Space>
            ) : (
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
            )}
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
