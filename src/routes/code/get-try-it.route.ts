import { setCookie } from "hono/cookie";
import { bundledThemes } from "shiki";
import type { AppInstance } from "../../types.js";
import {
  renderSiteFooter,
  renderSiteHeader,
  renderSiteMeta,
  siteSlogan,
  siteShellStyles,
} from "../site/site-layout.js";

const shikiThemes = Object.keys(bundledThemes).sort();

type ExampleInitialState = {
  locale: "zh" | "en" | "ja";
  htmlLang: "zh-Hans" | "en" | "ja";
};

type CodeExampleRouteOptions = {
  codeInspectorScript?: string;
};

const exampleTranslations = {
  zh: {
    navTryIt: "Playground",
    navDocs: "API 文档",
    languageLabel: "语言",
    subtitle: "为人和 API 打造的漂亮代码图片。",
    settings: "设置",
    editor: "编辑器",
    image: "图片",
    imageEmpty: "切换到图片模式时生成最终图片。",
    codePlaceholder: "在这里粘贴或输入代码...",
    loading: "正在加载 Codia...",
    language: "语言",
    codeTheme: "代码主题",
    imageFormat: "图片格式",
    backgroundColor: "背景",
    borderSize: "边距",
    borderRadius: "圆角",
    containerWidth: "容器宽度",
    showLineNumbers: "显示行号",
    imageQuality: "生成质量",
    parameterSettings: "参数设置",
    qualityDraft: "轻量",
    qualityStandard: "标准",
    qualityHigh: "高清",
    qualityUltra: "超清",
    imageSize: "图片大小",
    generateImage: "生成图片",
    editImage: "点击切换到编辑模式",
    copy: "复制图片",
    download: "下载",
    clear: "清空",
    copied: "图片已复制",
    downloaded: "已下载",
    failed: "操作失败",
    ready: "Ready",
    noMatch: "没有匹配项",
    containerRange: "容器宽度必须是 {min}-1920",
    borderRadiusRange: "圆角必须大于等于 0 且小于边距",
  },
  en: {
    navTryIt: "Playground",
    navDocs: "API Docs",
    languageLabel: "Language",
    subtitle: "Beautiful Code Images for Humans and APIs.",
    settings: "Settings",
    editor: "Editor",
    image: "Image",
    imageEmpty: "Switch to image mode to render the final image.",
    codePlaceholder: "Paste or type code here...",
    loading: "Loading Codia...",
    language: "Language",
    codeTheme: "Code theme",
    imageFormat: "Image format",
    backgroundColor: "Background",
    borderSize: "Padding",
    borderRadius: "Corner radius",
    containerWidth: "Container width",
    showLineNumbers: "Line numbers",
    imageQuality: "Image quality",
    parameterSettings: "Settings",
    qualityDraft: "Draft",
    qualityStandard: "Standard",
    qualityHigh: "High",
    qualityUltra: "Ultra",
    imageSize: "Image size",
    generateImage: "Generate Image",
    editImage: "Click to edit",
    copy: "Copy Image",
    download: "Download",
    clear: "Clear",
    copied: "Image copied",
    downloaded: "Downloaded",
    failed: "Action failed",
    ready: "Ready",
    noMatch: "No matches",
    containerRange: "Container width must be {min}-1920",
    borderRadiusRange: "Corner radius must be >= 0 and smaller than padding",
  },
  ja: {
    navTryIt: "Playground",
    navDocs: "API ドキュメント",
    languageLabel: "言語",
    subtitle: "人と API のための美しいコード画像。",
    settings: "設定",
    editor: "エディター",
    image: "画像",
    imageEmpty: "画像モードに切り替えると最終画像を生成します。",
    codePlaceholder: "ここにコードを貼り付けるか入力してください...",
    loading: "Codia を読み込み中...",
    language: "言語",
    codeTheme: "コードテーマ",
    imageFormat: "画像形式",
    backgroundColor: "背景",
    borderSize: "余白",
    borderRadius: "角丸",
    containerWidth: "コンテナ幅",
    showLineNumbers: "行番号",
    imageQuality: "生成品質",
    parameterSettings: "パラメータ設定",
    qualityDraft: "軽量",
    qualityStandard: "標準",
    qualityHigh: "高画質",
    qualityUltra: "超高画質",
    imageSize: "画像サイズ",
    generateImage: "画像を生成",
    editImage: "クリックして編集",
    copy: "画像をコピー",
    download: "ダウンロード",
    clear: "クリア",
    copied: "画像をコピーしました",
    downloaded: "ダウンロードしました",
    failed: "失敗しました",
    ready: "Ready",
    noMatch: "一致する項目がありません",
    containerRange: "コンテナ幅は {min}-1920 です",
    borderRadiusRange: "角丸は 0 以上、余白未満にしてください",
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

const defaultExampleBackgroundId = "sunset";
const defaultExampleBackground = backgroundPresets.find((item) => item.id === defaultExampleBackgroundId) ?? backgroundPresets[0];

const inspectorPath = (line: number, column: number, node: string) =>
  `src/routes/code/get-try-it.route.ts:${line}:${column}:${node}`;

const exampleHtml = (
  initialState: ExampleInitialState,
  origin: string,
  options: CodeExampleRouteOptions = {},
) => {
  const text = exampleTranslations[initialState.locale];
  const defaultBgColor = defaultExampleBackground.bgColor;

  return String.raw`<!doctype html>
<html lang="${initialState.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderSiteMeta({
      origin,
      path: "/try-it",
      title: `Try Codia · ${siteSlogan}`,
      description: "Generate beautiful code images in a human-friendly playground backed by an API built for agents.",
    })}
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
      ${siteShellStyles}

      :root {
        color-scheme: dark;
        --page-bg: #080a10;
        --text: #f8fafc;
        --muted: rgb(248 250 252 / 62%);
        --panel: #18181b;
        --panel-strong: #111827;
        --field: #111111;
        --border: rgb(255 255 255 / 12%);
        --field-border: rgb(255 255 255 / 12%);
        --divider: rgb(255 255 255 / 10%);
        --control-hover: rgb(255 255 255 / 10%);
        --button-bg: #ffffff;
        --button-text: #09090b;
        --button-hover: #e5e7eb;
        --focus: #ffffff;
        --focus-soft: rgb(255 255 255 / 14%);
        --active-bg: rgb(255 255 255 / 10%);
        --info: #7dd3fc;
        --error: #f87171;
        --shadow: rgb(0 0 0 / 38%);
        --shimmer-base: #f8fafc;
        --shimmer-highlight: #ffffff;
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

      @property --image-border-angle {
        syntax: "<angle>";
        inherits: false;
        initial-value: 0deg;
      }

      * {
        scrollbar-width: thin;
        scrollbar-color: rgb(248 250 252 / 34%) transparent;
      }

      *::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      *::-webkit-scrollbar-track {
        background: transparent;
      }

      *::-webkit-scrollbar-thumb {
        min-height: 44px;
        border: 3px solid transparent;
        border-radius: 999px;
        background: rgb(248 250 252 / 28%);
        background-clip: padding-box;
      }

      *::-webkit-scrollbar-thumb:hover {
        background: rgb(248 250 252 / 46%);
        background-clip: padding-box;
      }

      *::-webkit-scrollbar-corner {
        background: transparent;
      }

      body {
        margin: 0;
        min-height: 100vh;
        overflow-x: clip;
        background-color: var(--page-bg);
        background-image:
          radial-gradient(ellipse 78% 42% at 50% -12%, rgb(56 189 248 / 10%), transparent 72%),
          radial-gradient(ellipse 42% 36% at 100% 24%, rgb(129 140 248 / 7%), transparent 74%),
          linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
          linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px);
        background-size: auto, auto, 28px 28px, 28px 28px;
        background-attachment: fixed;
        color: var(--text);
        -webkit-font-smoothing: antialiased;
      }

      #root {
        width: 100%;
        min-height: 100vh;
      }

      .render-progress {
        position: fixed;
        z-index: 90;
        top: 0;
        left: 0;
        width: 100%;
        height: 8px;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        transform: translateY(-100%);
        transition:
          opacity 140ms ease,
          transform 140ms ease;
      }

      .render-progress::before,
      .render-progress::after {
        content: "";
        position: absolute;
        pointer-events: none;
      }

      .render-progress::before {
        top: 2px;
        left: 0;
        width: min(48vw, 520px);
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 18%) 24%, rgb(255 255 255 / 86%) 72%, #ffffff 100%);
        filter: drop-shadow(0 0 10px rgb(255 255 255 / 72%));
        transform: translateX(-110%);
        animation: render-progress-meteor-tail 860ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      .render-progress::after {
        top: 0;
        left: 0;
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #ffffff;
        box-shadow:
          0 0 10px rgb(255 255 255 / 92%),
          0 0 22px rgb(255 255 255 / 54%);
        transform: translateX(-10vw);
        animation: render-progress-meteor-head 860ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      body.is-rendering .render-progress {
        opacity: 1;
        transform: translateY(0);
      }

      @keyframes render-progress-meteor-tail {
        0% {
          opacity: 0;
          transform: translateX(-110%);
        }
        12% {
          opacity: 1;
        }
        100% {
          opacity: 0.72;
          transform: translateX(calc(100vw + 24px));
        }
      }

      @keyframes render-progress-meteor-head {
        0% {
          opacity: 0;
          transform: translateX(-10vw) scale(0.82);
        }
        12% {
          opacity: 1;
        }
        100% {
          opacity: 0.86;
          transform: translateX(calc(100vw + 24px)) scale(1);
        }
      }

      .react-root-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
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
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto;
        padding: 34px 0;
        display: grid;
        justify-items: center;
      }

      main.app-shell {
        flex: 1 0 auto;
        min-height: 0;
        padding: 34px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
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
        position: relative;
        z-index: 0;
        width: min(1366px, calc(100% - 32px));
        min-height: 96px;
        margin-top: 0;
        padding: 18px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        color: rgb(248 250 252 / 62%);
        font-size: 13px;
      }

      .site-footer::before {
        content: "";
        position: absolute;
        z-index: -1;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 100vw;
        transform: translateX(-50%);
        background: #09090b;
        box-shadow: 0 -1px 0 rgb(255 255 255 / 8%);
        pointer-events: none;
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

      .site-footer nav {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .site-footer a {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 12px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: transparent;
        color: rgb(248 250 252 / 68%);
        text-decoration: none;
        font: inherit;
        font-size: 14px;
        font-weight: 800;
        transition-property: color, background, border-color, transform;
        transition-duration: 160ms;
      }

      .site-footer a:hover {
        color: #ffffff;
      }

      .site-footer a:active {
        transform: scale(0.96);
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

      .app-layout {
        margin-bottom: 22px;
      }

      .preview-tools {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      button {
        height: 40px;
        border: 1px solid var(--field-border);
        border-radius: 4px;
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

      button:hover {
        background: var(--button-hover);
        box-shadow: 0 1px 2px rgb(15 23 42 / 12%);
      }

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
        background: #ffffff;
        border-color: rgb(15 23 42 / 18%);
        color: var(--text);
      }

      .preview-tools .icon-button,
      .copy-button,
      .download-button {
        width: 32px;
        min-width: 32px;
        height: 32px;
        border-radius: 4px;
        border-color: rgb(15 23 42 / 12%);
        background: #ffffff;
        color: var(--text);
        box-shadow: 0 8px 20px rgb(15 23 42 / 8%);
      }

      .preview-tools .icon-button:hover,
      .preview-tools .icon-button[aria-expanded="true"],
      .copy-button:hover,
      .download-button:hover {
        background: #f8fafc;
        border-color: rgb(15 23 42 / 18%);
        color: var(--text);
        box-shadow: 0 10px 24px rgb(15 23 42 / 12%);
      }

      .preview-tools .settings-toggle-button {
        width: auto;
        min-width: 32px;
        padding: 0 10px;
        gap: 6px;
      }

      .settings-toggle-label {
        display: inline;
        font-size: 13px;
        font-weight: 800;
        white-space: nowrap;
      }

      svg {
        width: 16px;
        height: 16px;
        flex: none;
      }

      #sonner-toast-container {
        position: fixed;
        z-index: 100;
        top: 16px;
        left: 50%;
        width: min(420px, calc(100vw - 32px));
        margin: 0;
        padding: 0;
        pointer-events: none;
        transform: translateX(-50%);
      }

      section {
        background: transparent;
        overflow: visible;
      }

      section + section {
        margin-top: 18px;
      }

      .app-layout {
        display: block;
        width: 100%;
        min-width: 0;
      }

      .settings-panel {
        position: relative;
        z-index: 6;
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        margin: 0;
        background: transparent;
        border-radius: 0;
        box-shadow: none;
        opacity: 0;
        transform: translateY(-8px);
        visibility: hidden;
        pointer-events: none;
        max-height: 0;
        overflow: hidden;
        transition:
          max-height 180ms ease,
          opacity 180ms ease,
          transform 180ms ease,
          visibility 180ms ease;
      }

      body.settings-open .app-layout {
        display: block;
      }

      body.settings-open .settings-panel {
        display: block;
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        pointer-events: auto;
        max-height: none;
        overflow: visible;
        margin-top: 12px;
        padding: 0;
      }

      body.settings-open .view-stack {
        margin-top: 24px;
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
        border-radius: 4px;
        background: var(--field);
      }

      .tabs::before {
        content: "";
        position: absolute;
        top: 2px;
        bottom: 2px;
        left: 2px;
        width: var(--tab-indicator-width, 84px);
        border-radius: 4px;
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
        grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.35fr);
        gap: 14px;
        align-items: stretch;
        min-width: 0;
      }

      .settings-primary-column,
      .settings-secondary-column {
        display: grid;
        gap: 14px;
        min-width: 0;
      }

      .settings-primary-column > label {
        grid-template-rows: auto 1fr;
      }

      .settings-row {
        display: grid;
        gap: 12px;
        min-width: 0;
      }

      .settings-row.two-up {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .settings-row.three-up {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .settings-row.compact-settings {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        align-items: start;
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
      .combobox:focus-within {
        border-color: var(--focus);
        box-shadow: 0 0 0 3px var(--focus-soft);
      }

      .format-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .format-option {
        min-height: 42px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid var(--field-border);
        border-radius: 9px;
        background: var(--field);
        color: var(--muted);
        font: 700 14px/1.5 ui-monospace, "SFMono-Regular", Consolas, monospace;
        cursor: pointer;
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
        transition:
          border-color 150ms ease,
          background 150ms ease,
          color 150ms ease,
          box-shadow 150ms ease;
      }

      .format-option:hover,
      .format-option:focus-within {
        border-color: var(--focus);
        color: var(--text);
      }

      .format-option:focus-within {
        box-shadow: 0 0 0 3px var(--focus-soft);
      }

      .format-option:has(input:checked) {
        background: var(--button-bg);
        color: var(--button-text);
        border-color: var(--button-bg);
      }

      .format-option input {
        width: 16px;
        height: 16px;
        padding: 0;
        accent-color: var(--button-bg);
        box-shadow: none;
        flex: 0 0 auto;
      }

      .quality-select {
        position: relative;
        min-width: 0;
      }

      .quality-trigger {
        width: 100%;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid var(--field-border);
        border-radius: 9px;
        background: var(--field);
        color: var(--text);
        font: 800 13px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace;
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
      }

      .quality-trigger[aria-expanded="true"],
      .quality-trigger:focus-visible {
        border-color: color-mix(in srgb, var(--quality-color) 72%, #ffffff 12%);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--quality-color) 18%, transparent);
      }

      .quality-trigger:hover {
        border-color: var(--field-border);
        background: var(--field);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
      }

      .quality-trigger-main,
      .quality-option-main {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .quality-trigger-label,
      .quality-option-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .quality-swatch {
        width: 20px;
        height: 8px;
        border-radius: 2px;
        background: var(--quality-color);
        box-shadow: 0 0 12px color-mix(in srgb, var(--quality-color) 48%, transparent);
        flex: 0 0 auto;
      }

      .quality-bars {
        display: inline-grid;
        grid-template-columns: repeat(4, 12px);
        gap: 3px;
        flex: 0 0 auto;
      }

      .quality-bars span {
        width: 12px;
        height: 6px;
        border-radius: 2px;
        background: rgb(248 250 252 / 16%);
      }

      .quality-bars span.is-on {
        background: var(--quality-color);
        box-shadow: 0 0 10px color-mix(in srgb, var(--quality-color) 58%, transparent);
      }

      .quality-menu {
        position: absolute;
        z-index: 18;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        padding: 4px;
        border: 1px solid var(--field-border);
        border-radius: 7px;
        background: var(--field);
        box-shadow: 0 18px 48px var(--shadow);
      }

      .quality-option {
        width: 100%;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 8px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--muted);
        font: 800 12px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace;
        box-shadow: none;
      }

      .quality-option:hover,
      .quality-option.is-active,
      .quality-option:focus-visible {
        background: transparent;
        color: #ffffff;
        box-shadow: none;
      }

      .quality-option .option-selection-icon {
        opacity: 0;
      }

      .quality-option.is-active .option-selection-icon {
        opacity: 1;
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

      .language-combobox input {
        padding-left: 38px;
      }

      .language-preview-icon {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 10px;
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        overflow: hidden;
        pointer-events: none;
        transform: translateY(-50%);
      }

      .language-preview-icon img,
      .option-language-icon img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
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

      .options {
        position: absolute;
        z-index: 18;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        max-height: 252px;
        overflow: auto;
        border: 1px solid var(--field-border);
        border-radius: 7px;
        background: var(--field);
        box-shadow: 0 18px 48px var(--shadow);
      }

      .option {
        width: 100%;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 9px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--text);
        font-size: 11px;
        font-weight: 700;
        text-align: left;
      }

      .option-main {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .option-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .option-language-icon {
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        overflow: hidden;
        flex: 0 0 auto;
      }

      .option:hover,
      .option.is-active {
        background: transparent;
        color: #ffffff;
      }

      .option-selection-icon {
        width: 13px;
        height: 13px;
        color: #ffffff;
        opacity: 0;
        flex: 0 0 auto;
      }

      .option.is-active .option-selection-icon {
        opacity: 1;
      }

      .option-selection-icon svg {
        width: 13px;
        height: 13px;
      }

      .empty {
        padding: 7px 9px;
        color: var(--muted);
        font-size: 11px;
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
        border-radius: 4px;
      }

      .color-control.is-invalid input[type="text"] {
        border-color: var(--error);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 18%, transparent);
      }

      .background-picker {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 294px;
        overflow: hidden;
        border-radius: 12px;
      }

      .background-card {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 0;
        display: block;
        padding: 0;
        border: 0;
        border-radius: 12px;
        background: var(--preset-bg);
        color: #ffffff;
        cursor: default;
        transition: background 180ms ease;
        box-shadow:
          inset 0 0 0 1px rgb(255 255 255 / 24%),
          0 14px 36px rgb(15 23 42 / 16%);
      }

      .background-card.is-selected {
        background: var(--preset-bg);
        color: #ffffff;
        box-shadow:
          inset 0 0 0 2px rgb(255 255 255 / 76%),
          0 16px 42px rgb(15 23 42 / 18%);
      }

      .background-thumbs {
        position: absolute;
        z-index: 3;
        left: 54px;
        right: 54px;
        bottom: 10px;
        height: 48px;
        padding: 0;
      }

      .background-thumb-nav {
        position: absolute;
        z-index: 4;
        bottom: 14px;
        width: 40px;
        min-width: 40px;
        height: 40px;
        display: inline-grid;
        place-items: center;
        padding: 0;
        border: 1px solid rgb(255 255 255 / 26%);
        border-radius: 999px;
        background: rgb(15 23 42 / 52%);
        color: #ffffff;
        box-shadow:
          0 10px 24px rgb(0 0 0 / 24%),
          inset 0 1px 0 rgb(255 255 255 / 16%);
        backdrop-filter: blur(12px);
      }

      .background-thumb-nav:hover,
      .background-thumb-nav:focus-visible {
        background: rgb(15 23 42 / 68%);
        border-color: rgb(255 255 255 / 52%);
        box-shadow:
          0 12px 28px rgb(0 0 0 / 30%),
          inset 0 1px 0 rgb(255 255 255 / 20%);
      }

      .background-thumb-nav:disabled {
        opacity: 0.38;
        cursor: default;
        pointer-events: none;
      }

      .background-thumb-nav.prev {
        left: 10px;
      }

      .background-thumb-nav.next {
        right: 10px;
      }

      .background-thumbs::part(container) {
        height: 100%;
        overflow: hidden;
      }

      .background-thumbs::part(wrapper) {
        height: 100%;
      }

      .background-thumbs swiper-slide {
        height: 100%;
        width: 68px;
      }

      .background-thumb {
        width: 68px;
        height: 48px;
        min-width: 0;
        padding: 0;
        border: 2px solid rgb(255 255 255 / 22%);
        border-radius: 7px;
        background: var(--preset-bg);
        box-shadow: 0 8px 20px rgb(0 0 0 / 22%);
      }

      .background-thumb:hover,
      .background-thumb:focus-visible,
      .background-thumb.is-selected {
        border-color: #ffffff;
        background: var(--preset-bg);
        box-shadow:
          0 0 0 2px rgb(0 0 0 / 28%),
          0 12px 24px rgb(0 0 0 / 28%);
      }

      .toggle-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .compact-settings .toggle-field {
        min-height: 42px;
        padding: 0 12px;
        border: 1px solid var(--field-border);
        border-radius: 9px;
        background: var(--field);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
      }

      .compact-settings .quality-field {
        grid-column: span 2;
      }

      .switch-control {
        width: 100%;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      .switch-control input {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        opacity: 0;
        clip: rect(0 0 0 0);
        overflow: hidden;
      }

      .switch-track {
        position: relative;
        width: 48px;
        height: 28px;
        border: 1px solid var(--field-border);
        border-radius: 999px;
        background: var(--field);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
        transition:
          background 150ms ease,
          border-color 150ms ease,
          box-shadow 150ms ease;
      }

      .switch-track::before {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        border-radius: 999px;
        background: rgb(248 250 252 / 78%);
        box-shadow: 0 4px 10px rgb(0 0 0 / 24%);
        transition:
          transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1),
          background 150ms ease;
      }

      .switch-control:hover .switch-track,
      .switch-control:focus-within .switch-track {
        border-color: var(--focus);
        box-shadow: 0 0 0 3px var(--focus-soft);
      }

      .switch-control input:checked + .switch-track {
        border-color: #ffffff;
        background: #ffffff;
      }

      .switch-control input:checked + .switch-track::before {
        background: #09090b;
        transform: translateX(20px);
      }

      .toggle-field input {
        width: 18px;
        height: 18px;
        padding: 0;
        accent-color: var(--text);
      }

      .editor-stage {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: transparent;
      }

      .view {
        width: 100%;
      }

      .view[hidden] {
        display: none !important;
      }

      .view-stack {
        position: relative;
        z-index: 1;
        width: 100%;
        margin-top: clamp(24px, calc((100vh - 842px) / 2), 60px);
        overflow: hidden;
      }

      .view-stack .view {
        animation: view-fade-in 220ms ease-out both;
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
      }

      .image-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        overflow: auto;
      }

      .final-image-frame {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        max-height: min(72vh, 760px);
        border-radius: var(--image-frame-radius, 12px);
        overflow: hidden;
      }

      .final-image {
        max-width: 100%;
        max-height: min(72vh, 760px);
        height: auto;
        display: block;
        object-fit: contain;
        transition: opacity 260ms ease;
      }

      .edit-image-button {
        position: absolute;
        right: 16px;
        bottom: 16px;
        min-width: 0;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 12px;
        border: 1px solid rgb(255 255 255 / 18%);
        border-radius: 999px;
        background: rgb(9 9 11 / 68%);
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        box-shadow: 0 12px 32px rgb(0 0 0 / 28%);
        opacity: 0;
        transform: translateY(6px);
        pointer-events: none;
        backdrop-filter: blur(12px);
        transition:
          opacity 160ms ease,
          transform 160ms ease,
          background 160ms ease;
      }

      .edit-image-button svg {
        width: 15px;
        height: 15px;
      }

      .final-image-frame:hover .edit-image-button,
      .final-image-frame:focus-within .edit-image-button {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .edit-image-button:hover {
        background: rgb(9 9 11 / 82%);
        box-shadow: 0 12px 32px rgb(0 0 0 / 28%);
      }

      .edit-image-button {
        z-index: 5;
      }

      .final-image-frame::before,
      .final-image-frame::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        opacity: 0;
        pointer-events: none;
      }

      .final-image-frame::before {
        z-index: 3;
        padding: 2px;
        background: conic-gradient(
          from var(--image-border-angle),
          rgb(255 255 255 / 0%) 0deg,
          rgb(255 255 255 / 0%) 238deg,
          rgb(255 255 255 / 28%) 286deg,
          #ffffff 322deg,
          rgb(255 255 255 / 0%) 360deg
        );
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .final-image-frame::after {
        z-index: 2;
        box-shadow:
          inset 0 0 0 1px rgb(255 255 255 / 18%),
          inset 0 0 28px rgb(255 255 255 / 10%),
          0 0 28px rgb(255 255 255 / 18%);
      }

      .final-image-frame.is-image-refreshing::before,
      .final-image-frame.is-image-refreshing::after {
        opacity: 1;
      }

      .final-image-frame.is-image-refreshing::before {
        animation: image-border-flow 880ms linear infinite;
      }

      @keyframes image-border-flow {
        to {
          --image-border-angle: 360deg;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .final-image {
          transition: none;
        }

        .final-image-frame.is-image-refreshing::before {
          animation: none;
        }
      }

      .image-empty {
        color: var(--muted);
        font-size: 14px;
      }

      .image-size {
        color: rgb(248 250 252 / 58%);
        font: 12px/1.4 "Fira Code", ui-monospace, "SFMono-Regular", Consolas, monospace;
        text-align: center;
      }

      .view.is-entering {
        animation: view-fade-in 220ms ease-out both;
      }

      @keyframes view-fade-in {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
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
        border: 1px solid rgb(15 23 42 / 16%);
        border-radius: 10px;
        outline: none;
        resize: none;
        overflow: auto;
        background: #ffffff;
        color: var(--text);
        caret-color: currentColor;
        -webkit-text-fill-color: currentColor;
        padding: 16px;
        box-shadow: 0 18px 50px rgb(15 23 42 / 10%);
        transition:
          border-color 150ms ease,
          box-shadow 150ms ease;
      }

      .code-input:focus {
        border-color: rgb(15 23 42 / 36%);
        box-shadow:
          0 0 0 3px rgb(24 24 27 / 8%),
          0 18px 50px rgb(15 23 42 / 12%);
      }

      .code-input::selection {
        background: rgb(0 0 0 / 28%);
      }

      .editor-actions {
        position: absolute;
        right: 14px;
        bottom: 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .clear-code-button,
      .generate-image-button {
        height: 34px;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 10px;
        border-color: rgb(15 23 42 / 10%);
        border-radius: 4px;
        background: rgb(255 255 255 / 92%);
        color: rgb(15 23 42 / 76%);
        font-size: 12px;
        font-weight: 800;
        box-shadow: 0 10px 26px rgb(15 23 42 / 14%);
        backdrop-filter: blur(10px);
      }

      .clear-code-button:hover,
      .generate-image-button:hover {
        background: #ffffff;
        color: var(--text);
        box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
      }

      .generate-image-button {
        border-color: rgb(15 23 42 / 16%);
        background: #111827;
        color: #ffffff;
      }

      .generate-image-button:hover {
        background: #020617;
        color: #ffffff;
      }

      .clear-code-button svg,
      .generate-image-button svg {
        width: 14px;
        height: 14px;
      }

      [hidden] {
        display: none !important;
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

      .site-locale-trigger,
      .site-menu-trigger,
      .site-avatar-link,
      .site-icon-link {
        background: rgb(255 255 255 / 7%);
        border-color: rgb(255 255 255 / 12%);
        color: #f8fafc;
        box-shadow: 0 16px 34px rgb(0 0 0 / 24%);
      }

      .site-nav a:hover,
      .site-playground-link:hover,
      .site-locale-trigger:hover,
      .site-menu-trigger:hover,
      .site-menu-trigger[aria-expanded="true"],
      .site-avatar-link:hover,
      .site-icon-link:hover {
        color: #ffffff;
      }

      .site-locale-trigger:hover {
        background: rgb(255 255 255 / 7%);
        border-color: rgb(255 255 255 / 12%);
        box-shadow: 0 16px 34px rgb(0 0 0 / 24%);
      }

      .site-menu-trigger:hover,
      .site-menu-trigger[aria-expanded="true"] {
        background: rgb(255 255 255 / 7%);
        border-color: rgb(255 255 255 / 12%);
        box-shadow: 0 16px 34px rgb(0 0 0 / 24%);
      }

      .site-nav a[aria-current="page"],
      .site-playground-link[aria-current="page"] {
        color: #ffffff;
      }

      .site-locale-menu {
        background: #111111;
        border-color: rgb(255 255 255 / 12%);
        box-shadow: 0 18px 48px rgb(0 0 0 / 38%);
      }

      .site-locale-menu button {
        background: #111111;
        border: 0;
        border-color: transparent;
        border-radius: 0;
        box-shadow: none;
        color: rgb(248 250 252 / 62%);
        outline: none;
      }

      .site-locale-menu button:hover,
      .site-locale-menu button:focus-visible,
      .site-locale-menu button[aria-pressed="true"] {
        background: #111111;
        border: 0;
        border-color: transparent;
        border-radius: 0;
        box-shadow: none;
        color: #ffffff;
        outline: none;
      }

      .code-input {
        border-color: rgb(255 255 255 / 12%);
        background: #18181b;
        box-shadow: 0 18px 50px rgb(0 0 0 / 32%);
      }

      .code-input:focus {
        border-color: rgb(255 255 255 / 34%);
        box-shadow:
          0 0 0 3px rgb(255 255 255 / 8%),
          0 18px 50px rgb(0 0 0 / 38%);
      }

      .code-input::selection {
        background: rgb(255 255 255 / 24%);
      }

      .clear-code-button,
      .generate-image-button {
        border-color: rgb(255 255 255 / 14%);
        box-shadow: 0 10px 26px rgb(0 0 0 / 30%);
      }

      .clear-code-button {
        background: rgb(255 255 255 / 10%);
        color: rgb(248 250 252 / 82%);
      }

      .clear-code-button:hover {
        background: rgb(255 255 255 / 16%);
        color: #ffffff;
      }

      .generate-image-button,
      .generate-image-button:hover {
        background: #ffffff;
        color: #09090b;
      }

      .preview-tools .icon-button,
      .preview-tools .icon-button:hover,
      .preview-tools .icon-button[aria-expanded="true"],
      .copy-button,
      .download-button,
      .copy-button:hover,
      .download-button:hover {
        border-color: rgb(255 255 255 / 12%);
        background: rgb(255 255 255 / 10%);
        color: #f8fafc;
        box-shadow: 0 8px 20px rgb(0 0 0 / 24%);
      }

      .final-image {
        outline: 1px solid rgb(255 255 255 / 10%);
        box-shadow: 0 18px 48px rgb(0 0 0 / 30%);
      }

      @media (min-width: 861px) {
        .final-image-frame {
          margin-top: 24px;
        }
      }

      @media (max-width: 760px) {
        .site-header-actions {
          background: #111111;
          color: #ffffff;
        }

        .site-header.is-menu-open .site-header-actions {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        .site-header-actions .site-nav a,
        .site-header-actions .site-playground-link,
        .site-header-actions .site-locale-trigger,
        .site-header-actions .site-avatar-link,
        .site-header-actions .site-icon-link {
          background: #111111;
          border-color: rgb(255 255 255 / 12%);
          color: rgb(248 250 252 / 62%);
          box-shadow: none;
        }

        .site-header-actions .site-nav a:hover,
        .site-header-actions .site-playground-link:hover,
        .site-header-actions .site-locale-trigger:hover,
        .site-header-actions .site-avatar-link:hover,
        .site-header-actions .site-icon-link:hover {
          color: #ffffff;
        }
      }

      @media (max-width: 860px) {
        main,
        main.app-shell {
          width: min(100% - 24px, 1200px);
          padding: 18px 0 26px;
        }

        .panel-header {
          min-height: 0;
          align-items: center;
          flex-direction: row;
          justify-content: space-between;
          gap: 12px;
        }

        .tabs {
          width: max-content;
          max-width: 100%;
          align-self: flex-start;
        }

        .tab-button {
          min-width: 0;
        }

        .preview-tools {
          width: max-content;
          max-width: calc(100% - 146px);
          justify-content: flex-end;
          display: flex;
          flex-wrap: nowrap;
        }

        .copy-button,
        .download-button {
          width: 40px;
          min-width: 0;
          padding: 0;
        }

        .copy-button span,
        .download-button span {
          display: none;
        }

        .preview-tools .settings-toggle-button {
          width: 32px;
          min-width: 32px;
          padding: 0;
        }

        .settings-toggle-label {
          display: none;
        }

        .app-layout {
          display: block;
        }

        body.settings-open .app-layout {
          display: block;
        }

        body.settings-open .settings-panel {
          margin-left: 0;
          margin-top: 12px;
          padding: 0;
          max-height: none;
        }

        .settings-row.three-up,
        .settings-grid {
          grid-template-columns: 1fr;
        }

        .settings-row.two-up,
        .settings-row.compact-settings {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .background-picker {
          height: auto;
          min-height: 0;
          max-height: 150px;
          aspect-ratio: 16 / 9;
        }

        body.settings-open .editor-section {
          min-width: 0;
        }

        .view-stack {
          margin-top: 24px;
        }

        .editor-body,
        .code-input {
          min-height: 420px;
        }

        .code-input {
          padding: 14px 14px 60px;
          font-size: 14px;
          line-height: 22px;
          border-radius: 4px;
        }

        .clear-code-button {
          min-width: 34px;
          padding: 0 8px;
        }

        .editor-actions {
          right: 10px;
          bottom: 10px;
        }

        .image-stage {
          min-height: 0;
          justify-content: flex-start;
          overflow: visible;
        }

        .final-image-frame {
          max-height: 72vh;
        }

        .final-image {
          max-height: 72vh;
          object-fit: contain;
        }

        .edit-image-button {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .site-footer {
          align-items: center;
          flex-direction: column;
          padding: 22px 0 24px;
          gap: 14px;
        }

        .site-footer-brand {
          width: 100%;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          text-align: center;
          line-height: 1.5;
          margin: 24px 0;
        }

        .site-footer-brand span {
          flex: 0 0 100%;
          text-align: center;
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

      }
    </style>
  </head>
  <body>
    <div class="render-progress" aria-hidden="true"></div>
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
      theme="dark">
    </ol>
    <template id="appTemplate">
    ${renderSiteHeader("try-it", initialState.locale, text)}
    <main class="app-shell" data-insp-path="${inspectorPath(1179, 5, "main")}">

      <div class="app-layout" id="appLayout" data-insp-path="${inspectorPath(1204, 7, "div")}">
        <section class="editor-section" data-insp-path="${inspectorPath(1205, 9, "section")}">
          <div class="panel-header">
            <div class="tabs" role="tablist" aria-label="Preview mode">
              <button class="tab-button" id="editorTab" type="button" role="tab" aria-selected="false" aria-controls="editorView" data-view="editor" data-i18n="editor">${text.editor}</button>
              <button class="tab-button" id="imageTab" type="button" role="tab" aria-selected="true" aria-controls="imageView" data-view="image" data-i18n="image">${text.image}</button>
            </div>
            <div class="preview-tools">
              <button class="copy-button" id="copy" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span data-i18n="copy">${text.copy}</span>
              </button>
              <button class="download-button" id="download" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                <span data-i18n="download">${text.download}</span>
              </button>
              <button class="icon-button settings-toggle-button" id="settingsToggle" type="button" aria-label="${text.parameterSettings}" aria-expanded="false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
                <span class="settings-toggle-label" data-i18n="parameterSettings">${text.parameterSettings}</span>
              </button>
            </div>
          </div>
          <aside class="settings-panel" id="settingsPanel" data-insp-path="${inspectorPath(1242, 9, "aside")}">
            <form id="form">
              <div class="settings-grid">
                <div class="settings-primary-column">
                  <label>
                    <span data-i18n="backgroundColor">${text.backgroundColor}</span>
                    <input id="bgColor" name="bgColor" type="hidden" value="${defaultBgColor}" />
                    <div class="background-picker">
                      <div class="background-card" id="backgroundPreview" aria-hidden="true"></div>
                      <button class="background-thumb-nav prev" id="backgroundThumbPrev" type="button" aria-label="Previous background">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      <swiper-container class="background-thumbs" id="backgroundThumbs" init="false"></swiper-container>
                      <button class="background-thumb-nav next" id="backgroundThumbNext" type="button" aria-label="Next background">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  </label>
                </div>
                <div class="settings-secondary-column">
                  <div class="settings-row two-up">
                    <div class="field">
                      <span data-i18n="language">${text.language}</span>
                      <input id="language" name="language" type="hidden" value="typescript" />
                      <div class="combobox language-combobox" id="languageCombobox">
                        <span class="language-preview-icon" id="languagePreviewIcon" aria-hidden="true"></span>
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
                  </div>
                  <label>
                    <span data-i18n="imageFormat">${text.imageFormat}</span>
                    <input id="imageFormat" name="format" type="hidden" value="png" />
                    <div class="format-options" id="imageFormatGroup" role="group" aria-label="${text.imageFormat}">
                      <label class="format-option">
                        <input class="format-checkbox" type="checkbox" value="png" data-image-format checked />
                        <span>PNG</span>
                      </label>
                      <label class="format-option">
                        <input class="format-checkbox" type="checkbox" value="webp" data-image-format />
                        <span>WebP</span>
                      </label>
                    </div>
                  </label>
                  <div class="settings-row compact-settings">
                    <label>
                      <span data-i18n="borderSize">${text.borderSize}</span>
                      <input id="borderSize" name="borderSize" type="number" min="0" max="120" step="1" value="12" />
                    </label>
                    <label>
                      <span data-i18n="borderRadius">${text.borderRadius}</span>
                      <input id="borderRadius" name="borderRadius" type="number" min="0" max="11" step="1" value="4" />
                    </label>
                    <label>
                      <span data-i18n="containerWidth">${text.containerWidth}</span>
                      <input id="containerWidth" name="containerWidth" type="number" min="400" max="1920" step="1" value="600" />
                    </label>
                    <div class="field line-number-field">
                      <span data-i18n="showLineNumbers">${text.showLineNumbers}</span>
                      <label class="switch-control">
                        <input id="showLineNumbers" name="showLineNumbers" type="checkbox" checked />
                        <span class="switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                    <div class="field quality-field">
                      <span data-i18n="imageQuality">${text.imageQuality}</span>
                      <input id="imageQuality" name="quality" type="hidden" value="2" />
                      <div class="quality-select">
                        <button class="quality-trigger" id="imageQualityTrigger" type="button" aria-expanded="false" aria-controls="imageQualityOptions" aria-label="${text.imageQuality}" style="--quality-color: #22c55e;">
                          <span class="quality-trigger-main">
                            <span class="quality-swatch" id="imageQualitySwatch" aria-hidden="true"></span>
                            <span class="quality-trigger-label" id="imageQualityLabel">${text.qualityStandard}</span>
                          </span>
                          <span class="quality-bars" id="imageQualityBars" aria-hidden="true"><span class="is-on"></span><span class="is-on"></span><span></span><span></span></span>
                        </button>
                        <div class="quality-menu" id="imageQualityOptions" role="listbox" hidden>
                          <button class="quality-option" type="button" role="option" aria-selected="false" data-image-quality="1" data-quality-label-key="qualityDraft" style="--quality-color: #38bdf8;">
                            <span class="quality-option-main">
                              <span class="option-selection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span>
                              <span class="quality-swatch" aria-hidden="true"></span>
                              <span class="quality-option-label" data-i18n="qualityDraft">${text.qualityDraft}</span>
                            </span>
                            <span class="quality-bars" aria-hidden="true"><span class="is-on"></span><span></span><span></span><span></span></span>
                          </button>
                          <button class="quality-option is-active" type="button" role="option" aria-selected="true" data-image-quality="2" data-quality-label-key="qualityStandard" style="--quality-color: #22c55e;">
                            <span class="quality-option-main">
                              <span class="option-selection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span>
                              <span class="quality-swatch" aria-hidden="true"></span>
                              <span class="quality-option-label" data-i18n="qualityStandard">${text.qualityStandard}</span>
                            </span>
                            <span class="quality-bars" aria-hidden="true"><span class="is-on"></span><span class="is-on"></span><span></span><span></span></span>
                          </button>
                          <button class="quality-option" type="button" role="option" aria-selected="false" data-image-quality="3" data-quality-label-key="qualityHigh" style="--quality-color: #f59e0b;">
                            <span class="quality-option-main">
                              <span class="option-selection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span>
                              <span class="quality-swatch" aria-hidden="true"></span>
                              <span class="quality-option-label" data-i18n="qualityHigh">${text.qualityHigh}</span>
                            </span>
                            <span class="quality-bars" aria-hidden="true"><span class="is-on"></span><span class="is-on"></span><span class="is-on"></span><span></span></span>
                          </button>
                          <button class="quality-option" type="button" role="option" aria-selected="false" data-image-quality="4" data-quality-label-key="qualityUltra" style="--quality-color: #f43f5e;">
                            <span class="quality-option-main">
                              <span class="option-selection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span>
                              <span class="quality-swatch" aria-hidden="true"></span>
                              <span class="quality-option-label" data-i18n="qualityUltra">${text.qualityUltra}</span>
                            </span>
                            <span class="quality-bars" aria-hidden="true"><span class="is-on"></span><span class="is-on"></span><span class="is-on"></span><span class="is-on"></span></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </aside>
          <div class="view-stack" id="viewStack">
            <div class="editor-stage view" id="editorView" role="tabpanel" aria-labelledby="editorTab" hidden>
              <div class="editor-canvas" id="editorCanvas">
                <div class="editor-window" id="editorWindow">
                  <div class="editor-body" id="editorBody">
                    <textarea class="code-input" id="code" name="code" spellcheck="false" placeholder="${text.codePlaceholder}"></textarea>
                    <div class="editor-actions">
                      <button class="clear-code-button" id="clearCode" type="button" aria-label="${text.clear}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        <span data-i18n="clear">${text.clear}</span>
                      </button>
                      <button class="generate-image-button" id="generateImage" type="button" aria-label="${text.generateImage}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16"/><path d="M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14"/><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/></svg>
                        <span data-i18n="generateImage">${text.generateImage}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="image-stage view" id="imageView" role="tabpanel" aria-labelledby="imageTab">
              <div class="final-image-frame" id="finalImageFrame">
                <img class="final-image" id="finalImage" alt="Rendered code image" loading="eager" decoding="async" fetchpriority="high" hidden />
                <button class="edit-image-button" id="editImage" type="button" aria-label="${text.editImage}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  <span data-i18n="editImage">${text.editImage}</span>
                </button>
              </div>
              <div class="image-size" id="imageSize" aria-live="polite" hidden></div>
              <div class="image-empty" id="imageEmpty" data-i18n="imageEmpty" hidden>${text.imageEmpty}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
    ${renderSiteFooter()}
    </template>
    <div id="root"></div>

    ${options.codeInspectorScript ? `<script>${options.codeInspectorScript}</script>` : ""}
    <script type="module">
      import React from "https://esm.sh/react@18.3.1";
      import { flushSync } from "https://esm.sh/react-dom@18.3.1";
      import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
      import { toast } from "https://esm.sh/vanilla-sonner@0.5.2";
      import { codeToTokens, bundledLanguages } from "https://esm.sh/shiki@3.23.0";
      import initTakumiWasm, { Renderer as TakumiRenderer } from "https://esm.sh/@takumi-rs/wasm@2.1.1?target=es2022&conditions=browser";
      import { container, image as takumiImage, text as takumiText } from "https://esm.sh/@takumi-rs/helpers@2.1.1?target=es2022&conditions=browser";

      const shikiThemes = ${JSON.stringify(shikiThemes)};
      const initialState = ${JSON.stringify(initialState)};
      const defaultCode = ${JSON.stringify(defaultExampleCode)};
      const defaultExampleBackgroundId = ${JSON.stringify(defaultExampleBackgroundId)};
      const translations = ${JSON.stringify(exampleTranslations)};
      const codeLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#111827"/><path fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" d="M24 22 12 32l12 10m16-20 12 10-12 10M36 16 28 48"/></svg>';
      const languageLogoAliases = {
        ts: "typescript",
        tsx: "typescript",
        js: "javascript",
        jsx: "javascript",
        py: "python",
        golang: "go",
        rs: "rust",
        rb: "ruby",
      };
      const languageLogoSvgs = {
        typescript: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#3178c6"/><path fill="#fff" d="M15 31h25v6h-9v21h-7V37h-9v-6Zm28 25c2 1 4 2 8 2 6 0 10-3 10-8 0-4-2-6-7-8l-2-1c-3-1-4-2-4-4s2-3 4-3c3 0 5 1 7 2l2-5c-2-1-5-3-9-3-6 0-10 4-10 9 0 4 2 7 8 9l2 1c3 1 4 2 4 4s-2 3-5 3c-3 0-6-1-8-3l-2 5Z"/></svg>',
        javascript: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#f7df1e"/><path fill="#111" d="M17 50c1 2 3 4 7 4 4 0 7-2 7-7V29h-6v18c0 2-1 3-3 3s-3-1-4-3l-1 3Zm18-1c2 3 5 5 10 5 5 0 9-3 9-8 0-4-2-7-8-9l-2-1c-3-1-4-2-4-4s1-3 4-3c2 0 4 1 5 3l4-3c-2-3-5-5-9-5-6 0-9 4-9 8 0 5 3 7 8 9l2 1c3 1 4 2 4 4s-2 3-4 3c-3 0-5-1-6-4l-4 4Z"/></svg>',
        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#e34f26"/><path fill="#fff" d="M18 10h28l-3 38-11 6-11-6-3-38Zm8 11 1 6h15l1-6H26Zm1 10 1 6h9l-.3 5-4.7 2.5-4.6-2.5-.3-3.4h-6l.7 7.4 10.2 5.6 10.2-5.6 1.3-16H27Z"/></svg>',
        css: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#423299" d="M511.344 274.266c.426-6.035.656-12.123.656-18.266C512 114.615 397.385 0 256 0S0 114.615 0 256c0 117.769 79.53 216.949 187.809 246.801l323.535-228.535z"/><path fill="#1B0683" d="M511.344 274.266 314.991 77.913 119.096 434.087l68.714 68.714C209.522 508.787 232.385 512 256 512c135.243 0 245.976-104.875 255.344-237.734z"/><path fill="#FFFFFF" d="m278.328 333.913-22.617-256H119.096v233.739z"/><path fill="#E8E6E6" d="M392.904 311.652V155.826l-55.652-22.261-22.261-55.652h-59.28l.356 256z"/><path fill="#FFFFFF" d="M314.991 155.826V77.913l77.913 77.913z"/><path fill="#6A5CAF" d="M119.096 311.652h273.809v122.435H119.096z"/><path fill="#FFFFFF" d="m230.64 354.863-7.795 9.233c-3.48-4.238-8.627-6.887-13.32-6.887-8.4 0-14.757 6.659-14.757 15.363 0 8.854 6.357 15.589 14.757 15.589 4.466 0 9.611-2.422 13.32-6.206l7.87 8.324c-5.675 5.827-14.076 9.687-21.871 9.687-15.969 0-27.849-11.73-27.849-27.245 0-15.287 12.184-26.79 28.305-26.79 7.869.002 16.042 3.482 21.34 8.932zm49.348-3.179-5.071 10.519c-5.6-3.255-12.639-5.524-16.952-5.524-3.482 0-5.827 1.287-5.827 3.86 0 9.157 28.001 3.936 28.001 23.082 0 10.595-9.384 16.196-21.19 16.196-8.854 0-17.936-3.33-24.218-8.476l5.221-10.368c5.449 4.768 13.623 7.947 19.148 7.947 4.238 0 6.886-1.589 6.886-4.617 0-9.384-28.001-3.783-28.001-22.552 0-9.763 8.4-15.969 21.114-15.969 7.645-.001 15.44 2.346 20.889 5.902zm50.634 0-5.071 10.519c-5.601-3.255-12.639-5.524-16.952-5.524-3.48 0-5.827 1.287-5.827 3.86 0 9.157 28.001 3.936 28.001 23.082 0 10.595-9.384 16.196-21.19 16.196-8.854 0-17.936-3.33-24.218-8.476l5.222-10.368c5.449 4.768 13.621 7.947 19.147 7.947 4.238 0 6.887-1.589 6.887-4.617 0-9.384-28.002-3.783-28.002-22.552 0-9.763 8.4-15.969 21.114-15.969 7.646-.001 15.44 2.346 20.889 5.902z"/></svg>',
        python: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#3776ab" d="M32 4c-14 0-13 6-13 6v7h14v2H13S4 18 4 32s8 13 8 13h5v-8s0-8 8-8h14s8 0 8-8v-9s1-8-15-8Zm-8 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/><path fill="#ffd43b" d="M32 60c14 0 13-6 13-6v-7H31v-2h20s9 1 9-13-8-13-8-13h-5v8s0 8-8 8H25s-8 0-8 8v9s-1 8 15 8Zm8-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>',
        go: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#00add8"/><path fill="#fff" d="M16 24h17c2 0 3 1 3 3s-1 3-3 3H20v4h11c2 0 3 1 3 3s-1 3-3 3H16v-4h6v-2h-9v-4h12v-2h-9v-4Zm32-1c8 0 13 5 13 12s-5 12-13 12-13-5-13-12 5-12 13-12Zm0 6c-4 0-7 2-7 6s3 6 7 6 7-2 7-6-3-6-7-6Z"/></svg>',
        rust: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="25" fill="#000"/><circle cx="32" cy="32" r="18" fill="#f74c00"/><path fill="#fff" d="M21 21h14c6 0 9 3 9 8 0 4-2 6-5 7l7 10h-8l-6-9h-4v9h-7V21Zm7 6v5h6c2 0 3-1 3-3s-1-2-3-2h-6Z"/></svg>',
        java: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#fff"/><path fill="#f89820" d="M35 5c6 6-14 10-4 19 3 3-2 6-2 6s2-3 0-5C19 16 40 13 35 5Z"/><path fill="#5382a1" d="M19 36c-7 2 4 5 18 3 3 0 6-1 6-1l-2 4c-11 3-31 2-22-6Zm-2 8c-7 2 5 7 24 4l-2 4c-15 2-29-1-22-8Zm30-13s4 3-4 5c-9 3-29 2-24-1 2-1 5-2 5-2s-8 0-9 4c-2 6 25 6 35 1 10-5-3-7-3-7Z"/></svg>',
        kotlin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="k" x1="0" y1="64" x2="64" y2="0"><stop stop-color="#0095d5"/><stop offset=".45" stop-color="#7f52ff"/><stop offset="1" stop-color="#ff6b00"/></linearGradient></defs><rect width="64" height="64" rx="12" fill="url(#k)"/><path fill="#fff" d="M14 14h13L14 30V14Zm0 36V31l18 19H14Zm15-18 20-18h1L31 33l20 17H37L23 36l6-4Z"/></svg>',
        swift: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="s" x1="8" y1="4" x2="56" y2="60"><stop stop-color="#fa7343"/><stop offset="1" stop-color="#f05138"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#s)"/><path fill="#fff" d="M49 42c3-8-3-18-10-24 3 6 3 11 1 15-5-4-11-9-16-15 3 7 8 14 13 19-6-4-14-10-22-19 5 10 12 20 22 27-7 4-17 3-25-1 8 9 20 12 30 7 4 2 6 5 7 8 3-6 2-12 0-17Z"/></svg>',
        ruby: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#111"/><path fill="#cc342d" d="m32 6 22 16-9 32-37-5 8-34L32 6Z"/><path fill="#ef5b4c" d="m32 6-8 20 21 28 9-32L32 6Z"/><path fill="#fff" opacity=".45" d="M16 15 8 49l16-23 8-20-16 9Z"/></svg>',
      };
      const getLanguageIcon = (id) => {
        const normalized = languageLogoAliases[id] ?? id;
        const svg = languageLogoSvgs[normalized] ?? codeLogoSvg;
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      };
      const languages = [
        ["typescript", "TypeScript"], ["javascript", "JavaScript"], ["tsx", "TSX"],
        ["jsx", "JSX"], ["python", "Python"], ["go", "Go"], ["rust", "Rust"],
        ["java", "Java"], ["kotlin", "Kotlin"], ["swift", "Swift"], ["php", "PHP"],
        ["ruby", "Ruby"], ["c", "C"], ["cpp", "C++"], ["csharp", "C#"],
        ["html", "HTML"], ["css", "CSS"], ["json", "JSON"], ["yaml", "YAML"],
        ["markdown", "Markdown"], ["bash", "Bash"], ["sql", "SQL"], ["text", "Plain Text"],
      ].map(([id, label]) => ({ id, label, icon: getLanguageIcon(id) }));
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
        '<textarea class="code-input" id="code" name="code" spellcheck="false" placeholder="${text.codePlaceholder}"></textarea>',
        '<textarea class="code-input" id="code" name="code" spellcheck="false" placeholder="${text.codePlaceholder}">' + escapeTemplateText(defaultCode) + '</textarea>',
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
      const languagePreviewIcon = $("#languagePreviewIcon");
      const languageFilter = $("#languageFilter");
      const languageOptions = $("#languageOptions");
      const codeTheme = $("#codeTheme");
      const themeFilter = $("#themeFilter");
      const themeOptions = $("#themeOptions");
      const themePrev = $("#themePrev");
      const themeNext = $("#themeNext");
      const imageFormat = $("#imageFormat");
      const imageFormatGroup = $("#imageFormatGroup");
      const imageFormatOptions = Array.from(document.querySelectorAll("[data-image-format]"));
      const bgColor = $("#bgColor");
      const backgroundPreview = $("#backgroundPreview");
      const backgroundThumbs = $("#backgroundThumbs");
      const backgroundThumbPrev = $("#backgroundThumbPrev");
      const backgroundThumbNext = $("#backgroundThumbNext");
      const borderSize = $("#borderSize");
      const borderRadius = $("#borderRadius");
      const containerWidth = $("#containerWidth");
      const showLineNumbers = $("#showLineNumbers");
      const imageQuality = $("#imageQuality");
      const imageQualityTrigger = $("#imageQualityTrigger");
      const imageQualityLabel = $("#imageQualityLabel");
      const imageQualityBars = $("#imageQualityBars");
      const imageQualityMenu = $("#imageQualityOptions");
      const imageQualityOptions = Array.from(document.querySelectorAll("[data-image-quality]"));
      const form = $("#form");
      const copy = $("#copy");
      const download = $("#download");
      const generateImage = $("#generateImage");
      const clearCode = $("#clearCode");
      const code = $("#code");
      code.defaultValue = defaultCode;
      code.value = defaultCode;
      const editorCanvas = $("#editorCanvas");
      const editorView = $("#editorView");
      const imageView = $("#imageView");
      const editorTab = $("#editorTab");
      const imageTab = $("#imageTab");
      const finalImageFrame = $("#finalImageFrame");
      const finalImage = $("#finalImage");
      const editImage = $("#editImage");
      const imageSize = $("#imageSize");
      const imageEmpty = $("#imageEmpty");
      const editorWindow = $("#editorWindow");
      const editorBody = $("#editorBody");
      const localeTrigger = $(".site-locale-trigger");
      const localeMenu = $("#site-locale-menu");
      const siteHeader = $(".site-header");
      const menuTrigger = $(".site-menu-trigger");
      const settingsToggle = $("#settingsToggle");
      const maxLineLength = 84;
      const headerHeight = 48;
      const codeVerticalPadding = 22;
      const codeFontSize = 18;
      const firaCodeCharWidthRatio = 0.68;
      const lineNumberColumnWidth = 72;
      const codeLeftPadding = 18;
      const codeRightPadding = 30;
      const languageLogoSize = 26;
      const lineHeight = 24;
      const maxContainerWidth = 1920;
      const firaCodeFontFiles = [
        { weight: 400, url: "https://cdn.jsdelivr.net/npm/@fontsource/fira-code@5.2.7/files/fira-code-latin-400-normal.woff2" },
        { weight: 600, url: "https://cdn.jsdelivr.net/npm/@fontsource/fira-code@5.2.7/files/fira-code-latin-600-normal.woff2" },
        { weight: 700, url: "https://cdn.jsdelivr.net/npm/@fontsource/fira-code@5.2.7/files/fira-code-latin-700-normal.woff2" },
      ];
      let latestDataUrl = "";
      let latestBlobUrl = "";
      let latestBlob = null;
      let latestImageData = null;
      let latestImageRadiusData = null;
      let currentImageInfo = { width: 0, height: 0, fileSize: null };
      let firaCodeFontsPromise;
      let takumiRendererPromise;
      let renderTimer;
      let renderInFlight = false;
      let renderQueued = false;
      let renderStateVersion = 0;
      let lastRenderStartedAt = 0;
      let imageRefreshStartedAt = 0;
      let imageRefreshToken = 0;
      const settingInvalidateTimers = new Map();
      const settingInvalidateLastRun = new Map();
      let activeView = "image";
      let imageDirty = true;
      const imageRenderDebounceMs = 360;
      const imageRenderThrottleMs = 640;
      const imageRefreshMinMs = 1000;
      const settingInvalidateThrottleMs = 180;
      let activeLanguageIndex = 0;
      let activeThemeIndex = 0;
      let selectedLanguage = languages[0];
      let selectedCodeTheme = codeThemes.find((item) => item.id === "dracula") ?? codeThemes[0];
      let selectedBackground = backgroundPresets[0];
      let currentMinContainerWidth = 400;
      let lastValidContainerWidth = "600";
      let currentLocale = initialState.locale;
      let playClickSound = () => {};
      let activeRenderRequests = 0;
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

      const storageKeys = {
        backgroundPreset: "codia_try_it_background_preset",
      };

      const readLocalStorage = (key) => {
        try {
          return window.localStorage.getItem(key);
        } catch (error) {
          return null;
        }
      };

      const writeLocalStorage = (key, value) => {
        try {
          window.localStorage.setItem(key, value);
        } catch (error) {
        }
      };

      const getStoredBackground = () => {
        const storedId = readLocalStorage(storageKeys.backgroundPreset);
        return backgroundPresets.find((item) => item.id === storedId) ??
          backgroundPresets.find((item) => item.id === ${JSON.stringify(defaultExampleBackgroundId)}) ??
          backgroundPresets[0];
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

      const startRenderProgress = () => {
        activeRenderRequests += 1;
        document.body.classList.add("is-rendering");
      };

      const finishRenderProgress = () => {
        activeRenderRequests = Math.max(activeRenderRequests - 1, 0);
        if (activeRenderRequests === 0) {
          document.body.classList.remove("is-rendering");
        }
      };

      const finishInitialLoad = () => {
        document.body.classList.add("is-ready");
      };

      const selectBackground = (item, options = {}) => {
        if (!item) return;
        const didChange = selectedBackground.id !== item.id || bgColor.value !== item.bgColor;
        selectedBackground = item;
        bgColor.value = item.bgColor;
        if (options.persist !== false) {
          writeLocalStorage(storageKeys.backgroundPreset, item.id);
        }
        backgroundPreview.classList.add("is-selected");
        backgroundPreview.dataset.id = item.id;
        backgroundPreview.style.setProperty("--preset-bg", item.bgColor);
        backgroundThumbs.querySelectorAll(".background-thumb").forEach((thumb) => {
          thumb.classList.toggle("is-selected", thumb.dataset.id === item.id);
          thumb.setAttribute("aria-pressed", String(thumb.dataset.id === item.id));
        });
        updateEditorFrame();
        if (didChange) {
          invalidateSettingImage("background");
        }
      };

      const renderBackgroundPresets = () => {
        backgroundPreview.className = "background-card is-selected";
        backgroundPreview.dataset.id = selectedBackground.id;
        backgroundPreview.style.setProperty("--preset-bg", selectedBackground.bgColor);
        const thumbnailSlides = backgroundPresets.map((item) => {
          const slide = document.createElement("swiper-slide");
          const button = document.createElement("button");
          button.className = "background-thumb" + (item.id === selectedBackground.id ? " is-selected" : "");
          button.type = "button";
          button.dataset.id = item.id;
          button.style.setProperty("--preset-bg", item.bgColor);
          button.setAttribute("aria-label", item.label);
          button.setAttribute("aria-pressed", String(item.id === selectedBackground.id));
          button.addEventListener("click", () => {
            selectBackground(item);
          });
          slide.append(button);
          return slide;
        });
        backgroundThumbs.replaceChildren(...thumbnailSlides);
      };

      const initializeBackgroundSwiper = () => {
        Object.assign(backgroundThumbs, {
          slidesPerView: "auto",
          spaceBetween: 8,
          speed: 220,
          observer: true,
          observeParents: true,
          allowTouchMove: false,
          freeMode: false,
        });
        if (!backgroundThumbs.swiper) {
          backgroundThumbs.initialize();
        } else {
          backgroundThumbs.swiper.update();
        }
        updateBackgroundThumbNav();
      };

      const updateBackgroundThumbNav = () => {
        const swiper = backgroundThumbs.swiper;
        if (!swiper) return;
        backgroundThumbPrev.disabled = swiper.isBeginning;
        backgroundThumbNext.disabled = swiper.isEnd;
      };

      const slideBackgroundThumbs = (direction) => {
        const swiper = backgroundThumbs.swiper;
        if (!swiper) return;
        if (direction === "prev") {
          swiper.slidePrev();
        } else {
          swiper.slideNext();
        }
        window.setTimeout(updateBackgroundThumbNav, 260);
      };

      const setSettingsOpen = (isOpen) => {
        document.body.classList.toggle("settings-open", isOpen);
        settingsToggle.setAttribute("aria-expanded", String(isOpen));
      };

      const initializeSettingsPanel = () => {
        setSettingsOpen(window.matchMedia("(min-width: 1080px)").matches);
      };

      const invalidateImage = () => {
        renderStateVersion += 1;
        imageDirty = true;
        if (activeView === "image") {
          scheduleImageRender();
        }
      };

      const invalidateSettingImage = (key, options = {}) => {
        if (typeof key !== "string") {
          options = key ?? {};
          key = "settings";
        }
        window.clearTimeout(settingInvalidateTimers.get(key));
        const now = Date.now();
        const elapsed = now - (settingInvalidateLastRun.get(key) ?? 0);
        const run = () => {
          settingInvalidateTimers.delete(key);
          settingInvalidateLastRun.set(key, Date.now());
          invalidateImage(options);
        };
        if (elapsed >= settingInvalidateThrottleMs) {
          run();
          return;
        }
        settingInvalidateTimers.set(key, window.setTimeout(run, settingInvalidateThrottleMs - elapsed));
      };

      const startImageRefresh = () => {
        if (activeView === "image" && !finalImage.hidden) {
          setImageFrameRadius();
          imageRefreshStartedAt = Date.now();
          imageRefreshToken += 1;
          finalImageFrame.classList.add("is-image-refreshing");
          return imageRefreshToken;
        }
        return imageRefreshToken;
      };

      const wait = (delay) => new Promise((resolve) => window.setTimeout(resolve, delay));

      const finishImageRefresh = async (token = imageRefreshToken) => {
        if (!finalImageFrame.classList.contains("is-image-refreshing")) return;
        const elapsed = Date.now() - imageRefreshStartedAt;
        const remaining = Math.max(imageRefreshMinMs - elapsed, 0);
        if (remaining > 0) await wait(remaining);
        if (token === imageRefreshToken) {
          imageRefreshStartedAt = 0;
          finalImageFrame.classList.remove("is-image-refreshing");
        }
      };

      const setImageFrameRadius = (radiusData = latestImageRadiusData) => {
        latestImageRadiusData = radiusData;
        if (!radiusData?.logicalWidth || radiusData.outerRadius === undefined || radiusData.outerRadius === null) {
          finalImageFrame.style.removeProperty("--image-frame-radius");
          return;
        }
        const frameWidth = finalImageFrame.getBoundingClientRect().width || Number(radiusData.logicalWidth);
        const scale = frameWidth / Number(radiusData.logicalWidth);
        const radius = Math.max(Number(radiusData.outerRadius) * scale, 0);
        finalImageFrame.style.setProperty("--image-frame-radius", radius.toFixed(2) + "px");
      };

      const formatFileSize = (bytes) => {
        const size = Number(bytes);
        if (!Number.isFinite(size) || size <= 0) return "";
        const units = ["B", "KB", "MB", "GB"];
        let value = size;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
          value /= 1024;
          unitIndex += 1;
        }
        const precision = unitIndex === 0 || value >= 100 ? 0 : 1;
        return value.toFixed(precision) + " " + units[unitIndex];
      };

      const setImageSize = (width, height, fileSize = null) => {
        const normalizedWidth = Math.round(Number(width) || 0);
        const normalizedHeight = Math.round(Number(height) || 0);
        if (normalizedWidth <= 0 || normalizedHeight <= 0) {
          currentImageInfo = { width: 0, height: 0, fileSize: null };
          imageSize.hidden = true;
          imageSize.textContent = "";
          return;
        }
        const normalizedFileSize = Number(fileSize);
        const hasFileSize = Number.isFinite(normalizedFileSize) && normalizedFileSize > 0;
        currentImageInfo = {
          width: normalizedWidth,
          height: normalizedHeight,
          fileSize: hasFileSize ? normalizedFileSize : null,
        };
        const fileSizeText = hasFileSize ? " · " + formatFileSize(normalizedFileSize) : "";
        imageSize.textContent = t("imageSize") + ": " + normalizedWidth + " x " + normalizedHeight + " px" + fileSizeText;
        imageSize.hidden = false;
      };

      const updateImageSizeFromElement = (fileSize = null) => {
        setImageSize(finalImage.naturalWidth, finalImage.naturalHeight, fileSize);
      };

      const setActiveView = (view) => {
        if (activeView === view) return;
        activeView = view;
        const isImage = view === "image";
        editorTab.setAttribute("aria-selected", String(!isImage));
        imageTab.setAttribute("aria-selected", String(isImage));
        editorView.hidden = isImage;
        imageView.hidden = !isImage;
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
        imageFormat.setAttribute("aria-label", t("imageFormat"));
        imageFormatGroup.setAttribute("aria-label", t("imageFormat"));
        imageQualityTrigger.setAttribute("aria-label", t("imageQuality"));
        settingsToggle.setAttribute("aria-label", t("parameterSettings"));
        code.placeholder = t("codePlaceholder");
        clearCode.setAttribute("aria-label", t("clear"));
        generateImage.setAttribute("aria-label", t("generateImage"));
        editImage.setAttribute("aria-label", t("editImage"));
        syncImageQualityOptions();
        if (!imageSize.hidden) {
          setImageSize(currentImageInfo.width, currentImageInfo.height, currentImageInfo.fileSize);
        }
      };

      const syncImageFormatOptions = () => {
        imageFormatOptions.forEach((option) => {
          option.checked = option.value === imageFormat.value;
        });
      };

      const selectImageFormat = (format) => {
        const nextFormat = format === "webp" ? "webp" : "png";
        const didChange = imageFormat.value !== nextFormat;
        imageFormat.value = nextFormat;
        syncImageFormatOptions();
        if (didChange) {
          invalidateSettingImage("imageFormat");
        }
      };

      const getInteractionKind = (target) => {
        if (target.closest(".tab-button")) return "tab";
        if (target.closest("#copy, #download, #clearCode, #generateImage")) return "action";
        if (target.closest("#settingsToggle, .theme-stepper button")) return "toggle";
        if (target.closest(".site-locale-trigger, [data-site-locale], .option")) return "menu";
        if (target.closest("input, textarea, .combobox, .format-option, .quality-trigger, .quality-option")) return "input";
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
        if (event.target.closest("button, input, textarea, select, .combobox")) {
          playInteractionSound(getInteractionKind(event.target));
        }
      }, true);

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
                option.innerHTML =
                  '<span class="option-main">' +
                    '<span class="option-selection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span>' +
                    (item.icon ? '<span class="option-language-icon" aria-hidden="true"><img src="' + item.icon + '" alt="" /></span>' : "") +
                    '<span class="option-label">' + item.label + "</span>" +
                  "</span>";
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

      const selectLanguage = (item, options = {}) => {
        if (!item) return;
        const didChange = selectedLanguage.id !== item.id || language.value !== item.id;
        selectedLanguage = item;
        activeLanguageIndex = Math.max(languages.findIndex((language) => language.id === item.id), 0);
        language.value = item.id;
        languageFilter.value = item.label;
        languagePreviewIcon.innerHTML = '<img src="' + item.icon + '" alt="" />';
        closeOptions(languageOptions, languageFilter);
        if (didChange) {
          invalidateSettingImage("language");
        }
      };

      const selectCodeTheme = (item, options = {}) => {
        if (!item) return;
        const didChange = selectedCodeTheme.id !== item.id || codeTheme.value !== item.id;
        selectedCodeTheme = item;
        activeThemeIndex = Math.max(codeThemes.findIndex((theme) => theme.id === item.id), 0);
        codeTheme.value = item.id;
        themeFilter.value = item.id;
        closeOptions(themeOptions, themeFilter);
        if (didChange) {
          invalidateSettingImage("theme");
        }
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
        const headerWidth = 36 + 49 + Math.ceil(selectedLanguage.id.length * 11) + 18;
        const codeWidth = (showLineNumbers.checked ? 72 : 18) + Math.ceil(maxLineColumns * 18 * 0.68) + 30;
        return Math.min(Math.max(Math.max(headerWidth, codeWidth), 400), 1920);
      };

      const normalizeBorderSize = (value) => {
        const parsed = Number(value || 0);
        return String(Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 0), 120) : 0);
      };

      const normalizeBorderRadius = (value, currentBorderSize = Number(borderSize.value || 0)) => {
        const parsed = Number(value || 0);
        const maxBorderRadius = Math.max(Math.trunc(currentBorderSize) - 1, 0);
        return String(Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 0), maxBorderRadius) : 0);
      };

      const applyBorderRadius = (shouldNotify = false) => {
        const normalizedBorderSize = Number(normalizeBorderSize(borderSize.value));
        borderSize.value = String(normalizedBorderSize);
        const maxBorderRadius = Math.max(normalizedBorderSize - 1, 0);
        borderRadius.max = String(maxBorderRadius);
        const nextBorderRadius = normalizeBorderRadius(borderRadius.value, normalizedBorderSize);
        if (shouldNotify && borderRadius.value !== nextBorderRadius) {
          setStatus(t("borderRadiusRange"), true);
        }
        borderRadius.value = nextBorderRadius;
        return true;
      };

      const normalizeContainerWidth = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < currentMinContainerWidth || parsed > 1920) return null;
        return String(Math.trunc(parsed));
      };

      const normalizeImageQuality = (value) => {
        const parsed = Number(value || 2);
        return String(Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 1), 4) : 2);
      };

      const getPreviewQuality = () => Number(normalizeImageQuality(imageQuality.value));

      const getImageQualityOption = (quality) =>
        imageQualityOptions.find((option) => option.dataset.imageQuality === quality) ?? imageQualityOptions[0];

      const closeImageQualityMenu = () => {
        imageQualityMenu.hidden = true;
        imageQualityTrigger.setAttribute("aria-expanded", "false");
      };

      const openImageQualityMenu = () => {
        imageQualityMenu.hidden = false;
        imageQualityTrigger.setAttribute("aria-expanded", "true");
        getImageQualityOption(imageQuality.value)?.focus();
      };

      const toggleImageQualityMenu = () => {
        if (imageQualityMenu.hidden) {
          openImageQualityMenu();
          return;
        }
        closeImageQualityMenu();
      };

      const renderQualityBars = (quality) =>
        Array.from({ length: 4 }, (_, index) => '<span' + (index < quality ? ' class="is-on"' : "") + "></span>").join("");

      const syncImageQualityOptions = () => {
        const normalizedQuality = normalizeImageQuality(imageQuality.value);
        imageQuality.value = normalizedQuality;
        const selectedOption = getImageQualityOption(normalizedQuality);
        const labelKey = selectedOption?.dataset.qualityLabelKey ?? "qualityStandard";
        const qualityColor = selectedOption?.style.getPropertyValue("--quality-color").trim() || "#22c55e";
        imageQualityTrigger.style.setProperty("--quality-color", qualityColor);
        imageQualityLabel.textContent = t(labelKey);
        imageQualityBars.innerHTML = renderQualityBars(Number(normalizedQuality));
        imageQualityOptions.forEach((option) => {
          const isSelected = option.dataset.imageQuality === normalizedQuality;
          option.classList.toggle("is-active", isSelected);
          option.setAttribute("aria-selected", String(isSelected));
          option.tabIndex = isSelected ? 0 : -1;
        });
      };

      const applyImageQuality = () => {
        imageQuality.value = normalizeImageQuality(imageQuality.value);
        syncImageQualityOptions();
        return true;
      };

      const selectImageQuality = (value, options = {}) => {
        const nextQuality = normalizeImageQuality(value);
        const didChange = imageQuality.value !== nextQuality;
        imageQuality.value = nextQuality;
        syncImageQualityOptions();
        if (options.closeMenu !== false) closeImageQualityMenu();
        if (didChange) {
          invalidateSettingImage("imageQuality");
        }
      };

      const stepImageQuality = (delta) => {
        const currentIndex = Math.max(
          imageQualityOptions.findIndex((option) => option.dataset.imageQuality === imageQuality.value),
          0,
        );
        const nextIndex = (currentIndex + delta + imageQualityOptions.length) % imageQualityOptions.length;
        selectImageQuality(imageQualityOptions[nextIndex].dataset.imageQuality, { closeMenu: false });
        imageQualityOptions[nextIndex].focus();
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

      const getEditorMinHeight = () => window.matchMedia("(max-width: 860px)").matches ? 420 : 520;

      const updateEditorFrame = () => {
        borderSize.value = normalizeBorderSize(borderSize.value);
        applyBorderRadius();
        currentMinContainerWidth = estimateMinContainerWidth();
        containerWidth.min = String(currentMinContainerWidth);
        if (Number(containerWidth.value || 600) < currentMinContainerWidth) {
          containerWidth.value = String(currentMinContainerWidth);
          lastValidContainerWidth = containerWidth.value;
        }
        const lineCount = Math.max(formatCode(code.value).split("\n").length, 1);
        const editorBodyHeight = Math.max(getEditorMinHeight(), lineCount * 24 + 72);
        editorCanvas.style.padding = "0";
        editorBody.style.height = editorBodyHeight + "px";
        code.style.height = editorBodyHeight + "px";
        editorWindow.style.width = "100%";
      };

      const loadFiraCodeFonts = () => {
        firaCodeFontsPromise ??= Promise.all(firaCodeFontFiles.map(async (font) => {
          const response = await fetch(font.url);
          if (!response.ok) throw new Error("Failed to load font");
          return {
            name: "Fira Code",
            data: new Uint8Array(await response.arrayBuffer()),
            weight: font.weight,
            style: "normal",
          };
        }));
        return firaCodeFontsPromise;
      };

      const loadTakumiRenderer = () => {
        takumiRendererPromise ??= initTakumiWasm({
          module_or_path: "/assets/vendor/takumi/takumi_wasm_bg.wasm",
        }).then(() => new TakumiRenderer());
        return takumiRendererPromise;
      };

      const normalizeRenderLanguage = (id) => {
        const normalized = id.trim().toLowerCase();
        return normalized in bundledLanguages ? normalized : "text";
      };

      const normalizeRenderFormat = (format) => {
        const normalized = (format || imageFormat.value || "png").trim().toLowerCase();
        if (normalized === "png" || normalized === "webp") return normalized;
        if (normalized === "jpg" || normalized === "jpeg") return "jpeg";
        return "png";
      };

      const mimeTypeFromFormat = (format) => {
        if (format === "png") return "image/png";
        if (format === "jpeg") return "image/jpeg";
        return "image/webp";
      };

      const calculateOuterBackgroundRadius = (innerRadius, padding, width, height) =>
        Math.min(innerRadius + padding, Math.floor(Math.min(width, height) / 2));

      const estimateRenderMinContainerWidth = (formattedCode, languageId, shouldShowLineNumbers) => {
        const maxLineColumns = Math.max(...formattedCode.split("\n").map(countColumns), 0);
        const codeWidth =
          (shouldShowLineNumbers ? lineNumberColumnWidth : 18) +
          Math.ceil(maxLineColumns * codeFontSize * firaCodeCharWidthRatio) +
          codeRightPadding;
        const headerWidth = 36 + 49 + languageLogoSize + codeLeftPadding;
        return Math.min(Math.max(Math.max(codeWidth, headerWidth), 400), maxContainerWidth);
      };

      const preserveCodeWhitespace = (content) =>
        content.replaceAll("\t", "    ").replaceAll(" ", "\u00a0");

      const renderToken = (token) =>
        takumiText(preserveCodeWhitespace(token.content), {
          color: token.color || "#f8f8f2",
          ...(token.fontStyle === 1 || token.fontStyle === 3 ? { fontStyle: "italic" } : {}),
          ...(token.fontStyle === 2 || token.fontStyle === 3 ? { fontWeight: 700 } : {}),
        });

      const buildCodeImageNode = ({ lines, tokens, languageId, imageWidth, imageHeight, codeWindowHeight, borderSize, borderRadius, bgColor }) => {
        const codeWindow = container({
          style: {
            width: "100%",
            height: codeWindowHeight + "px",
            background: tokens.bg,
            borderRadius: borderRadius + "px",
            overflow: "hidden",
            fontFamily: "Fira Code, Consolas, monospace",
          },
          children: [
            container({
              style: {
                height: headerHeight + "px",
                background: tokens.bg,
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
              children: [
                container({
                  style: {
                    display: "flex",
                    gap: "8px",
                  },
                  children: ["#ff5555", "#f1fa8c", "#50fa7b"].map((color) =>
                    container({
                      style: {
                        width: "11px",
                        height: "11px",
                        borderRadius: "999px",
                        background: color,
                      },
                    }),
                  ),
                }),
                takumiImage({
                  src: getLanguageIcon(languageId),
                  width: languageLogoSize,
                  height: languageLogoSize,
                  style: {
                    borderRadius: "6px",
                    objectFit: "contain",
                  },
                }),
              ],
            }),
            container({
              style: {
                padding: codeVerticalPadding + "px 0",
              },
              children: lines.map((line, index) =>
                container({
                  style: {
                    display: "flex",
                    minHeight: lineHeight + "px",
                    lineHeight: lineHeight + "px",
                    fontSize: codeFontSize + "px",
                  },
                  children: [
                    ...(showLineNumbers.checked
                      ? [
                          takumiText(String(index + 1), {
                            width: lineNumberColumnWidth + "px",
                            paddingRight: "22px",
                            textAlign: "right",
                            color: "#6272a4",
                          }),
                        ]
                      : []),
                    container({
                      style: {
                        flex: 1,
                        color: tokens.fg,
                        whiteSpace: "pre",
                        display: "flex",
                        paddingLeft: showLineNumbers.checked ? "0" : "18px",
                        paddingRight: codeRightPadding + "px",
                      },
                      children: line.map(renderToken),
                    }),
                  ],
                }),
              ),
            }),
          ],
        });

        return container({
          style: {
            width: "100%",
            height: "100%",
            background: "transparent",
          },
          children: [
            borderSize > 0
              ? container({
                  style: {
                    width: "100%",
                    height: "100%",
                    background: bgColor,
                    borderRadius: calculateOuterBackgroundRadius(borderRadius, borderSize, imageWidth, imageHeight) + "px",
                    overflow: "hidden",
                    padding: borderSize + "px",
                  },
                  children: [codeWindow],
                })
              : codeWindow,
          ],
        });
      };

      const renderClientImage = async ({ format } = {}) => {
        const normalizedFormat = normalizeRenderFormat(format);
        const renderLanguage = normalizeRenderLanguage(selectedLanguage.id);
        const formattedCode = formatCode(code.value);
        const minRequiredContainerWidth = estimateRenderMinContainerWidth(
          formattedCode,
          renderLanguage,
          showLineNumbers.checked,
        );
        const normalizedContainerWidth = Math.min(
          Math.max(Number(containerWidth.value || 600), minRequiredContainerWidth),
          maxContainerWidth,
        );
        const normalizedBorderSize = Number(normalizeBorderSize(borderSize.value));
        const normalizedBorderRadius = Number(normalizeBorderRadius(borderRadius.value, normalizedBorderSize));
        const previewQuality = getPreviewQuality();
        const tokens = await codeToTokens(formattedCode, {
          lang: renderLanguage,
          theme: selectedCodeTheme.id,
        });
        const lines = tokens.tokens.length > 0 ? tokens.tokens : [[]];
        const codeWindowHeight = headerHeight + codeVerticalPadding * 2 + lines.length * lineHeight;
        const imageWidth = normalizedContainerWidth + normalizedBorderSize * 2;
        const imageHeight = normalizedBorderSize * 2 + codeWindowHeight;
        const outerRadius = calculateOuterBackgroundRadius(
          normalizedBorderRadius,
          normalizedBorderSize,
          imageWidth,
          imageHeight,
        );
        const node = buildCodeImageNode({
          lines,
          tokens,
          languageId: renderLanguage,
          imageWidth,
          imageHeight,
          codeWindowHeight,
          borderSize: normalizedBorderSize,
          borderRadius: normalizedBorderRadius,
          bgColor: bgColor.value,
        });
        const [fonts, renderer] = await Promise.all([loadFiraCodeFonts(), loadTakumiRenderer()]);
        const bytes = await renderer.render(node, {
          width: imageWidth * previewQuality,
          height: imageHeight * previewQuality,
          devicePixelRatio: previewQuality,
          format: normalizedFormat,
          fonts,
        });
        const mimeType = mimeTypeFromFormat(normalizedFormat);
        const blob = new Blob([bytes], { type: mimeType });

        return {
          blob,
          dataUrl: URL.createObjectURL(blob),
          mimeType,
          format: normalizedFormat,
          language: renderLanguage,
          theme: selectedCodeTheme.id,
          lineCount: lines.length,
          minContainerWidth: minRequiredContainerWidth,
          containerWidth: normalizedContainerWidth,
          logicalWidth: imageWidth,
          logicalHeight: imageHeight,
          outerRadius,
          width: imageWidth * previewQuality,
          height: imageHeight * previewQuality,
          fileSize: blob.size,
          quality: previewQuality,
        };
      };

      const requestImage = async ({ silent = false, source = "try-it-preview", format, updatePreview = true, previewVersion } = {}) => {
        const shouldUpdatePreview = updatePreview !== false;
        const refreshToken = shouldUpdatePreview && !silent ? startImageRefresh() : imageRefreshToken;
        if (shouldUpdatePreview && !silent) startRenderProgress();
        try {
          const data = await renderClientImage({ format, source });
          if (!shouldUpdatePreview) return data;
          if (previewVersion !== undefined && previewVersion !== renderStateVersion) {
            URL.revokeObjectURL(data.dataUrl);
            imageDirty = true;
            return data;
          }
          if (latestBlobUrl && latestBlobUrl !== data.dataUrl) {
            URL.revokeObjectURL(latestBlobUrl);
          }
          latestDataUrl = data.dataUrl;
          latestBlobUrl = data.dataUrl;
          latestBlob = data.blob;
          latestImageData = data;
          latestImageRadiusData = { logicalWidth: data.logicalWidth, outerRadius: data.outerRadius };
          finalImage.src = data.dataUrl;
          finalImage.style.width = data.logicalWidth + "px";
          finalImage.hidden = false;
          imageEmpty.hidden = true;
          setImageFrameRadius();
          setImageSize(data.width, data.height, data.fileSize);
          imageDirty = previewVersion === undefined || previewVersion === renderStateVersion ? false : true;
          currentMinContainerWidth = data.minContainerWidth;
          containerWidth.min = String(data.minContainerWidth);
          containerWidth.value = String(data.containerWidth);
          lastValidContainerWidth = String(data.containerWidth);
          return data;
        } finally {
          if (shouldUpdatePreview) {
            if (!silent) await finishImageRefresh(refreshToken);
            if (!silent) finishRenderProgress();
          }
        }
      };

      const renderFinalImage = async () => {
        if (renderInFlight) {
          renderQueued = true;
          return;
        }
        if (!imageDirty && latestDataUrl) return;
        const previewVersion = renderStateVersion;
        renderInFlight = true;
        lastRenderStartedAt = Date.now();
        try {
          await requestImage({ previewVersion });
        } catch (error) {
          if (previewVersion === renderStateVersion) {
            finalImage.hidden = true;
            imageEmpty.hidden = false;
            setImageSize(0, 0);
            setStatus(t("failed"), true);
          } else {
            imageDirty = true;
          }
        } finally {
          renderInFlight = false;
          if (activeView === "image" && (renderQueued || imageDirty)) {
            renderQueued = false;
            scheduleImageRender();
          } else {
            renderQueued = false;
          }
        }
      };

      const scheduleImageRender = () => {
        window.clearTimeout(renderTimer);
        const elapsedSinceLastRender = Date.now() - lastRenderStartedAt;
        const throttleDelay = Math.max(imageRenderThrottleMs - elapsedSinceLastRender, 0);
        renderTimer = window.setTimeout(renderFinalImage, Math.max(imageRenderDebounceMs, throttleDelay));
      };

      const generateAndShowImage = () => {
        setActiveView("image");
        scheduleImageRender();
      };

      const submitSatisfaction = async (action) => {
        const response = await fetch("/v1/feedback/satisfaction", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ action }),
          keepalive: true,
        });
        if (!response.ok) {
          throw new Error("Failed to record satisfaction");
        }
      };

      const recordSatisfaction = (action) => {
        submitSatisfaction(action).catch((error) => {
          console.warn("Failed to record try-it satisfaction", error);
        });
      };

      const renderActionImage = async (source) => {
        const format = normalizeRenderFormat(imageFormat.value);
        const quality = getPreviewQuality();
        if (!imageDirty && latestImageData?.format === format && latestImageData?.quality === quality) {
          return { data: latestImageData, shouldRevoke: false };
        }
        const data = await requestImage({ source, format, silent: true, updatePreview: false });
        return { data, shouldRevoke: true };
      };

      const releaseActionImage = ({ data, shouldRevoke }) => {
        if (shouldRevoke) {
          window.setTimeout(() => URL.revokeObjectURL(data.dataUrl), 0);
        }
      };

      const copyImage = async () => {
        let rendered;
        try {
          rendered = await renderActionImage("try-it-copy");
          const { data } = rendered;
          await navigator.clipboard.write([new ClipboardItem({ [data.blob.type]: data.blob })]);
          recordSatisfaction("copy");
          setStatus(t("copied"));
        } catch (error) {
          setStatus(t("failed"), true);
        } finally {
          if (rendered) releaseActionImage(rendered);
        }
      };

      const downloadImage = async () => {
        let rendered;
        try {
          rendered = await renderActionImage("try-it-download");
          const { data } = rendered;
          const link = document.createElement("a");
          link.href = data.dataUrl;
          const extension = data.format === "jpeg" ? "jpg" : data.format || "webp";
          link.download = "code-snip." + extension;
          link.click();
          recordSatisfaction("download");
          setStatus(t("downloaded"));
        } catch (error) {
          setStatus(t("failed"), true);
        } finally {
          if (rendered) releaseActionImage(rendered);
        }
      };

      const clearCodeInput = () => {
        if (!code.value) {
          code.focus();
          return;
        }
        code.value = "";
        code.dispatchEvent(new Event("input", { bubbles: true }));
        code.focus();
      };

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

      localeTrigger?.addEventListener("click", (event) => {
        event.stopPropagation();
        closeHeaderMenu();
        toggleLocaleMenu();
      });
      menuTrigger?.addEventListener("click", (event) => {
        if (!siteHeader) return;
        event.stopPropagation();
        const isOpen = siteHeader.classList.toggle("is-menu-open");
        menuTrigger.setAttribute("aria-expanded", String(isOpen));
        if (!isOpen) closeLocaleMenu();
      });
      document.querySelectorAll("[data-site-locale]").forEach((button) => {
        button.addEventListener("click", () => {
          const locale = button.getAttribute("data-site-locale");
          if (!locale) return;
          setCookie("code_snip_locale", locale);
          window.location.reload();
        });
      });
      editorTab.addEventListener("click", () => setActiveView("editor"));
      imageTab.addEventListener("click", () => setActiveView("image"));
      editImage.addEventListener("click", () => setActiveView("editor"));
      backgroundThumbPrev.addEventListener("click", () => slideBackgroundThumbs("prev"));
      backgroundThumbNext.addEventListener("click", () => slideBackgroundThumbs("next"));
      backgroundThumbs.addEventListener("swiperslidechange", updateBackgroundThumbNav);
      settingsToggle.addEventListener("click", () => {
        setSettingsOpen(!document.body.classList.contains("settings-open"));
      });
      document.addEventListener("click", (event) => {
        if (localeTrigger && localeMenu && !localeMenu.contains(event.target) && !localeTrigger.contains(event.target)) {
          closeLocaleMenu();
        }
        if (!imageQualityMenu.contains(event.target) && !imageQualityTrigger.contains(event.target)) {
          closeImageQualityMenu();
        }
        if (siteHeader && !siteHeader.contains(event.target)) {
          closeHeaderMenu();
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeLocaleMenu();
          closeImageQualityMenu();
          closeHeaderMenu();
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
      imageFormatOptions.forEach((option) => {
        option.addEventListener("change", () => {
          if (!option.checked) {
            syncImageFormatOptions();
            return;
          }
          selectImageFormat(option.value);
        });
      });

      copy.addEventListener("click", copyImage);
      download.addEventListener("click", downloadImage);
      generateImage.addEventListener("click", generateAndShowImage);
      clearCode.addEventListener("click", clearCodeInput);
      code.addEventListener("input", () => {
        invalidateImage();
        updateEditorFrame();
      });
      borderSize.addEventListener("input", () => {
        applyBorderRadius();
        invalidateSettingImage("borderSize");
      });
      borderRadius.addEventListener("blur", () => {
        applyBorderRadius(true);
        invalidateSettingImage("borderRadius");
      });
      borderRadius.addEventListener("input", () => {
        applyBorderRadius();
        invalidateSettingImage("borderRadius");
      });
      borderRadius.addEventListener("change", () => {
        applyBorderRadius(true);
        invalidateSettingImage("borderRadius");
      });
      showLineNumbers.addEventListener("change", () => {
        invalidateSettingImage("showLineNumbers");
      });
      imageQualityTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleImageQualityMenu();
      });
      imageQualityTrigger.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openImageQualityMenu();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          openImageQualityMenu();
          stepImageQuality(-1);
        }
      });
      imageQualityOptions.forEach((option) => {
        option.addEventListener("mousedown", (event) => event.preventDefault());
        option.addEventListener("click", () => {
          selectImageQuality(option.dataset.imageQuality);
          imageQualityTrigger.focus();
        });
        option.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            stepImageQuality(1);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            stepImageQuality(-1);
          } else if (event.key === "Home") {
            event.preventDefault();
            selectImageQuality(imageQualityOptions[0].dataset.imageQuality, { closeMenu: false });
            imageQualityOptions[0].focus();
          } else if (event.key === "End") {
            event.preventDefault();
            const lastOption = imageQualityOptions[imageQualityOptions.length - 1];
            selectImageQuality(lastOption.dataset.imageQuality, { closeMenu: false });
            lastOption.focus();
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectImageQuality(option.dataset.imageQuality);
            imageQualityTrigger.focus();
          } else if (event.key === "Escape") {
            event.preventDefault();
            closeImageQualityMenu();
            imageQualityTrigger.focus();
          }
        });
      });
      containerWidth.addEventListener("blur", () => {
        if (applyContainerWidth()) invalidateSettingImage("containerWidth");
      });
      containerWidth.addEventListener("input", () => {
        updateEditorFrame();
        invalidateSettingImage("containerWidth");
      });
      containerWidth.addEventListener("change", () => {
        if (applyContainerWidth()) invalidateSettingImage("containerWidth");
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (applyContainerWidth(false)) {
          updateEditorFrame();
          invalidateSettingImage("containerWidth");
        }
      });
      window.addEventListener("resize", () => {
        updateTabIndicator();
        updateEditorFrame();
        setImageFrameRadius();
      });
      finalImage.addEventListener("load", () => {
        setImageFrameRadius();
        updateImageSizeFromElement(latestBlob?.size ?? currentImageInfo.fileSize);
      });

      initializeSettingsPanel();
      setupAudio();
      applyI18n();
      syncImageFormatOptions();
      selectedBackground = getStoredBackground();
      renderBackgroundPresets();
      initializeBackgroundSwiper();
      selectBackground(selectedBackground, { persist: false });
      selectLanguage(selectedLanguage);
      selectCodeTheme(selectedCodeTheme);
      applyImageQuality();
      updateEditorFrame();
      updateTabIndicator();
      renderFinalImage().finally(() => {
        finishInitialLoad();
        updateTabIndicator();
      });
    </script>
  </body>
</html>`;
};

export const route_GET_try_it = (app: AppInstance, options: CodeExampleRouteOptions = {}) => {
  app.get("/example", (c) => c.redirect("/try-it", 302));

  app.get("/try-it", (c) => {
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
