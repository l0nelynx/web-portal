import type { ReactNode } from "react";
import { useState } from "react";
import {
  Users,
  Globe,
  Smartphone,
  Github,
  Check,
  X,
  Apple,
  Laptop,
  Terminal,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BrandLogo from "../components/BrandLogo";
import PartnershipForm from "../components/PartnershipForm";
import { BRAND_NAME, BOT_URL } from "../branding";
import { useLang } from "../locale";
import { HOME_TITLE, usePageMeta } from "../seo";
import { useMediaQuery } from "../hooks/useMediaQuery";

const STATS_VALUES = ["99.9%", "50+", "10 Gbps", "24/7"];
const CLASH_PROTOCOLS = ["VLESS", "VMess", "Trojan", "Shadowsocks", "Hysteria 2", "WireGuard"];
const CLASH_RELEASES_URL = "https://github.com/l0nelynx/CheezyClash/releases";
const CHEEZY_RELEASES_URL = "https://github.com/l0nelynx/CheezyVPN-Releases/releases";
const CLASH_DOCS_URL = "https://l0nelynx.github.io/CheezyClash-docs/";

type AppId = "clash" | "cheezy";
type DownloadPlatform = "android" | "windows" | "macos" | "linux";

const APP_REPOS: Record<AppId, string> = {
  clash: "CheezyClash",
  cheezy: "CheezyVPN-Releases",
};

const APP_PREFIX: Record<AppId, string> = {
  clash: "CheezyClash",
  cheezy: "CheezyVPN",
};

// GitHub's /releases/latest/download/<asset> URL always resolves to the current
// release's asset with that exact name — no version number to keep in sync here.
const APK_VARIANT: Record<AppId, string> = {
  clash: "open",
  cheezy: "proprietary",
};

function releaseAssetUrl(app: AppId, filename: string): string {
  return `https://github.com/l0nelynx/${APP_REPOS[app]}/releases/latest/download/${filename}`;
}

function apkUrl(app: AppId, arch: string): string {
  return releaseAssetUrl(app, `app-direct-${APK_VARIANT[app]}-${arch}-release.apk`);
}

function defaultPlatform(): DownloadPlatform {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/Win/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  if (/Linux/i.test(ua)) return "linux";
  return "windows";
}

function desktopDownloads(app: AppId, L: ReturnType<typeof useLang>["L"]) {
  const p = APP_PREFIX[app];
  return {
    windows: [
      { label: L.download_win_installer, url: releaseAssetUrl(app, `${p}-win-x64.exe`) },
      { label: L.download_win_portable, url: releaseAssetUrl(app, `${p}-win-x64.zip`) },
    ],
    macos: [
      { label: L.download_mac_arm64, url: releaseAssetUrl(app, `${p}-mac-arm64.dmg`) },
      { label: L.download_mac_x64, url: releaseAssetUrl(app, `${p}-mac-x64.dmg`) },
    ],
    linux: [
      { label: L.download_linux_appimage, url: releaseAssetUrl(app, `${p}-linux-x86_64.AppImage`) },
      { label: L.download_linux_deb, url: releaseAssetUrl(app, `${p}-linux-amd64.deb`) },
    ],
  };
}

const PLATFORM_BADGES: { key: DownloadPlatform; labelKey: "platform_windows" | "platform_macos" | "platform_linux" | "platform_android"; icon: ReactNode }[] = [
  { key: "windows", labelKey: "platform_windows", icon: <Laptop size={14} /> },
  { key: "macos", labelKey: "platform_macos", icon: <Apple size={14} /> },
  { key: "linux", labelKey: "platform_linux", icon: <Terminal size={14} /> },
  { key: "android", labelKey: "platform_android", icon: <Smartphone size={14} /> },
];

function PlatformBadges({ L }: { L: ReturnType<typeof useLang>["L"] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {PLATFORM_BADGES.map(({ key, labelKey, icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
        >
          {icon}
          {L[labelKey]}
        </span>
      ))}
    </div>
  );
}

function ScreenContent({ variant }: { variant: AppId }) {
  if (variant === "clash") {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-md bg-muted/60 px-1.5 py-1">
            <div className={`h-1.5 w-1.5 rounded-full ${i === 1 ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
            <div className="h-[5px] flex-1 rounded-sm bg-foreground/15" />
          </div>
        ))}
      </>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <div className="h-11 w-11 rounded-full bg-primary/90 ring-[6px] ring-primary/15" />
      <div className="h-1 w-10 rounded-sm bg-foreground/15" />
    </div>
  );
}

function DeviceMockup({ variant }: { variant: AppId }) {
  return (
    <div className="relative mb-2 h-[130px] w-[180px]">
      {/* Laptop */}
      <div className="absolute left-0 top-0">
        {/* Screen */}
        <div className="box-border flex w-[140px] flex-col gap-1.5 rounded-t-lg border border-b-0 border-border/70 bg-muted/10 p-2">
          <ScreenContent variant={variant} />
        </div>
        {/* Base */}
        <div className="-ml-2 h-2 w-[156px] rounded-b-md border border-t-border/80 border-border/60 bg-muted/30" />
      </div>

      {/* Phone (overlapping bottom-right) */}
      <div className="absolute bottom-0 right-0 box-border flex h-[92px] w-[52px] flex-col gap-1 rounded-[10px] border border-border/70 bg-muted/10 p-1.5 shadow-lg">
        <div className="mx-auto mb-0.5 h-[3px] w-3.5 rounded-sm bg-foreground/15" />
        {variant === "clash" ? (
          [1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1 rounded bg-muted/60 px-1 py-0.5">
              <div className={`h-1 w-1 rounded-full ${i === 1 ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
              <div className="h-[3px] flex-1 rounded-sm bg-foreground/15" />
            </div>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-5 w-5 rounded-full bg-primary/80" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const isMobile = !useMediaQuery("(min-width: 576px)");
  const [downloadApp, setDownloadApp] = useState<AppId | null>(null);
  const [downloadPlatform, setDownloadPlatform] = useState<DownloadPlatform>(() => defaultPlatform());
  usePageMeta({ title: HOME_TITLE, robots: "index, follow" });

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const ARCH_OPTIONS = [
    { key: "arm64-v8a", label: L.arch_arm64_label, badge: L.arch_arm64_badge, desc: L.arch_arm64_desc, highlight: true },
    { key: "universal", label: L.arch_universal_label, badge: L.arch_universal_badge, desc: L.arch_universal_desc, highlight: true },
    { key: "armeabi-v7a", label: L.arch_armv7_label, desc: L.arch_armv7_desc },
    { key: "x86_64", label: L.arch_x86_label, desc: L.arch_x86_desc },
  ];

  const FEATURES = [
    { icon: <Globe size={28} className="text-foreground" />, title: L.feat_infra_title, desc: L.feat_infra_desc },
    { icon: <Users size={28} className="text-foreground" />, title: L.feat_audience_title, desc: L.feat_audience_desc },
    {
      icon: <Smartphone size={28} className="text-foreground" />,
      title: L.feat_apps_title,
      desc: L.feat_apps_desc,
      onClick: () => scrollTo("apps"),
    },
  ];

  const COMPARE_ROWS: { label: string; clash: boolean | string; cheezy: boolean | string }[] = [
    { label: L.apps_row_multiplatform, clash: true, cheezy: true },
    { label: L.apps_row_import, clash: true, cheezy: false },
    { label: L.apps_row_thirdparty, clash: true, cheezy: false },
    { label: L.apps_row_trial, clash: false, cheezy: true },
    { label: L.apps_row_manage, clash: false, cheezy: true },
    { label: L.apps_row_opensource, clash: true, cheezy: L.apps_opensource_footnote },
  ];

  const openDownload = (app: AppId) => {
    setDownloadPlatform(defaultPlatform());
    setDownloadApp(app);
  };

  const desktopOptions = downloadApp ? desktopDownloads(downloadApp, L) : null;

  const STATS = [
    { value: STATS_VALUES[0], label: L.stat_uptime },
    { value: STATS_VALUES[1], label: L.stat_nodes },
    { value: STATS_VALUES[2], label: L.stat_throughput },
    { value: STATS_VALUES[3], label: L.stat_support },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-[100] flex w-full items-center justify-between border-b border-border bg-background/95 px-4 py-3.5 backdrop-blur-xl sm:px-12 sm:py-[18px]">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={isMobile ? 28 : 34} />
          <span className="text-[15px] font-semibold tracking-tight text-foreground sm:text-lg">
            {BRAND_NAME}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center sm:flex">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => scrollTo("features")}>
              {L.nav_solutions}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => scrollTo("stats")}>
              {L.nav_platform}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => scrollTo("individuals")}>
              {L.nav_individuals}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => scrollTo("business")}>
              {L.nav_business}
            </Button>
          </div>

          {/* Language toggle */}
          <Button
            variant="outline"
            size="sm"
            className="min-w-[34px] text-muted-foreground"
            onClick={toggle}
          >
            {L.lang_toggle}
          </Button>
          <Button size="sm" onClick={() => navigate("/login")}>
            {isMobile ? L.btn_login : L.header_portal}
          </Button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 py-16 text-center sm:px-6 sm:py-[100px]">
        <div className="relative mx-auto max-w-[800px]">
          <div className="mb-6 inline-block rounded-full border border-border bg-muted/40 px-3.5 py-1">
            <span className="text-[13px] tracking-wide text-muted-foreground">
              {L.hero_badge}
            </span>
          </div>

          <h1 className="mb-5 text-[28px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-6xl">
            {L.hero_title_1}
            <br />
            <span className="text-foreground/90">{L.hero_title_2}</span>
          </h1>

          <p className="mx-auto mb-10 max-w-[560px] text-base leading-[1.7] text-muted-foreground sm:text-lg">
            {L.hero_desc}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-11 px-7 text-[15px] sm:h-[50px] sm:text-base"
              onClick={() =>
                BOT_URL
                  ? window.open(BOT_URL, "_blank", "noopener")
                  : navigate("/register")
              }
            >
              {BOT_URL ? L.ind_cta : L.btn_get_started}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-7 text-[15px] sm:h-[50px] sm:text-base"
              onClick={() => navigate("/login")}
            >
              {L.btn_login}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section id="stats" className="border-y border-border bg-muted/20 px-4 py-7 sm:px-12 sm:py-10">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="min-w-[80px] text-center sm:min-w-[140px]">
              <div className="text-2xl font-bold leading-none text-foreground sm:text-[32px]">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-[1200px] px-4 py-14 sm:px-12 sm:py-24">
        <div className="mb-9 text-center sm:mb-16">
          <h2 className="mb-3 text-[26px] font-bold text-foreground sm:text-4xl">
            {L.features_title}
          </h2>
          <p className="text-base text-muted-foreground">
            {L.features_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className={`h-full p-5 transition-colors sm:p-7 ${f.onClick ? "cursor-pointer hover:border-emerald-500/40" : ""}`}
              onClick={f.onClick}
            >
              <div className="mb-3.5">{f.icon}</div>
              <h4 className="mb-2 text-[17px] font-bold text-foreground">
                {f.title}
              </h4>
              <p className="m-0 leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Apps comparison ───────────────────────────────────────────────── */}
      <section id="apps" className="mx-auto max-w-[1100px] px-4 py-14 sm:px-12 sm:py-24">
        <div className="mb-9 text-center sm:mb-14">
          <h2 className="mb-3 text-[26px] font-bold text-foreground sm:text-4xl">
            {L.apps_title}
          </h2>
          <p className="mx-auto max-w-[560px] text-base text-muted-foreground">
            {L.apps_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
          <Card className="flex h-full flex-col p-6 sm:p-8">
            <DeviceMockup variant="clash" />
            <div className="mb-2 mt-5 flex items-center gap-2">
              <Github size={18} className="text-muted-foreground" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {L.apps_clash_badge}
              </span>
            </div>
            <h3 className="mb-2.5 text-[22px] font-bold text-foreground">
              {L.apps_clash_title}
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {L.apps_clash_desc}
            </p>
            <span className="mb-2 block text-xs text-muted-foreground/80">
              {L.apps_platforms_label}
            </span>
            <PlatformBadges L={L} />
            <div className="mt-auto">
              <span className="mb-2 block text-xs text-muted-foreground/80">
                {L.apps_clash_protocols_label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CLASH_PROTOCOLS.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button variant="outline" className="h-[46px] px-6" onClick={() => openDownload("clash")}>
                  {L.apps_clash_cta}
                </Button>
                <Button variant="outline" className="h-[46px] px-5 text-muted-foreground" asChild>
                  <a href={CLASH_DOCS_URL} target="_blank" rel="noopener noreferrer">
                    <BookOpen size={16} />
                    {L.apps_clash_docs}
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="relative flex h-full flex-col border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
            <div className="absolute right-4 top-4 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1">
              <span className="text-[11px] font-semibold text-emerald-500">{L.apps_trial_badge}</span>
            </div>
            <DeviceMockup variant="cheezy" />
            <div className="mb-2 mt-5 flex items-center gap-2">
              <Smartphone size={18} className="text-foreground" />
              <span className="text-xs uppercase tracking-wide text-foreground">
                {L.apps_cheezy_badge}
              </span>
            </div>
            <h3 className="mb-2.5 text-[22px] font-bold text-foreground">
              {L.apps_cheezy_title}
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {L.apps_cheezy_desc}
            </p>
            <span className="mb-2 block text-xs text-muted-foreground/80">
              {L.apps_platforms_label}
            </span>
            <PlatformBadges L={L} />
            <Button
              className="mt-auto h-[46px] self-start px-6 font-semibold"
              onClick={() => openDownload("cheezy")}
            >
              {L.apps_cheezy_cta}
            </Button>
          </Card>
        </div>

        {/* Feature comparison table */}
        <Card className="mt-8 overflow-hidden p-0">
          <div className="grid grid-cols-[1fr_50px_50px] bg-muted/20 px-3.5 py-3 sm:grid-cols-[1fr_160px_160px] sm:px-6">
            <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
              {L.apps_compare_feature}
            </span>
            <span className="text-center text-xs font-semibold text-foreground sm:text-sm">
              {L.apps_clash_title}
            </span>
            <span className="text-center text-xs font-semibold text-foreground sm:text-sm">
              {L.apps_cheezy_title}
            </span>
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_50px_50px] items-center px-3.5 py-3 sm:grid-cols-[1fr_160px_160px] sm:px-6 ${i === 0 ? "" : "border-t border-border"}`}
            >
              <span className="text-[13px] text-foreground/85 sm:text-sm">{row.label}</span>
              <div className="text-center">
                {row.clash === true ? (
                  <Check size={16} className="inline-block text-emerald-500" />
                ) : row.clash ? (
                  <span title={String(row.clash)} className="inline-block">
                    <HelpCircle size={16} className="text-emerald-500" aria-label="Footnote" />
                  </span>
                ) : (
                  <X size={16} className="inline-block text-muted-foreground/40" />
                )}
              </div>
              <div className="text-center">
                {row.cheezy === true ? (
                  <Check size={16} className="inline-block text-emerald-500" />
                ) : row.cheezy ? (
                  <span title={String(row.cheezy)} className="inline-block">
                    <HelpCircle size={16} className="text-emerald-500" aria-label="Footnote" />
                  </span>
                ) : (
                  <X size={16} className="inline-block text-muted-foreground/40" />
                )}
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* ── For individuals ────────────────────────────────────────────────── */}
      <section
        id="individuals"
        className="mx-4 mb-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-10 text-center sm:mx-12 sm:mb-16 sm:px-10 sm:py-16"
      >
        <span className="text-[13px] tracking-wide text-emerald-500">
          {L.ind_badge}
        </span>
        <h2 className="my-3 text-[22px] font-bold text-foreground sm:text-[30px]">
          {L.ind_title}
        </h2>
        <p className="mx-auto mb-8 max-w-[620px] text-base text-muted-foreground">
          {L.ind_desc}
        </p>
        <Button
          size="lg"
          className="h-[50px] px-10 text-base font-semibold"
          onClick={() =>
            BOT_URL ? window.open(BOT_URL, "_blank", "noopener") : navigate("/register")
          }
        >
          {BOT_URL ? L.ind_cta : L.btn_create_account}
        </Button>
      </section>

      {/* ── For business / partnership ─────────────────────────────────────── */}
      <section id="business" className="mx-auto w-full max-w-[720px] px-4 pb-14 sm:px-12 sm:pb-24">
        <div className="mb-7 text-center">
          <span className="text-[13px] tracking-wide text-muted-foreground">
            {L.biz_badge}
          </span>
          <h2 className="my-3 text-2xl font-bold text-foreground sm:text-[32px]">
            {L.biz_title}
          </h2>
          <p className="m-0 text-base text-muted-foreground">
            {L.biz_desc}
          </p>
        </div>
        <Card className="p-5 sm:p-8">
          <PartnershipForm />
        </Card>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-4 py-8 sm:px-12">
        {/* Links row */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-2">
            <BrandLogo size={26} />
            <span className="text-[15px] font-semibold text-foreground">{BRAND_NAME}</span>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-7">
            <Link to="/policy" className="text-[13px] text-muted-foreground hover:text-foreground">
              {L.footer_policy}
            </Link>
            <Link to="/agreement" className="text-[13px] text-muted-foreground hover:text-foreground">
              {L.footer_agreement}
            </Link>
            <Link to="/offer" className="text-[13px] text-muted-foreground hover:text-foreground">
              {L.footer_offer}
            </Link>
            {BOT_URL && (
              <a
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-muted-foreground hover:text-foreground"
              >
                {L.footer_telegram}
              </a>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
          <span className="text-[13px] text-muted-foreground/70">
            © {new Date().getFullYear()} {BRAND_NAME}. {L.footer_rights}
          </span>
          <span className="text-xs text-muted-foreground/50">
            {L.footer_tagline}
          </span>
        </div>

        {/* Compliance disclaimer */}
        <span className="mt-4 block text-center text-xs text-muted-foreground/40">
          {L.footer_disclaimer}
        </span>
      </footer>

      {/* ── Download picker modal ────────────────────────────────────────── */}
      <Dialog open={downloadApp !== null} onOpenChange={(open) => !open && setDownloadApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {downloadApp === "clash" ? L.apps_clash_title : L.apps_cheezy_title}
            </DialogTitle>
          </DialogHeader>

          <p className="mb-2 text-muted-foreground">
            {L.download_modal_subtitle}
          </p>

          <div className="mb-2 grid grid-cols-2 gap-2">
            {PLATFORM_BADGES.map(({ key, labelKey, icon }) => (
              <Button
                key={key}
                variant={downloadPlatform === key ? "default" : "outline"}
                className="h-11 gap-2"
                onClick={() => setDownloadPlatform(key)}
              >
                {icon}
                {L[labelKey]}
              </Button>
            ))}
          </div>

          {downloadPlatform === "android" ? (
            <>
              <p className="mb-3 text-[13px] text-muted-foreground">
                {L.arch_modal_subtitle}
              </p>
              <div className="flex flex-col gap-2.5">
                {ARCH_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => {
                      if (downloadApp) window.open(apkUrl(downloadApp, opt.key), "_blank", "noopener");
                      setDownloadApp(null);
                    }}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors hover:bg-accent/50 ${
                      opt.highlight ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-foreground">
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] text-muted-foreground">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              {(desktopOptions?.[downloadPlatform] ?? []).map((opt) => (
                <a
                  key={opt.url}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setDownloadApp(null);
                  }}
                  className="rounded-xl border border-border bg-muted/20 p-4 no-underline transition-colors hover:bg-accent/50"
                >
                  <span className="text-[15px] font-semibold text-foreground">
                    {opt.label}
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a
              href={downloadApp === "clash" ? CLASH_RELEASES_URL : CHEEZY_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted-foreground/60 hover:text-muted-foreground"
            >
              {L.arch_modal_all_releases}
            </a>
            {downloadApp === "clash" && (
              <a
                href={CLASH_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-muted-foreground/60 hover:text-muted-foreground"
              >
                {L.apps_clash_docs}
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
