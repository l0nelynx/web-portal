import { Laptop, Smartphone, Trash2, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiError, devices, DeviceItem } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { trackEvent } from "../../analytics";
import { useLang } from "../../locale";

function platformIcon(platform: string | null) {
  const p = (platform || "").toLowerCase();
  if (p.includes("android") || p.includes("ios") || p.includes("mobile"))
    return <Smartphone size={18} />;
  return <Laptop size={18} />;
}

export default function DevicesTab() {
  const { L, lang } = useLang();
  const { profile } = useAuth();
  const connection = profile?.subscription?.status === "active" && profile.subscription.subscription_url;
  const [data, setData] = useState<{ total: number; devices: DeviceItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingHwid, setRemovingHwid] = useState<string | null>(null);
  const listReported = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const resp = await devices.list(); setData(resp); }
    catch { setError(L.err_load_dev); }
    finally { setLoading(false); }
  }, [L]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (loading || error || !data || listReported.current) return;
    listReported.current = true;
    trackEvent("device_list_viewed", { device_count: data.total });
  }, [loading, error, data]);

  async function handleRemove(hwid: string) {
    setRemovingHwid(hwid);
    try {
      await devices.remove(hwid);
      trackEvent("device_removed");
      await load();
    } catch (e) {
      const msg = e instanceof ApiError && e.status === 429 ? L.err_rate_limited_dev : L.err_remove_dev;
      toast.error(msg);
    } finally {
      setRemovingHwid(null);
    }
  }

  return (
    <div>
      <div className="dashboard-heading">
        <h1 className="dashboard-title flex items-center gap-2">
          {L.dev_title}
          {data && <Badge variant="secondary">{data.total}</Badge>}
        </h1>
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
      ) : !data?.devices.length ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <Laptop className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{L.no_devices}</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">{L.dev_auto_registered}</p>
          <Button asChild variant="outline" onClick={() => trackEvent("connection_setup_clicked", {
            setup_source: connection ? "devices_subscription" : "devices_guide",
          })}>
            {connection
              ? <a href={connection} target="_blank" rel="noopener noreferrer">{L.setup_connection}</a>
              : <Link to="/instruction">{L.setup_connection}</Link>}
          </Button>
        </div>
      ) : (
        <div className="dashboard-list">
          {data.devices.map((dev) => (
            <div key={dev.hwid} className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                {platformIcon(dev.platform)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium [overflow-wrap:anywhere]">{dev.device_model || L.unknown_device}</div>
                <div className="text-sm text-muted-foreground">
                  {[dev.platform, dev.os_version].filter(Boolean).join(" · ")}
                  {dev.created_at && (
                    <span className="ml-2">
                      · {new Date(dev.created_at).toLocaleDateString(lang)}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      aria-label={`${L.ok_remove} · ${dev.device_model || L.unknown_device}`}
                      size="icon"
                      disabled={removingHwid === dev.hwid}
                      className="h-8 w-8 rounded-lg"
                    >
                      {removingHwid === dev.hwid ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{L.confirm_remove}</AlertDialogTitle>
                      <AlertDialogDescription>{L.confirm_remove_desc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{L.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-background hover:bg-destructive/95"
                        onClick={() => handleRemove(dev.hwid)}
                      >
                        {L.ok_remove}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {!!data?.devices.length && !error && <p className="mt-3 text-sm text-muted-foreground">{L.dev_auto_registered}</p>}
    </div>
  );
}
