import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import BrandLogo from "./BrandLogo";
import { BRAND_NAME, BOT_URL } from "../branding";
import { useLang } from "../locale";
import { LegalDoc } from "../pages/legal/content";
import { usePageMeta } from "../seo";

interface Props {
  doc: LegalDoc;
}

export default function LegalLayout({ doc }: Props) {
  const { L, toggle } = useLang();
  // Keep legal docs out of brand SERP competition; users still reach them via footer links.
  usePageMeta({ title: `${doc.title} | ${BRAND_NAME}`, robots: "noindex, follow" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <BrandLogo size={30} />
          <span className="text-base font-semibold text-foreground">{BRAND_NAME}</span>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="min-w-[34px] rounded-md border-border bg-secondary text-xs text-muted-foreground"
          onClick={toggle}
        >
          {L.lang_toggle}
        </Button>
      </nav>

      {/* Document */}
      <div className="mx-auto max-w-[820px] px-5 py-8 pb-20">
        <Link to="/" className="text-sm text-primary no-underline underline-offset-4 hover:underline">
          {L.legal_back}
        </Link>

        <h1 className="mb-2 mt-5 text-[32px] font-bold text-foreground">{doc.title}</h1>
        <span className="text-[13px] text-muted-foreground">{doc.updated}</span>

        {doc.intro && (
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{doc.intro}</p>
        )}

        {doc.sections.map((s, i) => (
          <section key={i} className="mt-7">
            <h3 className="mb-2.5 text-lg font-semibold text-foreground">{s.heading}</h3>
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="text-[15px] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="list-disc pl-6 text-[15px] leading-8 text-muted-foreground">
                {s.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {doc.footnote && (
          <div className="mt-9 rounded-xl border border-border bg-secondary px-5 py-4 text-sm text-foreground/90">
            {doc.footnote}
          </div>
        )}

        {/* Footer with clickable contact + disclaimer */}
        <div className="mt-10 border-t border-border pt-5">
          {BOT_URL && (
            <p className="m-0">
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                {L.footer_telegram}
              </a>
            </p>
          )}
          <span className="text-xs text-muted-foreground">{L.footer_disclaimer}</span>
        </div>
      </div>
    </div>
  );
}
