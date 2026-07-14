import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const renderRecords = sqliteTable(
  "render_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    source: text("source").notNull().default("api"),
    mimeType: text("mime_type").notNull().default("image/png"),
    language: text("language").notNull(),
    theme: text("theme").notNull(),
    bgColor: text("bg_color").notNull(),
    borderSize: integer("border_size").notNull(),
    containerWidth: integer("container_width").notNull(),
    minContainerWidth: integer("min_container_width").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    lineCount: integer("line_count").notNull(),
    showLineNumbers: integer("show_line_numbers", { mode: "boolean" }).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("render_records_created_at_idx").on(table.createdAt),
    index("render_records_language_idx").on(table.language),
    index("render_records_source_idx").on(table.source),
  ],
);

export type RenderRecord = typeof renderRecords.$inferSelect;
export type NewRenderRecord = typeof renderRecords.$inferInsert;
