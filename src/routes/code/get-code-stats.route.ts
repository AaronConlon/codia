import { createRoute, z } from "@hono/zod-openapi";
import type { AppInstance } from "../../types.js";
import { getRenderStats } from "../../services/render-records.js";

const schemaCodeStatsResponse = z
  .object({
    totalRenders: z.number().int().min(0).openapi({
      example: 128,
      description: "SQLite 中已记录的图片生成次数。",
    }),
    totalImagesStored: z.number().int().min(0).openapi({
      example: 128,
      description: "SQLite 中已记录的图片生成次数；不保存图片内容本身。",
    }),
    totalLinesRendered: z.number().int().min(0).openapi({
      example: 2048,
      description: "累计渲染的代码行数。",
    }),
    latestCreatedAt: z.string().nullable().openapi({
      example: "2026-07-14T02:12:00.000Z",
      description: "最近一次生成记录的 ISO 时间。没有记录时为 null。",
    }),
    topLanguages: z
      .array(
        z.object({
          language: z.string().openapi({
            example: "typescript",
            description: "Shiki 语言 id。",
          }),
          count: z.number().int().min(0).openapi({
            example: 42,
            description: "该语言累计生成次数。",
          }),
        }),
      )
      .openapi({
        description: "按生成次数排序的热门语言。",
      }),
    recent: z
      .array(
        z.object({
          id: z.number().int().min(0).openapi({
            example: 42,
            description: "生成记录 id。",
          }),
          source: z.string().openapi({
            example: "try-it-copy",
            description: "生成来源。",
          }),
          language: z.string().openapi({
            example: "typescript",
            description: "本次渲染使用的语言。",
          }),
          theme: z.string().openapi({
            example: "dracula",
            description: "本次渲染使用的代码主题。",
          }),
          width: z.number().int().positive().openapi({
            example: 624,
            description: "图片宽度。",
          }),
          height: z.number().int().positive().openapi({
            example: 360,
            description: "图片高度。",
          }),
          lineCount: z.number().int().positive().openapi({
            example: 18,
            description: "代码行数。",
          }),
          createdAt: z.string().openapi({
            example: "2026-07-14T02:12:00.000Z",
            description: "生成时间。",
          }),
        }),
      )
      .openapi({
        description: "最近生成记录。",
      }),
  })
  .openapi("CodeStatsResponse");

const route = createRoute({
  method: "get",
  path: "/v1/code/stats",
  tags: ["code"],
  summary: "Get Codia render statistics",
  description:
    "读取 SQLite 中的图片生成统计记录，返回总生成数、图片生成次数、累计渲染行数、热门语言和最近记录。服务端不保存图片 base64 内容。",
  responses: {
    200: {
      description: "统计读取成功。",
      content: {
        "application/json": {
          schema: schemaCodeStatsResponse,
        },
      },
    },
  },
});

export const route_GET_code_stats = (app: AppInstance) => {
  app.openapi(route, (c) => c.json(getRenderStats()));
};
