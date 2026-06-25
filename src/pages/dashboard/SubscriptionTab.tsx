import { Alert, Button, Progress, Spin, Tag, Typography } from "antd";
import { CalendarOutlined, LinkOutlined, ReloadOutlined, WifiOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { me, MeResponse, SubscriptionInfo } from "../../api/client";
import { useLang } from "../../locale";

const { Title, Text } = Typography;

function SubCard({ sub, L }: { sub: SubscriptionInfo; L: ReturnType<typeof useLang>["L"] }) {
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
  const statusColorMap: Record<string, string> = {
    active: "success", expired: "error", disabled: "default", limited: "warning",
  };

  return (
    <div className="sub-card">
      <div className="sub-card__header">
        <span className="sub-card__tariff">{sub.tariff}</span>
        <Tag color={statusColorMap[sub.status || ""] || "default"}>
          {statusMap[sub.status || ""] || sub.status || "—"}
        </Tag>
      </div>

      <div className="sub-card__days-row">
        <span className="sub-card__days-num">{sub.days_left}</span>
        <span className="sub-card__days-label">{L.label_days_left.toLowerCase()}</span>
      </div>

      {sub.data_limit_gb && sub.data_limit_gb > 0 ? (
        <div className="sub-card__progress">
          <Progress
            percent={usagePct}
            strokeColor={usagePct >= 90 ? "#FF8A8A" : "url(#progressGrad)"}
            trailColor="rgba(255,255,255,0.09)"
            status={usagePct >= 95 ? "exception" : "active"}
            format={(pct) => (
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{pct}%</Text>
            )}
          />
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            {sub.traffic_used_gb.toFixed(2)} GB / {sub.data_limit_gb} GB
          </Text>
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

      {sub.status === "active" && sub.subscription_url && (
        <div style={{ padding: "12px 22px 18px" }}>
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={() => window.open(sub.subscription_url!, "_blank")}
            style={{ borderRadius: 12 }}
          >
            {L.copy_sub_link}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionTab({ onBuyClick }: { onBuyClick: () => void }) {
  const { L } = useLang();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await me.get()); }
    catch { setError(L.err_load_sub); }
    finally { setLoading(false); }
  }, [L]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          <WifiOutlined style={{ marginRight: 8 }} />{L.sub_title}
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
          loading={loading}
          style={{ borderRadius: 10 }}
        >
          {L.btn_refresh}
        </Button>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
      ) : error ? (
        <Alert type="error" message={error} showIcon style={{ borderRadius: 12 }} />
      ) : data?.subscription ? (
        <SubCard sub={data.subscription} L={L} />
      ) : (
        <div style={{
          textAlign: "center",
          padding: "60px 24px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          border: "1px dashed rgba(255,255,255,0.10)",
        }}>
          <CalendarOutlined style={{ fontSize: 48, color: "rgba(255,255,255,0.2)", marginBottom: 16 }} />
          <Title level={4} style={{ color: "rgba(255,255,255,0.5)" }}>{L.no_sub_title}</Title>
          <Text style={{ color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 24 }}>{L.no_sub_text}</Text>
          <Button type="primary" size="large" onClick={onBuyClick} style={{ borderRadius: 12 }}>
            {L.btn_buy_sub}
          </Button>
        </div>
      )}
    </div>
  );
}
