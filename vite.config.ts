import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  server: {
    // Dev proxy: when VITE_API_URL is not set, relative /bot/miniapp/api calls
    // get forwarded to the local miniapp backend
    proxy: {
      "/bot/miniapp/api": "http://localhost:8001",
    },
  },
});
