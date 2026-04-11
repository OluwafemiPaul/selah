import { useCallback, useEffect, useState } from 'react';

import { BOOKS } from '@/constants/bible';
import { useDB } from '@/contexts/database-context';
import type { Book, Chapter, VerseRef } from '@/types';

interface UseBibleDataReturn {
  books: Book[];
  loadChapters: (bookId: number) => Promise<Chapter[]>;
  loadVerses: (chapterId: number) => Promise<VerseRef[]>;
  searchVerses: (query: string) => Promise<VerseRef[]>;
  getVerse: (bookId: number, chapter: number, verse: number) => Promise<VerseRef | null>;
}

export function useBibleData(): UseBibleDataReturn {
  const { db } = useDB();
  const [books] = useState<Book[]>(BOOKS);

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
      const rows = await db.getAllAsync<{
        id: number;
        book_id: number;
        chapter_id: number;
        number: number;
        text: string;
        book_name: string;
        book_abbrev: string;
        book_testament: string;
        chapter_number: number;
      }>(
        `SELECT v.id, v.book_id, v.chapter_id, v.number, v.text,
                b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament,
                c.number AS chapter_number
         FROM verses v
         JOIN books b ON v.book_id = b.id
         JOIN chapters c ON v.chapter_id = c.id
         WHERE v.chapter_id = ?
         ORDER BY v.number`,
        [chapterId]
      );
      return rows.map(r => ({
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

  const searchVerses = useCallback(
    async (query: string): Promise<VerseRef[]> => {
      if (!db || !query.trim()) return [];

      // Build FTS5 prefix query: each word gets a prefix wildcard
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
         LIMIT 50`,
        [terms]
      );

      return rows.map(r => ({
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
         WHERE v.book_id = ? AND c.number = ? AND v.number = ?`,
        [bookId, chapter, verse]
      );

      if (!row) return null;

      const book = BOOKS.find(b => b.id === bookId)!;
      return {
        book,
        chapter,
        verse,
        text: row.text,
        reference: `${row.book_name} ${chapter}:${verse}`,
      };
    },
    [db]
  );

  return { books, loadChapters, loadVerses, searchVerses, getVerse };
}
