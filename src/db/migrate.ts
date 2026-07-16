import { rawSqlite } from "./client.js";

let migrated = false;

export const migrateDatabase = () => {
  if (migrated) return;

  rawSqlite.exec(`
    CREATE TABLE IF NOT EXISTS render_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL DEFAULT 'api',
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
      created_at TEXT NOT NULL
    );
  `);

  rawSqlite.exec(`
    CREATE TABLE IF NOT EXISTS satisfaction_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL CHECK (action IN ('copy', 'download')),
      created_at TEXT NOT NULL
    );
  `);

  const columns = rawSqlite.prepare("PRAGMA table_info(render_records)").all() as Array<{
    name: string;
  }>;

  const shouldRebuildRenderRecords = ["image_base64", "code_hash", "code_length"].some((name) =>
    columns.some((column) => column.name === name),
  );

  if (shouldRebuildRenderRecords) {
    rawSqlite.exec(`
      CREATE TABLE render_records_next (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'api',
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
        created_at TEXT NOT NULL
      );

      INSERT INTO render_records_next (
        id,
        source,
        mime_type,
        language,
        theme,
        bg_color,
        border_size,
        container_width,
        min_container_width,
        width,
        height,
        line_count,
        show_line_numbers,
        created_at
      )
      SELECT
        id,
        source,
        mime_type,
        language,
        theme,
        bg_color,
        border_size,
        container_width,
        min_container_width,
        width,
        height,
        line_count,
        show_line_numbers,
        created_at
      FROM render_records;

      DROP TABLE render_records;
      ALTER TABLE render_records_next RENAME TO render_records;
    `);
  }

  rawSqlite.exec(`

    CREATE INDEX IF NOT EXISTS render_records_created_at_idx
      ON render_records (created_at);

    CREATE INDEX IF NOT EXISTS render_records_language_idx
      ON render_records (language);

    CREATE INDEX IF NOT EXISTS render_records_source_idx
      ON render_records (source);

    CREATE INDEX IF NOT EXISTS satisfaction_events_created_at_idx
      ON satisfaction_events (created_at);
  `);

  migrated = true;
};
