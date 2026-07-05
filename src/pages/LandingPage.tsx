import { useState } from "react";
import { Button, Col, Grid, Modal, Row, Typography } from "antd";
import {
  TeamOutlined,
  GlobalOutlined,
  MobileOutlined,
  GithubOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import PartnershipForm from "../components/PartnershipForm";
import { BRAND_NAME, BOT_URL } from "../branding";
import { useLang } from "../locale";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const STATS_VALUES = ["99.9%", "50+", "10 Gbps", "24/7"];
const CLASH_PROTOCOLS = ["VLESS", "VMess", "Trojan", "Shadowsocks", "Hysteria 2", "WireGuard"];
const CLASH_RELEASES_URL = "https://github.com/l0nelynx/CheezyClash/releases";
const CHEEZY_RELEASES_URL = "https://github.com/l0nelynx/CheezyVPN-Releases/releases";

// GitHub's /releases/latest/download/<asset> URL always resolves to the current
// release's asset with that exact name — no version number to keep in sync here.
const APK_BUILDS: Record<"clash" | "cheezy", { repo: string; variant: string }> = {
  clash: { repo: "CheezyClash", variant: "open" },
  cheezy: { repo: "CheezyVPN-Releases", variant: "proprietary" },
};

function apkUrl(app: "clash" | "cheezy", arch: string): string {
  const { repo, variant } = APK_BUILDS[app];
  return `https://github.com/l0nelynx/${repo}/releases/latest/download/app-direct-${variant}-${arch}-release.apk`;
}

// Illustrative device frame — no real screenshots yet, drawn directly in CSS so it
// always matches the brand theme and never goes stale as either app's UI changes.
function PhoneMockup({ variant }: { variant: "clash" | "cheezy" }) {
  return (
    <div
      style={{
        width: 96,
        height: 176,
        borderRadius: 18,
        border: "2px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ width: 24, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.15)", margin: "0 auto 4px" }} />
      {variant === "clash" ? (
        [1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 1 ? "#06D6A0" : "rgba(255,255,255,0.25)" }} />
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.15)" }} />
          </div>
        ))
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
              boxShadow: "0 0 0 6px rgba(124,156,255,0.15)",
            }}
          />
          <div style={{ width: 40, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.15)" }} />
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [archApp, setArchApp] = useState<"clash" | "cheezy" | null>(null);

  const px = isMobile ? "16px" : "48px";

  const ARCH_OPTIONS = [
    { key: "arm64-v8a", label: L.arch_arm64_label, badge: L.arch_arm64_badge, desc: L.arch_arm64_desc, highlight: true },
    { key: "universal", label: L.arch_universal_label, badge: L.arch_universal_badge, desc: L.arch_universal_desc, highlight: true },
    { key: "armeabi-v7a", label: L.arch_armv7_label, desc: L.arch_armv7_desc },
    { key: "x86_64", label: L.arch_x86_label, desc: L.arch_x86_desc },
  ];

  const FEATURES = [
    { icon: <GlobalOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_infra_title, desc: L.feat_infra_desc },
    { icon: <TeamOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_audience_title, desc: L.feat_audience_desc },
    {
      icon: <MobileOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />,
      title: L.feat_apps_title,
      desc: L.feat_apps_desc,
      onClick: () => document.getElementById("apps")?.scrollIntoView({ behavior: "smooth" }),
    },
  ];

  const COMPARE_ROWS = [
    { label: L.apps_row_import, clash: true, cheezy: false },
    { label: L.apps_row_thirdparty, clash: true, cheezy: false },
    { label: L.apps_row_trial, clash: false, cheezy: true },
    { label: L.apps_row_manage, clash: false, cheezy: true },
    { label: L.apps_row_opensource, clash: true, cheezy: false },
  ];

  const appCardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20,
    padding: isMobile ? 24 : 32,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };

  const STATS = [
    { value: STATS_VALUES[0], label: L.stat_uptime },
    { value: STATS_VALUES[1], label: L.stat_nodes },
    { value: STATS_VALUES[2], label: L.stat_throughput },
    { value: STATS_VALUES[3], label: L.stat_support },
  ];

  return (
    <div style={{ minHeight: "100vh", color: "rgba(255,255,255,0.92)", overflowX: "hidden" }}>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "18px 48px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(11,11,20,0.75)",
          backdropFilter: "blur(20px)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BrandLogo size={isMobile ? 28 : 34} />
          <Text strong style={{ fontSize: isMobile ? 15 : 18, color: "#fff", letterSpacing: "-0.3px" }}>
            {BRAND_NAME}
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          {!isMobile && (
            <Button
              type="text"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              {L.nav_solutions}
            </Button>
          )}
          {!isMobile && (
            <Button
              type="text"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
            >
              {L.nav_platform}
            </Button>
          )}
          {!isMobile && (
            <Button
              type="text"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onClick={() => document.getElementById("individuals")?.scrollIntoView({ behavior: "smooth" })}
            >
              {L.nav_individuals}
            </Button>
          )}
          {!isMobile && (
            <Button
              type="text"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onClick={() => document.getElementById("business")?.scrollIntoView({ behavior: "smooth" })}
            >
              {L.nav_business}
            </Button>
          )}
          {/* Language toggle */}
          <Button
            size={isMobile ? "small" : "middle"}
            onClick={toggle}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              borderRadius: 6,
              fontSize: 12,
              minWidth: 34,
            }}
          >
            {L.lang_toggle}
          </Button>
          <Button
            size={isMobile ? "small" : "middle"}
            style={{
              background: "rgba(6,214,160,0.15)",
              borderColor: "rgba(6,214,160,0.4)",
              color: "#7C9CFF",
            }}
            onClick={() => navigate("/login")}
          >
            {isMobile ? L.btn_login : L.header_portal}
          </Button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          textAlign: "center",
          padding: isMobile ? "64px 20px 56px" : "120px 24px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 20,
              border: "1px solid rgba(6,214,160,0.35)",
              background: "rgba(6,214,160,0.08)",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 13, color: "#7C9CFF", letterSpacing: "0.5px" }}>
              {L.hero_badge}
            </Text>
          </div>

          <Title
            level={1}
            style={{
              color: "#fff",
              fontSize: "clamp(28px, 8vw, 64px)",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "0 0 20px",
              letterSpacing: "-1px",
            }}
          >
            {L.hero_title_1}
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {L.hero_title_2}
            </span>
          </Title>

          <Paragraph
            style={{
              fontSize: isMobile ? 16 : 18,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 560,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            {L.hero_desc}
          </Paragraph>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              type="primary"
              size="large"
              style={{
                background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
                border: "none",
                height: isMobile ? 44 : 50,
                padding: "0 28px",
                fontSize: isMobile ? 15 : 16,
                fontWeight: 600,
                borderRadius: 12,
              }}
              onClick={() =>
                BOT_URL
                  ? window.open(BOT_URL, "_blank", "noopener")
                  : navigate("/register")
              }
            >
              {BOT_URL ? L.ind_cta : L.btn_get_started}
            </Button>
            <Button
              size="large"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "rgba(255,255,255,0.85)",
                height: isMobile ? 44 : 50,
                padding: "0 28px",
                fontSize: isMobile ? 15 : 16,
                borderRadius: 12,
              }}
              onClick={() => navigate("/login")}
            >
              {L.btn_login}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section
        id="stats"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: isMobile ? "28px 16px" : "40px 48px",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <Row justify="center" gutter={[isMobile ? 24 : 48, 20]}>
          {STATS.map((s) => (
            <Col key={s.label} style={{ textAlign: "center", minWidth: isMobile ? 80 : 140 }}>
              <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: "#7C9CFF", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                {s.label}
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{ padding: isMobile ? "56px 16px" : "100px 48px", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 64 }}>
          <Title
            level={2}
            style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 26 : 36, marginBottom: 12 }}
          >
            {L.features_title}
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.55)", fontSize: 16 }}>
            {L.features_subtitle}
          </Paragraph>
        </div>

        <Row gutter={[20, 20]}>
          {FEATURES.map((f) => (
            <Col key={f.title} xs={24} sm={12} lg={8}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 16,
                  padding: isMobile ? 20 : 28,
                  height: "100%",
                  cursor: f.onClick ? "pointer" : "default",
                  transition: "border-color 0.2s",
                }}
                onClick={f.onClick}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(6,214,160,0.3)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.09)")
                }
              >
                <div style={{ marginBottom: 14 }}>{f.icon}</div>
                <Title level={4} style={{ color: "#fff", marginBottom: 8, fontSize: 17 }}>
                  {f.title}
                </Title>
                <Paragraph style={{ color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
                  {f.desc}
                </Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ── Apps comparison ───────────────────────────────────────────────── */}
      <section
        id="apps"
        style={{ padding: isMobile ? "56px 16px" : "100px 48px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <Title
            level={2}
            style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 26 : 36, marginBottom: 12 }}
          >
            {L.apps_title}
          </Title>
          <Paragraph
            style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}
          >
            {L.apps_subtitle}
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} align="stretch">
          <Col xs={24} md={12}>
            <div style={appCardStyle}>
              <PhoneMockup variant="clash" />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, marginBottom: 8 }}>
                <GithubOutlined style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }} />
                <Text style={{ fontSize: 12, letterSpacing: "0.5px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                  {L.apps_clash_badge}
                </Text>
              </div>
              <Title level={3} style={{ color: "#fff", fontSize: 22, marginBottom: 10 }}>
                {L.apps_clash_title}
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                {L.apps_clash_desc}
              </Paragraph>
              <div style={{ marginTop: "auto" }}>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8 }}>
                  {L.apps_clash_protocols_label}
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CLASH_PROTOCOLS.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: 12,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <Button
                  size="large"
                  style={{
                    marginTop: 20,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    color: "rgba(255,255,255,0.85)",
                    height: 46,
                    padding: "0 24px",
                    borderRadius: 12,
                  }}
                  onClick={() => setArchApp("clash")}
                >
                  {L.apps_clash_cta}
                </Button>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div
              style={{
                ...appCardStyle,
                border: "1px solid rgba(6,214,160,0.3)",
                background: "linear-gradient(135deg, rgba(6,214,160,0.07), rgba(124,156,255,0.05))",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: "rgba(6,214,160,0.15)",
                  border: "1px solid rgba(6,214,160,0.4)",
                }}
              >
                <Text style={{ fontSize: 11, color: "#06D6A0", fontWeight: 600 }}>{L.apps_trial_badge}</Text>
              </div>
              <PhoneMockup variant="cheezy" />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, marginBottom: 8 }}>
                <MobileOutlined style={{ fontSize: 18, color: "#7C9CFF" }} />
                <Text style={{ fontSize: 12, letterSpacing: "0.5px", color: "#7C9CFF", textTransform: "uppercase" }}>
                  {L.apps_cheezy_badge}
                </Text>
              </div>
              <Title level={3} style={{ color: "#fff", fontSize: 22, marginBottom: 10 }}>
                {L.apps_cheezy_title}
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                {L.apps_cheezy_desc}
              </Paragraph>
              <Button
                type="primary"
                size="large"
                style={{
                  marginTop: "auto",
                  alignSelf: "flex-start",
                  background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
                  border: "none",
                  height: 46,
                  padding: "0 24px",
                  fontWeight: 600,
                  borderRadius: 12,
                }}
                onClick={() => setArchApp("cheezy")}
              >
                {L.apps_cheezy_cta}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Feature comparison table */}
        <div
          style={{
            marginTop: 32,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 50px 50px" : "1fr 160px 160px",
              padding: isMobile ? "12px 14px" : "14px 24px",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {L.apps_compare_feature}
            </Text>
            <Text style={{ textAlign: "center", color: "#fff", fontWeight: 600, fontSize: isMobile ? 12 : 14 }}>
              {L.apps_clash_title}
            </Text>
            <Text style={{ textAlign: "center", color: "#fff", fontWeight: 600, fontSize: isMobile ? 12 : 14 }}>
              {L.apps_cheezy_title}
            </Text>
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 50px 50px" : "1fr 160px 160px",
                alignItems: "center",
                padding: isMobile ? "12px 14px" : "14px 24px",
                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: isMobile ? 13 : 14 }}>{row.label}</Text>
              <div style={{ textAlign: "center" }}>
                {row.clash ? (
                  <CheckOutlined style={{ color: "#06D6A0" }} />
                ) : (
                  <CloseOutlined style={{ color: "rgba(255,255,255,0.25)" }} />
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                {row.cheezy ? (
                  <CheckOutlined style={{ color: "#06D6A0" }} />
                ) : (
                  <CloseOutlined style={{ color: "rgba(255,255,255,0.25)" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── For individuals ────────────────────────────────────────────────── */}
      <section
        id="individuals"
        style={{
          margin: isMobile ? "0 16px 40px" : "0 48px 64px",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(6,214,160,0.12), rgba(0,150,199,0.12))",
          border: "1px solid rgba(6,214,160,0.2)",
          padding: isMobile ? "40px 24px" : "60px 40px",
          textAlign: "center",
        }}
      >
        <Text style={{ fontSize: 13, color: "#06D6A0", letterSpacing: "0.5px" }}>
          {L.ind_badge}
        </Text>
        <Title level={2} style={{ color: "#fff", margin: "12px 0", fontSize: isMobile ? 22 : 30 }}>
          {L.ind_title}
        </Title>
        <Paragraph
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 16,
            marginBottom: 32,
            maxWidth: 620,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {L.ind_desc}
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{
            background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
            border: "none",
            height: 50,
            padding: "0 40px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 12,
          }}
          onClick={() =>
            BOT_URL ? window.open(BOT_URL, "_blank", "noopener") : navigate("/register")
          }
        >
          {BOT_URL ? L.ind_cta : L.btn_create_account}
        </Button>
      </section>

      {/* ── For business / partnership ─────────────────────────────────────── */}
      <section
        id="business"
        style={{
          padding: isMobile ? "0 16px 56px" : "0 48px 96px",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Text style={{ fontSize: 13, color: "#7C9CFF", letterSpacing: "0.5px" }}>
            {L.biz_badge}
          </Text>
          <Title level={2} style={{ color: "#fff", margin: "12px 0", fontSize: isMobile ? 24 : 32 }}>
            {L.biz_title}
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, margin: 0 }}>
            {L.biz_desc}
          </Paragraph>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 18,
            padding: isMobile ? 20 : 32,
          }}
        >
          <PartnershipForm />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: `32px ${px}`,
        }}
      >
        {/* Links row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BrandLogo size={26} />
            <Text strong style={{ color: "#fff", fontSize: 15 }}>{BRAND_NAME}</Text>
          </div>

          <div style={{ display: "flex", gap: isMobile ? 16 : 28, flexWrap: "wrap" }}>
            <Link to="/policy" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
              {L.footer_policy}
            </Link>
            <Link to="/agreement" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
              {L.footer_agreement}
            </Link>
            <Link to="/offer" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
              {L.footer_offer}
            </Link>
            {BOT_URL && (
              <a
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}
              >
                {L.footer_telegram}
              </a>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            © {new Date().getFullYear()} {BRAND_NAME}. {L.footer_rights}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
            {L.footer_tagline}
          </Text>
        </div>

        {/* Compliance disclaimer */}
        <Text
          style={{
            display: "block",
            marginTop: 16,
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          {L.footer_disclaimer}
        </Text>
      </footer>

      {/* ── Architecture picker (download modal) ─────────────────────────── */}
      <Modal
        open={archApp !== null}
        onCancel={() => setArchApp(null)}
        footer={null}
        title={L.arch_modal_title}
        centered
      >
        <Paragraph style={{ color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>
          {L.arch_modal_subtitle}
        </Paragraph>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ARCH_OPTIONS.map((opt) => (
            <div
              key={opt.key}
              onClick={() => {
                if (archApp) window.open(apkUrl(archApp, opt.key), "_blank", "noopener");
                setArchApp(null);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "14px 16px",
                borderRadius: 12,
                cursor: "pointer",
                border: opt.highlight ? "1px solid rgba(6,214,160,0.35)" : "1px solid rgba(255,255,255,0.09)",
                background: opt.highlight ? "rgba(6,214,160,0.06)" : "rgba(255,255,255,0.03)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = opt.highlight
                  ? "rgba(6,214,160,0.12)"
                  : "rgba(255,255,255,0.06)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = opt.highlight
                  ? "rgba(6,214,160,0.06)"
                  : "rgba(255,255,255,0.03)")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text strong style={{ color: "#fff", fontSize: 15 }}>
                  {opt.label}
                </Text>
                {opt.badge && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: "rgba(6,214,160,0.15)",
                      color: "#06D6A0",
                      fontWeight: 600,
                    }}
                  >
                    {opt.badge}
                  </span>
                )}
              </div>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{opt.desc}</Text>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <a
            href={archApp === "clash" ? CLASH_RELEASES_URL : CHEEZY_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}
          >
            {L.arch_modal_all_releases}
          </a>
        </div>
      </Modal>
    </div>
  );
}
