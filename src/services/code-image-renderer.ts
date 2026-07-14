import { render } from "takumi-js";
import type { Font } from "takumi-js";
import { container, image, text } from "takumi-js/helpers";
import { codeToTokens, bundledLanguages, bundledThemes } from "shiki";
import type { BundledLanguage, BundledTheme, SpecialLanguage } from "shiki";
import { formatCodeForRendering } from "./code-formatter.js";

export type RenderCodeImageFormat = "png" | "webp" | "jpeg";
export type RenderCodeImageInputFormat = RenderCodeImageFormat | "jpg";
export type RenderCodeImageMimeType = "image/png" | "image/webp" | "image/jpeg";

export type RenderCodeImageInput = {
  code: string;
  language: string;
  format?: RenderCodeImageInputFormat;
  theme?: string;
  bgColor?: string;
  backgroundColor?: string;
  borderSize?: number;
  borderRadius?: number;
  containerWidth?: number;
  showLineNumbers?: boolean;
  quality?: number;
};

export type RenderCodeImageResult = {
  imageBase64: string;
  dataUrl: string;
  mimeType: RenderCodeImageMimeType;
  format: RenderCodeImageFormat;
  language: string;
  theme: string;
  bgColor: string;
  backgroundColor: string;
  lineCount: number;
  showLineNumbers: boolean;
  borderSize: number;
  borderRadius: number;
  minContainerWidth: number;
  containerWidth: number;
  logicalWidth: number;
  logicalHeight: number;
  width: number;
  height: number;
  quality: number;
};

const defaultContainerWidth = 600;
const minContainerWidth = 400;
const maxContainerWidth = 1920;
const headerHeight = 48;
const codeVerticalPadding = 22;
const codeFontSize = 18;
const firaCodeCharWidthRatio = 0.68;
const lineNumberColumnWidth = 72;
const codeLeftPadding = 18;
const codeRightPadding = 30;
const languageLogoSize = 26;
const lineHeight = 24;
const maxBorderSize = 120;
const defaultCodeTheme = "dracula";
const defaultBgColor =
  "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)";
const defaultBorderSize = 12;
const defaultBorderRadius = 4;
const defaultQuality = 1;
const maxQuality = 3;
let firaCodeFonts: Promise<Font[]> | null = null;

export const renderCodeImage = async (
  input: RenderCodeImageInput,
): Promise<RenderCodeImageResult> => {
  const language = normalizeLanguage(input.language);
  const format = normalizeImageFormat(input.format);
  const theme = normalizeTheme(input.theme);
  const bgColor = normalizeBgColor(input.bgColor ?? input.backgroundColor);
  const borderSize = normalizeBorderSize(input.borderSize);
  const borderRadius = normalizeBorderRadius(input.borderRadius, borderSize);
  const quality = normalizeQuality(input.quality);
  const showLineNumbers = input.showLineNumbers ?? true;
  const formattedCode = formatCodeForRendering(input.code);
  const minRequiredContainerWidth = estimateMinContainerWidth(
    formattedCode,
    language,
    showLineNumbers,
  );
  const containerWidth = normalizeContainerWidth(
    input.containerWidth,
    minRequiredContainerWidth,
  );
  const tokens = await codeToTokens(formattedCode, {
    lang: language,
    theme,
  });
  const fonts = await loadFiraCodeFonts();

  const lines = tokens.tokens.length > 0 ? tokens.tokens : [[]];
  const lineCount = lines.length;
  const codeWindowHeight = headerHeight + codeVerticalPadding * 2 + lineCount * lineHeight;
  const imageWidth = containerWidth + borderSize * 2;
  const imageHeight = borderSize * 2 + codeWindowHeight;
  const outerBackgroundRadius = calculateOuterBackgroundRadius(
    borderRadius,
    borderSize,
    imageWidth,
    imageHeight,
  );

  const codeWindow = container({
    style: {
      width: "100%",
      height: `${codeWindowHeight}px`,
      background: tokens.bg,
      borderRadius: `${borderRadius}px`,
      overflow: "hidden",
      fontFamily: "Fira Code, Consolas, monospace",
    },
    children: [
      container({
        style: {
          height: `${headerHeight}px`,
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
          renderLanguageLogo(language),
        ],
      }),
      container({
        style: {
          padding: `${codeVerticalPadding}px 0`,
        },
        children: lines.map((line, index) =>
          container({
            style: {
              display: "flex",
              minHeight: `${lineHeight}px`,
              lineHeight: `${lineHeight}px`,
              fontSize: "18px",
            },
            children: [
              ...(showLineNumbers
                ? [
                    text(String(index + 1), {
                      width: "72px",
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
                  paddingLeft: showLineNumbers ? "0" : "18px",
                  paddingRight: `${codeRightPadding}px`,
                },
                children: line.map(renderToken),
              }),
            ],
          }),
        ),
      }),
    ],
  });

  const node = container({
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
              borderRadius: `${outerBackgroundRadius}px`,
              overflow: "hidden",
              padding: `${borderSize}px`,
            },
            children: [codeWindow],
          })
        : codeWindow,
    ],
  });

  const image = await renderRasterImage(node, imageWidth, imageHeight, format, fonts, quality);
  const mimeType = mimeTypeFromFormat(format);
  const imageBase64 = Buffer.from(image).toString("base64");
  const outputWidth = imageWidth * quality;
  const outputHeight = imageHeight * quality;

  return {
    imageBase64,
    dataUrl: `data:${mimeType};base64,${imageBase64}`,
    mimeType,
    format,
    language,
    theme,
    bgColor,
    backgroundColor: bgColor,
    lineCount,
    showLineNumbers,
    borderSize,
    borderRadius,
    minContainerWidth: minRequiredContainerWidth,
    containerWidth,
    logicalWidth: imageWidth,
    logicalHeight: imageHeight,
    width: outputWidth,
    height: outputHeight,
    quality,
  };
};

