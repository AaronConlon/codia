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
    galleryTitle: "最新代码图片",
    gallerySubtitle: "通过 Codia API 生成的九种语言示例，并以 WebP 格式发布。",
    screenshotLabels: [
      "TypeScript",
      "JavaScript",
      "Python",
      "Go",
      "Rust",
      "Java",
      "Kotlin",
      "Swift",
      "Ruby",
    ],
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
    galleryTitle: "Latest code images",
    gallerySubtitle: "Nine language samples generated through the Codia API and published as WebP.",
    screenshotLabels: [
      "TypeScript",
      "JavaScript",
      "Python",
      "Go",
      "Rust",
      "Java",
      "Kotlin",
      "Swift",
      "Ruby",
    ],
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
    galleryTitle: "最新のコード画像",
    gallerySubtitle: "Codia API で生成した 9 言語のサンプルを WebP で公開しています。",
    screenshotLabels: [
      "TypeScript",
      "JavaScript",
      "Python",
      "Go",
      "Rust",
      "Java",
      "Kotlin",
      "Swift",
      "Ruby",
    ],
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
    language: "typescript",
    width: 628,
    height: 236,
    url: "https://de4965e.webp.li/blog-images/2026/07/86b17c183db7b09a8b9b04cf4a3ba438.webp",
  },
  {
    language: "javascript",
    width: 1020,
    height: 224,
    url: "https://de4965e.webp.li/blog-images/2026/07/d57e6d2c91b1788e300b222bd42afacc.webp",
  },
  {
    language: "python",
    width: 714,
    height: 236,
    url: "https://de4965e.webp.li/blog-images/2026/07/7044733bed583bdda0d20f928bbb7cbe.webp",
  },
  {
    language: "go",
    width: 740,
    height: 320,
    url: "https://de4965e.webp.li/blog-images/2026/07/8351f9726b7538e1e56fe2e3bd3cb26c.webp",
  },
  {
    language: "rust",
    width: 764,
    height: 236,
    url: "https://de4965e.webp.li/blog-images/2026/07/a48e2683111079bfd89599c05db2329d.webp",
  },
  {
    language: "java",
    width: 726,
    height: 248,
    url: "https://de4965e.webp.li/blog-images/2026/07/2f1bb046f9c8522816b8208c667a3b39.webp",
  },
  {
    language: "kotlin",
    width: 750,
    height: 260,
    url: "https://de4965e.webp.li/blog-images/2026/07/7b004df1ed798da7d1676a529c2f0055.webp",
  },
  {
    language: "swift",
    width: 689,
    height: 296,
    url: "https://de4965e.webp.li/blog-images/2026/07/51595f4a592473827267c04820222b09.webp",
  },
  {
    language: "ruby",
    width: 704,
    height: 284,
    url: "https://de4965e.webp.li/blog-images/2026/07/6b1a5ab7f96b03a8a4e17faf8d771105.webp",
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
    <style>
      ${siteShellStyles}

      body {
        background:
          linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
          linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px),
          #050505;
        background-size: 28px 28px;
        color: #f8fafc;
      }

      .home-shell {
        width: min(1366px, calc(100vw - 32px));
        margin: 0 auto;
      }

      .site-header {
        position: relative;
        z-index: 10;
      }

      .site-brand,
      .site-nav a,
      .site-locale-trigger {
        color: #f8fafc;
      }

      .site-brand img {
        outline-color: rgb(255 255 255 / 16%);
        box-shadow: 0 16px 34px rgb(0 0 0 / 32%);
      }

      .site-nav a,
      .site-locale-trigger {
        background: rgb(255 255 255 / 7%);
        color: rgb(248 250 252 / 78%);
      }

      .site-locale-trigger {
        border-color: rgb(255 255 255 / 12%);
      }

      .site-nav a:hover,
      .site-nav a[aria-current="page"],
      .site-locale-trigger:hover {
        background: rgb(255 255 255 / 13%);
        color: #ffffff;
      }

      .site-locale-menu {
        background: #18181b;
        border-color: rgb(255 255 255 / 12%);
      }

      .site-locale-menu button {
        color: #f8fafc;
      }

      .site-locale-menu button:hover,
      .site-locale-menu button[aria-pressed="true"] {
        background: rgb(255 255 255 / 10%);
      }

      .landing-top {
        position: relative;
        width: 100vw;
        margin-left: calc(50% - 50vw);
        margin-top: -78px;
        padding: 78px 0 74px;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgb(0 0 0 / 16%) 0%, #050505 86%),
          url("https://swiperjs.com/images/home/header-bg.jpg") center top / cover no-repeat,
          #050505;
      }

      .landing-top::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 50% 16%, rgb(255 255 255 / 14%) 0%, transparent 32%),
          linear-gradient(180deg, transparent 0%, #050505 92%);
        pointer-events: none;
      }

      .landing-inner {
        position: relative;
        z-index: 1;
        width: min(1366px, calc(100vw - 32px));
        margin: 0 auto;
      }

      .hero {
        display: grid;
        align-items: center;
        gap: 26px;
        padding: clamp(74px, 9vw, 132px) 0 42px;
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
        background: rgb(255 255 255 / 10%);
        color: rgb(248 250 252 / 72%);
        font-size: 13px;
        font-weight: 900;
      }

      h1 {
        margin: 0;
        color: #ffffff;
        font-size: clamp(68px, 12vw, 168px);
        line-height: 0.86;
        letter-spacing: 0;
      }

      .slogan {
        max-width: 820px;
        margin: 0;
        color: #ffffff;
        font-size: clamp(24px, 4vw, 54px);
        line-height: 1.04;
        font-weight: 950;
        text-wrap: balance;
      }

      .intro {
        max-width: 740px;
        margin: 0;
        color: rgb(248 250 252 / 68%);
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
        background: #ffffff;
        color: #09090b;
        box-shadow: 0 16px 36px rgb(255 255 255 / 14%);
      }

      .button.secondary {
        background: rgb(255 255 255 / 10%);
        color: white;
        box-shadow: inset 0 0 0 1px rgb(255 255 255 / 12%);
      }

      .gallery-intro {
        max-width: 760px;
        margin: 0 auto 26px;
        text-align: center;
      }

      .gallery-intro h2 {
        margin: 0;
        color: #ffffff;
        font-size: clamp(34px, 4vw, 58px);
        line-height: 1.02;
        letter-spacing: 0;
      }

      .gallery-intro p {
        max-width: 680px;
        margin: 16px auto 0;
        color: rgb(248 250 252 / 62%);
        font-size: 17px;
        line-height: 1.7;
        font-weight: 650;
        text-wrap: pretty;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        padding: 58px 0 52px;
      }

      .stat-card {
        padding: 18px;
        border-radius: 16px;
        background: #18181b;
        border: 1px solid rgb(255 255 255 / 10%);
        box-shadow: 0 16px 42px rgb(0 0 0 / 28%);
        text-align: left;
      }

      .stat-value {
        display: block;
        color: #ffffff;
        font-size: 30px;
        line-height: 1;
        font-weight: 950;
        font-variant-numeric: tabular-nums;
      }

      .stat-label {
        display: block;
        margin-top: 8px;
        color: rgb(248 250 252 / 58%);
        font-size: 13px;
        font-weight: 800;
      }

      .masonry {
        width: min(1216px, 100%);
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-auto-rows: 8px;
        gap: 16px;
        align-items: start;
      }

      .masonry-card {
        position: relative;
        display: block;
        min-height: 132px;
        padding: 0;
        border: 1px solid rgb(255 255 255 / 12%);
        border-radius: 20px;
        background: #18181b;
        box-shadow: 0 18px 46px rgb(0 0 0 / 38%);
        overflow: hidden;
      }

      .masonry-card img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0.94;
      }

      .masonry-card-label {
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 2;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgb(0 0 0 / 54%);
        color: #ffffff;
        font-size: 13px;
        font-weight: 850;
        backdrop-filter: blur(12px);
      }

      .site-footer {
        color: rgb(248 250 252 / 56%);
      }

      .site-footer a:hover {
        color: #ffffff;
        background: rgb(255 255 255 / 10%);
      }

      @media (max-width: 840px) {
        .stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .masonry {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .stats {
          grid-template-columns: 1fr;
        }

        .masonry {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    ${renderSiteHeader("home", initialState.locale, text)}
    <main>
      <section class="landing-top">
        <div class="landing-inner">
          <div class="hero">
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
          </div>

          <div class="gallery-intro">
            <h2>${text.galleryTitle}</h2>
            <p>${text.gallerySubtitle}</p>
          </div>

          <div class="masonry" aria-label="${text.galleryLabel}">
            ${screenshots
              .map(
                (item, index) => `<article class="masonry-card" style="--image-ratio: ${
                  item.height / item.width
                };" data-width="${item.width}" data-height="${item.height}" data-depth="${
                  1 + (index % 4) * 0.12
                }">
                  <span class="masonry-card-label">${text.screenshotLabels[index]}</span>
                  <img src="${item.url}" width="${item.width}" height="${item.height}" alt="${text.screenshotLabels[index]} code image" loading="${
                    index < 3 ? "eager" : "lazy"
                  }" decoding="async" />
                </article>`,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="home-shell stats" aria-label="Codia stats">
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalRenders, initialState.locale)}</span><span class="stat-label">${text.totalRenders}</span></div>
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalImagesStored, initialState.locale)}</span><span class="stat-label">${text.imagesStored}</span></div>
        <div class="stat-card"><span class="stat-value">${formatNumber(stats.totalLinesRendered, initialState.locale)}</span><span class="stat-label">${text.linesRendered}</span></div>
        <div class="stat-card"><span class="stat-value">${formatBytes(stats.totalBytesStored)}</span><span class="stat-label">${text.base64Stored}</span></div>
      </section>
    </main>
    ${renderSiteFooter(text)}
    <script>
      const setCookie = (name, value) => {
        document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=31536000; samesite=lax";
      };

      const resizeMasonry = () => {
        const grid = document.querySelector(".masonry");
        if (!grid) return;
        const styles = window.getComputedStyle(grid);
        const rowHeight = Number.parseFloat(styles.getPropertyValue("grid-auto-rows")) || 8;
        const gap = Number.parseFloat(styles.getPropertyValue("row-gap")) || 16;

        grid.querySelectorAll(".masonry-card").forEach((card) => {
          const width = Number(card.dataset.width || 1);
          const height = Number(card.dataset.height || 1);
          const depth = Number(card.dataset.depth || 1);
          const renderedWidth = card.getBoundingClientRect().width;
          const renderedHeight = Math.max(132, renderedWidth * (height / width) * 1.72 * depth);
          const rows = Math.ceil((renderedHeight + gap) / (rowHeight + gap));
          card.style.height = renderedHeight + "px";
          card.style.gridRowEnd = "span " + rows;
        });
      };

      const masonryImages = document.querySelectorAll(".masonry-card img");
      masonryImages.forEach((image) => {
        if (image.complete) return;
        image.addEventListener("load", resizeMasonry, { once: true });
      });
      window.addEventListener("resize", resizeMasonry);
      resizeMasonry();

      const localeTrigger = document.querySelector(".site-locale-trigger");
      const localeMenu = document.getElementById("site-locale-menu");

      const closeLocaleMenu = () => {
        if (!localeTrigger || !localeMenu) return;
        localeTrigger.setAttribute("aria-expanded", "false");
        localeMenu.hidden = true;
      };

      const toggleLocaleMenu = () => {
        if (!localeTrigger || !localeMenu) return;
        const expanded = localeTrigger.getAttribute("aria-expanded") === "true";
        localeTrigger.setAttribute("aria-expanded", String(!expanded));
        localeMenu.hidden = expanded;
      };

      if (localeTrigger) {
        localeTrigger.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleLocaleMenu();
        });
      }

      document.addEventListener("click", (event) => {
        if (!localeTrigger || !localeMenu) return;
        if (!localeMenu.contains(event.target) && !localeTrigger.contains(event.target)) {
          closeLocaleMenu();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeLocaleMenu();
      });

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
