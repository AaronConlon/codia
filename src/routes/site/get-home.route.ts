import { setCookie } from "hono/cookie";
import type { AppInstance } from "../../types.js";
import { getRenderStats } from "../../services/render-records.js";
import {
  renderSiteFooter,
  renderSiteHeader,
  renderSiteMeta,
  siteMetaTitle,
  siteShellStyles,
  type SiteLocale,
} from "./site-layout.js";

type HomeInitialState = {
  locale: SiteLocale;
  htmlLang: "zh-Hans" | "en" | "ja";
};

const homeCopy = {
  zh: {
    metaDescription: "用友好的界面和 Agent 友好的 API 生成、定制漂亮的代码图片。",
    navTryIt: "Playground",
    navDocs: "API 文档",
    languageLabel: "语言",
    footerSlogan: "为人和 API 打造的漂亮代码图片。",
    footerBlog: "博客",
    footerX: "关注 Aaron",
    footerPrivacy: "隐私",
    eyebrow: "Human-friendly UI · API-first rendering",
    slogan: "Beautiful Code Images for Humans and APIs.",
    intro: "把代码转换成适合文档、博客、社交媒体和自动化流程的高清图片；不只适合人工操作，也方便 Agent 直接调用 API 生成图片。",
    tryCodia: "试试看",
    viewApi: "查看 API",
    galleryLabel: "Codia screenshot gallery",
    totalRenders: "总生成次数",
    imagesStored: "图片生成数",
    linesRendered: "已渲染行数",
    screenshotLabels: [
      "TypeScript",
      "HTML",
      "Go",
      "CSS",
      "JavaScript",
      "SQL",
      "Ruby",
      "Bash",
      "Rust",
      "C#",
      "Python",
      "PHP",
      "Java",
      "Kotlin",
      "Swift",
    ],
  },
  en: {
    metaDescription:
      "Generate and customize beautiful code images through a friendly UI and an agent-friendly API.",
    navTryIt: "Playground",
    navDocs: "API Docs",
    languageLabel: "Language",
    footerSlogan: "Beautiful Code Images for Humans and APIs.",
    footerBlog: "Blog",
    footerX: "Aaron on X",
    footerPrivacy: "Privacy",
    eyebrow: "Human-friendly UI · API-first rendering",
    slogan: "Beautiful Code Images for Humans and APIs.",
    intro:
      "Turn code into crisp images for docs, blogs, social posts, and automated workflows. It works for humans in the UI and for agents calling the API directly.",
    tryCodia: "Try Codia",
    viewApi: "View API",
    galleryLabel: "Codia screenshot gallery",
    totalRenders: "Total renders",
    imagesStored: "Images generated",
    linesRendered: "Lines rendered",
    screenshotLabels: [
      "TypeScript",
      "HTML",
      "Go",
      "CSS",
      "JavaScript",
      "SQL",
      "Ruby",
      "Bash",
      "Rust",
      "C#",
      "Python",
      "PHP",
      "Java",
      "Kotlin",
      "Swift",
    ],
  },
  ja: {
    metaDescription:
      "使いやすい UI と Agent 向け API で、美しいコード画像を生成、カスタマイズできます。",
    navTryIt: "Playground",
    navDocs: "API ドキュメント",
    languageLabel: "言語",
    footerSlogan: "人と API のための美しいコード画像。",
    footerBlog: "ブログ",
    footerX: "Aaron をフォロー",
    footerPrivacy: "プライバシー",
    eyebrow: "Human-friendly UI · API-first rendering",
    slogan: "Beautiful Code Images for Humans and APIs.",
    intro:
      "ドキュメント、ブログ、SNS、ワークフロー向けにコードを鮮明な画像へ変換します。人が UI で操作するだけでなく、Agent が API を直接呼び出す用途にも向いています。",
    tryCodia: "試す",
    viewApi: "API を見る",
    galleryLabel: "Codia スクリーンショットギャラリー",
    totalRenders: "生成回数",
    imagesStored: "画像生成数",
    linesRendered: "描画行数",
    screenshotLabels: [
      "TypeScript",
      "HTML",
      "Go",
      "CSS",
      "JavaScript",
      "SQL",
      "Ruby",
      "Bash",
      "Rust",
      "C#",
      "Python",
      "PHP",
      "Java",
      "Kotlin",
      "Swift",
    ],
  },
} as const;

