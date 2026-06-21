import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import WebApp from "./App";

// GitHub Pages SPA redirect: 404.html encodes the real path as /?p=/some/path
const ghRedirect = new URLSearchParams(window.location.search).get("p");
if (ghRedirect) {
  window.history.replaceState(null, "", ghRedirect);
}

const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
  .ant-menu-dark .ant-menu-item-selected { background: rgba(6,214,160,0.12) !important; }
  .ant-menu-dark .ant-menu-item-selected .ant-menu-item-icon,
  .ant-menu-dark .ant-menu-item-selected .ant-menu-title-content { color: #06D6A0 !important; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("web-root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider>
        <WebApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
