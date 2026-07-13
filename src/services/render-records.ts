import { createHash } from "node:crypto";
import { desc, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { renderRecords, type NewRenderRecord } from "../db/schema.js";
import type { RenderCodeImageInput, RenderCodeImageResult } from "./code-image-renderer.js";

export type RenderRecordSource = "api" | "try-it-preview" | "try-it-copy" | "try-it-download";

export type CreateRenderRecordInput = {
  source?: RenderRecordSource;
  request: RenderCodeImageInput;
  result: RenderCodeImageResult;
};

export const createRenderRecord = ({ source = "api", request, result }: CreateRenderRecordInput) => {
  const record: NewRenderRecord = {
    source,
    imageBase64: result.imageBase64,
    mimeType: result.mimeType,
    language: result.language,
    theme: result.theme,
    bgColor: result.bgColor,
    borderSize: result.borderSize,
    containerWidth: result.containerWidth,
    minContainerWidth: result.minContainerWidth,
    width: result.width,
    height: result.height,
    lineCount: result.lineCount,
    showLineNumbers: result.showLineNumbers,
    codeHash: createHash("sha256").update(request.code).digest("hex"),
    codeLength: request.code.length,
    createdAt: new Date().toISOString(),
  };

  return db.insert(renderRecords).values(record).returning({ id: renderRecords.id }).get();
};

export const getRenderStats = () => {
  const totals = db
    .select({
      totalRenders: sql<number>`count(*)`,
      totalImagesStored: sql<number>`count(*)`,
      totalBytesStored: sql<number>`coalesce(sum(length(${renderRecords.imageBase64})), 0)`,
      totalLinesRendered: sql<number>`coalesce(sum(${renderRecords.lineCount}), 0)`,
      latestCreatedAt: sql<string | null>`max(${renderRecords.createdAt})`,
    })
    .from(renderRecords)
    .get();

  const topLanguages = db
    .select({
      language: renderRecords.language,
      count: sql<number>`count(*)`,
    })
    .from(renderRecords)
    .groupBy(renderRecords.language)
    .orderBy(sql`count(*) desc`, renderRecords.language)
    .limit(6)
    .all();

  const recent = db
    .select({
      id: renderRecords.id,
      source: renderRecords.source,
      language: renderRecords.language,
      theme: renderRecords.theme,
      width: renderRecords.width,
      height: renderRecords.height,
      lineCount: renderRecords.lineCount,
      createdAt: renderRecords.createdAt,
    })
    .from(renderRecords)
    .orderBy(desc(renderRecords.createdAt))
    .limit(8)
    .all();

  return {
    totalRenders: Number(totals?.totalRenders ?? 0),
    totalImagesStored: Number(totals?.totalImagesStored ?? 0),
    totalBytesStored: Number(totals?.totalBytesStored ?? 0),
    totalLinesRendered: Number(totals?.totalLinesRendered ?? 0),
    latestCreatedAt: totals?.latestCreatedAt ?? null,
    topLanguages: topLanguages.map((item) => ({
      language: item.language,
      count: Number(item.count),
    })),
    recent,
  };
};
