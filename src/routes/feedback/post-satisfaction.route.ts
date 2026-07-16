import { createRoute, z } from "@hono/zod-openapi";
import type { AppInstance } from "../../types.js";
import {
  createSatisfactionEvent,
  getSatisfactionCount,
} from "../../services/satisfaction-events.js";

const schemaSatisfactionRequest = z
  .object({
    action: z.enum(["copy", "download"]).openapi({
      example: "copy",
      description: "用户完成的满意操作。每次成功复制或下载都会记录一次。",
    }),
  })
  .openapi("SatisfactionRequest");

const schemaSatisfactionResponse = z
  .object({
    accepted: z.literal(true).openapi({
      example: true,
      description: "满意事件是否已记录。",
    }),
    totalSatisfactions: z.number().int().min(0).openapi({
      example: 128,
      description: "当前累计满意操作数量。",
    }),
  })
  .openapi("SatisfactionResponse");

const route = createRoute({
  method: "post",
  path: "/v1/feedback/satisfaction",
  tags: ["feedback"],
  summary: "Record a successful try-it satisfaction action",
  description:
    "记录 /try-it 用户成功复制或下载图片的满意操作。只保存操作类型和时间，不保存代码或图片内容。",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: schemaSatisfactionRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: "满意操作记录成功。",
      content: {
        "application/json": {
          schema: schemaSatisfactionResponse,
        },
      },
    },
  },
});

export const route_POST_satisfaction = (app: AppInstance) => {
  app.openapi(route, (c) => {
    const { action } = c.req.valid("json");
    createSatisfactionEvent(action);

    return c.json({
      accepted: true as const,
      totalSatisfactions: getSatisfactionCount(),
    });
  });
};
