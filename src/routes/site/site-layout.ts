export type SiteLocale = "zh" | "en" | "ja";

export type SiteCopy = {
  navHome: string;
  navTryIt: string;
  navDocs: string;
  languageLabel: string;
  footerSlogan: string;
  footerBlog: string;
  footerX: string;
  footerPrivacy: string;
};

const defaultCopy: SiteCopy = {
  navHome: "Home",
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
    <div class="site-header-actions">
      <nav class="site-nav" aria-label="Primary navigation">
        <a href="/"${active === "home" ? ' aria-current="page"' : ""}>${text.navHome}</a>
        <a href="/docs">${text.navDocs}</a>
        <a href="/llms.txt" class="site-nav-llms"><span class="site-nav-llms-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg></span>llms.txt</a>
      </nav>
      <a class="site-playground-link" href="/try-it"${active === "try-it" ? ' aria-current="page"' : ""}>${text.navTryIt}</a>
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
                }><span class="site-locale-check" aria-hidden="true">${
                  item === locale
                    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
                    : ""
                }</span>${siteLocaleLabels[item]}</button></li>`,
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
      <img src="/assets/codia-logo.webp" width="30" height="30" alt="" />
      <span>Codia · ${text.footerSlogan}</span>
    </span>
    <nav aria-label="Footer links">
      <a href="/llms.txt"><svg viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>llms.txt</a>
      <a href="/privacy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>${text.footerPrivacy}</a>
      <a href="https://i5lin.top" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>${text.footerBlog}</a>
      <a href="https://x.com/intent/follow?screen_name=aaronconlondev" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l11.5 16h4L8 4z"/><path d="M4 20 20 4"/></svg>${text.footerX}</a>
      <a href="https://github.com/AaronConlon/codia" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.3-.85 2.1"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>GitHub</a>
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
  }

  .site-header-actions {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
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

  .site-nav a,
  .site-playground-link,
  .site-footer a {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition-property: color, background, transform;
    transition-duration: 160ms;
  }

  .site-nav a:hover,
  .site-playground-link:hover,
  .site-footer a:hover {
    color: var(--text);
    background: rgb(15 23 42 / 6%);
    border-color: rgb(15 23 42 / 10%);
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
    border-radius: 999px;
    background: var(--panel);
    color: var(--text);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition-property: color, background, border-color, transform, box-shadow;
    transition-duration: 160ms;
  }

  .site-locale-trigger:hover {
    background: rgb(15 23 42 / 4%);
    border-color: rgb(15 23 42 / 18%);
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
    padding: 6px;
    list-style: none;
    border-radius: 14px;
    background: var(--panel);
    border: 1px solid rgb(15 23 42 / 10%);
    box-shadow: 0 18px 40px rgb(15 23 42 / 16%);
    z-index: 40;
  }

  .site-locale-menu[hidden] {
    display: none;
  }

  .site-locale-menu li {
    margin: 0 0 4px;
  }

  .site-locale-menu li:last-child {
    margin-bottom: 0;
  }

  .site-locale-menu button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 36px;
    padding: 0 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition-property: color, background;
    transition-duration: 140ms;
  }

  .site-locale-menu button:hover {
    background: rgb(15 23 42 / 6%);
  }

  .site-locale-menu button[aria-pressed="true"] {
    color: #ffffff;
    background: #111827;
  }

  .site-locale-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--text);
  }

  .site-locale-check svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .site-footer {
    position: relative;
    min-height: 96px;
    color: var(--muted);
    font-size: 13px;
  }

  .site-footer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 100vw;
    height: 1px;
    transform: translateX(-50%);
    background: var(--footer-rule);
    pointer-events: none;
  }

  .site-footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .site-footer-brand img {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 12%);
    flex: 0 0 auto;
  }

  @media (max-width: 760px) {
    .site-header,
    .site-footer {
      align-items: flex-start;
      flex-direction: column;
      padding: 18px 0;
    }

    .site-header-actions {
      margin-left: 0;
      width: 100%;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }
`;
