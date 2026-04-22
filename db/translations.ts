import type { SQLiteDatabase } from 'expo-sqlite';

import { BOOKS } from '@/constants/bible';
import type { RawBible } from '@/types';

export interface TranslationDef {
  id: number;
  code: string;
  name: string;
  getData: () => RawBible;
}

/**
 * Registry of Bible translations bundled with the app.
 *
 * To add a new translation:
 *  1. Download the JSON in thiagobodruk/bible format from
 *     https://github.com/thiagobodruk/bible/tree/master/json
 *  2. Place it in assets/data/ (e.g. assets/data/web.json)
 *  3. Uncomment (or add) an entry below with the next available id.
 */
export const BUNDLED_TRANSLATIONS: TranslationDef[] = [
  {
    id: 1,
    code: 'kjv',
    name: 'King James Version',
    getData: () => require('@/assets/data/kjv.json'),
  },
  {
    id: 2,
    code: 'asv',
    name: 'American Standard Version',
    getData: () => require('@/assets/data/asv.json'),
  },
  {
    id: 3,
    code: 'bbe',
    name: 'Bible in Basic English',
    getData: () => require('@/assets/data/bbe.json'),
  },
  {
    id: 4,
    code: 'ylt',
    name: "Young's Literal Translation",
    getData: () => require('@/assets/data/ylt.json'),
  },
  {
    id: 5,
    code: 'darby',
    name: 'Darby Translation',
    getData: () => require('@/assets/data/darby.json'),
  },
  {
    id: 6,
    code: 'web',
    name: 'World English Bible',
    getData: () => require('@/assets/data/web.json'),
  },
  // To add more translations:
  // 1. Get a JSON in thiagobodruk/bible format (array of books with nested chapter/verse arrays)
  // 2. Place it in assets/data/ (e.g. assets/data/web.json)
  // 3. Add an entry here with the next available id
];

export function cleanVerse(text: string): string {
  return text.replace(/\s*\{[^}]*\}/g, '').trim();
}

/**
 * Seeds a single translation's verse texts into the DB.
 * Assumes books and chapters already exist (created during KJV seed).
 * Safe to call multiple times — skips if already seeded.
 */
export async function seedTranslation(
  db: SQLiteDatabase,
  def: TranslationDef
): Promise<void> {
  // Upsert the translation record
  await db.runAsync(
    'INSERT OR IGNORE INTO translations (id, code, name) VALUES (?, ?, ?)',
    [def.id, def.code, def.name]
  );

  // Skip if verses are already present for this translation
  const existing = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM verses WHERE translation_id = ?',
    [def.id]
  );
  if (existing && existing.n > 0) return;

  const raw = def.getData();

  for (let bookIndex = 0; bookIndex < raw.length; bookIndex++) {
    const rawBook = raw[bookIndex];
    const bookMeta = BOOKS[bookIndex];
    if (!bookMeta) continue;

    for (let chapterIndex = 0; chapterIndex < rawBook.chapters.length; chapterIndex++) {
      const chapterVerses = rawBook.chapters[chapterIndex];
      const chapterNumber = chapterIndex + 1;

      // Chapters are shared across translations; look up the existing one
      const chapter = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM chapters WHERE book_id = ? AND number = ?',
        [bookMeta.id, chapterNumber]
      );
      if (!chapter) continue;

      for (let verseIndex = 0; verseIndex < chapterVerses.length; verseIndex++) {
        const verseText = cleanVerse(chapterVerses[verseIndex]);
        const verseNumber = verseIndex + 1;

        const vResult = await db.runAsync(
          'INSERT INTO verses (book_id, chapter_id, number, text, translation_id) VALUES (?, ?, ?, ?, ?)',
          [bookMeta.id, chapter.id, verseNumber, verseText, def.id]
        );

        await db.runAsync(
          'INSERT INTO verses_fts (text, verse_id) VALUES (?, ?)',
          [verseText, vResult.lastInsertRowId]
        );
      }
    }
  }
}

/**
 * Seeds all BUNDLED_TRANSLATIONS that haven't been seeded yet.
 * Skips KJV (id=1) since it is handled by the initial seed / migration.
 * Call this after seed() or runMigrations() completes.
 */
export async function seedBundledTranslations(db: SQLiteDatabase): Promise<void> {
  for (const def of BUNDLED_TRANSLATIONS) {
    if (def.id === 1) continue; // KJV handled separately

    const row = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM translations WHERE code = ?',
      [def.code]
    );
    if (row && row.n > 0) continue; // already seeded

    await db.execAsync('BEGIN TRANSACTION');
    try {
      await seedTranslation(db, def);
      await db.execAsync('COMMIT');
    } catch (err) {
      await db.execAsync('ROLLBACK');
      throw err;
    }
  }
}
