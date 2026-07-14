export type SiteLocale = "zh" | "en" | "ja";

export type SiteCopy = {
  navHome: string;
  navTryIt: string;
  navDocs: string;
  languageLabel: string;
  footerSlogan: string;
  footerX: string;
};

const defaultCopy: SiteCopy = {
  navHome: "Home",
  navTryIt: "Try It",
  navDocs: "API Docs",
  languageLabel: "Language",
  footerSlogan: "Beautiful Code Images for Humans and APIs.",
  footerX: "Aaron on X",
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
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="/"${active === "home" ? ' aria-current="page"' : ""}>${text.navHome}</a>
      <a href="/try-it"${active === "try-it" ? ' aria-current="page"' : ""}>${text.navTryIt}</a>
      <a href="/docs">${text.navDocs}</a>
      <a href="/llms.txt" class="site-nav-llms"><span class="site-nav-llms-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg></span>llms.txt</a>
    </nav>
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
  </header>
`;
};

export const renderSiteFooter = (copy: Partial<SiteCopy> = {}) => {
  const text = { ...defaultCopy, ...copy };

  return `
  <footer class="site-footer">
    <span>Codia · ${text.footerSlogan}</span>
    <nav aria-label="Footer links">
      <a href="/llms.txt">llms.txt</a>
      <a href="https://x.com/intent/follow?screen_name=aaronconlondev" target="_blank" rel="noreferrer">${text.footerX}</a>
      <a href="https://github.com/AaronConlon/codia" target="_blank" rel="noreferrer">GitHub</a>
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
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
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
    width: min(1366px, calc(100vw - 32px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .site-header {
    min-height: 78px;
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

  .site-locale {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .site-nav a,
  .site-footer a {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border: 0;
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
  .site-nav a[aria-current="page"],
  .site-footer a:hover {
    color: var(--text);
    background: rgb(15 23 42 / 6%);
  }

  .site-nav a:active,
  .site-footer a:active {
    transform: scale(0.96);
  }

  .site-nav-llms {
    gap: 6px;
  }

  .site-nav-llms-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform-origin: 50% 50%;
    color: #ffffff;
    filter: drop-shadow(0 0 8px rgb(255 255 255 / 36%));
    transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64 1), color 160ms ease;
  }

  .site-nav-llms-icon svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .site-nav-llms:hover .site-nav-llms-icon {
    transform: rotate(-18deg) translateY(-1px);
    color: #ffffff;
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
    margin: 0;
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
    color: var(--text);
    background: rgb(15 23 42 / 8%);
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
    min-height: 96px;
    color: var(--muted);
    font-size: 13px;
  }

  @media (max-width: 760px) {
    .site-header,
    .site-footer {
      align-items: flex-start;
      flex-direction: column;
      padding: 18px 0;
    }
  }
`;
