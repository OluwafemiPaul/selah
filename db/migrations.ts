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
}
