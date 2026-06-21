# CLAUDE.md — xray-vpn-web

Static React SPA — public web portal for the xray-vpn-bot service.
Hosted on GitHub Pages / Vercel / Cloudflare Pages with a custom domain.
Backend API lives in the `xray-vpn-bot` repo (`miniapp` service, port 8001).

## Stack

| Layer | Tech |
|---|---|
| UI framework | React 18 + TypeScript |
| Component library | Ant Design v6 |
| Router | React Router v6 (`BrowserRouter`, `basename="/"`) |
| Build tool | Vite 6 (`base: "/"`) |
| i18n | Custom `LangContext` (`src/locale.tsx`) |
| Auth | JWT in `localStorage` (`web_access_token` / `web_refresh_token`) |

## Project structure

```
index.html            Vite entry — SEO meta tags with %VITE_BRAND_NAME% placeholders
public/
  404.html            GitHub Pages SPA fallback (encodes path as /?p=...)
  _redirects          Cloudflare Pages SPA fallback
  robots.txt          Base robots.txt — CI appends Sitemap: line
vercel.json           Vercel SPA rewrite rule
src/
  main.tsx            Entry: GH Pages redirect restore + mirror failover + render
  App.tsx             Routes + RequireAuth / RequireVerified guards
  locale.tsx          Translations (EN/RU) + browser language detection
  branding.ts         BRAND_NAME / BRAND_LOGO from VITE_* env vars
  api/client.ts       JWT API client (all /android/* and /web/* endpoints)
  auth/AuthContext.tsx Token lifecycle, auto-refresh, profile state
  components/         BrandLogo, CheezyLogo (default SVG logo)
  pages/
    LandingPage.tsx   Public marketing page — fully i18n
    LoginPage.tsx     Login form — fully i18n, lang toggle button
    RegisterPage.tsx  Invite-code registration — fully i18n
    VerifyEmailPage.tsx  6-digit email code verification — fully i18n
    DashboardPage.tsx    Authenticated shell: Sider (desktop) / Drawer (mobile)
    dashboard/
      SubscriptionTab.tsx
      BuyTab.tsx        Tree-nav identical to MiniApp BuyMenuPage
      DevicesTab.tsx
      SettingsTab.tsx   Includes Telegram link/unlink flow
  theme/webTheme.ts   Ant Design dark theme config
```

## API endpoints used

All calls go to `API_BASE` (`VITE_API_URL` or `/bot/miniapp/api` fallback).

| Group | Endpoints |
|---|---|
| Auth | `POST /android/auth/login`, `/refresh`, `/logout` |
| Register | `POST /web/register`, `POST /web/validate-invite` |
| Email verify | `POST /android/auth/email/send-code`, `/verify` |
| Profile | `GET /android/me` |
| Password | `POST /android/auth/password/change` |
| Sessions | `GET /android/sessions`, `POST /revoke-all`, `DELETE /:id` |
| Devices | `GET /android/devices`, `DELETE /android/devices/:hwid` |
| Payments | `GET /web/payments/menu`, `POST /web/payments/invoice` |
| Telegram | `POST /android/link/start`, `DELETE /android/link/telegram` |

## i18n

`src/locale.tsx` — `LangProvider` wraps the whole app in `App.tsx`.
Language detection order:
1. `localStorage["web_lang"]` (persisted user choice)
2. `navigator.language` — `ru-*` → Russian, else → English
3. Default: English

Use `const { L, toggle } = useLang()` in any component.
Add new keys to the `Translations` interface **and both** `en` and `ru` objects simultaneously.

## Branding

`src/branding.ts` reads `VITE_BRAND_NAME` and `VITE_BRAND_LOGO` at build time.
`index.html` uses `%VITE_BRAND_NAME%` (Vite replaces during build — warns if unset locally, that's OK).
`BrandLogo` renders `VITE_BRAND_LOGO` (URL to SVG) or falls back to `CheezyLogo`.

## Mobile breakpoints

`Grid.useBreakpoint()` from antd — `isMobile = !screens.md` (< 768px) used in
`DashboardPage` and `LandingPage`. Dashboard uses antd `Drawer` for mobile nav.
LandingPage collapses nav links on mobile, keeps only lang toggle + portal button.

## Mirror failover

`src/main.tsx` — background `HEAD` fetch to `VITE_API_URL` with 2.5 s timeout.
On failure, redirects to first mirror from `VITE_MIRRORS` that isn't the current origin.
Result cached in `sessionStorage["_api_ok"]` — runs once per tab session.

## Conventions

- antd v6: use `App.useApp()` for `message`; `styles={{ body }}` not `bodyStyle`.
- BuyTab tree navigation: `path: number[]` stack + `findNode()` recursive search.
  Don't flatten the tariff tree — structure mirrors `xray-vpn-bot` MiniApp.
- `public/` files are copied as-is (no Vite env replacement). Use CI steps for
  dynamic content (sitemap URL, robots.txt Sitemap directive).
- Dev server proxies `/bot/miniapp/api` → `localhost:8001` when `VITE_API_URL` is unset.

## Local development

```bash
npm install
# Copy and fill in at least VITE_API_URL if running against a remote backend:
cp .env.example .env
npm run dev        # http://localhost:5173
npm run build      # type-check + vite build → dist/
```

See `docs/deployment.md` for GitHub Actions variables, hosting setup, and CORS config.
