import { setCookie } from "hono/cookie";
import { bundledThemes } from "shiki";
import type { AppInstance } from "../../types.js";

const shikiThemes = Object.keys(bundledThemes).sort();

type ExampleInitialState = {
  locale: "zh" | "en" | "ja";
  htmlLang: "zh-Hans" | "en" | "ja";
};

type CodeExampleRouteOptions = {
  codeInspectorScript?: string;
};

const localeLabels = {
  zh: "中文",
  en: "English",
  ja: "日本語",
} as const;

const exampleTranslations = {
  zh: {
    subtitle: "为人和 API 打造的漂亮代码图片。",
    settings: "设置",
    editor: "编辑器",
    image: "图片",
    imageEmpty: "切换到图片模式时生成最终图片。",
    loading: "正在加载 Codia...",
    language: "语言",
    codeTheme: "代码主题",
    backgroundColor: "背景",
    borderSize: "边距",
    containerWidth: "容器宽度",
    showLineNumbers: "显示行号",
    copy: "复制图片",
    download: "下载",
    copied: "图片已复制",
    downloaded: "已下载",
    failed: "操作失败",
    ready: "Ready",
    rendering: "生成中...",
    noMatch: "没有匹配项",
    containerRange: "容器宽度必须是 {min}-1920",
  },
  en: {
    subtitle: "Beautiful Code Images for Humans and APIs.",
    settings: "Settings",
    editor: "Editor",
    image: "Image",
    imageEmpty: "Switch to image mode to render the final image.",
    loading: "Loading Codia...",
    language: "Language",
    codeTheme: "Code theme",
    backgroundColor: "Background",
    borderSize: "Padding",
    containerWidth: "Container width",
    showLineNumbers: "Line numbers",
    copy: "Copy Image",
    download: "Download",
    copied: "Image copied",
    downloaded: "Downloaded",
    failed: "Action failed",
    ready: "Ready",
    rendering: "Rendering...",
    noMatch: "No matches",
    containerRange: "Container width must be {min}-1920",
  },
  ja: {
    subtitle: "人と API のための美しいコード画像。",
    settings: "設定",
    editor: "エディター",
    image: "画像",
    imageEmpty: "画像モードに切り替えると最終画像を生成します。",
    loading: "Codia を読み込み中...",
    language: "言語",
    codeTheme: "コードテーマ",
    backgroundColor: "背景",
    borderSize: "余白",
    containerWidth: "コンテナ幅",
    showLineNumbers: "行番号",
    copy: "画像をコピー",
    download: "ダウンロード",
    copied: "画像をコピーしました",
    downloaded: "ダウンロードしました",
    failed: "失敗しました",
    ready: "Ready",
    rendering: "生成中...",
    noMatch: "一致する項目がありません",
    containerRange: "コンテナ幅は {min}-1920 です",
  },
} as const;

