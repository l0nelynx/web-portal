# Frontend stack

This repo (`xray-vpn-web`) is a standalone SPA that talks to the `miniapp`
backend service in the `xray-vpn-bot` monorepo. It intentionally does **not**
share a workspace with that repo, but its frontend stack is kept in sync with
`xray-vpn-bot/web/apps/miniapp` (and the shared `@xray/ui` package) so that
UI/UX, component APIs, and dependency versions don't drift between the two.

## Pinned versions

| Package | Version | Notes |
|---|---|---|
| `react` / `react-dom` | `^19.1.0` | |
| `react-router` | `^7.7.1` | replaces `react-router-dom` — import from `react-router` |
| `vite` | `^8.1.0` | |
| `@vitejs/plugin-react` | `^6.0.0` | |
| `typescript` | `^5.9.2` | |
| `tailwindcss` | `^4.1.11` | v4, CSS-first config (no `tailwind.config.js`) |
| `@tailwindcss/vite` | `^4.1.11` | Vite plugin, replaces PostCSS setup |
| `lucide-react` | `^0.525.0` | icon set, replaces `@ant-design/icons` |
| `sonner` | `^2.0.7` | toast notifications, replaces `antd` `message`/`Modal.error` |
| `react-hook-form` | `^7.62.0` | form state |
| `@hookform/resolvers` | `^5.2.2` | zod resolver for react-hook-form |
| `zod` | `^4.0.17` | schema validation |
| `class-variance-authority` | `^0.7.1` | shadcn variant styling |
| `clsx` / `tailwind-merge` | `^2.1.1` / `^3.3.1` | `cn()` helper in `src/lib/utils.ts` |
| Radix primitives (`@radix-ui/react-*`) | see `package.json` | underlie the local shadcn components |

Local shadcn config lives in `components.json` (style: `new-york`, base
color: `neutral`, `rsc: false`, CSS variables in `src/index.css`).

## Component library

There is no shared `@xray/ui` package here (this repo isn't part of the
`xray-vpn-bot` npm workspace). Instead, shadcn components are vendored
locally under `src/components/ui/` with the same API as the bot monorepo's
`web/packages/ui/src/components/`. When adding a new shadcn component here,
prefer copying the equivalent file from that package and only adjusting
import paths (`@/lib/utils` etc. already match).

Components currently vendored: `alert`, `alert-dialog`, `badge`, `button`,
`card`, `dialog`, `input`, `label`, `progress`, `select`, `separator`,
`sheet`, `skeleton`, `sonner`, `spinner`, `switch`, `table`, `tabs`,
`textarea`. Add more (`checkbox`, `dropdown-menu`, `popover`, `tooltip`,
etc.) from the bot monorepo's `web/packages/ui/src/components/` as needed.

## Sync checklist vs `xray-vpn-bot`

When the bot monorepo's `web/apps/miniapp` or `web/packages/ui` change, check
whether this repo needs the same update:

- [ ] Compare `dependencies`/`devDependencies` versions in
      `xray-vpn-bot/web/apps/miniapp/package.json` against this repo's
      `package.json` — bump to match (`react`, `react-router`, `vite`,
      `typescript`, `tailwindcss`, `lucide-react`, `sonner`,
      `react-hook-form`, `zod`, `@hookform/resolvers`).
- [ ] Compare `xray-vpn-bot/web/packages/ui/package.json` Radix versions
      against this repo's own `@radix-ui/react-*` deps.
- [ ] Diff any touched files under
      `xray-vpn-bot/web/packages/ui/src/components/*.tsx` against
      `src/components/ui/*.tsx` here — port visual/behavioral fixes.
- [ ] Diff `xray-vpn-bot/web/packages/ui/src/styles/globals.css` against
      `src/index.css` here for CSS variable / theme changes.
- [ ] If the bot's MiniApp `BuyMenuPage.tsx` tree-nav UX changes, check
      `src/pages/dashboard/BuyTab.tsx` here (same tree-nav pattern, same
      `webPayments` API contract).
- [ ] Re-run `npm install && npm run build` after any bump to confirm the
      two stacks still produce a clean build independently.

This repo has no `antd`, `@ant-design/icons`, or `dayjs` dependency (fully
migrated to Tailwind + shadcn + Lucide + native `Date`/`Intl` formatting).