const getStatDisplayValue = (value: number) => {
  if (value <= 10_000) return { value, suffix: "" };
  const compactValue = value / 1_000;
  return {
    value: Number(compactValue.toFixed(compactValue >= 100 ? 0 : 1)),
    suffix: "k",
  };
};

const formatStatValue = (value: number, locale: SiteLocale) => {
  const stat = getStatDisplayValue(value);
  const hasFraction = !Number.isInteger(stat.value);
  const formattedValue = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, {
    maximumFractionDigits: hasFraction ? 1 : 0,
    minimumFractionDigits: hasFraction ? 1 : 0,
  }).format(stat.value);
  return `${formattedValue}${stat.suffix}`;
};

const screenshots = [
  {
    language: "typescript",
    width: 628,
    height: 236,
    url: "https://de4965e.webp.li/blog-images/2026/07/5fa36dbaad07e39ea75495903f40e20b.webp",
  },
  { language: "html", width: 877, height: 300, url: "/assets/gallery/html-neon-form.webp" },
  {
    language: "go",
    width: 740,
    height: 320,
    url: "https://de4965e.webp.li/blog-images/2026/07/834dde8c604a0946fab221f974f6da5b.webp",
  },
  { language: "css", width: 901, height: 348, url: "/assets/gallery/css-fluid-grid.webp" },
  {
    language: "javascript",
    width: 1020,
    height: 224,
    url: "https://de4965e.webp.li/blog-images/2026/07/1cc4305bbd610d6de72dd41543c9e911.webp",
  },
  { language: "sql", width: 740, height: 324, url: "/assets/gallery/sql-usage-rollup.webp" },
  {
    language: "ruby",
    width: 704,
    height: 284,
    url: "https://de4965e.webp.li/blog-images/2026/07/d66ecd222278fbcc355c3dac3b7fbfb8.webp",
  },
  { language: "bash", width: 800, height: 300, url: "/assets/gallery/bash-release-check.webp" },
  {
    language: "rust",
    width: 764,
    height: 236,
    url: "https://de4965e.webp.li/blog-images/2026/07/5664656304704be9f1374d22fb6b0581.webp",
  },
  { language: "csharp", width: 901, height: 324, url: "/assets/gallery/csharp-render-job.webp" },
  {
    language: "python",
    width: 714,
    height: 236,
    url: "https://de4965e.webp.li/blog-images/2026/07/8ea99733c2c0ce9c227a05451a94c6b5.webp",
  },
  { language: "php", width: 803, height: 372, url: "/assets/gallery/php-route-handler.webp" },
  {
    language: "java",
    width: 726,
    height: 248,
    url: "https://de4965e.webp.li/blog-images/2026/07/3bd53282a53519d9a3e81201d3fa316c.webp",
  },
  {
    language: "kotlin",
    width: 750,
    height: 260,
    url: "https://de4965e.webp.li/blog-images/2026/07/a1ad3a2ca37849d6092efd5e4e1d79c4.webp",
  },
  {
    language: "swift",
    width: 689,
    height: 296,
    url: "https://de4965e.webp.li/blog-images/2026/07/70ba14d556446b453e3e55ffb01b4890.webp",
  },
];

