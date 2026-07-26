import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  AppWindow,
  CheckCircle2,
  KeyRound,
  Link2,
  RefreshCw,
  Smartphone,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";
import BrandLogo from "../components/BrandLogo";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "../branding";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

export default function InstructionPage() {
  const { L, toggle } = useLang();
  usePageMeta({
    title: `${L.instruction_title} | ${BRAND_NAME}`,
    description: L.instruction_lead,
    robots: "index, follow",
  });

  const steps = [
    [Link2, L.instruction_step_1_title, L.instruction_step_1_body],
    [AppWindow, L.instruction_step_2_title, L.instruction_step_2_body],
    [UserRound, L.instruction_step_3_title, L.instruction_step_3_body],
    [KeyRound, L.instruction_step_4_title, L.instruction_step_4_body],
    [RefreshCw, L.instruction_step_5_title, L.instruction_step_5_body],
    [Smartphone, L.instruction_step_6_title, L.instruction_step_6_body],
    [CheckCircle2, L.instruction_step_7_title, L.instruction_step_7_body],
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo size={30} />
            <span className="font-semibold tracking-tight">{BRAND_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggle}>{L.lang_toggle}</Button>
            <Button size="sm" asChild><Link to="/login">{L.instruction_open_portal}</Link></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[980px]">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-emerald-400">
              {L.instruction_eyebrow}
            </p>
            <h1 className="max-w-[820px] text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
              {L.instruction_title}
            </h1>
            <p className="mt-6 max-w-[720px] text-base leading-7 text-muted-foreground sm:text-lg">
              {L.instruction_lead}
            </p>
            <div className="mt-9 flex items-center gap-3 border-l-2 border-emerald-400 bg-card px-4 py-3 font-mono text-xs leading-5 text-foreground sm:text-sm">
              <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400" />
              {L.instruction_quick_path}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[220px_1fr] lg:py-20">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {steps.map(([, title], index) => (
                <a
                  key={title}
                  href={`#step-${index + 1}`}
                  className="flex shrink-0 items-center gap-3 border-l border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-emerald-400 hover:text-foreground"
                >
                  <span className="font-mono text-emerald-400">{String(index + 1).padStart(2, "0")}</span>
                  <span className="max-w-[150px] truncate lg:whitespace-normal">{title}</span>
                </a>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            {steps.map(([Icon, title, body], index) => (
              <section
                id={`step-${index + 1}`}
                key={title}
                className="scroll-mt-28 border-t border-border py-9 first:border-t-0 first:pt-0 sm:py-12"
              >
                <div className="grid gap-5 sm:grid-cols-[64px_1fr]">
                  <div className="flex h-12 w-12 items-center justify-center border border-border bg-card text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-xs text-muted-foreground">STEP {String(index + 1).padStart(2, "0")}</div>
                    <h2 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{title}</h2>
                    <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">{body}</p>

                    {index === 3 && (
                      <div className="mt-7 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
                        <div className="bg-card p-5">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> {L.instruction_separate_title}
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{L.instruction_separate_body}</p>
                        </div>
                        <div className="bg-background p-5">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <ArrowRight className="h-4 w-4" /> {L.instruction_transfer_title}
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{L.instruction_transfer_body}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}

            <section className="border border-amber-500/30 bg-amber-500/[0.04] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <h2 className="text-xl font-semibold">{L.instruction_trouble_title}</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {[L.instruction_trouble_1, L.instruction_trouble_2, L.instruction_trouble_3].map((item) => (
                      <li key={item} className="flex gap-3"><span className="text-amber-400">—</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="border-t border-border bg-card px-4 py-12 sm:px-8">
          <div className="mx-auto flex max-w-[980px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">{L.instruction_cta_title}</h2>
              <p className="mt-2 max-w-[620px] text-sm leading-6 text-muted-foreground">{L.instruction_cta_body}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" asChild><Link to="/"><ArrowLeft className="h-4 w-4" />{L.instruction_back_home}</Link></Button>
              <Button asChild><Link to="/login">{L.instruction_open_portal}<ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
