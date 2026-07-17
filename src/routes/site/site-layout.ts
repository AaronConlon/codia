import { codiaBuildInfo } from "../../generated/build-info.js";

export type SiteLocale = "zh" | "en" | "ja";

export type SiteCopy = {
  navTryIt: string;
  navDocs: string;
  languageLabel: string;
  footerSlogan: string;
  footerBlog: string;
  footerX: string;
  footerPrivacy: string;
};

type SiteMetaOptions = {
  origin: string;
  path: string;
  title: string;
  description: string;
};

export const siteSlogan = "Beautiful Code Images for Humans and APIs.";
export const siteMetaTitle = `Codia · ${siteSlogan}`;
export const siteOgImageWidth = 1200;
export const siteOgImageHeight = 630;

const defaultCopy: SiteCopy = {
  navTryIt: "Playground",
  navDocs: "API Docs",
  languageLabel: "Language",
  footerSlogan: "Beautiful Code Images for Humans and APIs.",
  footerBlog: "Blog",
  footerX: "Aaron on X",
  footerPrivacy: "Privacy",
};

export const siteLocaleLabels: Record<SiteLocale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

const profileImageUrl = "https://pbs.twimg.com/profile_images/2069979979467890689/H3eMkyep_400x400.jpg";
const xFollowUrl = "https://x.com/intent/follow?screen_name=aaronconlondev";
const githubUrl = "https://github.com/AaronConlon/codia";
const siteBuildConsolePayload = JSON.stringify({
  updatedAt: codiaBuildInfo.date,
  gitTag: codiaBuildInfo.tag,
});

