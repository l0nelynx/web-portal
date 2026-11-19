import {
  ChevronLeft,
  ChevronRight,
  Headset,
  Laptop,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";
import { pageView } from "../analytics";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import SubscriptionTab from "./dashboard/SubscriptionTab";
import BuyTab from "./dashboard/BuyTab";
import DevicesTab from "./dashboard/DevicesTab";
import SettingsTab from "./dashboard/SettingsTab";
import SupportTab from "./dashboard/SupportTab";

type TabKey = "subscription" | "buy" | "devices" | "support" | "settings";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { L, toggle } = useLang();
  const isMobile = !useMediaQuery("(min-width: 768px)");

  const requestedTab = searchParams.get("tab");
  const tab: TabKey = ["subscription", "buy", "devices", "support", "settings"].includes(
    requestedTab ?? ""
  ) ? requestedTab as TabKey : "subscription";
  const requestedSubscriptionId = Number(searchParams.get("subscription_id"));
  const targetId = Number.isSafeInteger(requestedSubscriptionId) && requestedSubscriptionId > 0
    ? requestedSubscriptionId : undefined;
  const renewing = tab === "buy" && (!!targetId || searchParams.get("renew") === "1");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => { pageView(`/dashboard/${tab}`); }, [tab]);

  const MENU_ITEMS: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: "subscription", icon: <Wifi size={16} />, label: L.menu_subscription },
    { key: "buy", icon: <ShoppingCart size={16} />, label: L.menu_buy },
    { key: "devices", icon: <Laptop size={16} />, label: L.menu_devices },
    { key: "support", icon: <Headset size={16} />, label: L.menu_support },
    { key: "settings", icon: <ShieldCheck size={16} />, label: L.menu_settings },
  ];

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function selectTab(key: TabKey, subscriptionId?: number, renew = false) {
    setDrawerOpen(false);
    const next = new URLSearchParams();
    if (key !== "subscription") next.set("tab", key);
    if (key === "buy" && subscriptionId) {
      next.set("subscription_id", String(subscriptionId));
    }
    if (renew && !subscriptionId) next.set("renew", "1");
    if (next.toString() !== searchParams.toString()) setSearchParams(next);
  }

  function renderTab() {
    switch (tab) {
      case "subscription": return <SubscriptionTab onBuy={() => selectTab("buy")} onRenew={(id) => selectTab("buy", id, true)} />;
      case "buy": return (
        <BuyTab key={targetId ?? String(renewing)} targetSubscriptionId={targetId} renewing={renewing} />
      );
      case "devices": return <DevicesTab />;
      case "support": return <SupportTab />;
      case "settings": return <SettingsTab />;
    }
  }

  const shortName = BRAND_NAME.split(" ")[0];

  /* ── Sidebar content shared between sidebar and drawer ─────────────── */
  function renderNav(drawer = false) {
    const collapsedNow = collapsed && !drawer;
    return (
      <div className="flex h-full flex-col">
        <Link
          to="/"
          className={cn(
            "flex flex-shrink-0 items-center gap-2.5 overflow-hidden border-b border-border py-5 no-underline transition-[padding]",
            collapsedNow ? "px-[18px]" : "px-6",
          )}
        >
          <BrandLogo size={32} style={{ flexShrink: 0 }} />
          {!collapsedNow && (
            <span className="whitespace-nowrap text-[15px] font-semibold text-foreground">{shortName}</span>
          )}
        </Link>

        <div className="flex-1 overflow-y-auto py-3">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => selectTab(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
              title={collapsedNow ? item.label : undefined}
              className={cn(
                "mx-2 mb-1 flex w-[calc(100%-16px)] items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors",
                collapsedNow && "justify-center px-0",
                tab === item.key
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {item.icon}
              {!collapsedNow && item.label}
            </button>
          ))}
        </div>

        {!drawer && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={L.toggle_sidebar}
            className="mx-2 mb-1 flex flex-shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs text-muted-foreground hover:bg-accent"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        <div className={cn("flex-shrink-0 border-t border-border p-3", drawer ? "pb-6" : "pb-14")}>
          <Button
            variant="outline"
            onClick={handleLogout}
            title={collapsedNow ? L.btn_logout : undefined}
            className={cn(
              "w-full gap-2 rounded-lg",
              collapsedNow ? "justify-center px-0" : "justify-start",
            )}
          >
            <LogOut size={16} />
            {!collapsedNow && L.btn_logout}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      {!isMobile && (
        <div
          className="sticky top-0 h-screen flex-shrink-0 overflow-hidden border-r border-border bg-sidebar transition-[width] duration-200"
          style={{ width: collapsed ? 80 : 220 }}
        >
          {renderNav()}
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {/* Header */}
        <div
          className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-border"
          style={{ padding: isMobile ? "0 16px" : "0 32px" }}
        >
          <div className="flex items-center gap-3">
            {isMobile ? (
              <>
                <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={L.dashboard_navigation}><Menu /></Button>
                  </SheetTrigger>
                  <SheetContent side="left" aria-describedby={undefined} className="w-60 p-0">
                    <SheetTitle className="sr-only">{L.dashboard_navigation}</SheetTitle>
                    {renderNav(true)}
                  </SheetContent>
                </Sheet>
                <span className="text-sm font-medium">
                  {renewing ? L.renew_subscription : MENU_ITEMS.find(item => item.key === tab)?.label}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{L.header_portal}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="min-w-[34px] rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
            >
              {L.lang_toggle}
            </button>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {(user?.email || "U")[0].toUpperCase()}
            </div>
            {!isMobile && <span className="max-w-[40vw] truncate text-sm text-foreground">{user?.email || "—"}</span>}
          </div>
        </div>

        {/* Content — only this area scrolls */}
        <main key={tab}
          className="flex-1 overflow-y-auto"
          style={{
            padding: isMobile ? "16px" : "32px 40px",
            maxWidth: isMobile ? "100%" : 1100,
            width: "100%",
          }}
        >
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
