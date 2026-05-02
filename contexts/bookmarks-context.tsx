import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useDB } from '@/contexts/database-context';
import { useSettings } from '@/contexts/settings-context';
import type { VerseRef } from '@/types';

interface BookmarksContextValue {
  bookmarkedIds: Set<number>;
  addBookmark: (verse: VerseRef) => Promise<void>;
  removeBookmark: (verseId: number) => Promise<void>;
  isBookmarked: (verseId: number) => boolean;
  loadBookmarkedVerses: () => Promise<VerseRef[]>;
}

const BookmarksContext = createContext<BookmarksContextValue>({
  bookmarkedIds: new Set(),
  addBookmark: async () => {},
  removeBookmark: async () => {},
  isBookmarked: () => false,
  loadBookmarkedVerses: async () => [],
});

export function useBookmarks() {
  return useContext(BookmarksContext);
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { db, isReady } = useDB();
  const { settings } = useSettings();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Load all bookmarked verse IDs on mount
  useEffect(() => {
    if (!db || !isReady) return;
    db.getAllAsync<{ verse_id: number }>('SELECT verse_id FROM bookmarks')
      .then(rows => setBookmarkedIds(new Set(rows.map(r => r.verse_id))));
  }, [db, isReady]);

  const addBookmark = useCallback(async (verse: VerseRef) => {
    if (!db) return;
    const translationId = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM translations WHERE code = ?',
      [settings.bibleTranslation]
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO bookmarks (verse_id, translation_id, created_at) VALUES (?, ?, ?)',
      [verse.id, translationId?.id ?? 1, Date.now()]
    );
    setBookmarkedIds(prev => new Set(prev).add(verse.id));
  }, [db, settings.bibleTranslation]);

  const removeBookmark = useCallback(async (verseId: number) => {
    if (!db) return;
    await db.runAsync('DELETE FROM bookmarks WHERE verse_id = ?', [verseId]);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      next.delete(verseId);
      return next;
    });
  }, [db]);

  const isBookmarked = useCallback((verseId: number) => bookmarkedIds.has(verseId), [bookmarkedIds]);

  const loadBookmarkedVerses = useCallback(async (): Promise<VerseRef[]> => {
    if (!db) return [];
    const rows = await db.getAllAsync<{
      verse_id: number;
      number: number;
      text: string;
      book_id: number;
      book_name: string;
      book_abbrev: string;
      book_testament: string;
      chapter_number: number;
      created_at: number;
    }>(
      `SELECT bk.verse_id, v.number, v.text, v.book_id,
              b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament,
              c.number AS chapter_number, bk.created_at
       FROM bookmarks bk
       JOIN verses v ON bk.verse_id = v.id
       JOIN books b ON v.book_id = b.id
       JOIN chapters c ON v.chapter_id = c.id
       ORDER BY bk.created_at DESC`
    );
    return rows.map(r => ({
      id: r.verse_id,
      book: { id: r.book_id, name: r.book_name, abbrev: r.book_abbrev, testament: r.book_testament as 'OT' | 'NT' },
      chapter: r.chapter_number,
      verse: r.number,
      text: r.text,
      reference: `${r.book_name} ${r.chapter_number}:${r.number}`,
    }));
  }, [db]);

  return (
    <BookmarksContext.Provider value={{ bookmarkedIds, addBookmark, removeBookmark, isBookmarked, loadBookmarkedVerses }}>
      {children}
    </BookmarksContext.Provider>
  );
}
