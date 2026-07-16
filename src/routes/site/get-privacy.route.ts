import { setCookie } from "hono/cookie";
import type { AppInstance } from "../../types.js";
import {
  renderSiteFooter,
  renderSiteHeader,
  renderSiteMeta,
  siteSlogan,
  siteShellStyles,
  type SiteLocale,
} from "./site-layout.js";

type PrivacyInitialState = {
  locale: SiteLocale;
  htmlLang: "zh-Hans" | "en" | "ja";
};

const privacyCopy = {
  zh: {
    metaDescription: "Codia 隐私说明：我们不收集用户代码和生成图片，仅记录生成与满意操作统计。",
    navTryIt: "Playground",
    navDocs: "API 文档",
    languageLabel: "语言",
    footerSlogan: "为人和 API 打造的漂亮代码图片。",
    footerBlog: "博客",
    footerX: "关注 Aaron",
    footerPrivacy: "隐私",
    title: "隐私说明",
    subtitle: "Codia 不保存你的代码，也不保存生成后的图片内容。",
    sections: [
      {
        title: "我们不收集什么",
        body: "Codia 不会保存你输入的代码原文、代码哈希、代码长度，也不会保存生成图片的 base64、data URL 或图片文件内容。",
      },
      {
        title: "我们记录什么",
        body: "为了展示公开的产品统计，我们只记录图片生成事件、成功复制或下载的满意操作，以及非内容元数据，例如生成来源、语言、主题、图片尺寸、渲染行数、是否展示行号和生成时间。",
      },
      {
        title: "这些统计如何使用",
        body: "这些数据仅用于首页展示生成次数、用户满意数、累计渲染行数、热门语言和最近生成流。它们不能还原你的代码或图片。",
      },
      {
        title: "本地和 API 使用",
        body: "/try-it 页面和 API 调用都遵循同样规则：成功生成图片会增加生成统计，成功复制或下载图片会增加一次满意统计。",
      },
    ],
  },
  en: {
    metaDescription:
      "Codia privacy notice: we do not collect user code or generated images, only lightweight render and satisfaction counts.",
    navTryIt: "Playground",
    navDocs: "API Docs",
    languageLabel: "Language",
    footerSlogan: "Beautiful Code Images for Humans and APIs.",
    footerBlog: "Blog",
    footerX: "Aaron on X",
    footerPrivacy: "Privacy",
    title: "Privacy Notice",
    subtitle: "Codia does not store your code or the generated image content.",
    sections: [
      {
        title: "What We Do Not Collect",
        body: "Codia does not save the source code you enter, code hashes, code length, generated image base64, data URLs, or image files.",
      },
      {
        title: "What We Record",
        body: "To show public product statistics, we record render events, successful copy or download actions, and non-content metadata such as source, language, theme, image dimensions, rendered line count, line-number setting, and timestamp.",
      },
      {
        title: "How Stats Are Used",
        body: "These records only power homepage totals, user satisfaction counts, rendered line totals, popular languages, and recent generation flow. They cannot reconstruct your code or image.",
      },
      {
        title: "Try-It and API Usage",
        body: "The /try-it page and API follow the same rule: every successful image render increments render statistics, while each successful copy or download adds one satisfaction event.",
      },
    ],
  },
  ja: {
    metaDescription:
      "Codia のプライバシー説明：コードや生成画像は保存せず、軽量な生成と満足操作の統計のみを記録します。",
    navTryIt: "Playground",
    navDocs: "API ドキュメント",
    languageLabel: "言語",
    footerSlogan: "人と API のための美しいコード画像。",
    footerBlog: "ブログ",
    footerX: "Aaron をフォロー",
    footerPrivacy: "プライバシー",
    title: "プライバシーについて",
    subtitle: "Codia はコード本文や生成画像の内容を保存しません。",
    sections: [
      {
        title: "収集しないもの",
        body: "入力されたコード本文、コードハッシュ、コード長、生成画像の base64、data URL、画像ファイルそのものは保存しません。",
      },
      {
        title: "記録するもの",
        body: "公開統計を表示するため、生成イベント、コピーまたはダウンロードの成功操作、非コンテンツのメタデータのみを記録します。例として、生成元、言語、テーマ、画像サイズ、描画行数、行番号設定、生成時刻があります。",
      },
      {
        title: "統計の使い道",
        body: "これらの記録は、ホームの生成回数、ユーザー満足数、描画行数、人気言語、最近の生成履歴の表示にのみ使われます。コードや画像を復元することはできません。",
      },
      {
        title: "Try-It と API",
        body: "/try-it ページと API は同じルールに従います。画像生成が成功するたびに生成統計が増え、コピーまたはダウンロードが成功するたびに満足統計が 1 回増えます。",
      },
    ],
  },
} as const;

