import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { runMigrations } from '@/db/migrations';
import { CREATE_TABLES } from '@/db/schema';
import { seed } from '@/db/seed';
import { seedBundledTranslations } from '@/db/translations';

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const database = await SQLite.openDatabaseAsync('selah.db');

        // Enable WAL mode for better performance
        await database.execAsync('PRAGMA journal_mode = WAL;');

        // Create all tables
        await database.execAsync(CREATE_TABLES);

        // Check if we need to seed
        const row = await database.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = 'db_version'"
        );

        if (!row) {
          // First launch — seed the database
          await seed(database);
        } else {
          // Run any pending migrations
          await runMigrations(database, row.value);
        }

        // Ensure the translation index exists (column guaranteed present after seed/migration)
        await database.execAsync(
          'CREATE INDEX IF NOT EXISTS idx_verses_translation ON verses(translation_id, chapter_id)'
        );

        // Seed any newly added bundled translations (idempotent)
        await seedBundledTranslations(database);

        if (mounted) {
          setDb(database);
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return { db, isReady, error };
}
