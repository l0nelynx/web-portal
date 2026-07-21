import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { BRAND_NAME, BOT_URL } from "../branding";
import { useLang } from "../locale";
import { LegalDoc } from "../pages/legal/content";
import { usePageMeta } from "../seo";

const { Title, Paragraph, Text } = Typography;

interface Props {
  doc: LegalDoc;
}

export default function LegalLayout({ doc }: Props) {
  const { L, toggle } = useLang();
  // Keep legal docs out of brand SERP competition; users still reach them via footer links.
  usePageMeta({ title: `${doc.title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B14", color: "rgba(255,255,255,0.9)" }}>
      {/* Top bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(11,11,20,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <BrandLogo size={30} />
          <Text strong style={{ color: "#fff", fontSize: 16 }}>{BRAND_NAME}</Text>
        </Link>
        <Button
          size="small"
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
      </nav>

      {/* Document */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 80px" }}>
        <Link to="/" style={{ color: "#7C9CFF", fontSize: 14, textDecoration: "none" }}>
          {L.legal_back}
        </Link>

        <Title level={1} style={{ color: "#fff", fontSize: 32, marginTop: 20, marginBottom: 8 }}>
          {doc.title}
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{doc.updated}</Text>

        {doc.intro && (
          <Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 20, lineHeight: 1.7 }}>
            {doc.intro}
          </Paragraph>
        )}

        {doc.sections.map((s, i) => (
          <section key={i} style={{ marginTop: 28 }}>
            <Title level={3} style={{ color: "#fff", fontSize: 18, marginBottom: 10 }}>
              {s.heading}
            </Title>
            {s.paragraphs?.map((p, j) => (
              <Paragraph key={j} style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7 }}>
                {p}
              </Paragraph>
            ))}
            {s.bullets && (
              <ul style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.8, paddingLeft: 22 }}>
                {s.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {doc.footnote && (
          <div
            style={{
              marginTop: 36,
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(124,156,255,0.08)",
              border: "1px solid rgba(124,156,255,0.2)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 14,
            }}
          >
            {doc.footnote}
          </div>
        )}

        {/* Footer with clickable contact + disclaimer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {BOT_URL && (
            <Paragraph style={{ margin: 0 }}>
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#7C9CFF" }}>
                {L.footer_telegram}
              </a>
            </Paragraph>
          )}
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            {L.footer_disclaimer}
          </Text>
        </div>
      </div>
    </div>
  );
}
