import { App, Avatar, Button, Drawer, Grid, Layout, Menu, Typography } from "antd";
import {
  LaptopOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLang } from "../locale";
import BrandLogo from "../components/BrandLogo";
import { BRAND_NAME } from "../branding";
import SubscriptionTab from "./dashboard/SubscriptionTab";
import BuyTab from "./dashboard/BuyTab";
import DevicesTab from "./dashboard/DevicesTab";
import SettingsTab from "./dashboard/SettingsTab";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

type TabKey = "subscription" | "buy" | "devices" | "settings";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { L, toggle } = useLang();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [tab, setTab] = useState<TabKey>("subscription");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const MENU_ITEMS = [
    { key: "subscription", icon: <WifiOutlined />, label: L.menu_subscription },
    { key: "buy", icon: <ShoppingCartOutlined />, label: L.menu_buy },
    { key: "devices", icon: <LaptopOutlined />, label: L.menu_devices },
    { key: "settings", icon: <SafetyCertificateOutlined />, label: L.menu_settings },
  ];

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function selectTab(key: TabKey) {
    setTab(key);
    setDrawerOpen(false);
  }

  function renderTab() {
    switch (tab) {
      case "subscription": return <SubscriptionTab onBuyClick={() => selectTab("buy")} />;
      case "buy": return <BuyTab />;
      case "devices": return <DevicesTab />;
      case "settings": return <SettingsTab />;
    }
  }

  const shortName = BRAND_NAME.split(" ")[0];

  /* ── Sidebar content shared between Sider and Drawer ─────────────── */
  function NavContent({ drawer = false }: { drawer?: boolean }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed && !drawer ? "20px 18px" : "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
            flexShrink: 0,
            textDecoration: "none",
            transition: "padding 0.2s",
          }}
        >
          <BrandLogo size={32} style={{ flexShrink: 0 }} />
          {(!collapsed || drawer) && (
            <Text strong style={{ color: "#fff", fontSize: 15, whiteSpace: "nowrap" }}>
              {shortName}
            </Text>
          )}
        </Link>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <Menu
            mode="inline"
            selectedKeys={[tab]}
            items={MENU_ITEMS}
            onClick={({ key }) => selectTab(key as TabKey)}
            style={{ background: "transparent", border: "none", padding: "12px 0" }}
            theme="dark"
          />
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: drawer ? "12px 12px 24px" : "12px 12px 60px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              borderRadius: 10,
              textAlign: "left",
            }}
          >
            {(!collapsed || drawer) && L.btn_logout}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <App>
      {/* Mobile navigation drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={240}
          closable={false}
          styles={{
            body: { padding: 0, background: "#0D0D1A", height: "100%" },
            mask: { background: "rgba(0,0,0,0.6)" },
          }}
        >
          <NavContent drawer />
        </Drawer>
      )}

      <Layout style={{ height: "100vh", overflow: "hidden", background: "#0B0B14" }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={220}
            style={{
              height: "100vh",
              position: "sticky",
              top: 0,
              background: "rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            <NavContent />
          </Sider>
        )}

        {/* Main area */}
        <Layout
          style={{ background: "#0B0B14", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* Header */}
          <Header
            style={{
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: isMobile ? "0 16px" : "0 32px",
              height: 60,
              flexShrink: 0,
            }}
          >
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isMobile ? (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerOpen(true)}
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, padding: "4px 8px" }}
                />
              ) : (
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  {L.header_portal}
                </Text>
              )}
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
              <Button
                size="small"
                onClick={toggle}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                  borderRadius: 6,
                  fontSize: 12,
                  minWidth: 34,
                }}
              >
                {L.lang_toggle}
              </Button>
              <Avatar
                size={32}
                style={{ background: "linear-gradient(135deg, #06D6A0, #0096C7)", fontSize: 14, flexShrink: 0 }}
              >
                {(user?.email || "U")[0].toUpperCase()}
              </Avatar>
              {!isMobile && (
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  {user?.email || "—"}
                </Text>
              )}
            </div>
          </Header>

          {/* Content — only this area scrolls */}
          <Content
            style={{
              padding: isMobile ? "16px" : "32px 40px",
              overflowY: "auto",
              flex: 1,
              maxWidth: isMobile ? "100%" : 1100,
              width: "100%",
            }}
          >
            {renderTab()}
          </Content>
        </Layout>
      </Layout>
    </App>
  );
}
