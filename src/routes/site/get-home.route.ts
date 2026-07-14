import { setCookie } from "hono/cookie";
import type { AppInstance } from "../../types.js";
import { getRenderStats } from "../../services/render-records.js";
import {
  renderSiteFooter,
  renderSiteHeader,
  siteShellStyles,
  type SiteLocale,
} from "./site-layout.js";

type HomeInitialState = {
  locale: SiteLocale;
  htmlLang: "zh-Hans" | "en" | "ja";
};

const homeCopy = {
  zh: {
    metaDescription: "用友好的界面和 API 生成、定制、存储漂亮的代码图片。",
    navHome: "首页",
    navTryIt: "试试看",
    navDocs: "API 文档",
    languageLabel: "语言",
    footerSlogan: "为人和 API 打造的漂亮代码图片。",
    footerX: "关注 Aaron",
    eyebrow: "Human-friendly UI · API-first rendering",
    slogan: "Beautiful Code Images for Humans and APIs.",
    intro: "把代码转换成适合文档、博客、社交媒体和自动化流程的高清图片，并保留每一次生成记录。",
    tryCodia: "试试看",
    viewApi: "查看 API",
    galleryLabel: "Codia screenshot gallery",
    totalRenders: "总生成次数",
    imagesStored: "已存图片",
    linesRendered: "已渲染行数",
    base64Stored: "Base64 存储",
    screenshotLabels: ["API 渲染", "编辑器模式", "背景定制", "移动端预览"],
  },
  en: {
    metaDescription:
      "Generate, customize, store, and integrate beautiful code images through a friendly UI and API.",
    navHome: "Home",
    navTryIt: "Try It",
    navDocs: "API Docs",
    languageLabel: "Language",
    footerSlogan: "Beautiful Code Images for Humans and APIs.",
    footerX: "Aaron on X",
    eyebrow: "Human-friendly UI · API-first rendering",
    slogan: "Beautiful Code Images for Humans and APIs.",
    intro:
      "Turn code into crisp images for docs, blogs, social posts, and automated workflows, with every render saved for later.",
    tryCodia: "Try Codia",
    viewApi: "View API",
    galleryLabel: "Codia screenshot gallery",
    totalRenders: "Total renders",
    imagesStored: "Images stored",
    linesRendered: "Lines rendered",
    base64Stored: "Base64 stored",
    screenshotLabels: ["API render", "Editor mode", "Backgrounds", "Mobile preview"],
  },
  ja: {
    metaDescription:
      "使いやすい UI と API で、美しいコード画像を生成、カスタマイズ、保存できます。",
    navHome: "ホーム",
    navTryIt: "試す",
    navDocs: "API ドキュメント",
    languageLabel: "言語",
    footerSlogan: "人と API のための美しいコード画像。",
    footerX: "Aaron をフォロー",
    eyebrow: "Human-friendly UI · API-first rendering",
    slogan: "Beautiful Code Images for Humans and APIs.",
    intro:
      "ドキュメント、ブログ、SNS、ワークフロー向けにコードを鮮明な画像へ変換し、生成履歴も保存します。",
    tryCodia: "試す",
    viewApi: "API を見る",
    galleryLabel: "Codia スクリーンショットギャラリー",
    totalRenders: "生成回数",
    imagesStored: "保存画像",
    linesRendered: "描画行数",
    base64Stored: "Base64 保存量",
    screenshotLabels: ["API 生成", "エディター", "背景設定", "モバイル表示"],
  },
} as const;

const formatNumber = (value: number, locale: SiteLocale) =>
  new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale).format(value);

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

const screenshots = [
  {
    tone: "sky",
    code: `<span class="token-pink">export</span> <span class="token-cyan">async function</span> render(code) {
  <span class="token-pink">return</span> <span class="token-green">await</span> codia.render({
    language: <span class="token-yellow">"typescript"</span>,
    theme: <span class="token-yellow">"dracula"</span>,
    bgColor: <span class="token-yellow">"radial-gradient(...)"</span>
  });
}`,
  },
  {
    tone: "mint",
    code: `<span class="token-cyan">POST</span> /v1/code/render
<span class="token-green">200</span> image/png base64

{
  recordId: <span class="token-yellow">1024</span>,
  width: <span class="token-yellow">728</span>,
  height: <span class="token-yellow">420</span>
}`,
  },
  {
    tone: "sunset",
    code: `<span class="token-pink">const</span> image = <span class="token-green">await</span> toImage({
  code,
  padding: <span class="token-yellow">12</span>,
  width: <span class="token-yellow">600</span>,
  showLineNumbers: <span class="token-pink">true</span>
});

download(image);`,
  },
  {
    tone: "paper",
    code: `<span class="token-pink">function</span> <span class="token-cyan">quickSort</span>(items) {
  <span class="token-pink">if</span> (items.length <= <span class="token-yellow">1</span>) <span class="token-pink">return</span> items;
  <span class="token-pink">const</span> [pivot, ...rest] = items;
  <span class="token-pink">return</span> [...left, pivot, ...right];
}`,
  },
];

