export const renderSiteHeader = (active: "home" | "try-it" = "home") => `
  <header class="site-header">
    <a class="site-brand" href="/" aria-label="Codia home">
      <img src="/assets/codia-logo.webp" width="38" height="38" alt="" />
      <span>Codia</span>
    </a>
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="/"${active === "home" ? ' aria-current="page"' : ""}>Home</a>
      <a href="/try-it"${active === "try-it" ? ' aria-current="page"' : ""}>Try It</a>
      <a href="/docs">API Docs</a>
      <a href="/llms.txt">llms.txt</a>
    </nav>
  </header>
`;

export const renderSiteFooter = () => `
  <footer class="site-footer">
    <span>Codia · Beautiful Code Images for Humans and APIs.</span>
    <nav aria-label="Footer links">
      <a href="/llms.txt">llms.txt</a>
      <a href="https://x.com/intent/follow?screen_name=aaronconlondev" target="_blank" rel="noreferrer">Aaron on X</a>
      <a href="https://github.com/AaronConlon/codia" target="_blank" rel="noreferrer">GitHub</a>
    </nav>
  </footer>
`;

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

  .site-nav a,
  .site-footer a {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 999px;
    color: var(--muted);
    font-size: 14px;
    font-weight: 800;
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
