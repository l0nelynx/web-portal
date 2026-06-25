import { Button, Col, Grid, Row, Typography } from "antd";
import {
  LockOutlined,
  RocketOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { useLang } from "../locale";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const STATS_VALUES = ["99.9%", "50+", "10 Gbps", "24/7"];

export default function LandingPage() {
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const px = isMobile ? "16px" : "48px";

  const FEATURES = [
    { icon: <LockOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_zero_trust_title, desc: L.feat_zero_trust_desc },
    { icon: <GlobalOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_global_title, desc: L.feat_global_desc },
    { icon: <TeamOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_team_title, desc: L.feat_team_desc },
    { icon: <ThunderboltOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_throughput_title, desc: L.feat_throughput_desc },
    { icon: <SafetyCertificateOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_compliance_title, desc: L.feat_compliance_desc },
    { icon: <RocketOutlined style={{ fontSize: 28, color: "#7C9CFF" }} />, title: L.feat_deploy_title, desc: L.feat_deploy_desc },
  ];

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
              onClick={() => navigate("/register")}
            >
              {L.btn_get_started}
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
                  transition: "border-color 0.2s",
                }}
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

      {/* ── CTA banner ─────────────────────────────────────────────────────── */}
      <section
        style={{
          margin: isMobile ? "0 16px 48px" : "0 48px 80px",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(6,214,160,0.12), rgba(0,150,199,0.12))",
          border: "1px solid rgba(6,214,160,0.2)",
          padding: isMobile ? "40px 24px" : "60px 40px",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ color: "#fff", marginBottom: 12, fontSize: isMobile ? 22 : 30 }}>
          {L.cta_title}
        </Title>
        <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 32 }}>
          {L.cta_desc}
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
          onClick={() => navigate("/register")}
        >
          {L.btn_create_account}
        </Button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: `24px ${px}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BrandLogo size={26} />
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            © {new Date().getFullYear()} {BRAND_NAME}. {L.footer_rights}
          </Text>
        </div>
        <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
          {L.footer_tagline}
        </Text>
      </footer>
    </div>
  );
}