const homeHtml = (initialState: HomeInitialState) => {
  const stats = getRenderStats();
  const text = homeCopy[initialState.locale];

  return `<!doctype html>
<html lang="${initialState.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Codia · ${text.slogan}</title>
    <meta name="description" content="${text.metaDescription}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/assets/codia-logo.webp" />
    <meta property="og:title" content="Codia" />
    <meta property="og:description" content="${text.slogan}" />
    <meta property="og:image" content="/og-image.png" />
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-element-bundle.min.js"></script>
    <style>
      ${siteShellStyles}

      .home-shell {
        width: min(1366px, calc(100vw - 32px));
        margin: 0 auto;
      }

      .hero {
        min-height: calc(100vh - 220px);
        display: grid;
        align-items: center;
        gap: 26px;
        padding: clamp(48px, 8vw, 108px) 0 28px;
        text-align: center;
      }

      .hero-copy {
        display: grid;
        justify-items: center;
        gap: 22px;
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
        color: var(--ink);
        font-size: clamp(68px, 12vw, 168px);
        line-height: 0.86;
        letter-spacing: 0;
      }

      .slogan {
        max-width: 820px;
        margin: 0;
        color: #111827;
        font-size: clamp(24px, 4vw, 54px);
        line-height: 1.04;
        font-weight: 950;
        text-wrap: balance;
      }

      .intro {
        max-width: 740px;
        margin: 0;
        color: #475569;
        font-size: 18px;
        line-height: 1.7;
        font-weight: 650;
        text-wrap: pretty;
      }

      .actions {
        display: flex;
        justify-content: center;
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

      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        padding: 14px 0 52px;
      }

      .stat-card {
        padding: 18px;
        border-radius: 16px;
        background: rgb(255 255 255 / 84%);
        box-shadow: 0 16px 42px var(--shadow);
        text-align: left;
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

      .gallery-band {
        width: 100vw;
        margin-left: calc(50% - 50vw);
        padding: 24px 0 72px;
        overflow: hidden;
      }

      .gallery-swiper {
        width: 100%;
        --swiper-wrapper-transition-timing-function: linear;
      }

      .gallery-swiper swiper-slide {
        width: min(78vw, 960px);
      }

      .screenshot {
        position: relative;
        min-height: clamp(360px, 44vw, 620px);
        display: grid;
        align-items: center;
        padding: clamp(18px, 3.2vw, 46px);
        border-radius: 28px;
        box-shadow: 0 30px 80px rgb(15 23 42 / 18%);
        overflow: hidden;
      }

      .screenshot.sky {
        background: radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%);
      }

      .screenshot.mint {
        background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
      }

      .screenshot.sunset {
        background: linear-gradient(135deg, #fdc830 0%, #f37335 100%);
      }

      .screenshot.paper {
        background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 48%, #cbd5e1 100%);
      }

      .screenshot-label {
        position: absolute;
        top: 18px;
        right: 18px;
        z-index: 2;
        padding: 7px 11px;
        border-radius: 999px;
        background: rgb(255 255 255 / 78%);
        color: #111827;
        font-size: 13px;
        font-weight: 900;
        backdrop-filter: blur(12px);
      }

      .code-window {
        width: 100%;
        height: 100%;
        min-height: 300px;
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
        padding: 10px clamp(18px, 3vw, 34px) 30px;
        font: clamp(14px, 1.6vw, 19px)/1.75 "Fira Code", ui-monospace, monospace;
        white-space: pre-wrap;
        text-align: left;
      }

      .token-pink { color: #ff79c6; }
      .token-cyan { color: #8be9fd; }
      .token-green { color: #50fa7b; }
      .token-yellow { color: #f1fa8c; }

      @media (max-width: 840px) {
        .stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .gallery-swiper swiper-slide {
          width: min(86vw, 760px);
        }
      }

      @media (max-width: 560px) {
        .stats {
          grid-template-columns: 1fr;
        }

        .gallery-swiper swiper-slide {
          width: calc(100vw - 32px);
        }
      }
    </style>
  </head>
  <body>
    ${renderSiteHeader("home", initialState.locale, text)}
    <main class="home-shell">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${text.eyebrow}</span>
          <h1>Codia</h1>
          <p class="slogan">${text.slogan}</p>
          <p class="intro">${text.intro}</p>
          <div class="actions">
            <a class="button primary" href="/try-it">${text.tryCodia}</a>
            <a class="button secondary" href="/docs">${text.viewApi}</a>
          </div>
        </div>
      </section>

      <section class="stats" aria-label="Codia stats">
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalRenders, initialState.locale)}</span><span class="stat-label">${text.totalRenders}</span></div>
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalImagesStored, initialState.locale)}</span><span class="stat-label">${text.imagesStored}</span></div>
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalLinesRendered, initialState.locale)}</span><span class="stat-label">${text.linesRendered}</span></div>
        <div class="stat-card"><span class="stat-value">${formatBytes(stats.totalBytesStored)}</span><span class="stat-label">${text.base64Stored}</span></div>
      </section>

      <section class="gallery-band" aria-label="${text.galleryLabel}">
        <swiper-container class="gallery-swiper" slides-per-view="auto" space-between="22" centered-slides="true" loop="true" speed="6200" autoplay-delay="1" autoplay-disable-on-interaction="false" free-mode="true">
          ${screenshots
            .map(
              (item, index) => `<swiper-slide>
                <article class="screenshot ${item.tone}">
                  <span class="screenshot-label">${text.screenshotLabels[index]}</span>
                  <div class="code-window">
                    <div class="window-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
                    <pre>${item.code}</pre>
                  </div>
                </article>
              </swiper-slide>`,
            )
            .join("")}
        </swiper-container>
      </section>
    </main>
    ${renderSiteFooter(text)}
    <script>
      const setCookie = (name, value) => {
        document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=31536000; samesite=lax";
      };

      document.querySelectorAll("[data-site-locale]").forEach((button) => {
        button.addEventListener("click", () => {
          const locale = button.getAttribute("data-site-locale");
          if (!locale) return;
          setCookie("code_snip_locale", locale);
          window.location.reload();
        });
      });
    </script>
  </body>
</html>`;
};

