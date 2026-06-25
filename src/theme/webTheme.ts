import { theme } from "antd";
import type { ConfigProviderProps } from "antd";

const tokens = {
  colorPrimary: "#7C9CFF",
  colorSuccess: "#4ECBA8",
  colorWarning: "#FFD479",
  colorError: "#FF8A8A",
  colorInfo: "#9DB8FF",

  colorText: "rgba(255, 255, 255, 0.92)",
  colorTextSecondary: "rgba(255, 255, 255, 0.62)",
  colorTextTertiary: "rgba(255, 255, 255, 0.42)",
  colorTextQuaternary: "rgba(255, 255, 255, 0.28)",

  colorBgBase: "#0B0B14",
  colorBgContainer: "rgba(255, 255, 255, 0.06)",
  colorBgElevated: "rgba(255, 255, 255, 0.10)",
  colorBgLayout: "transparent",
  colorBgSpotlight: "rgba(18, 18, 30, 0.92)",

  colorBorder: "rgba(255, 255, 255, 0.13)",
  colorBorderSecondary: "rgba(255, 255, 255, 0.07)",
  colorFill: "rgba(255, 255, 255, 0.06)",
  colorFillSecondary: "rgba(255, 255, 255, 0.04)",
  colorFillTertiary: "rgba(255, 255, 255, 0.03)",

  borderRadius: 14,
  borderRadiusLG: 20,
  borderRadiusSM: 10,
  borderRadiusXS: 6,

  controlHeight: 42,
  controlHeightLG: 48,

  fontSize: 14,
  fontWeightStrong: 600,

  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.32)",
  boxShadowSecondary: "0 2px 12px rgba(0, 0, 0, 0.22)",
};

export const webThemeConfig: ConfigProviderProps = {
  theme: {
    algorithm: theme.darkAlgorithm,
    token: tokens,
    components: {
      Layout: {
        siderBg: "rgba(255,255,255,0.03)",
        headerBg: "rgba(255,255,255,0.02)",
        bodyBg: "transparent",
      },
      Menu: {
        darkItemBg: "transparent",
        darkSubMenuItemBg: "transparent",
        darkItemSelectedBg: "rgba(124,156,255,0.14)",
        darkItemSelectedColor: "#9DB8FF",
        darkItemHoverBg: "rgba(255,255,255,0.05)",
        itemSelectedBg: "rgba(124,156,255,0.14)",
        itemSelectedColor: "#9DB8FF",
        itemBorderRadius: 10,
      },
      Card: {
        colorBgContainer: "rgba(255, 255, 255, 0.06)",
        borderRadiusLG: 20,
      },
      Button: {
        defaultShadow: "none",
        primaryShadow: "none",
        defaultBg: "rgba(255, 255, 255, 0.07)",
        defaultBorderColor: "rgba(255, 255, 255, 0.13)",
        defaultColor: "rgba(255, 255, 255, 0.88)",
        defaultHoverBg: "rgba(255, 255, 255, 0.12)",
        defaultHoverBorderColor: "rgba(255, 255, 255, 0.22)",
        defaultHoverColor: "#FFFFFF",
      },
      Input: {
        activeShadow: "none",
        colorBgContainer: "rgba(255, 255, 255, 0.06)",
        hoverBorderColor: "rgba(255, 255, 255, 0.24)",
        activeBorderColor: "#7C9CFF",
      },
      Table: {
        colorBgContainer: "transparent",
        borderColor: "rgba(255,255,255,0.07)",
        headerBg: "rgba(255,255,255,0.03)",
        rowHoverBg: "rgba(255,255,255,0.04)",
        headerColor: "rgba(255,255,255,0.55)",
        colorText: "rgba(255,255,255,0.85)",
      },
      Modal: {
        contentBg: "rgba(18, 18, 30, 0.90)",
        headerBg: "transparent",
        titleColor: "rgba(255, 255, 255, 0.92)",
      },
      Alert: {
        colorInfoBg: "rgba(124,156,255,0.12)",
        colorInfoBorder: "rgba(124,156,255,0.30)",
        colorSuccessBg: "rgba(78,203,168,0.10)",
        colorSuccessBorder: "rgba(78,203,168,0.28)",
        colorWarningBg: "rgba(255,212,121,0.12)",
        colorWarningBorder: "rgba(255,212,121,0.30)",
        colorErrorBg: "rgba(255,138,138,0.12)",
        colorErrorBorder: "rgba(255,138,138,0.30)",
      },
      Descriptions: {
        labelBg: "transparent",
        colorTextLabel: "rgba(255, 255, 255, 0.45)",
      },
      Progress: {
        defaultColor: "#7C9CFF",
        remainingColor: "rgba(255,255,255,0.09)",
      },
      Tag: {
        defaultBg: "rgba(255,255,255,0.09)",
        defaultColor: "rgba(255,255,255,0.88)",
      },
    },
  },
};
