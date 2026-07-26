import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  AppWindow,
  CheckCircle2,
  ChevronDown,
  Link2,
  Smartphone,
  UserRound,
  Wifi,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import BrandLogo from "../components/BrandLogo";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "../branding";
import { useLang } from "../locale";
import { usePageMeta } from "../seo";

function StepHeading({
  n,
  icon: Icon,
  title,
}: {
  n: number;
  icon: typeof Link2;
  title: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[44px_1fr] gap-3 sm:grid-cols-[56px_1fr] sm:gap-5">
      <div className="flex h-11 w-11 items-center justify-center border border-border bg-card text-emerald-400 sm:h-12 sm:w-12">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="mb-1.5 font-mono text-[11px] tracking-wide text-muted-foreground sm:mb-2 sm:text-xs">
          STEP {String(n).padStart(2, "0")}
        </div>
        <h2 className="wrap-break-word text-xl font-semibold tracking-[-0.025em] sm:text-3xl">{title}</h2>
      </div>
    </div>
  );
}

function NoteDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group min-w-0 border border-border bg-card open:bg-card/80">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 wrap-break-word">{summary}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="min-w-0 wrap-break-word border-t border-border px-4 py-3 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </details>
  );
}

export default function InstructionPage() {
  const { L, toggle } = useLang();
  usePageMeta({
    title: `${L.instruction_title} | ${BRAND_NAME}`,
    description: L.instruction_lead,
    robots: "index, follow",
  });

  const toc = [
    L.instruction_toc_1,
    L.instruction_toc_2,
    L.instruction_toc_3,
    L.instruction_toc_4,
    L.instruction_toc_5,
  ];

  const benefits = [
    L.instruction_benefit_1,
    L.instruction_benefit_2,
    L.instruction_benefit_3,
    L.instruction_benefit_4,
  ];

  const trouble = [
    L.instruction_trouble_1,
    L.instruction_trouble_2,
    L.instruction_trouble_3,
    L.instruction_trouble_4,
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-2 px-4 py-3 sm:px-8 sm:py-3.5">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <BrandLogo size={28} />
            <span className="truncate font-semibold tracking-tight">{BRAND_NAME}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" onClick={toggle}>{L.lang_toggle}</Button>
            <Button size="sm" asChild>
              <Link to="/login">
                <span className="sm:hidden">{L.sign_in}</span>
                <span className="hidden sm:inline">{L.instruction_open_portal}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="min-w-0">
        <section className="border-b border-border px-4 py-10 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[980px]">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 sm:mb-5 sm:text-xs">
              {L.instruction_eyebrow}
            </p>
            <h1 className="max-w-[820px] text-3xl font-bold leading-[1.08] tracking-[-0.04em] wrap-break-word sm:text-6xl sm:leading-[1.05]">
              {L.instruction_title}
            </h1>
            <p className="mt-4 max-w-[720px] text-[15px] leading-7 text-muted-foreground wrap-break-word sm:mt-6 sm:text-lg">
              {L.instruction_lead}
            </p>
            <div className="mt-7 flex items-start gap-3 border-l-2 border-emerald-400 bg-card px-3.5 py-3 text-sm leading-6 text-foreground sm:mt-9 sm:px-4 sm:text-sm">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span className="min-w-0 wrap-break-word">{L.instruction_quick_path}</span>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:py-20">
          <aside className="min-w-0 max-w-full lg:sticky lg:top-24 lg:h-fit">
            <nav
              aria-label="Steps"
              className="flex w-full max-w-full flex-wrap gap-2 lg:flex-col lg:flex-nowrap"
            >
              {toc.map((label, index) => (
                <a
                  key={label}
                  href={`#step-${index + 1}`}
                  className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-emerald-400 hover:text-foreground lg:border-0 lg:border-l lg:border-border lg:bg-transparent lg:px-3 lg:py-2 lg:hover:border-emerald-400"
                >
                  <span className="font-mono text-emerald-400">{String(index + 1).padStart(2, "0")}</span>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 max-w-full space-y-0">
            {/* Step 1 */}
            <section id="step-1" className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0 sm:py-12">
              <StepHeading n={1} icon={Link2} title={L.instruction_step_1_title} />
              <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-muted-foreground wrap-break-word sm:ml-[76px] sm:mt-5 sm:text-base">
                {L.instruction_step_1_body}
              </p>
            </section>

            {/* Step 2 — benefits */}
            <section id="step-2" className="scroll-mt-28 border-t border-border py-8 sm:py-12">
              <StepHeading n={2} icon={AppWindow} title={L.instruction_step_2_title} />
              <div className="mt-4 max-w-[760px] space-y-5 sm:ml-[76px] sm:mt-5">
                <p className="text-[15px] leading-7 text-muted-foreground wrap-break-word sm:text-base">
                  {L.instruction_step_2_body}
                </p>
                <ul className="space-y-3 border border-border bg-card p-4 sm:p-5">
                  {benefits.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="min-w-0 wrap-break-word">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Step 3 — account branches */}
            <section id="step-3" className="scroll-mt-28 border-t border-border py-8 sm:py-12">
              <StepHeading n={3} icon={UserRound} title={L.instruction_step_3_title} />
              <div className="mt-4 max-w-[760px] space-y-4 sm:ml-[76px] sm:mt-5">
                <p className="text-[15px] leading-7 text-muted-foreground wrap-break-word sm:text-base">
                  {L.instruction_step_3_body}
                </p>

                <div className="min-w-0 space-y-2">
                  <NoteDetails summary={L.instruction_note_register_title}>
                    <p>{L.instruction_note_register_body}</p>
                  </NoteDetails>

                  <NoteDetails summary={L.instruction_note_existing_title}>
                    <p className="mb-4">{L.instruction_note_existing_body}</p>
                    <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
                      <div className="min-w-0 bg-background p-4">
                        <div className="mb-2 flex items-start gap-2 text-sm font-semibold text-emerald-400">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0 wrap-break-word">{L.instruction_separate_title}</span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground wrap-break-word">{L.instruction_separate_body}</p>
                      </div>
                      <div className="min-w-0 bg-background p-4">
                        <div className="mb-2 flex items-start gap-2 text-sm font-semibold">
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0 wrap-break-word">{L.instruction_transfer_title}</span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground wrap-break-word">{L.instruction_transfer_body}</p>
                      </div>
                    </div>
                  </NoteDetails>

                  <NoteDetails summary={L.instruction_note_skip_title}>
                    <p>{L.instruction_note_skip_body}</p>
                  </NoteDetails>
                </div>
              </div>
            </section>

            {/* Step 4 — client */}
            <section id="step-4" className="scroll-mt-28 border-t border-border py-8 sm:py-12">
              <StepHeading n={4} icon={Smartphone} title={L.instruction_step_4_title} />
              <div className="mt-4 max-w-[760px] space-y-4 sm:ml-[76px] sm:mt-5">
                <p className="text-[15px] leading-7 text-muted-foreground wrap-break-word sm:text-base">
                  {L.instruction_step_4_body}
                </p>
                <NoteDetails summary={L.instruction_note_cheezy_title}>
                  <p>{L.instruction_note_cheezy_body}</p>
                </NoteDetails>
              </div>
            </section>

            {/* Step 5 — connect */}
            <section id="step-5" className="scroll-mt-28 border-t border-border py-8 sm:py-12">
              <StepHeading n={5} icon={Wifi} title={L.instruction_step_5_title} />
              <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-muted-foreground wrap-break-word sm:ml-[76px] sm:mt-5 sm:text-base">
                {L.instruction_step_5_body}
              </p>
            </section>

            <section className="min-w-0 border border-amber-500/30 bg-amber-500/[0.04] p-5 sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold wrap-break-word sm:text-xl">{L.instruction_trouble_title}</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {trouble.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="shrink-0 text-amber-400">—</span>
                        <span className="min-w-0 wrap-break-word">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="border-t border-border bg-card px-4 py-10 sm:px-8 sm:py-12">
          <div className="mx-auto flex max-w-[980px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold wrap-break-word sm:text-2xl">{L.instruction_cta_title}</h2>
              <p className="mt-2 max-w-[620px] text-sm leading-6 text-muted-foreground wrap-break-word">{L.instruction_cta_body}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/"><ArrowLeft className="h-4 w-4" />{L.instruction_back_home}</Link>
              </Button>
              <Button className="w-full sm:w-auto" asChild>
                <Link to="/login">{L.instruction_open_portal}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