export const renderSiteMeta = ({ origin, path, title, description }: SiteMetaOptions) => {
  const canonicalUrl = `${origin}${path}`;
  const logoUrl = `${origin}/assets/codia-logo.webp`;
  const faviconUrl = `${origin}/favicon.png`;
  const ogImageUrl = `${origin}/og-image.png`;

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/png" href="${faviconUrl}" />
    <link rel="apple-touch-icon" href="${logoUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Codia" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:width" content="${siteOgImageWidth}" />
    <meta property="og:image:height" content="${siteOgImageHeight}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="Codia turns code into beautiful images for humans and APIs." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <meta name="twitter:image:alt" content="Codia turns code into beautiful images for humans and APIs." />
    <script>
      console.info("Codia update", ${siteBuildConsolePayload});
    </script>`;
};

export const renderSiteHeader = (
  active: "home" | "try-it" = "home",
  locale: SiteLocale = "en",
  copy: Partial<SiteCopy> = {},
) => {
  const text = { ...defaultCopy, ...copy };

  return `
  <header class="site-header">
    <a class="site-brand" href="/" aria-label="Codia home">
      <img src="/assets/codia-logo.webp" width="38" height="38" alt="" />
      <span>Codia</span>
    </a>
    <button class="site-menu-trigger" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="site-header-actions">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
    </button>
    <div class="site-header-actions" id="site-header-actions">
      <nav class="site-nav" aria-label="Primary navigation">
        <a href="/llms.txt" class="site-nav-llms"><span class="site-nav-llms-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg></span>llms.txt</a>
      </nav>
      <a class="site-playground-link" href="/try-it"${active === "try-it" ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 17-5-5 5-5"/><path d="m16 7 5 5-5 5"/><path d="m14 4-4 16"/></svg>${text.navTryIt}</a>
      <a class="site-avatar-link" href="${xFollowUrl}" target="_blank" rel="noreferrer" aria-label="Follow Aaron on X">
        <img class="site-avatar" src="${profileImageUrl}" width="38" height="38" alt="" />
      </a>
      <a class="site-icon-link" href="${githubUrl}" target="_blank" rel="noreferrer" aria-label="AaronConlon/codia on GitHub">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.3-.85 2.1"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
      </a>
      <div class="site-locale" aria-label="${text.languageLabel}">
        <button type="button" class="site-locale-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="site-locale-menu">
          <span class="site-locale-trigger-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </span>
          <span class="site-locale-trigger-label">${siteLocaleLabels[locale]}</span>
          <span class="site-locale-trigger-caret" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </button>
        <ul id="site-locale-menu" class="site-locale-menu" role="listbox" hidden>
          ${(["zh", "en", "ja"] as SiteLocale[])
            .map(
              (item) =>
                `<li role="option" aria-selected="${item === locale}"><button type="button" data-site-locale="${item}"${
                  item === locale ? ' aria-pressed="true"' : ""
                }>${
                  item === locale
                    ? '<span class="site-locale-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'
                    : ""
                }${siteLocaleLabels[item]}</button></li>`,
            )
            .join("")}
        </ul>
      </div>
    </div>
  </header>
`;
};

export const renderSiteFooter = (copy: Partial<SiteCopy> = {}) => {
  const text = { ...defaultCopy, ...copy };

  return `
  <footer class="site-footer">
    <span class="site-footer-brand">
      <img class="site-footer-logo" src="/assets/codia-logo.webp" width="30" height="30" alt="" />
      <img class="site-footer-avatar" src="${profileImageUrl}" width="30" height="30" alt="" />
      <span>Codia · ${text.footerSlogan}</span>
    </span>
    <nav aria-label="Footer links">
      <a href="/docs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>${text.navDocs}</a>
      <a href="/llms.txt"><svg viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>llms.txt</a>
      <a href="/privacy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>${text.footerPrivacy}</a>
      <a href="https://i5lin.top" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>${text.footerBlog}</a>
      <a href="${xFollowUrl}" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l11.5 16h4L8 4z"/><path d="M4 20 20 4"/></svg>${text.footerX}</a>
      <a href="${githubUrl}" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.3-.85 2.1"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>GitHub</a>
    </nav>
  </footer>
`;
};

export const siteShellStyles = `
  :root {
    color-scheme: light;
    --page: #f8fafc;
    --text: #0f172a;
    --muted: #64748b;
    --panel: #ffffff;
    --ink: #111827;
    --shadow: rgb(15 23 42 / 12%);
    --footer-rule: rgb(15 23 42 / 8%);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: clip;
    color: var(--text);
    background:
      linear-gradient(rgb(15 23 42 / 4%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(15 23 42 / 4%) 1px, transparent 1px),
      var(--page);
    background-size: 28px 28px;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  main {
    flex: 1 0 auto;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .site-header,
  .site-footer {
    width: min(1366px, calc(100% - 32px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .site-header {
    min-height: 78px;
    position: relative;
  }

  .site-header-actions {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
  }

  .site-menu-trigger {
    display: none;
    width: 40px;
    height: 40px;
    margin-left: auto;
    align-items: center;
    justify-content: center;
    border: 1px solid rgb(15 23 42 / 10%);
    border-radius: 4px;
    background: var(--panel);
    color: var(--text);
    font: inherit;
    cursor: pointer;
    box-shadow: 0 10px 24px rgb(15 23 42 / 10%);
    transition-property: color, transform;
    transition-duration: 160ms;
  }

  .site-menu-trigger:hover,
  .site-menu-trigger[aria-expanded="true"] {
    color: var(--ink);
  }

  .site-menu-trigger:active {
    transform: scale(0.96);
  }

  .site-menu-trigger svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .site-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ink);
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0;
  }

  .site-brand img {
    border-radius: 10px;
    box-shadow: 0 14px 30px rgb(15 23 42 / 16%);
    outline: 1px solid rgba(0, 0, 0, 0.1);
  }

  .site-nav,
  .site-footer nav {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .site-nav {
    justify-content: flex-end;
  }

  .site-locale {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .site-avatar-link,
  .site-icon-link {
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgb(15 23 42 / 10%);
    border-radius: 4px;
    background: var(--panel);
    color: var(--text);
    box-shadow: 0 10px 24px rgb(15 23 42 / 10%);
    overflow: hidden;
    flex: 0 0 auto;
    transition-property: color, transform;
    transition-duration: 160ms;
  }

  .site-avatar-link:hover,
  .site-icon-link:hover {
    color: var(--ink);
  }

  .site-avatar-link:active,
  .site-icon-link:active {
    transform: scale(0.96);
  }

  .site-avatar {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .site-icon-link svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .site-nav a,
  .site-playground-link,
  .site-footer a {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition-property: color, transform;
    transition-duration: 160ms;
  }

  .site-nav a:hover,
  .site-playground-link:hover,
  .site-footer a:hover {
    color: var(--text);
  }

  .site-footer a {
    border-radius: 4px;
  }

  .site-nav a[aria-current="page"],
  .site-playground-link[aria-current="page"] {
    color: var(--text);
  }

  .site-nav a:active,
  .site-playground-link:active,
  .site-footer a:active {
    transform: scale(0.96);
  }

  .site-nav-llms {
    gap: 6px;
  }

  .site-playground-link svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: 0 0 auto;
  }

  .site-footer a svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: 0 0 auto;
  }

  .site-nav-llms-icon {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    transform-origin: 50% 50%;
    color: currentColor;
    transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), color 160ms ease;
  }

  .site-nav-llms-icon svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .site-nav-llms:hover .site-nav-llms-icon {
    transform: rotate(-18deg) translateY(-1px);
    color: currentColor;
  }

  @media (prefers-reduced-motion: reduce) {
    .site-nav-llms-icon {
      transition: color 160ms ease;
    }

    .site-nav-llms:hover .site-nav-llms-icon {
      transform: none;
    }
  }

  .site-locale-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid rgb(15 23 42 / 10%);
    border-radius: 4px;
    background: var(--panel);
    color: var(--text);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition-property: color, transform;
    transition-duration: 160ms;
  }

  .site-locale-trigger:hover {
    background: var(--panel);
    border-color: rgb(15 23 42 / 10%);
    box-shadow: none;
    color: var(--ink);
  }

  .site-locale-trigger[aria-expanded="true"] {
    border-color: rgb(15 23 42 / 22%);
    box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
  }

  .site-locale-trigger:active {
    transform: scale(0.96);
  }

  .site-locale-trigger svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .site-locale-trigger-caret svg {
    transition: transform 160ms ease;
  }

  .site-locale-trigger[aria-expanded="true"] .site-locale-trigger-caret svg {
    transform: rotate(180deg);
  }

  .site-locale-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 168px;
    margin: 0;
    padding: 3px;
    list-style: none;
    border-radius: 11px;
    background: var(--panel);
    border: 1px solid rgb(255 255 255 / 10%);
    box-shadow: 0 18px 40px rgb(0 0 0 / 28%);
    z-index: 40;
  }

  .site-locale-menu[hidden] {
    display: none;
  }

  .site-locale-menu li {
    margin: 0 0 1px;
  }

  .site-locale-menu li:last-child {
    margin-bottom: 0;
  }

  .site-locale-menu button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    min-height: 33px;
    padding: 0 7px;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    color: rgb(248 250 252 / 62%);
    font: inherit;
    font-size: 11px;
    font-weight: 600;
    outline: none;
    text-align: left;
    cursor: pointer;
    transition-property: color;
    transition-duration: 140ms;
  }

  .site-locale-menu button:hover,
  .site-locale-menu button:focus-visible,
  .site-locale-menu button[aria-pressed="true"] {
    background: transparent;
    border: 0;
    border-color: transparent;
    border-radius: 0;
    box-shadow: none;
    color: #ffffff;
    outline: none;
  }

  .site-locale-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: currentColor;
  }

  .site-locale-check svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .site-footer {
    position: relative;
    z-index: 0;
    min-height: 96px;
    padding: 18px 0;
    color: rgb(248 250 252 / 62%);
    font-size: 13px;
  }

  .site-footer::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 100vw;
    z-index: -1;
    transform: translateX(-50%);
    background: #09090b;
    box-shadow: 0 -1px 0 var(--footer-rule);
    pointer-events: none;
  }

  .site-footer a {
    color: rgb(248 250 252 / 68%);
  }

  .site-footer a:hover {
    color: #ffffff;
  }

  .site-footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .site-footer-logo,
  .site-footer-avatar {
    width: 30px;
    height: 30px;
    box-shadow: 0 10px 24px rgb(0 0 0 / 28%);
    flex: 0 0 auto;
  }

  .site-footer-logo {
    border-radius: 8px;
  }

  .site-footer-avatar {
    border-radius: 4px;
    object-fit: cover;
    outline: 1px solid rgb(255 255 255 / 18%);
  }

  @media (max-width: 760px) {
    .site-header {
      align-items: center;
      padding: 18px 0;
      gap: 12px;
    }

    .site-menu-trigger {
      display: inline-flex;
    }

    .site-header-actions {
      position: absolute;
      z-index: 60;
      top: calc(100% - 8px);
      right: 0;
      width: min(320px, calc(100vw - 32px));
      margin-left: 0;
      padding: 12px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      border: 1px solid rgb(15 23 42 / 10%);
      border-radius: 4px;
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 22px 60px rgb(15 23 42 / 18%);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-6px);
      pointer-events: none;
      transition:
        opacity 160ms ease,
        transform 160ms ease,
        visibility 160ms ease;
    }

    .site-header.is-menu-open .site-header-actions {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }

    .site-nav,
    .site-footer nav {
      width: 100%;
    }

    .site-nav {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .site-nav a,
    .site-playground-link,
    .site-locale-trigger {
      width: 100%;
      justify-content: flex-start;
      color: #0f172a;
      background: transparent;
      border-color: rgb(15 23 42 / 8%);
    }

    .site-avatar-link,
    .site-icon-link {
      width: 100%;
      height: 40px;
      border-radius: 4px;
      justify-content: flex-start;
      padding: 0 12px;
      overflow: visible;
      box-shadow: none;
      color: #0f172a;
    }

    .site-avatar-link::after {
      content: "Aaron on X";
      margin-left: 10px;
      font-size: 14px;
      font-weight: 800;
    }

    .site-icon-link::after {
      content: "GitHub";
      margin-left: 10px;
      font-size: 14px;
      font-weight: 800;
    }

    .site-avatar {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }

    .site-locale {
      width: 100%;
    }

    .site-locale-menu {
      position: static;
      width: 100%;
      min-width: 0;
      margin-top: 6px;
      box-shadow: none;
    }

    .site-footer {
      align-items: stretch;
      flex-direction: column;
      padding: 22px 0 24px;
      gap: 14px;
    }

    .site-footer-brand {
      width: 100%;
      align-items: flex-start;
      flex-wrap: wrap;
      line-height: 1.5;
      margin: 24px 0;
    }

    .site-footer-brand span {
      flex: 0 0 100%;
    }

    .site-footer nav {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .site-footer a {
      width: 100%;
      justify-content: flex-start;
      min-height: 40px;
      padding: 0 10px;
      border-radius: 4px;
      border-color: rgb(255 255 255 / 8%);
      background: rgb(255 255 255 / 4%);
    }

    .site-footer a:hover {
      color: #ffffff;
    }

    .site-footer::before {
      left: 50%;
    }
  }
`;