const privacyHtml = (initialState: PrivacyInitialState, origin: string) => {
  const text = privacyCopy[initialState.locale];

  return `<!doctype html>
<html lang="${initialState.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderSiteMeta({
      origin,
      path: "/privacy",
      title: `Codia Privacy · ${siteSlogan}`,
      description: text.metaDescription,
    })}
    <style>
      ${siteShellStyles}

      .privacy-main {
        width: min(920px, calc(100% - 32px));
        margin: 0 auto;
        padding: 72px 0 96px;
      }

      .privacy-hero {
        display: grid;
        gap: 18px;
        margin-bottom: 34px;
      }

      .privacy-kicker {
        width: fit-content;
        padding: 7px 11px;
        border-radius: 999px;
        background: rgb(15 23 42 / 6%);
        color: #475569;
        font-size: 13px;
        font-weight: 900;
      }

      h1 {
        margin: 0;
        color: #09090b;
        font-size: clamp(42px, 8vw, 86px);
        line-height: 0.95;
        letter-spacing: 0;
      }

      .privacy-subtitle {
        max-width: 760px;
        margin: 0;
        color: #475569;
        font-size: 19px;
        line-height: 1.7;
        font-weight: 700;
      }

      .privacy-sections {
        display: grid;
        gap: 12px;
      }

      .privacy-section {
        padding: 22px;
        border: 1px solid rgb(15 23 42 / 10%);
        border-radius: 18px;
        background: rgb(255 255 255 / 84%);
        box-shadow: 0 18px 48px rgb(15 23 42 / 8%);
      }

      .privacy-section h2 {
        margin: 0 0 9px;
        color: #111827;
        font-size: 18px;
        line-height: 1.25;
      }

      .privacy-section p {
        margin: 0;
        color: #64748b;
        font-size: 15px;
        line-height: 1.8;
        font-weight: 650;
      }
    </style>
  </head>
  <body>
    ${renderSiteHeader("home", initialState.locale, text)}
    <main class="privacy-main">
      <section class="privacy-hero">
        <span class="privacy-kicker">Codia Privacy</span>
        <h1>${text.title}</h1>
        <p class="privacy-subtitle">${text.subtitle}</p>
      </section>
      <section class="privacy-sections">
        ${text.sections
          .map(
            (section) => `<article class="privacy-section">
              <h2>${section.title}</h2>
              <p>${section.body}</p>
            </article>`,
          )
          .join("")}
      </section>
    </main>
    ${renderSiteFooter(text)}
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

      if (localeTrigger && localeMenu) {
        localeTrigger.addEventListener("click", (event) => {
          event.stopPropagation();
          const expanded = localeTrigger.getAttribute("aria-expanded") === "true";
          localeTrigger.setAttribute("aria-expanded", String(!expanded));
          localeMenu.hidden = expanded;
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

export const route_GET_privacy = (app: AppInstance) => {
  app.get("/privacy", (c) => {
    const initialState = resolveInitialState(
      c.req.header("cookie") ?? "",
      c.req.header("accept-language") ?? "",
    );

    setCookie(c, "code_snip_locale", initialState.locale, {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "Lax",
    });

    return c.html(privacyHtml(initialState, new URL(c.req.url).origin));
  });
};

const resolveInitialState = (cookieHeader: string, acceptLanguage: string): PrivacyInitialState => {
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
    .filter((item): item is { locale: SiteLocale; q: number } => item.locale !== null)
    .sort((left, right) => right.q - left.q)[0]?.locale;

  return locale ?? "en";
};