export const route_GET_home = (app: AppInstance) => {
  app.get("/", (c) => {
    const initialState = resolveInitialState(
      c.req.header("cookie") ?? "",
      c.req.header("accept-language") ?? "",
    );

    setCookie(c, "code_snip_locale", initialState.locale, {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "Lax",
    });

    return c.html(homeHtml(initialState));
  });
};

const resolveInitialState = (cookieHeader: string, acceptLanguage: string): HomeInitialState => {
  const cookies = parseCookieHeader(cookieHeader);
  const locale = normalizeLocale(cookies.code_snip_locale) ?? localeFromAcceptLanguage(acceptLanguage);

  return {
    locale,
    htmlLang: locale === "zh" ? "zh-Hans" : locale,
  };
};

const parseCookieHeader = (cookieHeader: string) =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separatorIndex = item.indexOf("=");
        if (separatorIndex === -1) return [item, ""];
        return [
          item.slice(0, separatorIndex),
          safeDecodeURIComponent(item.slice(separatorIndex + 1)),
        ];
      }),
  ) as Record<string, string>;

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeLocale = (locale: string | undefined): SiteLocale | null => {
  if (locale === "zh" || locale === "en" || locale === "ja") return locale;
  return null;
};

const localeFromAcceptLanguage = (acceptLanguage: string): SiteLocale => {
  const locale = acceptLanguage
    .split(",")
    .map((item) => {
      const [tag = "", qValue = "q=1"] = item.trim().split(";");
      const q = Number(qValue.trim().replace(/^q=/i, ""));
      return {
        locale: normalizeLocale(tag.toLowerCase().split("-")[0]),
        q: Number.isFinite(q) ? q : 1,
      };
    })
    .filter((item) => item.locale)
    .sort((left, right) => right.q - left.q)[0]?.locale;

  if (locale) return locale;
  return "zh";
};
