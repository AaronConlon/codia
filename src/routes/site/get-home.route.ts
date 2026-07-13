import type { AppInstance } from "../../types.js";
import { getRenderStats } from "../../services/render-records.js";
import { renderSiteFooter, renderSiteHeader, siteShellStyles } from "./site-layout.js";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

const homeHtml = () => {
  const stats = getRenderStats();
  const topLanguageSlides =
    stats.topLanguages.length > 0
      ? stats.topLanguages
      : [
          { language: "typescript", count: 0 },
          { language: "javascript", count: 0 },
          { language: "python", count: 0 },
        ];
  const recentSlides =
    stats.recent.length > 0
      ? stats.recent
      : [
          {
            id: 0,
            source: "api",
            language: "typescript",
            theme: "dracula",
            width: 624,
            height: 360,
            lineCount: 24,
            createdAt: new Date().toISOString(),
          },
        ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Codia · Beautiful Code Images for Humans and APIs.</title>
    <meta name="description" content="Generate, customize, store, and integrate beautiful code images through a friendly UI and API." />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/assets/codia-logo.webp" />
    <meta property="og:title" content="Codia" />
    <meta property="og:description" content="Beautiful Code Images for Humans and APIs." />
    <meta property="og:image" content="/og-image.png" />
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-element-bundle.min.js"></script>
    <style>
      ${siteShellStyles}

      .home-shell {
        width: min(1366px, calc(100vw - 32px));
        margin: 0 auto;
      }

      .hero {
        min-height: calc(100vh - 190px);
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
        align-items: center;
        gap: 44px;
        padding: 44px 0 26px;
      }

      .hero-copy {
        display: grid;
        gap: 24px;
      }

      .eyebrow {
        width: fit-content;
        padding: 7px 11px;
        border-radius: 999px;
        background: rgb(15 23 42 / 7%);
        color: var(--muted);
        font-size: 13px;
        font-weight: 900;
      }

      h1 {
        margin: 0;
        max-width: 760px;
        color: var(--ink);
        font-size: clamp(58px, 9vw, 128px);
        line-height: 0.88;
        letter-spacing: 0;
        text-wrap: balance;
      }

      .slogan {
        max-width: 620px;
        margin: 0;
        color: #334155;
        font-size: clamp(20px, 2.4vw, 32px);
        line-height: 1.22;
        font-weight: 800;
        text-wrap: pretty;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .button {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 16px;
        border-radius: 10px;
        font-weight: 900;
        transition-property: transform, box-shadow, background;
        transition-duration: 160ms;
      }

      .button:active {
        transform: scale(0.96);
      }

      .button.primary {
        background: #111827;
        color: white;
        box-shadow: 0 16px 36px rgb(15 23 42 / 22%);
      }

      .button.secondary {
        background: white;
        color: #111827;
        box-shadow: 0 10px 28px rgb(15 23 42 / 10%);
      }

      .hero-visual {
        min-width: 0;
      }

      .showcase-swiper {
        width: 100%;
      }

      .showcase-slide {
        min-height: 520px;
        display: grid;
        align-items: center;
      }

      .code-image-card {
        position: relative;
        aspect-ratio: 16 / 10;
        border-radius: 28px;
        padding: clamp(18px, 3vw, 42px);
        background: radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%);
        box-shadow: 0 36px 90px rgb(15 23 42 / 22%);
        overflow: hidden;
      }

      .code-window {
        height: 100%;
        border-radius: 16px;
        background: #111315;
        box-shadow: 0 20px 54px rgb(2 6 23 / 32%);
        color: #f8f8f2;
        overflow: hidden;
      }

      .window-bar {
        height: 48px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 18px;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .dot.red { background: #ff5f56; }
      .dot.yellow { background: #ffbd2e; }
      .dot.green { background: #27c93f; }

      pre {
        margin: 0;
        padding: 6px 22px 24px;
        font: 16px/1.8 "Fira Code", ui-monospace, monospace;
        white-space: pre-wrap;
      }

      .token-pink { color: #ff79c6; }
      .token-cyan { color: #8be9fd; }
      .token-green { color: #50fa7b; }
      .token-yellow { color: #f1fa8c; }

      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        padding: 10px 0 34px;
      }

      .stat-card,
      .metric-panel,
      .recent-panel {
        border-radius: 16px;
        background: rgb(255 255 255 / 84%);
        box-shadow: 0 16px 42px var(--shadow);
      }

      .stat-card {
        padding: 18px;
      }

      .stat-value {
        display: block;
        color: var(--ink);
        font-size: 30px;
        line-height: 1;
        font-weight: 950;
        font-variant-numeric: tabular-nums;
      }

      .stat-label {
        display: block;
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
        font-weight: 800;
      }

      .data-grid {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 16px;
        padding: 10px 0 54px;
      }

      .metric-panel,
      .recent-panel {
        min-width: 0;
        padding: 22px;
      }

      h2 {
        margin: 0 0 16px;
        color: var(--ink);
        font-size: 24px;
        text-wrap: balance;
      }

      .language-swiper,
      .recent-swiper {
        width: 100%;
      }

      .language-card,
      .recent-card {
        min-height: 160px;
        display: grid;
        align-content: space-between;
        padding: 18px;
        border-radius: 12px;
        background: #f8fafc;
        box-shadow: inset 0 0 0 1px rgb(15 23 42 / 7%);
      }

      .language-card strong,
      .recent-card strong {
        color: var(--ink);
        font-size: 20px;
      }

      .language-card span,
      .recent-card span {
        color: var(--muted);
        font-size: 13px;
        font-weight: 800;
      }

      @media (max-width: 980px) {
        .hero,
        .data-grid {
          grid-template-columns: 1fr;
        }

        .stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .stats {
          grid-template-columns: 1fr;
        }

        .showcase-slide {
          min-height: 360px;
        }
      }
    </style>
  </head>
  <body>
    ${renderSiteHeader("home")}
    <main class="home-shell">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Human-friendly UI · API-first rendering</span>
          <h1>Codia</h1>
          <p class="slogan">Beautiful Code Images for Humans and APIs.</p>
          <div class="actions">
            <a class="button primary" href="/try-it">Try Codia</a>
            <a class="button secondary" href="/docs">View API</a>
          </div>
        </div>
        <div class="hero-visual">
          <swiper-container class="showcase-swiper" slides-per-view="1" speed="520" loop="true" autoplay-delay="2600">
            <swiper-slide>
              <div class="showcase-slide">
                <div class="code-image-card">
                  <div class="code-window">
                    <div class="window-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
                    <pre><span class="token-pink">export</span> <span class="token-cyan">async function</span> image(code) {
  <span class="token-pink">return</span> <span class="token-green">await</span> codia.render({
    language: <span class="token-yellow">"typescript"</span>,
    theme: <span class="token-yellow">"dracula"</span>
  })
}</pre>
                  </div>
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="showcase-slide">
                <div class="code-image-card" style="background: linear-gradient(135deg, #111827 0%, #2563eb 48%, #67e8f9 100%);">
                  <div class="code-window"><div class="window-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><pre><span class="token-cyan">POST</span> /v1/code/render
<span class="token-green">200</span> image/png base64
recordId: <span class="token-yellow">#${stats.totalRenders + 1}</span></pre></div>
                </div>
              </div>
            </swiper-slide>
          </swiper-container>
        </div>
      </section>

      <section class="stats" aria-label="Codia stats">
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalRenders)}</span><span class="stat-label">Total renders</span></div>
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalImagesStored)}</span><span class="stat-label">Images stored</span></div>
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalLinesRendered)}</span><span class="stat-label">Lines rendered</span></div>
        <div class="stat-card"><span class="stat-value">${formatBytes(stats.totalBytesStored)}</span><span class="stat-label">Base64 stored</span></div>
      </section>

      <section class="data-grid">
        <div class="metric-panel">
          <h2>Language momentum</h2>
          <swiper-container class="language-swiper" slides-per-view="1.2" space-between="12" breakpoints='{"720":{"slidesPerView":2}}'>
            ${topLanguageSlides
              .map(
                (item) => `<swiper-slide><div class="language-card"><strong>${item.language}</strong><span>${formatNumber(item.count)} renders</span></div></swiper-slide>`,
              )
              .join("")}
          </swiper-container>
        </div>
        <div class="recent-panel">
          <h2>Recent generation flow</h2>
          <swiper-container class="recent-swiper" slides-per-view="1" space-between="12" autoplay-delay="3200">
            ${recentSlides
              .map(
                (item) => `<swiper-slide><div class="recent-card"><strong>${item.language} · ${item.theme}</strong><span>${item.width}x${item.height} · ${item.lineCount} lines · ${item.source}</span></div></swiper-slide>`,
              )
              .join("")}
          </swiper-container>
        </div>
      </section>
    </main>
    ${renderSiteFooter()}
  </body>
</html>`;
};

export const route_GET_home = (app: AppInstance) => {
  app.get("/", (c) => c.html(homeHtml()));
};
