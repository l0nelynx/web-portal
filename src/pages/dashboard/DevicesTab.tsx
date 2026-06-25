import { Alert, Button, Modal, Popconfirm, Spin, Tag, Typography } from "antd";
import { DeleteOutlined, LaptopOutlined, MobileOutlined, ReloadOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { ApiError, devices, DeviceItem } from "../../api/client";
import { useLang } from "../../locale";

const { Title, Text } = Typography;

function platformIcon(platform: string | null) {
  const p = (platform || "").toLowerCase();
  if (p.includes("android") || p.includes("ios") || p.includes("mobile"))
    return <MobileOutlined />;
  return <LaptopOutlined />;
}

export default function DevicesTab() {
  const { L } = useLang();
  const [data, setData] = useState<{ total: number; devices: DeviceItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingHwid, setRemovingHwid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const resp = await devices.list(); setData(resp); }
    catch { setError(L.err_load_dev); }
    finally { setLoading(false); }
  }, [L]);

  useEffect(() => { load(); }, [load]);

  async function handleRemove(hwid: string) {
    setRemovingHwid(hwid);
    try {
      await devices.remove(hwid);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError && e.status === 429 ? L.err_rate_limited_dev : L.err_remove_dev;
      Modal.error({ title: "Error", content: msg, centered: true });
    } finally {
      setRemovingHwid(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          <LaptopOutlined style={{ marginRight: 8 }} />
          {L.dev_title}
          {data && (
            <Tag style={{ marginLeft: 8, verticalAlign: "middle" }}>{data.total}</Tag>
          )}
        </Title>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading} style={{ borderRadius: 10 }}>
          {L.btn_refresh}
        </Button>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
      ) : error ? (
        <Alert type="error" message={error} showIcon style={{ borderRadius: 12 }} />
      ) : !data?.devices.length ? (
        <div style={{
          textAlign: "center",
          padding: "48px 24px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          border: "1px dashed rgba(255,255,255,0.10)",
        }}>
          <LaptopOutlined style={{ fontSize: 40, color: "rgba(255,255,255,0.2)", marginBottom: 12 }} />
          <Text style={{ display: "block", color: "rgba(255,255,255,0.35)" }}>{L.no_devices}</Text>
        </div>
      ) : (
        <div>
          {data.devices.map((dev) => (
            <div key={dev.hwid} className="device-card">
              <div className="device-card__icon">
                {platformIcon(dev.platform)}
              </div>
              <div className="device-card__body">
                <div className="device-card__name">{dev.device_model || L.unknown_device}</div>
                <div className="device-card__meta">
                  {[dev.platform, dev.os_version].filter(Boolean).join(" · ")}
                  {dev.created_at && (
                    <span style={{ marginLeft: 8 }}>
                      · {new Date(dev.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="device-card__actions">
                <Popconfirm
                  title={L.confirm_remove}
                  description={L.confirm_remove_desc}
                  onConfirm={() => handleRemove(dev.hwid)}
                  okText={L.ok_remove}
                  cancelText={L.cancel}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={removingHwid === dev.hwid}
                    style={{ borderRadius: 8 }}
                  />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      <Text style={{ display: "block", marginTop: 12, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
        {L.dev_auto_registered}
      </Text>
    </div>
  );
}
