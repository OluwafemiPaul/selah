import type { SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase, currentVersion: string): Promise<void> {
  const version = parseInt(currentVersion, 10);

  if (version < 1) {
    // Already handled by seed
  }

  // Future migrations go here:
  // if (version < 2) {
  //   await db.execAsync('ALTER TABLE meditations ADD COLUMN tags TEXT');
  //   await db.runAsync("UPDATE settings SET value = '2' WHERE key = 'db_version'");
  // }
}
