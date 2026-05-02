import type { SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase, currentVersion: string): Promise<void> {
  const version = parseInt(currentVersion, 10);

  if (version < 1) {
    // Already handled by seed
  }

  if (version < 2) {
    // Add multi-translation support
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS translations (
        id   INTEGER PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      );
    `);

    await db.runAsync(
      "INSERT OR IGNORE INTO translations (id, code, name) VALUES (1, 'kjv', 'King James Version')"
    );

    // Add translation_id to verses (existing rows default to 1 = KJV)
    await db.execAsync(
      'ALTER TABLE verses ADD COLUMN translation_id INTEGER NOT NULL DEFAULT 1'
    );

    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_verses_translation ON verses(translation_id, chapter_id)'
    );

    await db.runAsync("UPDATE settings SET value = '2' WHERE key = 'db_version'");
  }

  if (version < 3) {
    // Add API.Bible translation support columns to translations table.
    // Wrapped in try/catch because new installs already have these columns via CREATE_TABLES.
    try {
      await db.execAsync('ALTER TABLE translations ADD COLUMN bible_id TEXT');
    } catch {}
    try {
      await db.execAsync(
        'ALTER TABLE translations ADD COLUMN is_api INTEGER NOT NULL DEFAULT 0'
      );
    } catch {}

    await db.runAsync("UPDATE settings SET value = '3' WHERE key = 'db_version'");
  }

  if (version < 4) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id             INTEGER PRIMARY KEY AUTOINCREMENT,
          verse_id       INTEGER NOT NULL UNIQUE,
          translation_id INTEGER NOT NULL,
          created_at     INTEGER NOT NULL
        );
      `);
    } catch {}
    await db.runAsync("UPDATE settings SET value = '4' WHERE key = 'db_version'");
  }

  if (version < 5) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS highlights (
          id             INTEGER PRIMARY KEY AUTOINCREMENT,
          verse_id       INTEGER NOT NULL UNIQUE,
          translation_id INTEGER NOT NULL,
          color          TEXT NOT NULL,
          created_at     INTEGER NOT NULL
        );
      `);
    } catch {}
    await db.runAsync("UPDATE settings SET value = '5' WHERE key = 'db_version'");
  }
}