const renderRasterImage = (
  node: Parameters<typeof render>[0],
  width: number,
  height: number,
  format: RenderCodeImageFormat,
  fonts: Font[],
  quality: number,
) => {
  const outputWidth = width * quality;
  const outputHeight = height * quality;

  if (format === "webp") {
    return render(node, {
      width: outputWidth,
      height: outputHeight,
      devicePixelRatio: quality,
      format: "webp",
      fonts,
    });
  }

  if (format === "jpeg") {
    return render(node, {
      width: outputWidth,
      height: outputHeight,
      devicePixelRatio: quality,
      format: "jpeg",
      fonts,
    });
  }

  return render(node, {
    width: outputWidth,
    height: outputHeight,
    devicePixelRatio: quality,
    format: "png",
    fonts,
  });
};

const normalizeImageFormat = (format: RenderCodeImageInputFormat | undefined): RenderCodeImageFormat => {
  const normalized = (format ?? "webp").trim().toLowerCase();
  if (normalized === "png" || normalized === "webp") return normalized;
  if (normalized === "jpg" || normalized === "jpeg") return "jpeg";
  return "webp";
};

const mimeTypeFromFormat = (format: RenderCodeImageFormat): RenderCodeImageMimeType => {
  if (format === "png") return "image/png";
  if (format === "jpeg") return "image/jpeg";
  return "image/webp";
};

const renderLanguageLogo = (language: BundledLanguage | SpecialLanguage) =>
  image({
    src: languageLogoDataUrl(String(language)),
    width: languageLogoSize,
    height: languageLogoSize,
    style: {
      borderRadius: "6px",
      objectFit: "contain",
    },
  });

