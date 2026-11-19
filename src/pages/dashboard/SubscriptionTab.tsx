import { Calendar, ChevronDown, ExternalLink, MonitorSmartphone, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { badgeVariants, type BadgeProps } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { managedSubscriptions, me, type ManagedSubscription, type SubscriptionInfo } from "../../api/client";
import { subscriptionName } from "../../lib/subscription-name";
import { trackEvent } from "../../analytics";
import { useLang } from "../../locale";

function SubscriptionCard({ sub, name, compact, onRenew, onSetPrimary, saving }: {
  sub: SubscriptionInfo | ManagedSubscription;
  name: string;
  compact?: boolean;
  onRenew: () => void;
  onSetPrimary?: () => void;
  saving: boolean;
}) {
  const { L, lang } = useLang();
  const status: Record<string, [string, BadgeProps["variant"]]> = {
    active: [L.status_active, "success"], expired: [L.status_expired, "destructive"],
    disabled: [L.status_disabled, "secondary"], limited: [L.status_limited, "warning"],
  };
  const [statusText, variant] = status[sub.status ?? ""] ?? [sub.status || "—", "secondary"];
  const until = sub.expire_iso && new Date(sub.expire_iso);
  const term = until && Number.isFinite(until.getTime())
    ? L.expires_on(until.toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" }))
    : `${L.label_days_left}: ${sub.days_left}`;
  const metadata = [name !== sub.tariff && sub.tariff, term].filter(Boolean).join(" · ");
  const connection = sub.status === "active" && sub.subscription_url;
  const limit = sub.data_limit_gb;
  const usage = limit && limit > 0 ? Math.min(100, Math.max(0, 100 * sub.traffic_used_gb / limit)) : null;
  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });

  const heading = (
    <>
      <span className="min-w-0 text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">{name}</span>
      <span className="flex flex-wrap items-center justify-end gap-1.5">
        {"is_primary" in sub && sub.is_primary && <span className={badgeVariants({ variant: "outline" })}>{L.primary_subscription}</span>}
        <span className={badgeVariants({ variant, className: variant === "destructive" ? "bg-destructive/15 text-destructive" : undefined })}>
          {statusText}
        </span>
      </span>
      <span className="col-span-2 row-start-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">{metadata}</span>
    </>
  );
  const body = (
    <div className="px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border py-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span>{usage !== null && limit ? L.traffic_amount(number.format(sub.traffic_used_gb), number.format(limit)) : L.traffic_unlimited}</span>
          {usage !== null && <Progress aria-hidden="true" className="h-1.5 w-20" value={usage} indicatorClassName={usage >= 90 ? "bg-destructive" : undefined} />}
        </div>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <MonitorSmartphone size={16} />{L.devices_count(sub.devices_count)}
        </span>
      </div>
      <div className="grid gap-2 sm:flex sm:flex-wrap">
        {connection && (
          <Button asChild>
            <a href={connection} target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent("connection_setup_clicked", { setup_source: "subscription" })}>
              {L.setup_connection}<ExternalLink />
            </a>
          </Button>
        )}
        <Button variant={connection ? "outline" : "default"} onClick={() => {
          trackEvent("renewal_selected", { days_remaining: Math.max(0, sub.days_left) });
          onRenew();
        }}>{L.renew_subscription}</Button>
        {onSetPrimary && <Button variant="ghost" onClick={onSetPrimary} disabled={saving}>{L.make_primary}</Button>}
      </div>
    </div>
  );
  return compact ? (
    <details className="group rounded-xl border border-border bg-card">
      <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-1 rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-ring sm:px-6 [&::-webkit-details-marker]:hidden">
        {heading}<ChevronDown size={16} className="col-start-3 row-span-2 row-start-1 text-muted-foreground group-open:rotate-180" />
      </summary>
      {body}
    </details>
  ) : (
    <article className="rounded-xl border border-border bg-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 p-4 sm:px-6 sm:py-5">{heading}</header>
      {body}
    </article>
  );
}

export default function SubscriptionTab({ onBuy, onRenew }: {
  onBuy: () => void;
  onRenew: (id?: number) => void;
}) {
  const { L } = useLang();
  const [legacy, setLegacy] = useState<SubscriptionInfo | null>(null);
  const [subscriptions, setSubscriptions] = useState<ManagedSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const overviewReported = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [profile, managed] = await Promise.all([me.get(), managedSubscriptions.list()]);
      setLegacy(profile.subscription);
      setSubscriptions([...managed.subscriptions].sort((a, b) => Number(b.is_primary) - Number(a.is_primary)));
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (loading || error || overviewReported.current) return;
    overviewReported.current = true;
    const visible = subscriptions.length ? subscriptions : legacy ? [legacy] : [];
    trackEvent("subscription_overview_viewed", {
      subscription_count: visible.length,
      active_subscription_count: visible.filter(sub => sub.status === "active").length,
    });
  }, [loading, error, subscriptions, legacy]);

  async function makePrimary(id: number) {
    setSaving(true);
    try {
      await managedSubscriptions.setPrimary(id);
      trackEvent("primary_subscription_changed");
      await load();
    } catch { toast.error(L.primary_failed); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl">
      <div className="dashboard-heading">
        <h1 className="dashboard-title">{L.sub_title}</h1>
        <Button variant="outline" onClick={load} disabled={loading || saving}>
          {loading ? <Spinner /> : <RefreshCw />}{L.btn_refresh}
        </Button>
      </div>
      {error ? (
        <Alert variant="destructive"><AlertDescription>{L.err_load_sub}</AlertDescription></Alert>
      ) : subscriptions.length ? (
        <div className="grid gap-3">
          {subscriptions.map((sub, index) => (
            <SubscriptionCard key={sub.id} sub={sub} name={subscriptionName(sub, subscriptions)} compact={index > 0}
              onRenew={() => onRenew(sub.id)} onSetPrimary={sub.is_primary ? undefined : () => makePrimary(sub.id)} saving={saving} />
          ))}
        </div>
      ) : legacy ? (
        <SubscriptionCard sub={legacy} name={legacy.tariff} onRenew={() => onRenew()} saving={false} />
      ) : loading ? (
        <div className="py-16 text-center"><Spinner className="mx-auto h-8 w-8" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
          <Calendar className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="mb-5 text-lg font-semibold">{L.no_sub_title}</h2>
          <Button onClick={onBuy}>{L.btn_buy_sub}</Button>
        </div>
      )}
    </div>
  );
}
