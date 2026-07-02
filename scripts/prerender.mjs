/**
 * Post-build prerender: injects static landing-page HTML into dist/index.html
 * so Google's first-wave crawler (no JS) sees real content instead of an empty div.
 *
 * React mounts on top of this content after JS loads — users never see the raw HTML.
 * No extra dependencies needed; runs via `node scripts/prerender.mjs`.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const distIndex = resolve(__dir, "../dist/index.html");

const brand = process.env.VITE_BRAND_NAME || "Cheezy Networks";
const botUrl = process.env.VITE_BOT_URL || "";
const tryLink = botUrl || "/register";

const staticHtml = `
<header>
  <nav aria-label="Main navigation">
    <a href="/">${brand}</a>
    <a href="/login">Sign In</a>
    <a href="${tryLink}">Try free in Telegram</a>
  </nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">${brand} — Private &amp; Secure VPN</h1>
    <p>
      Fast, encrypted VPN that keeps your connection private on any network —
      for individuals and businesses alike. No activity logs, no tracking, no fuss.
    </p>
    <a href="${tryLink}">Try free in Telegram</a>
    <a href="/login">Sign In</a>
  </section>

  <section aria-labelledby="features-heading">
    <h2 id="features-heading">Built for privacy and speed</h2>
    <p>Everything you need for a private, reliable connection — nothing you don't.</p>
    <ul>
      <li>
        <h3>No-Logs Privacy</h3>
        <p>We don't record your browsing, traffic or IP address. What you do online stays yours.</p>
      </li>
      <li>
        <h3>Global Network</h3>
        <p>High-availability servers across multiple regions for low-latency, reliable connections wherever you are.</p>
      </li>
      <li>
        <h3>For You or Your Team</h3>
        <p>Use it solo for everyday privacy, or roll out secure access across your whole organisation.</p>
      </li>
      <li>
        <h3>High Speed</h3>
        <p>Optimised routing delivers fast, high-bandwidth connections for streaming, calls and work.</p>
      </li>
      <li>
        <h3>Strong Encryption</h3>
        <p>Modern encryption protocols protect every connection end to end.</p>
      </li>
      <li>
        <h3>Instant Setup</h3>
        <p>Connect in minutes. Cross-platform clients for Windows, macOS, Linux, iOS and Android.</p>
      </li>
    </ul>
  </section>

  <section aria-labelledby="individuals-heading">
    <h2 id="individuals-heading">Your privacy, in one tap</h2>
    <p>
      Encrypted, high-speed access that keeps your connection private on any network.
      Start free in Telegram, no card required.
    </p>
    <a href="${tryLink}">Try free in Telegram</a>
  </section>

  <section aria-labelledby="business-heading">
    <h2 id="business-heading">Partner with us</h2>
    <p>
      Looking to offer private connectivity to your team, resell access, or integrate our
      infrastructure? Tell us your goal and we'll get back to you.
    </p>
  </section>
</main>
<footer>
  <nav aria-label="Legal">
    <a href="/policy">Privacy Policy</a>
    <a href="/agreement">User Agreement</a>
    <a href="/offer">Public Offer</a>${botUrl ? `\n    <a href="${botUrl}">Telegram</a>` : ""}
  </nav>
  <p>© ${new Date().getFullYear()} ${brand}. All rights reserved. Secure · Private · Reliable</p>
  <p>This service is not intended for circumventing lawful restrictions.</p>
</footer>
`.trim();

let html = readFileSync(distIndex, "utf-8");

if (!html.includes('<div id="web-root">')) {
  console.error("❌  Could not find <div id=\"web-root\"> in dist/index.html");
  process.exit(1);
}

html = html.replace(
  '<div id="web-root"></div>',
  `<div id="web-root">${staticHtml}</div>`
);

writeFileSync(distIndex, html, "utf-8");
console.log(`✓  Prerendered landing page for "${brand}" injected into dist/index.html`);