const languageLogoDataUrl = (language: string) => {
  const logo = languageLogos[language] ?? languageLogos[languageLogoAliases[language] ?? ""] ?? codeLogo;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logo)}`;
};

const languageLogoAliases: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  golang: "go",
  rs: "rust",
  rb: "ruby",
};

const languageLogos: Record<string, string> = {
  typescript: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#3178c6"/><path fill="#fff" d="M15 31h25v6h-9v21h-7V37h-9v-6Zm28 25c2 1 4 2 8 2 6 0 10-3 10-8 0-4-2-6-7-8l-2-1c-3-1-4-2-4-4s2-3 4-3c3 0 5 1 7 2l2-5c-2-1-5-3-9-3-6 0-10 4-10 9 0 4 2 7 8 9l2 1c3 1 4 2 4 4s-2 3-5 3c-3 0-6-1-8-3l-2 5Z"/></svg>`,
  javascript: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#f7df1e"/><path fill="#111" d="M17 50c1 2 3 4 7 4 4 0 7-2 7-7V29h-6v18c0 2-1 3-3 3s-3-1-4-3l-1 3Zm18-1c2 3 5 5 10 5 5 0 9-3 9-8 0-4-2-7-8-9l-2-1c-3-1-4-2-4-4s1-3 4-3c2 0 4 1 5 3l4-3c-2-3-5-5-9-5-6 0-9 4-9 8 0 5 3 7 8 9l2 1c3 1 4 2 4 4s-2 3-4 3c-3 0-5-1-6-4l-4 4Z"/></svg>`,
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#e34f26"/><path fill="#fff" d="M18 10h28l-3 38-11 6-11-6-3-38Zm8 11 1 6h15l1-6H26Zm1 10 1 6h9l-.3 5-4.7 2.5-4.6-2.5-.3-3.4h-6l.7 7.4 10.2 5.6 10.2-5.6 1.3-16H27Z"/></svg>`,
  css: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#423299" d="M511.344 274.266c.426-6.035.656-12.123.656-18.266C512 114.615 397.385 0 256 0S0 114.615 0 256c0 117.769 79.53 216.949 187.809 246.801l323.535-228.535z"/><path fill="#1B0683" d="M511.344 274.266 314.991 77.913 119.096 434.087l68.714 68.714C209.522 508.787 232.385 512 256 512c135.243 0 245.976-104.875 255.344-237.734z"/><path fill="#FFFFFF" d="m278.328 333.913-22.617-256H119.096v233.739z"/><path fill="#E8E6E6" d="M392.904 311.652V155.826l-55.652-22.261-22.261-55.652h-59.28l.356 256z"/><path fill="#FFFFFF" d="M314.991 155.826V77.913l77.913 77.913z"/><path fill="#6A5CAF" d="M119.096 311.652h273.809v122.435H119.096z"/><path fill="#FFFFFF" d="m230.64 354.863-7.795 9.233c-3.48-4.238-8.627-6.887-13.32-6.887-8.4 0-14.757 6.659-14.757 15.363 0 8.854 6.357 15.589 14.757 15.589 4.466 0 9.611-2.422 13.32-6.206l7.87 8.324c-5.675 5.827-14.076 9.687-21.871 9.687-15.969 0-27.849-11.73-27.849-27.245 0-15.287 12.184-26.79 28.305-26.79 7.869.002 16.042 3.482 21.34 8.932zm49.348-3.179-5.071 10.519c-5.6-3.255-12.639-5.524-16.952-5.524-3.482 0-5.827 1.287-5.827 3.86 0 9.157 28.001 3.936 28.001 23.082 0 10.595-9.384 16.196-21.19 16.196-8.854 0-17.936-3.33-24.218-8.476l5.221-10.368c5.449 4.768 13.623 7.947 19.148 7.947 4.238 0 6.886-1.589 6.886-4.617 0-9.384-28.001-3.783-28.001-22.552 0-9.763 8.4-15.969 21.114-15.969 7.645-.001 15.44 2.346 20.889 5.902zm50.634 0-5.071 10.519c-5.601-3.255-12.639-5.524-16.952-5.524-3.48 0-5.827 1.287-5.827 3.86 0 9.157 28.001 3.936 28.001 23.082 0 10.595-9.384 16.196-21.19 16.196-8.854 0-17.936-3.33-24.218-8.476l5.222-10.368c5.449 4.768 13.621 7.947 19.147 7.947 4.238 0 6.887-1.589 6.887-4.617 0-9.384-28.002-3.783-28.002-22.552 0-9.763 8.4-15.969 21.114-15.969 7.646-.001 15.44 2.346 20.889 5.902z"/></svg>`,
  python: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#3776ab" d="M32 4c-14 0-13 6-13 6v7h14v2H13S4 18 4 32s8 13 8 13h5v-8s0-8 8-8h14s8 0 8-8v-9s1-8-15-8Zm-8 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/><path fill="#ffd43b" d="M32 60c14 0 13-6 13-6v-7H31v-2h20s9 1 9-13-8-13-8-13h-5v8s0 8-8 8H25s-8 0-8 8v9s-1 8 15 8Zm8-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>`,
  go: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#00add8"/><path fill="#fff" d="M16 24h17c2 0 3 1 3 3s-1 3-3 3H20v4h11c2 0 3 1 3 3s-1 3-3 3H16v-4h6v-2h-9v-4h12v-2h-9v-4Zm32-1c8 0 13 5 13 12s-5 12-13 12-13-5-13-12 5-12 13-12Zm0 6c-4 0-7 2-7 6s3 6 7 6 7-2 7-6-3-6-7-6Z"/></svg>`,
  rust: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="25" fill="#000"/><circle cx="32" cy="32" r="18" fill="#f74c00"/><path fill="#fff" d="M21 21h14c6 0 9 3 9 8 0 4-2 6-5 7l7 10h-8l-6-9h-4v9h-7V21Zm7 6v5h6c2 0 3-1 3-3s-1-2-3-2h-6Z"/></svg>`,
  java: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#fff"/><path fill="#f89820" d="M35 5c6 6-14 10-4 19 3 3-2 6-2 6s2-3 0-5C19 16 40 13 35 5Z"/><path fill="#5382a1" d="M19 36c-7 2 4 5 18 3 3 0 6-1 6-1l-2 4c-11 3-31 2-22-6Zm-2 8c-7 2 5 7 24 4l-2 4c-15 2-29-1-22-8Zm30-13s4 3-4 5c-9 3-29 2-24-1 2-1 5-2 5-2s-8 0-9 4c-2 6 25 6 35 1 10-5-3-7-3-7Z"/></svg>`,
  kotlin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="k" x1="0" y1="64" x2="64" y2="0"><stop stop-color="#0095d5"/><stop offset=".45" stop-color="#7f52ff"/><stop offset="1" stop-color="#ff6b00"/></linearGradient></defs><rect width="64" height="64" rx="12" fill="url(#k)"/><path fill="#fff" d="M14 14h13L14 30V14Zm0 36V31l18 19H14Zm15-18 20-18h1L31 33l20 17H37L23 36l6-4Z"/></svg>`,
  swift: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="s" x1="8" y1="4" x2="56" y2="60"><stop stop-color="#fa7343"/><stop offset="1" stop-color="#f05138"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#s)"/><path fill="#fff" d="M49 42c3-8-3-18-10-24 3 6 3 11 1 15-5-4-11-9-16-15 3 7 8 14 13 19-6-4-14-10-22-19 5 10 12 20 22 27-7 4-17 3-25-1 8 9 20 12 30 7 4 2 6 5 7 8 3-6 2-12 0-17Z"/></svg>`,
  ruby: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#111"/><path fill="#cc342d" d="m32 6 22 16-9 32-37-5 8-34L32 6Z"/><path fill="#ef5b4c" d="m32 6-8 20 21 28 9-32L32 6Z"/><path fill="#fff" opacity=".45" d="M16 15 8 49l16-23 8-20-16 9Z"/></svg>`,
};

const codeLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#111827"/><path fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" d="M24 22 12 32l12 10m16-20 12 10-12 10M36 16 28 48"/></svg>`;

const loadFiraCodeFonts = () => {
  firaCodeFonts ??= loadNodeFiraCodeFonts();
  return firaCodeFonts;
};

const loadNodeFiraCodeFonts = async (): Promise<Font[]> => {
  if (!isNodeRuntime()) return [];

  const [{ readFile }, { createRequire }] = await Promise.all([
    import("node:fs/promises"),
    import("node:module"),
  ]);
  const require = createRequire(import.meta.url);
  const fontFiles = [
    {
      weight: 400,
      path: require.resolve("@fontsource/fira-code/files/fira-code-latin-400-normal.woff2"),
    },
    {
      weight: 600,
      path: require.resolve("@fontsource/fira-code/files/fira-code-latin-600-normal.woff2"),
    },
    {
      weight: 700,
      path: require.resolve("@fontsource/fira-code/files/fira-code-latin-700-normal.woff2"),
    },
  ];

  return Promise.all(
    fontFiles.map(async (font): Promise<Font> => ({
      name: "Fira Code",
      data: await readFile(font.path),
      weight: font.weight,
      style: "normal",
    })),
  );
};

const isNodeRuntime = () =>
  typeof process !== "undefined" &&
  typeof process.versions === "object" &&
  typeof process.versions.node === "string";

const normalizeTheme = (theme: string | undefined): BundledTheme => {
  const normalized = (theme ?? defaultCodeTheme).trim().toLowerCase();

  if (isBundledTheme(normalized)) {
    return normalized;
  }

  return defaultCodeTheme;
};

