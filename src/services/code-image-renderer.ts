import { render } from "takumi-js";
import type { Font } from "takumi-js";
import { container, text } from "takumi-js/helpers";
import { codeToTokens, bundledLanguages, bundledThemes } from "shiki";
import type { BundledLanguage, BundledTheme, SpecialLanguage } from "shiki";
import { formatCodeForRendering } from "./code-formatter.js";

type RenderCodeImageInput = {
  code: string;
  language: string;
  theme?: string;
  bgColor?: string;
  backgroundColor?: string;
  borderSize?: number;
  containerWidth?: number;
  showLineNumbers?: boolean;
};

type RenderCodeImageOutput = {
  imageBase64: string;
  dataUrl: string;
  mimeType: "image/png";
  language: string;
  theme: string;
  bgColor: string;
  backgroundColor: string;
  lineCount: number;
  showLineNumbers: boolean;
  borderSize: number;
  minContainerWidth: number;
  containerWidth: number;
  width: number;
  height: number;
};

const defaultContainerWidth = 600;
const minContainerWidth = 400;
const maxContainerWidth = 1920;
const headerHeight = 48;
const codeVerticalPadding = 22;
const codeFontSize = 18;
const firaCodeCharWidthRatio = 0.6;
const lineNumberColumnWidth = 72;
const codeRightPadding = 18;
const lineHeight = 24;
const maxBorderSize = 120;
const defaultCodeTheme = "dracula";
const defaultBgColor =
  "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)";
const defaultBorderSize = 12;
let firaCodeFonts: Promise<Font[]> | null = null;

export const renderCodeImage = async (
  input: RenderCodeImageInput,
): Promise<RenderCodeImageOutput> => {
  const language = normalizeLanguage(input.language);
  const theme = normalizeTheme(input.theme);
  const bgColor = normalizeBgColor(input.bgColor ?? input.backgroundColor);
  const borderSize = normalizeBorderSize(input.borderSize);
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

  const codeWindow = container({
    style: {
      width: "100%",
      height: `${codeWindowHeight}px`,
      background: tokens.bg,
      borderRadius: "10px",
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
          text(language, {
            color: tokens.fg,
            fontSize: "17px",
            fontWeight: 600,
          }),
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
                  paddingRight: "18px",
                },
                children: line.map(renderToken),
              }),
            ],
          }),
        ),
      }),
    ],
  });

  const node =
    borderSize > 0
      ? container({
          style: {
            width: "100%",
            height: "100%",
            background: bgColor,
            padding: `${borderSize}px`,
          },
          children: [codeWindow],
        })
      : codeWindow;

  const png = await render(node, {
    width: imageWidth,
    height: imageHeight,
    format: "png",
    fonts,
  });
  const imageBase64 = Buffer.from(png).toString("base64");

  return {
    imageBase64,
    dataUrl: `data:image/png;base64,${imageBase64}`,
    mimeType: "image/png",
    language,
    theme,
    bgColor,
    backgroundColor: bgColor,
    lineCount,
    showLineNumbers,
    borderSize,
    minContainerWidth: minRequiredContainerWidth,
    containerWidth,
    width: imageWidth,
    height: imageHeight,
  };
};

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
  const headerWidth = 36 + 49 + Math.ceil(String(language).length * 10);

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
