import { useCallback, useEffect, useState } from 'react';

import { BOOKS } from '@/constants/bible';
import { USFM_BOOKS } from '@/constants/usfm-books';
import { useDB } from '@/contexts/database-context';
import { useSettings } from '@/contexts/settings-context';
import { fetchChapterVerses } from '@/services/api-bible';
import type { Book, Chapter, Translation, VerseRef } from '@/types';

interface UseBibleDataReturn {
  books: Book[];
  translations: Translation[];
  loadChapters: (bookId: number) => Promise<Chapter[]>;
  loadVerses: (chapterId: number) => Promise<VerseRef[]>;
  searchVerses: (query: string) => Promise<VerseRef[]>;
  getVerse: (bookId: number, chapter: number, verse: number) => Promise<VerseRef | null>;
  getVersesByIds: (ids: number[]) => Promise<VerseRef[]>;
}

export function useBibleData(): UseBibleDataReturn {
  const { db, translationsVersion } = useDB();
  const { settings } = useSettings();
  const [books] = useState<Book[]>(BOOKS);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState<Translation | null>(null);

  const translationId = currentTranslation?.id ?? 1;

  // Load available translations from DB (reloads when API translations are discovered)
  useEffect(() => {
    if (!db) return;
    db.getAllAsync<{ id: number; code: string; name: string; bible_id: string | null; is_api: number }>(
      'SELECT id, code, name, bible_id, is_api FROM translations ORDER BY id'
    ).then(rows => {
      setTranslations(
        rows.map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          bibleId: r.bible_id ?? null,
          isApi: r.is_api === 1,
        }))
      );
    });
  }, [db, translationsVersion]);

  // Resolve active translation code → Translation object
  useEffect(() => {
    if (translations.length === 0) return;
    const match = translations.find(t => t.code === settings.bibleTranslation);
    setCurrentTranslation(match ?? translations[0]);
  }, [translations, settings.bibleTranslation]);

  const loadChapters = useCallback(
    async (bookId: number): Promise<Chapter[]> => {
      if (!db) return [];
      const rows = await db.getAllAsync<{ id: number; book_id: number; number: number }>(
        'SELECT id, book_id, number FROM chapters WHERE book_id = ? ORDER BY number',
        [bookId]
      );
      return rows.map(r => ({ id: r.id, bookId: r.book_id, number: r.number }));
    },
    [db]
  );

  const loadVerses = useCallback(
    async (chapterId: number): Promise<VerseRef[]> => {
      if (!db) return [];

      const query = `
        SELECT v.id, v.book_id, v.chapter_id, v.number, v.text,
               b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament,
               c.number AS chapter_number
        FROM verses v
        JOIN books b ON v.book_id = b.id
        JOIN chapters c ON v.chapter_id = c.id
        WHERE v.chapter_id = ? AND v.translation_id = ?
        ORDER BY v.number`;

      const toVerseRefs = (rows: Array<{
        id: number; book_id: number; chapter_id: number; number: number; text: string;
        book_name: string; book_abbrev: string; book_testament: string; chapter_number: number;
      }>): VerseRef[] =>
        rows.map(r => ({
          id: r.id,
          book: { id: r.book_id, name: r.book_name, abbrev: r.book_abbrev, testament: r.book_testament as 'OT' | 'NT' },
          chapter: r.chapter_number,
          verse: r.number,
          text: r.text,
          reference: `${r.book_name} ${r.chapter_number}:${r.number}`,
        }));

      const cached = await db.getAllAsync<Parameters<typeof toVerseRefs>[0][number]>(
        query, [chapterId, translationId]
      );

      // Return SQLite cache if it exists (bundled or previously fetched API)
      if (cached.length > 0 || !currentTranslation?.isApi) {
        return toVerseRefs(cached);
      }

      // API translation with no cached verses — fetch from API.Bible
      const apiKey = settings.apiBibleKey;
      const bibleId = currentTranslation.bibleId;
      if (!apiKey || !bibleId) return [];

      const chapterInfo = await db.getFirstAsync<{ book_id: number; number: number }>(
        'SELECT book_id, number FROM chapters WHERE id = ?',
        [chapterId]
      );
      if (!chapterInfo) return [];

      const usfm = USFM_BOOKS[chapterInfo.book_id];
      if (!usfm) return [];

      const apiVerses = await fetchChapterVerses(apiKey, bibleId, usfm, chapterInfo.number);

      // Cache in SQLite so subsequent loads are instant
      await db.execAsync('BEGIN TRANSACTION');
      try {
        for (const av of apiVerses) {
          const vResult = await db.runAsync(
            'INSERT INTO verses (book_id, chapter_id, number, text, translation_id) VALUES (?, ?, ?, ?, ?)',
            [chapterInfo.book_id, chapterId, av.verseNumber, av.text, translationId]
          );
          await db.runAsync(
            'INSERT INTO verses_fts (text, verse_id) VALUES (?, ?)',
            [av.text, vResult.lastInsertRowId]
          );
        }
        await db.execAsync('COMMIT');
      } catch (err) {
        await db.execAsync('ROLLBACK');
        throw err;
      }

      const fresh = await db.getAllAsync<Parameters<typeof toVerseRefs>[0][number]>(
        query, [chapterId, translationId]
      );
      return toVerseRefs(fresh);
    },
    [db, translationId, currentTranslation, settings.apiBibleKey]
  );

  const searchVerses = useCallback(
    async (query: string): Promise<VerseRef[]> => {
      if (!db || !query.trim()) return [];

      const terms = query
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(w => `"${w.replace(/"/g, '')}*"`)
        .join(' ');

      const rows = await db.getAllAsync<{
        verse_id: number;
        text: string;
        number: number;
        book_id: number;
        book_name: string;
        book_abbrev: string;
        book_testament: string;
        chapter_number: number;
      }>(
        `SELECT f.verse_id, f.text, v.number,
                v.book_id, b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament,
                c.number AS chapter_number
         FROM verses_fts f
         JOIN verses v ON f.verse_id = v.id
         JOIN chapters c ON v.chapter_id = c.id
         JOIN books b ON v.book_id = b.id
         WHERE verses_fts MATCH ?
           AND v.translation_id = ?
         LIMIT 50`,
        [terms, translationId]
      );

      return rows.map(r => ({
        id: r.verse_id,
        book: {
          id: r.book_id,
          name: r.book_name,
          abbrev: r.book_abbrev,
          testament: r.book_testament as 'OT' | 'NT',
        },
        chapter: r.chapter_number,
        verse: r.number,
        text: r.text,
        reference: `${r.book_name} ${r.chapter_number}:${r.number}`,
      }));
    },
    [db, translationId]
  );

  const getVerse = useCallback(
    async (bookId: number, chapter: number, verse: number): Promise<VerseRef | null> => {
      if (!db) return null;
      const row = await db.getFirstAsync<{
        id: number;
        text: string;
        book_name: string;
        book_abbrev: string;
        book_testament: string;
      }>(
        `SELECT v.id, v.text, b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament
         FROM verses v
         JOIN chapters c ON v.chapter_id = c.id
         JOIN books b ON v.book_id = b.id
         WHERE v.book_id = ? AND c.number = ? AND v.number = ? AND v.translation_id = ?`,
        [bookId, chapter, verse, translationId]
      );

      if (!row) return null;

      const book = BOOKS.find(b => b.id === bookId)!;
      return {
        id: row.id,
        book,
        chapter,
        verse,
        text: row.text,
        reference: `${row.book_name} ${chapter}:${verse}`,
      };
    },
    [db, translationId]
  );

  const getVersesByIds = useCallback(
    async (ids: number[]): Promise<VerseRef[]> => {
      if (!db || ids.length === 0) return [];
      const placeholders = ids.map(() => '?').join(', ');
      const rows = await db.getAllAsync<{
        id: number;
        book_id: number;
        number: number;
        text: string;
        book_name: string;
        book_abbrev: string;
        book_testament: string;
        chapter_number: number;
      }>(
        `SELECT v.id, v.book_id, v.number, v.text,
                b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament,
                c.number AS chapter_number
         FROM verses v
         JOIN books b ON v.book_id = b.id
         JOIN chapters c ON v.chapter_id = c.id
         WHERE v.id IN (${placeholders})
         ORDER BY v.book_id, c.number, v.number`,
        ids
      );
      return rows.map(r => ({
        id: r.id,
        book: {
          id: r.book_id,
          name: r.book_name,
          abbrev: r.book_abbrev,
          testament: r.book_testament as 'OT' | 'NT',
        },
        chapter: r.chapter_number,
        verse: r.number,
        text: r.text,
        reference: `${r.book_name} ${r.chapter_number}:${r.number}`,
      }));
    },
    [db]
  );

  return { books, translations, loadChapters, loadVerses, searchVerses, getVerse, getVersesByIds };
}
