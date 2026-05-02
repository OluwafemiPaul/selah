import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useDB } from '@/contexts/database-context';
import { useSettings } from '@/contexts/settings-context';
import type { HighlightColor, VerseRef } from '@/types';

export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; border: string }> = {
  yellow: { bg: '#FEF9C3', border: '#CA8A04' },
  green:  { bg: '#DCFCE7', border: '#16A34A' },
  blue:   { bg: '#DBEAFE', border: '#2563EB' },
  pink:   { bg: '#FCE7F3', border: '#DB2777' },
  purple: { bg: '#EDE9FE', border: '#7C3AED' },
};

interface HighlightsContextValue {
  highlightMap: Map<number, HighlightColor>;
  setHighlight: (verse: VerseRef, color: HighlightColor) => Promise<void>;
  removeHighlight: (verseId: number) => Promise<void>;
  getHighlight: (verseId: number) => HighlightColor | undefined;
  loadHighlightedVerses: () => Promise<Array<VerseRef & { color: HighlightColor }>>;
}

const HighlightsContext = createContext<HighlightsContextValue>({
  highlightMap: new Map(),
  setHighlight: async () => {},
  removeHighlight: async () => {},
  getHighlight: () => undefined,
  loadHighlightedVerses: async () => [],
});

export function useHighlights() {
  return useContext(HighlightsContext);
}

export function HighlightsProvider({ children }: { children: ReactNode }) {
  const { db, isReady } = useDB();
  const { settings } = useSettings();
  const [highlightMap, setHighlightMap] = useState<Map<number, HighlightColor>>(new Map());

  useEffect(() => {
    if (!db || !isReady) return;
    db.getAllAsync<{ verse_id: number; color: string }>('SELECT verse_id, color FROM highlights')
      .then(rows => {
        const map = new Map<number, HighlightColor>();
        rows.forEach(r => map.set(r.verse_id, r.color as HighlightColor));
        setHighlightMap(map);
      });
  }, [db, isReady]);

  const setHighlight = useCallback(async (verse: VerseRef, color: HighlightColor) => {
    if (!db) return;
    const translationId = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM translations WHERE code = ?',
      [settings.bibleTranslation]
    );
    await db.runAsync(
      'INSERT OR REPLACE INTO highlights (verse_id, translation_id, color, created_at) VALUES (?, ?, ?, ?)',
      [verse.id, translationId?.id ?? 1, color, Date.now()]
    );
    setHighlightMap(prev => new Map(prev).set(verse.id, color));
  }, [db, settings.bibleTranslation]);

  const removeHighlight = useCallback(async (verseId: number) => {
    if (!db) return;
    await db.runAsync('DELETE FROM highlights WHERE verse_id = ?', [verseId]);
    setHighlightMap(prev => {
      const next = new Map(prev);
      next.delete(verseId);
      return next;
    });
  }, [db]);

  const getHighlight = useCallback((verseId: number) => highlightMap.get(verseId), [highlightMap]);

  const loadHighlightedVerses = useCallback(async (): Promise<Array<VerseRef & { color: HighlightColor }>> => {
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
      color: string;
    }>(
      `SELECT h.verse_id, v.number, v.text, v.book_id,
              b.name AS book_name, b.abbrev AS book_abbrev, b.testament AS book_testament,
              c.number AS chapter_number, h.color
       FROM highlights h
       JOIN verses v ON h.verse_id = v.id
       JOIN books b ON v.book_id = b.id
       JOIN chapters c ON v.chapter_id = c.id
       ORDER BY h.created_at DESC`
    );
    return rows.map(r => ({
      id: r.verse_id,
      book: { id: r.book_id, name: r.book_name, abbrev: r.book_abbrev, testament: r.book_testament as 'OT' | 'NT' },
      chapter: r.chapter_number,
      verse: r.number,
      text: r.text,
      reference: `${r.book_name} ${r.chapter_number}:${r.number}`,
      color: r.color as HighlightColor,
    }));
  }, [db]);

  return (
    <HighlightsContext.Provider value={{ highlightMap, setHighlight, removeHighlight, getHighlight, loadHighlightedVerses }}>
      {children}
    </HighlightsContext.Provider>
  );
}
