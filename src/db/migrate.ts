import { rawSqlite } from "./client.js";

let migrated = false;

export const migrateDatabase = () => {
  if (migrated) return;

  rawSqlite.exec(`
    CREATE TABLE IF NOT EXISTS render_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL DEFAULT 'api',
      image_base64 TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/png',
      language TEXT NOT NULL,
      theme TEXT NOT NULL,
      bg_color TEXT NOT NULL,
      border_size INTEGER NOT NULL,
      container_width INTEGER NOT NULL,
      min_container_width INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      line_count INTEGER NOT NULL,
      show_line_numbers INTEGER NOT NULL,
      code_hash TEXT NOT NULL,
      code_length INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS render_records_created_at_idx
      ON render_records (created_at);

    CREATE INDEX IF NOT EXISTS render_records_language_idx
      ON render_records (language);

    CREATE INDEX IF NOT EXISTS render_records_source_idx
      ON render_records (source);
  `);

  migrated = true;
};
