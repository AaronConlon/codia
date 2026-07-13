import { createRoute, z } from "@hono/zod-openapi";
import type { AppInstance } from "../../types.js";
import { renderCodeImage } from "../../services/code-image-renderer.js";
import { createRenderRecord } from "../../services/render-records.js";

const schemaCodeRenderRequest = z
  .object({
    code: z
      .string()
      .min(1)
      .max(50_000)
      .openapi({
        example: "const message = 'Hello, Takumi';\nconsole.log(message);",
        description: "需要渲染为高亮图片的代码字符串，最大 50,000 字符。",
      }),
    language: z
      .string()
      .min(1)
      .max(80)
      .openapi({
        example: "typescript",
        description: "Shiki 支持的语言 id，例如 typescript、javascript、python、go。",
      }),
    theme: z
      .string()
      .min(1)
      .max(100)
      .default("dracula")
      .openapi({
        example: "dracula",
        description: "Shiki 内置主题名。未知主题会回退到 dracula。",
      }),
    bgColor: z
      .string()
      .min(1)
      .max(900)
      .optional()
      .openapi({
        example:
          "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
        description:
          "图片最外层背景。支持 #RRGGBB、linear-gradient(...) 和 radial-gradient(...)。默认使用天青色径向渐变。",
      }),
    backgroundColor: z
      .string()
      .min(1)
      .max(900)
      .optional()
      .openapi({
        example: "#81D8D0",
        description: "兼容旧版本的背景字段。推荐改用 bgColor。",
      }),
    borderSize: z
      .number()
      .int()
      .min(0)
      .max(120)
      .default(12)
      .openapi({
        example: 12,
        description:
          "图片最外层留白/边框大小，单位 px。默认 12；最大 120。传 0 时只输出代码窗口本身。",
      }),
    containerWidth: z
      .number()
      .int()
      .min(400)
      .max(1920)
      .default(600)
      .openapi({
        example: 600,
        description:
          "期望的代码容器本体宽度，单位 px。默认 600，最小 400，最大 1920。服务端会根据格式化后的最宽代码行计算动态 minContainerWidth，并将实际 containerWidth 抬高到不小于该值。最终图片宽度为 containerWidth + borderSize * 2。",
      }),
    showLineNumbers: z
      .boolean()
      .default(true)
      .openapi({
        example: true,
        description: "是否在代码图片中展示行号。默认 true。",
      }),
    source: z
      .enum(["api", "try-it-preview", "try-it-copy", "try-it-download"])
      .default("api")
      .openapi({
        example: "api",
        description:
          "生成来源。API 直接调用默认 api；/try-it 页面复制和下载会分别标记为 try-it-copy 与 try-it-download。",
      }),
  })
  .openapi("CodeRenderRequest");

const schemaCodeRenderResponse = z
  .object({
    imageBase64: z.string().openapi({
      example: "iVBORw0KGgoAAAANSUhEUgAA...",
      description: "PNG 图片的 base64 内容，不包含 data URL 前缀。",
    }),
    dataUrl: z.string().openapi({
      example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      description: "可直接用于 img src 的 PNG data URL。",
    }),
    mimeType: z.literal("image/png").openapi({
      example: "image/png",
      description: "返回图片格式。",
    }),
    language: z.string().openapi({
      example: "typescript",
      description: "实际用于 Shiki 渲染的语言；未知语言会回退为 text。",
    }),
    theme: z.string().openapi({
      example: "dracula",
      description: "实际用于 Shiki 渲染的主题。",
    }),
    bgColor: z.string().openapi({
      example:
        "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
      description: "实际用于图片最外层区域的背景。",
    }),
    backgroundColor: z.string().openapi({
      example:
        "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
      description: "兼容旧版本的响应字段，值与 bgColor 相同。",
    }),
    lineCount: z.number().int().positive().openapi({
      example: 2,
      description: "代码行数。开启 showLineNumbers 时，也对应图片中展示的行号数量。",
    }),
    showLineNumbers: z.boolean().openapi({
      example: true,
      description: "本次渲染是否展示了行号。",
    }),
    borderSize: z.number().int().min(0).openapi({
      example: 12,
      description: "本次渲染使用的图片最外层留白/边框大小，单位 px。",
    }),
    minContainerWidth: z.number().int().positive().openapi({
      example: 400,
      description: "根据格式化后的最宽代码行估算出的动态代码容器最小宽度，单位 px。",
    }),
    containerWidth: z.number().int().positive().openapi({
      example: 600,
      description: "本次渲染实际使用的代码容器本体宽度，单位 px。",
    }),
    width: z.number().int().positive().openapi({
      example: 600,
      description: "生成图片总宽度，单位 px。等于 containerWidth + borderSize * 2。",
    }),
    height: z.number().int().positive().openapi({
      example: 292,
      description: "生成图片高度，单位 px。",
    }),
    recordId: z.number().int().positive().openapi({
      example: 42,
      description: "本次图片生成记录在 SQLite 中的自增 id。",
    }),
  })
  .openapi("CodeRenderResponse");

const route = createRoute({
  method: "post",
  path: "/v1/code/render",
  tags: ["code"],
  summary: "Render highlighted code as a PNG base64 string",
  description:
    "接收代码字符串、language、theme、bgColor、borderSize、containerWidth 和 showLineNumbers，将代码按最长 84 字符自动换行，使用 Shiki 完成语法高亮，再通过 Takumi 和 Fira Code 渲染为 PNG 图片并返回 base64。borderSize 控制代码效果到图片边界的距离，bgColor 控制该区域背景。",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: schemaCodeRenderRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: "代码图片生成成功。",
      content: {
        "application/json": {
          schema: schemaCodeRenderResponse,
        },
      },
    },
  },
});

export const route_POST_code_render = (app: AppInstance) => {
  app.openapi(route, async (c) => {
    const body = c.req.valid("json");
    const result = await renderCodeImage(body);
    const record = createRenderRecord({
      source: body.source,
      request: body,
      result,
    });

    return c.json({
      ...result,
      recordId: record.id,
    });
  });
};