const isBundledTheme = (theme: string): theme is BundledTheme => theme in bundledThemes;

const normalizeBgColor = (color: string | undefined) => {
  const normalized = (color ?? defaultBgColor).trim().replace(/\s+/g, " ");

  if (/^#[0-9a-fA-F]{6}$/.test(normalized) || isSafeCssGradient(normalized)) {
    return normalized;
  }

  return defaultBgColor;
};

const isSafeCssGradient = (value: string) => {
  if (value.length > 900) return false;
  if (/[;"{}]|url\s*\(/i.test(value)) return false;
  if (!/^(linear-gradient|radial-gradient)\(/i.test(value)) return false;
  return /^[#%(),.\-\s\w]+$/.test(value);
};

const normalizeBorderSize = (borderSize: number | undefined) => {
  if (borderSize === undefined || Number.isNaN(borderSize)) {
    return defaultBorderSize;
  }

  return Math.min(Math.max(Math.trunc(borderSize), 0), maxBorderSize);
};

const normalizeBorderRadius = (borderRadius: number | undefined, borderSize: number) => {
  const maxBorderRadius = Math.max(borderSize - 1, 0);
  if (borderRadius === undefined || Number.isNaN(borderRadius)) {
    return Math.min(defaultBorderRadius, maxBorderRadius);
  }

  return Math.min(Math.max(Math.trunc(borderRadius), 0), maxBorderRadius);
};

const normalizeQuality = (quality: number | undefined) => {
  if (quality === undefined || Number.isNaN(quality)) {
    return defaultQuality;
  }

  return Math.min(Math.max(Math.trunc(quality), 1), maxQuality);
};

const calculateOuterBackgroundRadius = (
  innerRadius: number,
  padding: number,
  width: number,
  height: number,
) => {
  // For concentric rounded rectangles with uniform padding:
  // innerRadius = outerRadius - padding, so outerRadius = innerRadius + padding.
  const idealRadius = innerRadius + padding;
  const maxRadius = Math.floor(Math.min(width, height) / 2);

  return Math.min(idealRadius, maxRadius);
};

const normalizeContainerWidth = (
  containerWidth: number | undefined,
  minRequiredContainerWidth: number,
) => {
  if (containerWidth === undefined || Number.isNaN(containerWidth)) {
    return Math.max(defaultContainerWidth, minRequiredContainerWidth);
  }

  return Math.min(
    Math.max(Math.trunc(containerWidth), minRequiredContainerWidth),
    maxContainerWidth,
  );
};

const estimateMinContainerWidth = (
  formattedCode: string,
  language: BundledLanguage | SpecialLanguage,
  showLineNumbers: boolean,
) => {
  const maxLineColumns = Math.max(
    ...formattedCode.split("\n").map((line) => countColumns(line)),
    0,
  );
  const codeWidth =
    (showLineNumbers ? lineNumberColumnWidth : 18) +
    Math.ceil(maxLineColumns * codeFontSize * firaCodeCharWidthRatio) +
    codeRightPadding;
  const headerWidth = 36 + 49 + languageLogoSize + codeLeftPadding;

  return Math.min(
    Math.max(Math.max(codeWidth, headerWidth), minContainerWidth),
    maxContainerWidth,
  );
};

const countColumns = (line: string) => {
  let columns = 0;

  for (const char of line) {
    columns += char === "\t" ? 4 : 1;
  }

  return columns;
};

const normalizeLanguage = (language: string): BundledLanguage | SpecialLanguage => {
  const normalized = language.trim().toLowerCase();

  if (isBundledLanguage(normalized)) {
    return normalized;
  }

  return "text";
};

const isBundledLanguage = (language: string): language is BundledLanguage =>
  language in bundledLanguages;

const renderToken = (token: { content: string; color?: string; fontStyle?: number }) => {
  const style = {
    color: token.color ?? "#f8f8f2",
  };

  return text(preserveCodeWhitespace(token.content), {
    ...style,
    ...(token.fontStyle === 1 || token.fontStyle === 3 ? { fontStyle: "italic" } : {}),
    ...(token.fontStyle === 2 || token.fontStyle === 3 ? { fontWeight: 700 } : {}),
  });
};

const preserveCodeWhitespace = (content: string) =>
  content.replaceAll("\t", "    ").replaceAll(" ", "\u00a0");