const backgroundPresets = [
  {
    id: "sky",
    label: "Sky Cyan",
    bgColor:
      "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  },
  {
    id: "aurora",
    label: "Aurora",
    bgColor: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    bgColor: "linear-gradient(135deg, #fdc830 0%, #f37335 100%)",
  },
  {
    id: "candy",
    label: "Candy",
    bgColor: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 52%, #fad0c4 100%)",
  },
  {
    id: "indigo",
    label: "Indigo",
    bgColor: "radial-gradient(circle at top left, #a78bfa 0%, #6366f1 36%, #111827 100%)",
  },
  {
    id: "mesh",
    label: "Mesh",
    bgColor:
      "radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.9) 0%, transparent 32%), radial-gradient(circle at 80% 18%, rgba(14, 165, 233, 0.86) 0%, transparent 34%), radial-gradient(circle at 50% 86%, rgba(236, 72, 153, 0.78) 0%, transparent 38%), #111827",
  },
  {
    id: "paper",
    label: "Soft Paper",
    bgColor: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 48%, #cbd5e1 100%)",
  },
  {
    id: "noir",
    label: "Noir",
    bgColor: "radial-gradient(circle at top, #374151 0%, #111827 56%, #030712 100%)",
  },
] as const;

const defaultExampleCode = `function quickSort(values: number[]): number[] {
  if (values.length <= 1) return values;

  const [pivot, ...rest] = values;
  const smaller = rest.filter((value) => value < pivot);
  const larger = rest.filter((value) => value >= pivot);

  return [...quickSort(smaller), pivot, ...quickSort(larger)];
}

const result = quickSort([8, 3, 5, 4, 7, 6, 1, 2]);
console.log(result);`;

const inspectorPath = (line: number, column: number, node: string) =>
  `src/routes/code/get-code-example.route.ts:${line}:${column}:${node}`;

const exampleHtml = (
  initialState: ExampleInitialState,
  origin: string,
  options: CodeExampleRouteOptions = {},
) => {
  const canonicalUrl = `${origin}/example`;
  const logoUrl = `${origin}/assets/codia-logo.webp`;
  const faviconUrl = `${origin}/favicon.png`;
  const ogImageUrl = `${origin}/og-image.png`;
  const text = exampleTranslations[initialState.locale];
  const localeLabel = localeLabels[initialState.locale];
  const defaultBgColor = backgroundPresets[0].bgColor;

  return String.raw`<!doctype html>
<html lang="${initialState.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Codia</title>
    <meta name="description" content="Beautiful Code Images for Humans and APIs." />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/png" href="${faviconUrl}" />
    <link rel="apple-touch-icon" href="${logoUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Codia" />
    <meta property="og:title" content="Codia" />
    <meta property="og:description" content="Beautiful Code Images for Humans and APIs." />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1536" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:image:type" content="image/png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Codia" />
    <meta name="twitter:description" content="Beautiful Code Images for Humans and APIs." />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/vanilla-sonner@0.5.2/dist/vanilla-sonner.min.css"
      rel="stylesheet"
    />
    <script src="https://cdn.jsdelivr.net/npm/swiper@14/swiper-element-bundle.min.js"></script>
    <style>
      :root {
        color-scheme: light;
        --page-bg: #f8fafc;
        --text: #09090b;
        --muted: #64748b;
        --panel: #ffffff;
        --panel-strong: #f8fafc;
        --field: #ffffff;
        --border: #e4e4e7;
        --field-border: #d4d4d8;
        --divider: rgb(15 23 42 / 14%);
        --control-hover: #f4f4f5;
        --button-bg: #18181b;
        --button-text: #ffffff;
        --button-hover: #27272a;
        --button-secondary-bg: transparent;
        --focus: #18181b;
        --focus-soft: rgb(24 24 27 / 13%);
        --active-bg: #f4f4f5;
        --info: #0369a1;
        --error: #dc2626;
        --shadow: rgb(15 23 42 / 14%);
        --shimmer-base: #18181b;
        --shimmer-highlight: #000000;
        --shimmer-mid: #71717a;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        background: var(--page-bg);
        color: var(--text);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background-color: var(--page-bg);
        background-image:
          linear-gradient(rgb(15 23 42 / 5%) 1px, transparent 1px),
          linear-gradient(90deg, rgb(15 23 42 / 5%) 1px, transparent 1px);
        background-size: 32px 32px, 32px 32px;
        color: var(--text);
      }

      #root {
        width: 100%;
      }

      .react-root-shell {
        display: contents;
      }

      .app-shell {
        opacity: 1;
        transition: opacity 180ms ease;
      }

      body:not(.is-ready) .app-shell {
        opacity: 0.16;
        pointer-events: none;
      }

      .initial-loader {
        position: fixed;
        z-index: 80;
        inset: 0;
        display: grid;
        place-items: center;
        background: var(--page-bg);
        transition:
          opacity 180ms ease,
          visibility 180ms ease;
      }

      body.is-ready .initial-loader {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .loader-content {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--text);
        font-size: 14px;
        font-weight: 600;
      }

      .loader-dot {
        width: 18px;
        height: 18px;
        border: 2px solid var(--border);
        border-top-color: var(--text);
        border-radius: 999px;
        animation: loader-spin 680ms linear infinite;
      }

      @keyframes loader-spin {
        to {
          transform: rotate(360deg);
        }
      }

      main {
        width: min(1366px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 34px 0;
        display: grid;
        justify-items: center;
      }

      header {
        width: 100%;
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 18px;
      }

      .brand-lockup {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-logo {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        object-fit: cover;
        box-shadow: 0 10px 28px rgb(15 23 42 / 12%);
      }

      h1 {
        margin: 0;
        font-size: clamp(30px, 4vw, 48px);
        line-height: 1.05;
        letter-spacing: 0;
        color: transparent;
        background:
          linear-gradient(
            45deg,
            var(--shimmer-base) 0%,
            var(--shimmer-base) 36%,
            var(--shimmer-highlight) 46%,
            var(--shimmer-mid) 50%,
            var(--shimmer-highlight) 54%,
            var(--shimmer-base) 64%,
            var(--shimmer-base) 100%
          );
        background-size: 240% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        animation: shimmer-title 3.2s linear infinite;
      }

      @keyframes shimmer-title {
        from {
          background-position: 160% 0;
        }

        to {
          background-position: -80% 0;
        }
      }

      p {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 15px;
      }

      .site-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 22px;
        padding: 18px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .site-footer nav {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .site-footer a {
        color: var(--text);
        text-decoration: none;
        font-weight: 700;
      }

      .site-footer a:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .top-controls,
      .preview-tools {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .menu {
        position: relative;
      }

      .menu-trigger,
      button {
        height: 40px;
        border: 1px solid var(--field-border);
        border-radius: 6px;
        background: var(--button-bg);
        color: var(--button-text);
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: inset 0 0 0 1px rgb(255 255 255 / 8%);
        transition:
          background 150ms ease,
          box-shadow 150ms ease,
          transform 150ms ease;
      }

      .menu-trigger {
        min-width: 0;
        width: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 9px;
        white-space: nowrap;
      }

      .menu-trigger:hover,
      button:hover {
        background: var(--button-hover);
        box-shadow: 0 1px 2px rgb(15 23 42 / 12%);
      }

      .menu-trigger:active,
      button:active {
        transform: translateY(1px);
      }

      .icon-button {
        width: 40px;
        min-width: 40px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .icon-button[aria-expanded="true"] {
        background: var(--button-hover);
      }

      svg {
        width: 16px;
        height: 16px;
        flex: none;
      }

      .menu-panel {
        position: absolute;
        z-index: 20;
        top: calc(100% + 6px);
        right: 0;
        width: max-content;
        min-width: 100%;
        padding: 6px;
        border: 1px solid var(--field-border);
        border-radius: 8px;
        background: var(--field);
        box-shadow: 0 18px 48px var(--shadow);
      }

      .menu-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        padding: 0 8px;
        border: 0;
        background: transparent;
        color: var(--text);
        border-radius: 6px;
        box-shadow: none;
      }

      .menu-item:hover,
      .menu-item.is-selected {
        background: var(--active-bg);
      }

      #sonner-toast-container {
        top: 16px;
      }

      #sonner-toast-container [data-sonner-toast] {
        border: 0;
        border-radius: 8px;
        background: #18181b;
        color: #ffffff;
        box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
      }

      #sonner-toast-container [data-sonner-toast][data-type="success"] {
        background: #15803d;
      }

      #sonner-toast-container [data-sonner-toast][data-type="error"] {
        background: #dc2626;
      }

      section {
        background: transparent;
        overflow: visible;
      }

      section + section {
        margin-top: 18px;
      }

      .app-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 0px;
        gap: 0;
        align-items: start;
        width: 100%;
        min-width: 0;
        transition: grid-template-columns 200ms ease;
      }

      .settings-panel {
        display: block;
        min-width: 0;
        min-height: 100%;
        max-width: 100%;
        background: var(--panel);
        border-radius: 12px;
        box-shadow:
          0 18px 50px rgb(15 23 42 / 12%),
          inset 0 0 0 1px rgb(15 23 42 / 8%);
        opacity: 0;
        transform: translateX(12px);
        visibility: hidden;
        pointer-events: none;
        max-height: 0;
        overflow: hidden;
        transition:
          opacity 180ms ease,
          transform 180ms ease,
          visibility 180ms ease;
      }

      body.settings-open .app-layout {
        grid-template-columns: minmax(0, 1fr) 360px;
      }

      body.settings-open .settings-panel {
        display: block;
        opacity: 1;
        transform: translateX(0);
        visibility: visible;
        pointer-events: auto;
        max-height: 80vh;
        overflow: auto;
        margin-left: 18px;
        padding: 14px;
      }

      body.settings-open .editor-section {
        min-width: 0;
      }

      .panel-header {
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0 12px;
        color: var(--text);
        font-weight: 800;
      }

      .tabs {
        position: relative;
        display: inline-flex;
        gap: 2px;
        padding: 2px;
        border: 1px solid var(--field-border);
        border-radius: 8px;
        background: var(--field);
      }

      .tabs::before {
        content: "";
        position: absolute;
        top: 2px;
        bottom: 2px;
        left: 2px;
        width: var(--tab-indicator-width, 84px);
        border-radius: 6px;
        background: var(--button-bg);
        transform: translateX(var(--tab-indicator-x, 0px));
        transition:
          transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
          width 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .tab-button {
        position: relative;
        z-index: 1;
        height: 32px;
        min-width: 84px;
        padding: 0 12px;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: var(--text);
        box-shadow: none;
      }

      .tab-button:hover,
      .tab-button[aria-selected="true"] {
        color: var(--button-text);
        box-shadow: none;
      }

      form {
        display: block;
        padding: 0;
      }

      .settings-grid {
        display: grid;
        gap: 14px;
        min-width: 0;
      }

      label,
      .field {
        display: grid;
        gap: 7px;
        color: var(--text);
        font-size: 14px;
        font-weight: 700;
        min-width: 0;
        max-width: 100%;
      }

      input {
        width: 100%;
        height: 42px;
        border: 1px solid var(--field-border);
        border-radius: 9px;
        background: var(--field);
        color: var(--text);
        padding: 0 12px;
        font: 15px/1.5 ui-monospace, "SFMono-Regular", Consolas, monospace;
        outline: none;
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
        transition:
          border-color 150ms ease,
          background 150ms ease,
          box-shadow 150ms ease;
      }

      input:hover,
      .combobox:hover {
        border-color: var(--focus);
      }

      input:focus,
      .combobox:focus-within,
      .menu-trigger:focus {
        border-color: var(--focus);
        box-shadow: 0 0 0 3px var(--focus-soft);
      }

      input[type="color"] {
        padding: 4px;
      }

      .combobox {
        position: relative;
        border: 1px solid var(--field-border);
        border-radius: 9px;
        background: var(--field);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
        transition:
          border-color 150ms ease,
          background 150ms ease,
          box-shadow 150ms ease;
      }

      .combobox input {
        border: 0;
        box-shadow: none;
        background: transparent;
      }

      .theme-combobox input {
        padding-right: 46px;
      }

      .theme-stepper {
        position: absolute;
        top: 3px;
        right: 3px;
        bottom: 3px;
        width: 34px;
        display: grid;
        grid-template-rows: 1fr 1fr;
        overflow: hidden;
        border-left: 1px solid var(--field-border);
      }

      .theme-stepper button {
        width: 100%;
        height: 100%;
        min-width: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--text);
        box-shadow: none;
      }

      .theme-stepper button:hover {
        background: var(--active-bg);
        box-shadow: none;
      }

      .background-stepper {
        position: absolute;
        z-index: 2;
        top: 10px;
        right: 10px;
        height: 34px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        overflow: hidden;
        border: 1px solid rgb(255 255 255 / 34%);
        border-radius: 999px;
        background: rgb(0 0 0 / 28%);
        backdrop-filter: blur(10px);
      }

      .background-stepper button {
        width: 36px;
        height: 32px;
        min-width: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: #ffffff;
        box-shadow: none;
      }

      .background-stepper button + button {
        border-left: 1px solid rgb(255 255 255 / 24%);
      }

      .background-stepper button:hover {
        background: rgb(255 255 255 / 16%);
        box-shadow: none;
      }

      .options {
        position: absolute;
        z-index: 18;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        max-height: 252px;
        overflow: auto;
        border: 1px solid var(--field-border);
        border-radius: 10px;
        background: var(--field);
        box-shadow: 0 18px 48px var(--shadow);
      }

      .option {
        width: 100%;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--text);
        font-size: 14px;
        font-weight: 700;
        text-align: left;
      }

      .option:hover,
      .option.is-active {
        background: var(--active-bg);
      }

      .option-id {
        color: var(--muted);
        font: 12px/1.2 "Fira Code", monospace;
      }

      .empty {
        padding: 10px 12px;
        color: var(--muted);
        font-size: 14px;
      }

      .secondary {
        background: var(--button-secondary-bg);
        color: var(--text);
      }

      button:disabled {
        cursor: wait;
        opacity: 0.62;
      }

      .copy-button,
      .download-button {
        width: auto;
        min-width: 78px;
        height: 32px;
        padding: 0 10px;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .copy-button:hover,
      .download-button:hover {
        background: transparent;
        color: var(--text);
        box-shadow: inset 0 0 0 1px currentColor;
      }

      .color-control {
        position: relative;
        display: grid;
      }

      .color-control input[type="text"] {
        padding-right: 52px;
        text-transform: uppercase;
      }

      .color-control input[type="color"] {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 36px;
        height: 34px;
        padding: 2px;
        border-radius: 6px;
      }

      .color-control.is-invalid input[type="text"] {
        border-color: var(--error);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 18%, transparent);
      }

      .background-swiper {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        padding: 2px 0 0;
        overflow: hidden;
      }

      .background-swiper::part(container) {
        overflow: hidden;
      }

      .background-swiper::part(wrapper) {
        min-width: 0;
      }

      .background-swiper swiper-slide {
        min-width: 0;
      }

      .background-card {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        min-height: 0;
        display: grid;
        align-content: end;
        gap: 8px;
        padding: 12px;
        border: 0;
        border-radius: 12px;
        background: var(--preset-bg);
        color: #ffffff;
        text-align: left;
        cursor: pointer;
        box-shadow:
          inset 0 0 0 1px rgb(255 255 255 / 24%),
          0 14px 36px rgb(15 23 42 / 16%);
      }

      .background-card:hover,
      .background-card.is-selected {
        background: var(--preset-bg);
        color: #ffffff;
        box-shadow:
          inset 0 0 0 2px rgb(255 255 255 / 76%),
          0 16px 42px rgb(15 23 42 / 18%);
      }

      .background-card span {
        width: fit-content;
        max-width: 100%;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgb(0 0 0 / 34%);
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        backdrop-filter: blur(10px);
      }

      .toggle-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .toggle-field input {
        width: 18px;
        height: 18px;
        padding: 0;
        accent-color: var(--text);
      }

      .editor-stage {
        min-height: 560px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        background: transparent;
      }

      .view {
        width: 100%;
      }

      .view[hidden] {
        display: none !important;
      }

      .view-swiper {
        width: 100%;
        min-height: 560px;
        display: block;
      }

      .view-swiper::part(container) {
        height: 560px;
        min-height: 560px;
        overflow: hidden;
      }

      .view-swiper::part(wrapper) {
        align-items: stretch;
        height: 560px;
        min-height: 560px;
      }

      swiper-slide {
        width: 100%;
        height: 560px;
      }

      .editor-canvas {
        display: flex;
        align-items: stretch;
        justify-content: center;
        width: 100%;
        max-width: 100%;
        background: transparent;
        transition: opacity 180ms ease;
      }

      .editor-window {
        width: 100%;
        max-width: 100%;
        background: transparent;
        box-shadow: none;
      }

      .image-stage {
        min-height: 560px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
      }

      .final-image {
        max-width: 100%;
        height: auto;
        display: block;
        box-shadow: 0 22px 70px var(--shadow);
      }

      .image-empty {
        color: var(--muted);
        font-size: 14px;
      }

      .view.is-entering {
        animation: view-enter 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      @keyframes view-enter {
        from {
          opacity: 0;
          transform: translateY(8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .editor-bar {
        display: none;
      }

      .dots {
        display: flex;
        gap: 8px;
      }

      .dot {
        width: 11px;
        height: 11px;
        border-radius: 999px;
      }

      .dot.red {
        background: #ff5555;
      }

      .dot.yellow {
        background: #f1fa8c;
      }

      .dot.green {
        background: #50fa7b;
      }

      .editor-language {
        font: 700 15px/1 "Fira Code", monospace;
      }

      .editor-body {
        position: relative;
        min-height: 520px;
        font-family: "Fira Code", ui-monospace, "SFMono-Regular", Consolas, monospace;
        font-size: 16px;
        line-height: 24px;
        background: transparent;
      }

      .code-input {
        margin: 0;
        font: inherit;
        white-space: pre;
      }

      .code-input {
        position: static;
        display: block;
        width: 100%;
        min-height: 520px;
        border: 0;
        outline: none;
        resize: none;
        overflow: auto;
        background: #ffffff;
        color: var(--text);
        caret-color: currentColor;
        -webkit-text-fill-color: currentColor;
        padding: 16px;
      }

      .code-input::selection {
        background: rgb(0 0 0 / 28%);
      }

      [hidden] {
        display: none !important;
      }

      @media (max-width: 860px) {
        header {
          display: block;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
        }

        .top-controls {
          margin-top: 16px;
          justify-content: flex-start;
        }

        .preview-tools {
          justify-content: flex-start;
        }

        .app-layout {
          display: block;
        }

        body.settings-open .app-layout {
          display: block;
        }

        body.settings-open .settings-panel {
          margin-left: 0;
          margin-top: 18px;
          padding: 14px;
        }

        body.settings-open .editor-section {
          min-width: 0;
        }

      }
    </style>
  </head>
  <body>
    <div class="initial-loader" id="initialLoader" role="status" aria-live="polite">
      <div class="loader-content">
        <span class="loader-dot" aria-hidden="true"></span>
        <span data-i18n="loading">${text.loading}</span>
      </div>
    </div>
    <ol
      id="sonner-toast-container"
      position="top-center"
      max-toasts="1"
      duration="2200"
      close-button="false"
      rich-colors="false"
      theme="light">
    </ol>
    <template id="appTemplate">
    <main class="app-shell" data-insp-path="${inspectorPath(1179, 5, "main")}">
      <header data-insp-path="${inspectorPath(1180, 7, "header")}">
        <div>
          <div class="brand-lockup">
            <img class="brand-logo" src="/assets/codia-logo.webp" alt="Codia logo" width="52" height="52" />
            <h1>Codia</h1>
          </div>
          <p data-i18n="subtitle"><strong>${text.subtitle}</strong></p>
        </div>
        <div>
          <div class="top-controls">
            <div class="menu" data-menu>
              <button class="menu-trigger" id="uiLanguageTrigger" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                <span id="uiLanguageLabel">${localeLabel}</span>
              </button>
              <div class="menu-panel" id="uiLanguageMenu" hidden></div>
            </div>
            <button class="icon-button" id="settingsToggle" type="button" aria-label="Settings" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div class="app-layout" id="appLayout" data-insp-path="${inspectorPath(1204, 7, "div")}">
        <section class="editor-section" data-insp-path="${inspectorPath(1205, 9, "section")}">
          <div class="panel-header">
            <div class="tabs" role="tablist" aria-label="Preview mode">
              <button class="tab-button" id="editorTab" type="button" role="tab" aria-selected="true" aria-controls="editorView" data-view="editor" data-i18n="editor">${text.editor}</button>
              <button class="tab-button" id="imageTab" type="button" role="tab" aria-selected="false" aria-controls="imageView" data-view="image" data-i18n="image">${text.image}</button>
            </div>
            <div class="preview-tools">
              <button class="secondary copy-button" id="copy" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span data-i18n="copy">${text.copy}</span>
              </button>
              <button class="secondary download-button" id="download" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                <span data-i18n="download">${text.download}</span>
              </button>
            </div>
          </div>
          <swiper-container class="view-swiper" id="viewSwiper" speed="240" slides-per-view="1" auto-height="true">
            <swiper-slide>
              <div class="editor-stage view" id="editorView" role="tabpanel" aria-labelledby="editorTab">
                <div class="editor-canvas" id="editorCanvas">
                  <div class="editor-window" id="editorWindow">
                    <div class="editor-body" id="editorBody">
                      <textarea class="code-input" id="code" name="code" spellcheck="false"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="image-stage view" id="imageView" role="tabpanel" aria-labelledby="imageTab">
                <img class="final-image" id="finalImage" alt="Rendered code image" hidden />
                <div class="image-empty" id="imageEmpty" data-i18n="imageEmpty">${text.imageEmpty}</div>
              </div>
            </swiper-slide>
          </swiper-container>
        </section>
        <aside class="settings-panel" id="settingsPanel" data-insp-path="${inspectorPath(1242, 9, "aside")}">
          <div class="panel-header" data-i18n="settings">${text.settings}</div>
          <form id="form">
            <div class="settings-grid">
              <div class="field">
                <span data-i18n="language">${text.language}</span>
                <input id="language" name="language" type="hidden" value="typescript" />
                <div class="combobox" id="languageCombobox">
                  <input id="languageFilter" type="text" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="languageOptions" />
                  <div class="options" id="languageOptions" role="listbox" hidden></div>
                </div>
              </div>
              <div class="field">
                <span data-i18n="codeTheme">${text.codeTheme}</span>
                <input id="codeTheme" name="theme" type="hidden" value="dracula" />
                <div class="combobox theme-combobox" id="themeCombobox">
                  <input id="themeFilter" type="text" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="themeOptions" />
                  <div class="theme-stepper" aria-label="Code theme stepper">
                    <button id="themePrev" type="button" aria-label="Previous code theme">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <button id="themeNext" type="button" aria-label="Next code theme">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>
                  <div class="options" id="themeOptions" role="listbox" hidden></div>
                </div>
              </div>
              <label>
                <span data-i18n="backgroundColor">${text.backgroundColor}</span>
                <input id="bgColor" name="bgColor" type="hidden" value="${defaultBgColor}" />
                <swiper-container class="background-swiper" id="backgroundSwiper" init="false"></swiper-container>
              </label>
              <label>
                <span data-i18n="borderSize">${text.borderSize}</span>
                <input id="borderSize" name="borderSize" type="number" min="0" max="120" step="1" value="12" />
              </label>
              <label>
                <span data-i18n="containerWidth">${text.containerWidth}</span>
                <input id="containerWidth" name="containerWidth" type="number" min="400" max="1920" step="1" value="600" />
              </label>
              <label class="toggle-field">
                <span data-i18n="showLineNumbers">${text.showLineNumbers}</span>
                <input id="showLineNumbers" name="showLineNumbers" type="checkbox" checked />
              </label>
            </div>
          </form>
        </aside>
      </div>
      <footer class="site-footer" data-insp-path="${inspectorPath(1291, 7, "footer")}">
        <span>Codia · Beautiful Code Images for Humans and APIs.</span>
        <nav aria-label="Footer links">
          <a href="/llms.txt">llms.txt</a>
          <a href="https://x.com/intent/follow?screen_name=aaronconlondev" target="_blank" rel="noreferrer">Aaron on X</a>
          <a href="https://github.com/AaronConlon/codia" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </footer>
    </main>
    </template>
    <div id="root"></div>

    ${options.codeInspectorScript ? `<script>${options.codeInspectorScript}</script>` : ""}
    <script type="module">
      import React from "https://esm.sh/react@18.3.1";
      import { flushSync } from "https://esm.sh/react-dom@18.3.1";
      import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
      import { toast } from "https://esm.sh/vanilla-sonner@0.5.2";

      const shikiThemes = ${JSON.stringify(shikiThemes)};
      const initialState = ${JSON.stringify(initialState)};
      const defaultCode = ${JSON.stringify(defaultExampleCode)};
      const translations = ${JSON.stringify(exampleTranslations)};
      const locales = ${JSON.stringify(
        Object.entries(localeLabels).map(([id, label]) => ({ id, label })),
      )};
      const languages = [
        ["typescript", "TypeScript"], ["javascript", "JavaScript"], ["tsx", "TSX"],
        ["jsx", "JSX"], ["python", "Python"], ["go", "Go"], ["rust", "Rust"],
        ["java", "Java"], ["kotlin", "Kotlin"], ["swift", "Swift"], ["php", "PHP"],
        ["ruby", "Ruby"], ["c", "C"], ["cpp", "C++"], ["csharp", "C#"],
        ["html", "HTML"], ["css", "CSS"], ["json", "JSON"], ["yaml", "YAML"],
        ["markdown", "Markdown"], ["bash", "Bash"], ["sql", "SQL"], ["text", "Plain Text"],
      ].map(([id, label]) => ({ id, label }));
      const codeThemes = shikiThemes.map((id) => ({ id, label: id }));
      const backgroundPresets = ${JSON.stringify(backgroundPresets)};

      const appTemplate = document.getElementById("appTemplate");
      const rootElement = document.getElementById("root");
      const escapeTemplateText = (value) =>
        value
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
      appTemplate.innerHTML = appTemplate.innerHTML.replace(
        '<textarea class="code-input" id="code" name="code" spellcheck="false"></textarea>',
        '<textarea class="code-input" id="code" name="code" spellcheck="false">' + escapeTemplateText(defaultCode) + '</textarea>',
      );
      const ExampleApp = () =>
        React.createElement("div", {
          className: "react-root-shell",
          dangerouslySetInnerHTML: { __html: appTemplate.innerHTML },
        });
      flushSync(() => createRoot(rootElement).render(React.createElement(ExampleApp)));
      appTemplate.remove();

      const $ = (selector) => document.querySelector(selector);
      const language = $("#language");
      const languageFilter = $("#languageFilter");
      const languageOptions = $("#languageOptions");
      const codeTheme = $("#codeTheme");
      const themeFilter = $("#themeFilter");
      const themeOptions = $("#themeOptions");
      const themePrev = $("#themePrev");
      const themeNext = $("#themeNext");
      const bgColor = $("#bgColor");
      const backgroundSwiper = $("#backgroundSwiper");
      const borderSize = $("#borderSize");
      const containerWidth = $("#containerWidth");
      const showLineNumbers = $("#showLineNumbers");
      const form = $("#form");
      const copy = $("#copy");
      const download = $("#download");
      const code = $("#code");
      code.defaultValue = defaultCode;
      code.value = defaultCode;
      const editorCanvas = $("#editorCanvas");
      const editorView = $("#editorView");
      const imageView = $("#imageView");
      const viewSwiper = $("#viewSwiper");
      const editorTab = $("#editorTab");
      const imageTab = $("#imageTab");
      const finalImage = $("#finalImage");
      const imageEmpty = $("#imageEmpty");
      const editorWindow = $("#editorWindow");
      const editorBody = $("#editorBody");
      const uiLanguageTrigger = $("#uiLanguageTrigger");
      const uiLanguageLabel = $("#uiLanguageLabel");
      const uiLanguageMenu = $("#uiLanguageMenu");
      const settingsToggle = $("#settingsToggle");
      const maxLineLength = 84;
      let latestDataUrl = "";
      let renderTimer;
      let activeView = "editor";
      let imageDirty = true;
      let activeLanguageIndex = 0;
      let activeThemeIndex = 0;
      let selectedLanguage = languages[0];
      let selectedCodeTheme = codeThemes.find((item) => item.id === "dracula") ?? codeThemes[0];
      let selectedBackground = backgroundPresets[0];
      let currentMinContainerWidth = 400;
      let lastValidContainerWidth = "600";
      let currentLocale = initialState.locale;
      let playClickSound = () => {};
      const soundProfiles = {
        tab: { start: 420, end: 620, gain: 0.055, duration: 0.08 },
        menu: { start: 560, end: 460, gain: 0.045, duration: 0.07 },
        action: { start: 760, end: 540, gain: 0.07, duration: 0.09 },
        input: { start: 520, end: 520, gain: 0.03, duration: 0.045 },
        toggle: { start: 360, end: 720, gain: 0.06, duration: 0.085 },
      };

      const setCookie = (name, value) => {
        document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=31536000; samesite=lax";
      };

      const t = (key, values = {}) => {
        let text = translations[currentLocale][key] ?? translations.en[key] ?? key;
        for (const [name, value] of Object.entries(values)) {
          text = text.replaceAll("{" + name + "}", String(value));
        }
        return text;
      };

      const setStatus = (message, isError = false) => {
        if (!message) return;
        if (isError) {
          toast.error(message);
          return;
        }
        if (message === t("copied") || message === t("downloaded")) {
          toast.success(message);
          return;
        }
        toast(message);
      };

      const finishInitialLoad = () => {
        document.body.classList.add("is-ready");
      };

      const selectBackground = (item, options = {}) => {
        if (!item) return;
        selectedBackground = item;
        bgColor.value = item.bgColor;
        backgroundSwiper.querySelectorAll(".background-card").forEach((card) => {
          card.classList.toggle("is-selected", card.dataset.id === item.id);
        });
        if (options.slide !== false) {
          const index = backgroundPresets.findIndex((preset) => preset.id === item.id);
          if (index >= 0) backgroundSwiper.swiper?.slideTo(index);
        }
        updateEditorFrame();
        invalidateImage();
      };

      const renderBackgroundPresets = () => {
        backgroundSwiper.replaceChildren(...backgroundPresets.map((item) => {
          const slide = document.createElement("swiper-slide");
          const button = document.createElement("div");
          button.className = "background-card" + (item.id === selectedBackground.id ? " is-selected" : "");
          button.setAttribute("role", "button");
          button.tabIndex = 0;
          button.dataset.id = item.id;
          button.style.setProperty("--preset-bg", item.bgColor);
          button.innerHTML = '<div class="background-stepper" aria-label="Background stepper">' +
            '<button class="background-step-button" type="button" aria-label="Previous background" data-background-step="-1">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>' +
            '</button>' +
            '<button class="background-step-button" type="button" aria-label="Next background" data-background-step="1">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
            '</button>' +
            '</div><span>' + item.label + "</span>";
          button.querySelectorAll(".background-step-button").forEach((stepButton) => {
            stepButton.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              stepBackground(Number(stepButton.dataset.backgroundStep));
            });
          });
          button.addEventListener("click", () => {
            selectBackground(item);
          });
          button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectBackground(item);
            }
          });
          slide.append(button);
          return slide;
        }));
      };

      const initializeBackgroundSwiper = () => {
        Object.assign(backgroundSwiper, {
          slidesPerView: 1,
          spaceBetween: 10,
          speed: 220,
          observer: true,
          observeParents: true,
        });
        if (!backgroundSwiper.swiper) {
          backgroundSwiper.initialize();
        } else {
          backgroundSwiper.swiper.update();
        }
      };

      const stepBackground = (delta) => {
        const currentIndex = Math.max(
          backgroundPresets.findIndex((item) => item.id === selectedBackground.id),
          0,
        );
        const nextIndex = (currentIndex + delta + backgroundPresets.length) % backgroundPresets.length;
        selectBackground(backgroundPresets[nextIndex]);
      };

      const setSettingsOpen = (isOpen) => {
        document.body.classList.toggle("settings-open", isOpen);
        settingsToggle.setAttribute("aria-expanded", String(isOpen));
      };

      const initializeSettingsPanel = () => {
        setSettingsOpen(window.matchMedia("(min-width: 1080px)").matches);
      };

      const invalidateImage = () => {
        imageDirty = true;
        if (activeView === "image") scheduleImageRender();
      };

      const setActiveView = (view) => {
        if (activeView === view) return;
        activeView = view;
        const isImage = view === "image";
        editorTab.setAttribute("aria-selected", String(!isImage));
        imageTab.setAttribute("aria-selected", String(isImage));
        viewSwiper.swiper?.slideTo(isImage ? 1 : 0);
        updateTabIndicator();
        animateActiveView(isImage ? imageView : editorView);
        if (isImage) scheduleImageRender();
      };

      const syncActiveViewFromSwiper = () => {
        const nextView = viewSwiper.swiper?.activeIndex === 1 ? "image" : "editor";
        if (activeView === nextView) return;
        activeView = nextView;
        const isImage = nextView === "image";
        editorTab.setAttribute("aria-selected", String(!isImage));
        imageTab.setAttribute("aria-selected", String(isImage));
        updateTabIndicator();
        animateActiveView(isImage ? imageView : editorView);
        if (isImage) scheduleImageRender();
      };

      const updateTabIndicator = () => {
        const selectedTab = activeView === "image" ? imageTab : editorTab;
        const tabs = selectedTab.parentElement;
        const tabsRect = tabs.getBoundingClientRect();
        const tabRect = selectedTab.getBoundingClientRect();
        tabs.style.setProperty("--tab-indicator-width", tabRect.width + "px");
        tabs.style.setProperty("--tab-indicator-x", tabRect.left - tabsRect.left - 2 + "px");
      };

      const animateActiveView = (view) => {
        view.classList.remove("is-entering");
        void view.offsetWidth;
        view.classList.add("is-entering");
      };

      const applyI18n = () => {
        document.documentElement.lang = currentLocale === "zh" ? "zh-Hans" : currentLocale;
        document.querySelectorAll("[data-i18n]").forEach((node) => {
          node.textContent = t(node.dataset.i18n);
        });
        languageFilter.placeholder = t("language");
        themeFilter.placeholder = t("codeTheme");
        uiLanguageLabel.textContent = locales.find((item) => item.id === currentLocale).label;
      };

      const getInteractionKind = (target) => {
        if (target.closest(".tab-button")) return "tab";
        if (target.closest("#copy, #download")) return "action";
        if (target.closest("#settingsToggle, .theme-stepper button, .background-stepper button")) return "toggle";
        if (target.closest(".menu-trigger, .menu-item, .option")) return "menu";
        if (target.closest("input, textarea, .combobox")) return "input";
        return "action";
      };

      const createFallbackClickSound = () => {
        let context;
        return (kind = "action") => {
          context ??= new AudioContext();
          const profile = soundProfiles[kind] ?? soundProfiles.action;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(profile.start, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(profile.end, context.currentTime + profile.duration * 0.55);
          gain.gain.setValueAtTime(0.0001, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(profile.gain, context.currentTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + profile.duration);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + profile.duration + 0.01);
        };
      };

      const setupAudio = async () => {
        playClickSound = createFallbackClickSound();
        try {
          const { defineSound, ensureReady } = await import("https://esm.sh/@web-kits/audio");
          const sounds = Object.fromEntries(Object.entries(soundProfiles).map(([name, profile]) => [
            name,
            defineSound({
              source: { type: "sine", frequency: { start: profile.start, end: profile.end } },
              envelope: { attack: 0.001, decay: profile.duration * 0.52, sustain: 0, release: 0.025 },
              gain: profile.gain,
            }),
          ]));
          playClickSound = async (kind = "action") => {
            await ensureReady();
            (sounds[kind] ?? sounds.action)();
          };
        } catch (error) {
          playClickSound = createFallbackClickSound();
        }
      };

      const playInteractionSound = (kind) => {
        try {
          const result = playClickSound(kind);
          if (result && typeof result.catch === "function") result.catch(() => {});
        } catch (error) {
          playClickSound = createFallbackClickSound();
          playClickSound(kind);
        }
      };

      document.addEventListener("click", (event) => {
        if (event.target.closest("button, input, textarea, .combobox, .menu-trigger")) {
          playInteractionSound(getInteractionKind(event.target));
        }
      }, true);

      const renderMenu = (panel, items, selectedId, onSelect) => {
        panel.replaceChildren(...items.map((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "menu-item" + (item.id === selectedId ? " is-selected" : "");
          button.innerHTML = "<span>" + item.label + "</span>";
          button.addEventListener("click", () => {
            panel.hidden = true;
            onSelect(item);
          });
          return button;
        }));
      };

      const toggleMenu = (panel) => {
        document.querySelectorAll(".menu-panel").forEach((node) => {
          if (node !== panel) node.hidden = true;
        });
        panel.hidden = !panel.hidden;
      };

      const renderOptions = (panel, items, query, activeIndex, onSelect) => {
        const normalizedQuery = query.trim().toLowerCase();
        const filtered = items.filter((item) =>
          [item.id, item.label].some((value) => value.toLowerCase().includes(normalizedQuery)),
        );
        panel.replaceChildren(
          ...(filtered.length
            ? filtered.map((item, index) => {
                const option = document.createElement("button");
                option.type = "button";
                option.className = "option" + (index === activeIndex ? " is-active" : "");
                option.dataset.id = item.id;
                option.innerHTML = "<span>" + item.label + '</span><span class="option-id">' + item.id + "</span>";
                option.addEventListener("mousedown", (event) => event.preventDefault());
                option.addEventListener("click", () => onSelect(item));
                return option;
              })
            : [Object.assign(document.createElement("div"), {
                className: "empty",
                textContent: t("noMatch"),
              })]),
        );
      };

      const openOptions = (panel, input, items, activeIndex, onSelect) => {
        panel.hidden = false;
        input.setAttribute("aria-expanded", "true");
        renderOptions(panel, items, input.value, activeIndex, onSelect);
      };

      const closeOptions = (panel, input) => {
        panel.hidden = true;
        input.setAttribute("aria-expanded", "false");
      };

      const selectLanguage = (item) => {
        if (!item) return;
        selectedLanguage = item;
        activeLanguageIndex = Math.max(languages.findIndex((language) => language.id === item.id), 0);
        language.value = item.id;
        languageFilter.value = item.label;
        closeOptions(languageOptions, languageFilter);
        invalidateImage();
      };

      const selectCodeTheme = (item) => {
        if (!item) return;
        selectedCodeTheme = item;
        activeThemeIndex = Math.max(codeThemes.findIndex((theme) => theme.id === item.id), 0);
        codeTheme.value = item.id;
        themeFilter.value = item.id;
        closeOptions(themeOptions, themeFilter);
        invalidateImage();
      };

      const stepCodeTheme = (delta) => {
        const currentIndex = Math.max(codeThemes.findIndex((item) => item.id === selectedCodeTheme.id), 0);
        const nextIndex = (currentIndex + delta + codeThemes.length) % codeThemes.length;
        selectCodeTheme(codeThemes[nextIndex]);
      };

      const moveActive = (panel, delta, activeIndexSetter) => {
        const options = [...panel.querySelectorAll(".option")];
        if (!options.length) return 0;
        const current = options.findIndex((item) => item.classList.contains("is-active"));
        const next = (Math.max(current, 0) + delta + options.length) % options.length;
        options.forEach((item) => item.classList.remove("is-active"));
        options[next].classList.add("is-active");
        options[next].scrollIntoView({ block: "nearest" });
        activeIndexSetter(next);
        return next;
      };

      const formatCode = (value) =>
        value
          .replaceAll("\r\n", "\n")
          .replaceAll("\r", "\n")
          .split("\n")
          .flatMap((line) => wrapCodeLine(line, maxLineLength))
          .join("\n");

      const wrapCodeLine = (line, maxLength) => {
        if (line.length <= maxLength) return [line];
        const wrapped = [];
        let remaining = line;
        while (remaining.length > maxLength) {
          const wrapAt = findWrapPosition(remaining, maxLength);
          wrapped.push(remaining.slice(0, wrapAt).trimEnd());
          remaining = remaining.slice(wrapAt).trimStart();
        }
        wrapped.push(remaining);
        return wrapped;
      };

      const findWrapPosition = (line, maxLength) => {
        for (let index = maxLength; index > 0; index -= 1) {
          if (/\s/.test(line[index] || "")) return index;
        }
        return maxLength;
      };

      const countColumns = (line) => [...line].reduce((sum, char) => sum + (char === "\t" ? 4 : 1), 0);

      const estimateMinContainerWidth = () => {
        const maxLineColumns = Math.max(...formatCode(code.value).split("\n").map(countColumns), 0);
        const headerWidth = 36 + 49 + selectedLanguage.id.length * 10;
        const codeWidth = (showLineNumbers.checked ? 72 : 18) + Math.ceil(maxLineColumns * 18 * 0.6) + 18;
        return Math.min(Math.max(Math.max(headerWidth, codeWidth), 400), 1920);
      };

      const normalizeBorderSize = (value) => {
        const parsed = Number(value || 0);
        return String(Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 0), 120) : 0);
      };

      const normalizeContainerWidth = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < currentMinContainerWidth || parsed > 1920) return null;
        return String(Math.trunc(parsed));
      };

      const applyContainerWidth = (shouldUpdate = true) => {
        currentMinContainerWidth = estimateMinContainerWidth();
        containerWidth.min = String(currentMinContainerWidth);
        const nextContainerWidth = normalizeContainerWidth(containerWidth.value);
        if (!nextContainerWidth) {
          containerWidth.value = lastValidContainerWidth;
          setStatus(t("containerRange", { min: currentMinContainerWidth }), true);
          return false;
        }
        lastValidContainerWidth = nextContainerWidth;
        containerWidth.value = nextContainerWidth;
        if (shouldUpdate) updateEditorFrame();
        return true;
      };

      const updateEditorFrame = () => {
        borderSize.value = normalizeBorderSize(borderSize.value);
        currentMinContainerWidth = estimateMinContainerWidth();
        containerWidth.min = String(currentMinContainerWidth);
        if (Number(containerWidth.value || 600) < currentMinContainerWidth) {
          containerWidth.value = String(currentMinContainerWidth);
          lastValidContainerWidth = containerWidth.value;
        }
        const lineCount = Math.max(formatCode(code.value).split("\n").length, 1);
        const editorBodyHeight = Math.max(520, lineCount * 24 + 48);
        editorCanvas.style.padding = "0";
        editorBody.style.height = editorBodyHeight + "px";
        code.style.height = editorBodyHeight + "px";
        editorWindow.style.width = "100%";
        viewSwiper.swiper?.updateAutoHeight(180);
        viewSwiper.swiper?.update();
      };

      const requestImage = async ({ silent = false } = {}) => {
        if (!silent) setStatus(t("rendering"));
        const response = await fetch("/v1/code/render", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            language: selectedLanguage.id,
            theme: selectedCodeTheme.id,
            bgColor: bgColor.value,
            borderSize: Number(borderSize.value || 0),
            containerWidth: Number(containerWidth.value || 600),
            showLineNumbers: showLineNumbers.checked,
            code: code.value,
          }),
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        latestDataUrl = data.dataUrl;
        finalImage.src = data.dataUrl;
        finalImage.hidden = false;
        imageEmpty.hidden = true;
        imageDirty = false;
        currentMinContainerWidth = data.minContainerWidth;
        containerWidth.min = String(data.minContainerWidth);
        containerWidth.value = String(data.containerWidth);
        lastValidContainerWidth = String(data.containerWidth);
        return data;
      };

      const renderFinalImage = async () => {
        if (!imageDirty && latestDataUrl) return;
        try {
          await requestImage();
        } catch (error) {
          finalImage.hidden = true;
          imageEmpty.hidden = false;
          setStatus(t("failed"), true);
        }
      };

      const scheduleImageRender = () => {
        window.clearTimeout(renderTimer);
        renderTimer = window.setTimeout(renderFinalImage, 180);
      };

      const copyImage = async () => {
        try {
          const data = await requestImage();
          const blob = await (await fetch(data.dataUrl)).blob();
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          setStatus(t("copied"));
        } catch (error) {
          setStatus(t("failed"), true);
        }
      };

      const downloadImage = async () => {
        try {
          const data = await requestImage();
          const link = document.createElement("a");
          link.href = data.dataUrl;
          link.download = "code-snip.png";
          link.click();
          setStatus(t("downloaded"));
        } catch (error) {
          setStatus(t("failed"), true);
        }
      };

      const applyI18nMenus = () => {
        renderMenu(uiLanguageMenu, locales, currentLocale, (item) => {
          currentLocale = item.id;
          setCookie("code_snip_locale", item.id);
          applyI18n();
          applyI18nMenus();
        });
      };

      uiLanguageTrigger.addEventListener("click", () => toggleMenu(uiLanguageMenu));
      editorTab.addEventListener("click", () => setActiveView("editor"));
      imageTab.addEventListener("click", () => setActiveView("image"));
      viewSwiper.addEventListener("swiperslidechange", syncActiveViewFromSwiper);
      backgroundSwiper.addEventListener("swiperslidechange", () => {
        const nextIndex = backgroundSwiper.swiper?.activeIndex ?? 0;
        selectBackground(backgroundPresets[nextIndex] ?? backgroundPresets[0], { slide: false });
      });
      settingsToggle.addEventListener("click", () => {
        setSettingsOpen(!document.body.classList.contains("settings-open"));
      });
      document.addEventListener("click", (event) => {
        if (!event.target.closest("[data-menu]")) {
          document.querySelectorAll(".menu-panel").forEach((panel) => (panel.hidden = true));
        }
      });

      languageFilter.addEventListener("focus", () => openOptions(languageOptions, languageFilter, languages, activeLanguageIndex, selectLanguage));
      languageFilter.addEventListener("input", () => openOptions(languageOptions, languageFilter, languages, activeLanguageIndex, selectLanguage));
      languageFilter.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          activeLanguageIndex = moveActive(languageOptions, 1, (index) => (activeLanguageIndex = index));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          activeLanguageIndex = moveActive(languageOptions, -1, (index) => (activeLanguageIndex = index));
        } else if (event.key === "Enter") {
          const option = languageOptions.querySelectorAll(".option")[activeLanguageIndex];
          if (option) {
            event.preventDefault();
            selectLanguage(languages.find((item) => item.id === option.dataset.id));
          }
        } else if (event.key === "Escape") {
          closeOptions(languageOptions, languageFilter);
        }
      });
      languageFilter.addEventListener("blur", () => window.setTimeout(() => {
        languageFilter.value = selectedLanguage.label;
        closeOptions(languageOptions, languageFilter);
      }, 120));

      themeFilter.addEventListener("focus", () => openOptions(themeOptions, themeFilter, codeThemes, activeThemeIndex, selectCodeTheme));
      themeFilter.addEventListener("input", () => openOptions(themeOptions, themeFilter, codeThemes, activeThemeIndex, selectCodeTheme));
      themeFilter.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          activeThemeIndex = moveActive(themeOptions, 1, (index) => (activeThemeIndex = index));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          activeThemeIndex = moveActive(themeOptions, -1, (index) => (activeThemeIndex = index));
        } else if (event.key === "Enter") {
          const option = themeOptions.querySelectorAll(".option")[activeThemeIndex];
          if (option) {
            event.preventDefault();
            selectCodeTheme(codeThemes.find((item) => item.id === option.dataset.id));
          }
        } else if (event.key === "Escape") {
          closeOptions(themeOptions, themeFilter);
        }
      });
      themeFilter.addEventListener("blur", () => window.setTimeout(() => {
        themeFilter.value = selectedCodeTheme.id;
        closeOptions(themeOptions, themeFilter);
      }, 120));
      themePrev.addEventListener("click", () => stepCodeTheme(-1));
      themeNext.addEventListener("click", () => stepCodeTheme(1));

      copy.addEventListener("click", copyImage);
      download.addEventListener("click", downloadImage);
      code.addEventListener("input", () => {
        invalidateImage();
        updateEditorFrame();
      });
      borderSize.addEventListener("input", () => {
        invalidateImage();
      });
      showLineNumbers.addEventListener("change", () => {
        invalidateImage();
      });
      containerWidth.addEventListener("blur", () => {
        if (applyContainerWidth()) invalidateImage();
      });
      containerWidth.addEventListener("change", () => {
        if (applyContainerWidth()) invalidateImage();
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (applyContainerWidth(false)) {
          updateEditorFrame();
          invalidateImage();
        }
      });
      window.addEventListener("resize", updateTabIndicator);

      initializeSettingsPanel();
      setupAudio();
      applyI18n();
      applyI18nMenus();
      renderBackgroundPresets();
      initializeBackgroundSwiper();
      selectBackground(selectedBackground, { slide: false });
      selectLanguage(selectedLanguage);
      selectCodeTheme(selectedCodeTheme);
      updateEditorFrame();
      requestImage({ silent: true })
        .catch(() => setStatus(t("failed"), true))
        .finally(finishInitialLoad);
      updateTabIndicator();
    </script>
  </body>
</html>`;
};

export const route_GET_code_example = (app: AppInstance, options: CodeExampleRouteOptions = {}) => {
  app.get("/example", (c) => {
    const initialState = resolveInitialState(
      c.req.header("cookie") ?? "",
      c.req.header("accept-language") ?? "",
    );

    setCookie(c, "code_snip_locale", initialState.locale, {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "Lax",
    });

    return c.html(exampleHtml(initialState, new URL(c.req.url).origin, options));
  });
};

const resolveInitialState = (cookieHeader: string, acceptLanguage: string): ExampleInitialState => {
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

const normalizeLocale = (locale: string | undefined): ExampleInitialState["locale"] | null => {
  if (locale === "zh" || locale === "en" || locale === "ja") return locale;
  return null;
};

const localeFromAcceptLanguage = (acceptLanguage: string): ExampleInitialState["locale"] => {
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
