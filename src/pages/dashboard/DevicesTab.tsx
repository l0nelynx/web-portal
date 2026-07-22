import { Laptop, Smartphone, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
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
import { useLang } from "../../locale";

function platformIcon(platform: string | null) {
  const p = (platform || "").toLowerCase();
  if (p.includes("android") || p.includes("ios") || p.includes("mobile"))
    return <Smartphone size={18} />;
  return <Laptop size={18} />;
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
      toast.error(msg);
    } finally {
      setRemovingHwid(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h4 className="m-0 flex items-center gap-2 text-lg font-semibold text-white">
          <Laptop size={18} />
          {L.dev_title}
          {data && <Badge variant="secondary">{data.total}</Badge>}
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
      ) : !data?.devices.length ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <Laptop className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <span className="block text-white/35">{L.no_devices}</span>
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
                    <span className="ml-2">
                      · {new Date(dev.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="device-card__actions">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
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
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
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

      <span className="mt-3 block text-xs text-white/30">
        {L.dev_auto_registered}
      </span>
    </div>
  );
}
