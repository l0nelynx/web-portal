import { Calendar, Link as LinkIcon, RefreshCw, Wifi } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ManagedSubscription,
  managedSubscriptions,
  me,
  MeResponse,
  SubscriptionInfo,
} from "../../api/client";
import { useLang } from "../../locale";

function SubCard({
  sub,
  L,
  isRu,
  onBuy,
  onSetPrimary,
}: {
  sub: SubscriptionInfo | ManagedSubscription;
  L: ReturnType<typeof useLang>["L"];
  isRu: boolean;
  onBuy: () => void;
  onSetPrimary?: () => void;
}) {
  const usagePct =
    sub.data_limit_gb && sub.data_limit_gb > 0
      ? Math.min(100, Math.round((sub.traffic_used_gb / sub.data_limit_gb) * 100))
      : 0;

  const statusMap: Record<string, string> = {
    active: L.status_active,
    expired: L.status_expired,
    disabled: L.status_disabled,
    limited: L.status_limited,
  };
  const statusVariantMap: Record<string, "success" | "destructive" | "secondary" | "warning"> = {
    active: "success", expired: "destructive", disabled: "secondary", limited: "warning",
  };

  return (
    <div className="sub-card">
      <div className="sub-card__header">
        <span className="sub-card__tariff">{sub.tariff}</span>
        <div className="flex items-center gap-2">
          {"is_primary" in sub && sub.is_primary && (
            <Badge variant="outline">{isRu ? "Основной" : "Primary"}</Badge>
          )}
          <Badge variant={statusVariantMap[sub.status || ""] || "secondary"}>
            {statusMap[sub.status || ""] || sub.status || "—"}
          </Badge>
        </div>
      </div>

      <div className="sub-card__days-row">
        <span className="sub-card__days-num">{sub.days_left}</span>
        <span className="sub-card__days-label">{L.label_days_left.toLowerCase()}</span>
      </div>

      {sub.data_limit_gb && sub.data_limit_gb > 0 ? (
        <div className="sub-card__progress">
          <div className="flex items-center gap-2">
            <Progress
              value={usagePct}
              className={usagePct >= 90 ? "progress-danger" : undefined}
            />
            <span className="text-xs text-muted-foreground">{usagePct}%</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {sub.traffic_used_gb.toFixed(2)} GB / {sub.data_limit_gb} GB
          </span>
        </div>
      ) : null}

      <div className="sub-card__stats">
        <div className="sub-card__stat">
          <span className="sub-card__stat-val">{sub.devices_count}</span>
          <span className="sub-card__stat-label">{L.label_devices}</span>
        </div>
        <div className="sub-card__stat">
          <span className="sub-card__stat-val">
            {sub.data_limit_gb ? `${sub.traffic_used_gb.toFixed(1)} GB` : "∞"}
          </span>
          <span className="sub-card__stat-label">{L.label_traffic}</span>
        </div>
        {sub.expire_iso && (
          <div className="sub-card__stat">
            <span className="sub-card__stat-val">
              {new Date(sub.expire_iso).toLocaleDateString()}
            </span>
            <span className="sub-card__stat-label">{L.label_expires}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 px-[22px] pb-[18px] pt-3">
        {sub.status === "active" && sub.subscription_url && (
          <Button className="rounded-xl" onClick={() => window.open(sub.subscription_url!, "_blank")}>
            <LinkIcon className="h-4 w-4" />
            {L.copy_sub_link}
          </Button>
        )}
        <Button className="rounded-xl" variant="outline" onClick={onBuy}>
          {isRu ? "Продлить" : "Renew"}
        </Button>
        {onSetPrimary && (
          <Button className="rounded-xl" variant="ghost" onClick={onSetPrimary}>
            {isRu ? "Сделать основным" : "Make primary"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionTab({ onBuyClick }: { onBuyClick: (id?: number) => void }) {
  const { L, lang } = useLang();
  const isRu = lang === "ru";
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<ManagedSubscription[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meResponse, managed] = await Promise.all([me.get(), managedSubscriptions.list()]);
      setData(meResponse);
      setSubscriptions(managed.subscriptions);
    }
    catch { setError(L.err_load_sub); }
    finally { setLoading(false); }
  }, [L]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h4 className="m-0 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Wifi size={18} />{L.sub_title}
        </h4>
        <Button variant="outline" onClick={load} disabled={loading} className="rounded-lg">
          {loading ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          {L.btn_refresh}
        </Button>
      </div>

      {loading && !data ? (
        <div className="py-16 text-center"><Spinner className="mx-auto h-8 w-8" /></div>
      ) : error ? (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : subscriptions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {subscriptions.map((sub) => (
            <SubCard
              key={sub.id}
              sub={sub}
              L={L}
              isRu={isRu}
              onBuy={() => onBuyClick(sub.id)}
              onSetPrimary={sub.is_primary ? undefined : async () => {
                await managedSubscriptions.setPrimary(sub.id);
                await load();
              }}
            />
          ))}
        </div>
      ) : data?.subscription ? (
        <SubCard sub={data.subscription} L={L} isRu={isRu} onBuy={() => onBuyClick()} />
      ) : (
        <div className="rounded-[20px] border border-dashed border-border bg-card px-6 py-16 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h4 className="text-lg font-semibold text-muted-foreground">{L.no_sub_title}</h4>
          <span className="mb-6 block text-muted-foreground">{L.no_sub_text}</span>
          <Button size="lg" onClick={() => onBuyClick()} className="rounded-xl">
            {L.btn_buy_sub}
          </Button>
        </div>
      )}
    </div>
  );
}