const homeHtml = (initialState: HomeInitialState, origin: string) => {
  const stats = getRenderStats();
  const text = homeCopy[initialState.locale];
  const statItems = [
    { value: stats.totalRenders, label: text.totalRenders },
    { value: stats.totalImagesStored, label: text.imagesStored },
    { value: stats.totalLinesRendered, label: text.linesRendered },
  ].map((item) => {
    const display = getStatDisplayValue(item.value);
    return {
      ...item,
      displayValue: display.value,
      suffix: display.suffix,
      fallback: formatStatValue(item.value, initialState.locale),
    };
  });

  return `<!doctype html>
<html lang="${initialState.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderSiteMeta({
      origin,
      path: "/",
      title: siteMetaTitle,
      description: text.metaDescription,
    })}
    <style>
      ${siteShellStyles}

      body {
        background:
          linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
          linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px),
          #050505;
        background-size: 28px 28px;
        color: #f8fafc;
        overflow-x: clip;
      }

      .home-shell {
        width: min(1366px, calc(100% - 32px));
        margin: 0 auto;
      }

      .site-header {
        position: relative;
        z-index: 10;
      }

      .site-brand,
      .site-nav a,
      .site-playground-link,
      .site-locale-trigger,
      .site-icon-link {
        color: #f8fafc;
      }

      .site-brand img {
        outline-color: rgb(255 255 255 / 16%);
        box-shadow: 0 16px 34px rgb(0 0 0 / 32%);
      }

      .site-nav a,
      .site-playground-link {
        background: transparent;
        border-color: transparent;
        color: rgb(248 250 252 / 78%);
      }

      .site-locale-trigger {
        background: rgb(255 255 255 / 7%);
        border-color: rgb(255 255 255 / 12%);
      }

      .site-menu-trigger,
      .site-avatar-link,
      .site-icon-link {
        background: rgb(255 255 255 / 7%);
        border-color: rgb(255 255 255 / 12%);
        box-shadow: 0 16px 34px rgb(0 0 0 / 24%);
      }

      .site-nav a:hover,
      .site-playground-link:hover,
      .site-locale-trigger:hover,
      .site-menu-trigger:hover,
      .site-menu-trigger[aria-expanded="true"],
      .site-avatar-link:hover,
      .site-icon-link:hover {
        background: rgb(255 255 255 / 13%);
        border-color: rgb(255 255 255 / 14%);
        color: #ffffff;
      }

      .site-menu-trigger {
        color: #f8fafc;
      }

      .site-nav a[aria-current="page"],
      .site-playground-link[aria-current="page"] {
        color: #ffffff;
      }

      .site-nav-llms-icon {
        color: #ffffff;
        filter: drop-shadow(0 0 8px rgb(255 255 255 / 36%));
      }

      .site-locale-menu {
        background: #ffffff;
        border-color: rgb(15 23 42 / 10%);
      }

      .site-locale-menu button {
        color: #0f172a;
      }

      .site-locale-menu button:hover {
        background: rgb(15 23 42 / 6%);
      }

      .site-locale-menu button[aria-pressed="true"] {
        background: #111827;
        color: #ffffff;
      }

      @media (max-width: 760px) {
        .site-header-actions {
          background: #ffffff;
          color: #0f172a;
        }

        .site-header.is-menu-open .site-header-actions {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .site-header-actions .site-nav a,
        .site-header-actions .site-playground-link,
        .site-header-actions .site-locale-trigger,
        .site-header-actions .site-avatar-link,
        .site-header-actions .site-icon-link {
          background: transparent;
          border-color: rgb(15 23 42 / 8%);
          color: #0f172a;
          box-shadow: none;
        }

        .site-header-actions .site-nav a:hover,
        .site-header-actions .site-playground-link:hover,
        .site-header-actions .site-locale-trigger:hover,
        .site-header-actions .site-avatar-link:hover,
        .site-header-actions .site-icon-link:hover {
          background: rgb(15 23 42 / 6%);
          border-color: rgb(15 23 42 / 12%);
          color: #0f172a;
        }
      }

      .landing-top {
        position: relative;
        width: 100%;
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
        width: min(1366px, calc(100% - 32px));
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
        --speed: 2.8s;
        --angle: 45deg;
        --shine-width: 2ch;
        --start-position: 76%;
        --end-position: 24%;
        max-width: 660px;
        margin: 0;
        color: transparent;
        background-image: linear-gradient(
          var(--angle),
          rgb(248 250 252 / 68%) calc(50% - var(--shine-width)),
          #ffffff 50%,
          rgb(248 250 252 / 68%) calc(50% + var(--shine-width))
        );
        background-size: 400% 100%;
        background-position: var(--start-position) 0;
        background-clip: text;
        -webkit-background-clip: text;
        font-size: clamp(24px, 4vw, 54px);
        line-height: 1.04;
        font-weight: 950;
        text-wrap: balance;
        animation: shimmer var(--speed) ease-in-out infinite both;
      }

      @keyframes shimmer {
        0% {
          background-position: var(--start-position) 0;
        }

        72%,
        100% {
          background-position: var(--end-position) 0;
        }
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
        position: relative;
        overflow: hidden;
        isolation: isolate;
        background: #ffffff;
        color: #09090b;
        box-shadow: 0 16px 36px rgb(255 255 255 / 14%);
      }

      .button.primary::before {
        content: "";
        position: absolute;
        inset: -40%;
        z-index: -1;
        background: linear-gradient(
          110deg,
          transparent 28%,
          rgb(229 231 235 / 78%) 46%,
          rgb(255 255 255 / 92%) 50%,
          rgb(229 231 235 / 78%) 54%,
          transparent 72%
        );
        transform: translateX(-72%) rotate(8deg);
        opacity: 0;
        transition:
          transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
          opacity 180ms ease;
      }

      .button.primary svg,
      .button.primary span {
        position: relative;
        z-index: 1;
      }

      .button.primary svg {
        transition: transform 180ms ease;
      }

      .button.primary:hover::before {
        transform: translateX(72%) rotate(8deg);
        opacity: 1;
      }

      .button.primary:hover svg {
        transform: translateX(2px);
      }

      .button.secondary {
        background: rgb(255 255 255 / 10%);
        color: white;
        box-shadow: inset 0 0 0 1px rgb(255 255 255 / 12%);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(18px, 4vw, 54px);
        padding: 72px 0 64px;
      }

      .stat-card {
        display: grid;
        justify-items: center;
        gap: 12px;
        padding: 8px 0;
        text-align: center;
        opacity: 0;
        transform: translateY(18px);
        animation: stats-fade-in 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      .stat-card:nth-child(2) {
        animation-delay: 120ms;
      }

      .stat-card:nth-child(3) {
        animation-delay: 240ms;
      }

      .stat-value {
        display: block;
        color: #ffffff;
        font-size: clamp(56px, 7vw, 104px);
        line-height: 1;
        font-weight: 950;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0;
        text-shadow: 0 18px 42px rgb(0 0 0 / 30%);
        --number-flow-mask-height: 0.14em;
      }

      .stat-label {
        display: block;
        color: rgb(248 250 252 / 58%);
        font-size: 14px;
        font-weight: 800;
      }

      @keyframes stats-fade-in {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .masonry {
        width: min(1160px, 100%);
        margin: 200px auto 0;
        columns: 3 320px;
        column-gap: 10px;
      }

      .masonry-card {
        position: relative;
        display: block;
        margin: 0 0 10px;
        padding: 0;
        border: 1px solid rgb(255 255 255 / 12%);
        border-radius: 0;
        background: #18181b;
        box-shadow: 0 14px 34px rgb(0 0 0 / 34%);
        overflow: hidden;
        break-inside: avoid;
        opacity: 0;
        transform: translateY(18px);
        animation: masonry-fade-in 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      @keyframes masonry-fade-in {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .masonry-card img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: contain;
        opacity: 0.94;
      }

      .site-footer {
        --footer-rule: rgb(255 255 255 / 8%);
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

      }

      @media (max-width: 560px) {
        .stats {
          grid-template-columns: 1fr;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .slogan {
          color: #ffffff;
          background-image: none;
          animation: none;
        }

        .button.primary::before,
        .button.primary svg,
        .masonry-card,
        .stat-card {
          transition: none;
          animation: none;
        }

        .masonry-card,
        .stat-card {
          opacity: 1;
          transform: none;
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
                <a class="button primary" href="/try-it">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  <span>${text.tryCodia}</span>
                </a>
              </div>
            </div>
          </div>

          <div class="masonry" aria-label="${text.galleryLabel}">
            ${screenshots
              .map(
                (item, index) => `<article class="masonry-card" style="animation-delay: ${Math.min(index * 25, 280)}ms">
                  <img src="${item.url}" width="${item.width}" height="${item.height}" alt="${text.screenshotLabels[index]} code image" loading="eager" decoding="async" />
                </article>`,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="home-shell stats" aria-label="Codia stats">
        ${statItems
          .map(
            (item) =>
              `<div class="stat-card"><number-flow class="stat-value" value="0" data-value="${item.displayValue}" data-suffix="${item.suffix}" data-locale="${initialState.locale}" data-fallback="${item.fallback}">0${item.suffix}</number-flow><span class="stat-label">${item.label}</span></div>`,
          )
          .join("")}
      </section>
    </main>
    ${renderSiteFooter(text)}
    <script type="module">
      import "https://esm.sh/number-flow";

      const localeMap = {
        zh: "zh-CN",
        en: "en-US",
        ja: "ja-JP",
      };

      const getStatFlows = () => [...document.querySelectorAll("number-flow[data-value]")];

      const setupStatFlow = (flow) => {
        const value = Number(flow.getAttribute("data-value") ?? "0");
        const locale = flow.getAttribute("data-locale") ?? "en";
        const suffix = flow.getAttribute("data-suffix") ?? "";
        const hasFraction = !Number.isInteger(value);
        flow.locales = localeMap[locale] ?? localeMap.en;
        flow.numberSuffix = suffix;
        flow.format = {
          maximumFractionDigits: hasFraction ? 1 : 0,
          minimumFractionDigits: hasFraction ? 1 : 0,
        };
        flow.trend = 1;
        flow.transformTiming = { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
        flow.spinTiming = { duration: 760, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
        flow.opacityTiming = { duration: 220, easing: "ease-out" };
      };

      const setStatsValue = (isActive) => {
        getStatFlows().forEach((flow) => {
          const target = Number(flow.getAttribute("data-value") ?? "0");
          flow.update(isActive && Number.isFinite(target) ? target : 0);
        });
      };

      const initializeStatsObserver = () => {
        const statsSection = document.querySelector(".stats");
        if (!statsSection) return;
        getStatFlows().forEach((flow) => {
          setupStatFlow(flow);
          flow.update(0);
        });
        if (!("IntersectionObserver" in window)) {
          requestAnimationFrame(() => setStatsValue(true));
          return;
        }
        const observer = new IntersectionObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.intersectionRatio >= 0.34) {
            setStatsValue(false);
            requestAnimationFrame(() => setStatsValue(true));
            return;
          }
          setStatsValue(false);
        }, {
          root: null,
          threshold: 0.34,
          rootMargin: "-8% 0px -8% 0px",
        });
        observer.observe(statsSection);
      };

      customElements.whenDefined("number-flow").then(initializeStatsObserver).catch(() => {
        getStatFlows().forEach((flow) => {
          flow.textContent = flow.getAttribute("data-fallback") ?? "";
        });
      });
    </script>
    <script>
      const setCookie = (name, value) => {
        document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=31536000; samesite=lax";
      };

      const localeTrigger = document.querySelector(".site-locale-trigger");
      const localeMenu = document.getElementById("site-locale-menu");
      const siteHeader = document.querySelector(".site-header");
      const menuTrigger = document.querySelector(".site-menu-trigger");

      const closeLocaleMenu = () => {
        if (!localeTrigger || !localeMenu) return;
        localeTrigger.setAttribute("aria-expanded", "false");
        localeMenu.hidden = true;
      };

      const closeHeaderMenu = () => {
        if (!siteHeader || !menuTrigger) return;
        siteHeader.classList.remove("is-menu-open");
        menuTrigger.setAttribute("aria-expanded", "false");
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

      if (menuTrigger && siteHeader) {
        menuTrigger.addEventListener("click", (event) => {
          event.stopPropagation();
          const isOpen = siteHeader.classList.toggle("is-menu-open");
          menuTrigger.setAttribute("aria-expanded", String(isOpen));
          if (!isOpen) closeLocaleMenu();
        });
      }

      document.addEventListener("click", (event) => {
        if (!localeTrigger || !localeMenu) return;
        if (!localeMenu.contains(event.target) && !localeTrigger.contains(event.target)) {
          closeLocaleMenu();
        }
        if (siteHeader && !siteHeader.contains(event.target)) {
          closeHeaderMenu();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeLocaleMenu();
          closeHeaderMenu();
        }
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

    return c.html(homeHtml(initialState, new URL(c.req.url).origin));
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
