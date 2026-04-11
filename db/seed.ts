import type { SQLiteDatabase } from 'expo-sqlite';

import { BOOKS } from '@/constants/bible';
import type { RawBible } from '@/types';

function cleanVerse(text: string): string {
  // Remove editorial additions in curly braces e.g. {it was}, {Heb. ...}
  return text.replace(/\s*\{[^}]*\}/g, '').trim();
}

export async function seed(db: SQLiteDatabase): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const raw: RawBible = require('@/assets/data/kjv.json');

  await db.execAsync('BEGIN TRANSACTION');

  try {
    for (let bookIndex = 0; bookIndex < raw.length; bookIndex++) {
      const rawBook = raw[bookIndex];
      const bookMeta = BOOKS[bookIndex];

      if (!bookMeta) continue;

      await db.runAsync(
        'INSERT OR IGNORE INTO books (id, name, abbrev, testament) VALUES (?, ?, ?, ?)',
        [bookMeta.id, bookMeta.name, bookMeta.abbrev, bookMeta.testament]
      );

      for (let chapterIndex = 0; chapterIndex < rawBook.chapters.length; chapterIndex++) {
        const chapterVerses = rawBook.chapters[chapterIndex];
        const chapterNumber = chapterIndex + 1;

        const chResult = await db.runAsync(
          'INSERT INTO chapters (book_id, number) VALUES (?, ?)',
          [bookMeta.id, chapterNumber]
        );
        const chapterId = chResult.lastInsertRowId;

        for (let verseIndex = 0; verseIndex < chapterVerses.length; verseIndex++) {
          const verseText = cleanVerse(chapterVerses[verseIndex]);
          const verseNumber = verseIndex + 1;

          const vResult = await db.runAsync(
            'INSERT INTO verses (book_id, chapter_id, number, text) VALUES (?, ?, ?, ?)',
            [bookMeta.id, chapterId, verseNumber, verseText]
          );

          await db.runAsync(
            'INSERT INTO verses_fts (text, verse_id) VALUES (?, ?)',
            [verseText, vResult.lastInsertRowId]
          );
        }
      }
    }

    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('db_version', '1')"
    );

    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}
