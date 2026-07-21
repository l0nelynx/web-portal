# Deployment Guide

The portal is a static SPA — no server needed. Build once, deploy everywhere.

---

## GitHub Actions variables & secrets

Configure in **GitHub → repo → Settings → Secrets and variables → Actions**.

### Secrets (`secrets.*`) — sensitive values, never logged

| Secret | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Full API base URL including path, e.g. `https://api.yourdomain.com/bot/miniapp/api`. Used by the React app at runtime to reach the backend. |

### Variables (`vars.*`) — non-sensitive, visible in logs

| Variable | Required | Description                                                                                                                                                                                                                                                            |
|---|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `VITE_BRAND_NAME` | Yes | Brand name shown throughout the portal, e.g. `Cheeze Networks`. Substituted into `index.html` and JS bundle at build time.                                                                                                                                             |
| `VITE_SITE_URL` | Yes | Public origin of the portal, e.g. `https://www.domain.com`. Used by CI to inject `<link rel="canonical">`, `<meta og:url>` into `index.html`, generate `sitemap.xml`, and append `Sitemap:` to `robots.txt`. No trailing slash.                                        |
| `PAGES_CNAME` | GH Pages only | Custom domain written to `dist/CNAME`, e.g. `www.domain.com`. Leave empty to use the default `*.github.io` URL.                                                                                                                                                        |
| `VITE_BRAND_LOGO` | No | URL to an SVG logo file. If omitted, the built-in CheezyLogo SVG is used.                                                                                                                                                                                              |
| `VITE_MIRRORS` | No | Comma-separated list of **all** mirror origins (including the primary). At runtime the current origin is excluded automatically. Example: `https://www.cheezyvpn.uk,https://myrepo.vercel.app,https://l0nelynx.github.io/web-portal`. Leave empty to disable failover. |

### What CI does with these variables

```
Build step (npm run build):
  VITE_API_URL    → bundled into JS (import.meta.env.VITE_API_URL)
  VITE_BRAND_NAME → substituted into index.html (%VITE_BRAND_NAME%) + JS bundle
  VITE_BRAND_LOGO → bundled into JS
  VITE_MIRRORS    → bundled into JS
  VITE_SITE_URL   → bundled into JS (currently unused in JS, used by CI steps below)

Post-build steps (only when VITE_SITE_URL is set):
  • sed injects into dist/index.html:
      <link rel="canonical" href="$VITE_SITE_URL/" />
      <meta property="og:url" content="$VITE_SITE_URL/" />
  • Generates dist/sitemap.xml with **homepage only** (`/`) — auth/legal routes are excluded
  • Appends "Sitemap: $VITE_SITE_URL/sitemap.xml" to dist/robots.txt
  • Copies route shells under dist/{login,register,policy,agreement,offer}/ with
    `noindex, follow`, unique titles, and landing prerender stripped (so they cannot
    outrank the homepage in brand search)

PAGES_CNAME step:
  • If set → writes dist/CNAME (GitHub Pages custom domain)
```

---

## GitHub Pages

### First-time setup

1. Repo **Settings → Pages → Source**: set to **GitHub Actions** (not a branch).
2. Add the variables and secrets above.
3. Push to `main` — the workflow builds and deploys automatically.

### Custom domain

1. Add a DNS record in your provider (Cloudflare recommended):
   ```
   CNAME  www  →  <username>.github.io   (proxy OFF — grey cloud)
   A      @    →  192.0.2.1              (proxy ON  — used only for redirect rule)
   ```
2. In GitHub **Settings → Pages → Custom domain**: enter `www.yourdomain.com`.
3. Set `PAGES_CNAME=www.yourdomain.com` in Actions variables.
4. Wait for GitHub to issue the Let's Encrypt certificate (~1–5 min after DNS propagates).
5. Enable **Enforce HTTPS** in GitHub Pages settings.
6. Add a Cloudflare **Redirect Rule**: `domain.com → https://www.domain.com` (301).
7. Once HTTPS is verified, re-enable proxy (orange cloud) on the `www` CNAME if desired.

### SPA routing

`public/404.html` encodes the real path as `/?p=/path` and redirects there.
`src/main.tsx` detects `?p=` on load and calls `window.history.replaceState` to restore
the real URL before React renders — transparent to the user.

---

## Vercel

1. Import the repo in Vercel dashboard.
2. Framework preset: **Vite**.
3. Add all secrets/variables as **Environment Variables** (same names, no `secrets.` prefix).
4. `vercel.json` already contains the SPA rewrite rule — no extra config needed.
5. Assign a custom domain in Vercel **Settings → Domains**.

---

## Cloudflare Pages

1. **Workers & Pages → Create → Connect to Git** → select the repo.
2. Build command: `npm run build`, output directory: `dist`.
3. Add environment variables (same names as above).
4. `public/_redirects` already contains `/* /index.html 200` — SPA routing works out of the box.
5. Assign a custom domain in Pages **Settings → Custom domains**.

---

## Mirror failover

Set `VITE_MIRRORS` to a comma-separated list of **all** deployment URLs:

```
VITE_MIRRORS=https://www.domain.com,https://myorg.vercel.app,https://username.github.io
```

At runtime (`src/main.tsx`):
- A background `HEAD` request is sent to `VITE_API_URL` with a 2.5 s timeout.
- If it fails (API unreachable), the browser is redirected to the next mirror that is not the current origin.
- On success, `sessionStorage["_api_ok"] = "1"` is set — no repeat check within the same tab session.
- The current origin is always excluded from the candidates list.

Each mirror must serve the same build (same `VITE_API_URL`) for failover to be transparent.

---

## CORS — backend configuration

The backend (`xray-vpn-bot`, `miniapp` service) must allow the portal's origin.
Add to `config.yml` on the server:

```yaml
web_allowed_origins:
  - https://www.domain.com
  - https://myorg.vercel.app        # add any mirror origins too
```

Or as a comma-separated string:

```yaml
web_allowed_origins: "https://www.domain.com,https://myorg.vercel.app"
```

The miniapp service reads this at startup and configures `CORSMiddleware` with
`allow_credentials=True`, methods `GET POST DELETE OPTIONS`, headers `Authorization Content-Type`.

---

## SEO

After the first deploy with `VITE_SITE_URL` set, submit the sitemap to Google Search Console:

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add property → **URL prefix** → `https://www.domain.com`.
3. Verify ownership via **HTML file** method: download the file Google provides, place it in
   `public/`, commit and push, then click **Verify**.
4. **Sitemaps** → add `https://www.domain.com/sitemap.xml`.

The sitemap lists only the homepage. Auth and legal pages use `noindex, follow` so they
stay reachable via footer links but do not compete for brand queries.

If `/agreement` or `/offer` already appear in Search results, after deploy use
**Search Console → Removals → Temporary removal** (or wait for the next crawl to honour
`noindex`) to drop them faster.

---

## Local development

```bash
npm install
cp .env.example .env
# Edit .env — set at least VITE_API_URL
npm run dev       # http://localhost:5173
```

When `VITE_API_URL` is not set, Vite proxies `/bot/miniapp/api` → `http://localhost:8001`
so the local miniapp backend is used automatically.
