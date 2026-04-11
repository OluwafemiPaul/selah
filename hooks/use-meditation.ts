import { useCallback, useEffect, useState } from 'react';

import { useDB } from '@/contexts/database-context';
import type { CreateMeditationInput, Meditation } from '@/types';

interface UseMeditationReturn {
  meditations: Meditation[];
  refresh: () => Promise<void>;
  getMeditation: (id: number) => Promise<Meditation | null>;
  createMeditation: (input: CreateMeditationInput) => Promise<number>;
  updateMeditation: (id: number, input: Partial<CreateMeditationInput>) => Promise<void>;
  deleteMeditation: (id: number) => Promise<void>;
}

function rowToMeditation(r: Record<string, unknown>): Meditation {
  return {
    id: r.id as number,
    title: r.title as string,
    verseRef: (r.verse_ref as string | null) ?? null,
    verseText: r.verse_text as string,
    bookId: (r.book_id as number | null) ?? null,
    chapterNum: (r.chapter_num as number | null) ?? null,
    verseNum: (r.verse_num as number | null) ?? null,
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
  };
}

export function useMeditation(): UseMeditationReturn {
  const { db, isReady } = useDB();
  const [meditations, setMeditations] = useState<Meditation[]>([]);

  const refresh = useCallback(async () => {
    if (!db) return;
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM meditations ORDER BY created_at DESC'
    );
    setMeditations(rows.map(rowToMeditation));
  }, [db]);

  useEffect(() => {
    if (isReady) refresh();
  }, [isReady, refresh]);

  const getMeditation = useCallback(
    async (id: number): Promise<Meditation | null> => {
      if (!db) return null;
      const row = await db.getFirstAsync<Record<string, unknown>>(
        'SELECT * FROM meditations WHERE id = ?',
        [id]
      );
      return row ? rowToMeditation(row) : null;
    },
    [db]
  );

  const createMeditation = useCallback(
    async (input: CreateMeditationInput): Promise<number> => {
      if (!db) throw new Error('Database not ready');
      const now = Date.now();
      const result = await db.runAsync(
        `INSERT INTO meditations
          (title, verse_ref, verse_text, book_id, chapter_num, verse_num, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.title,
          input.verseRef,
          input.verseText,
          input.bookId,
          input.chapterNum,
          input.verseNum,
          now,
          now,
        ]
      );
      await refresh();
      return result.lastInsertRowId;
    },
    [db, refresh]
  );

  const updateMeditation = useCallback(
    async (id: number, input: Partial<CreateMeditationInput>): Promise<void> => {
      if (!db) return;
      const now = Date.now();
      await db.runAsync(
        `UPDATE meditations SET
          title = COALESCE(?, title),
          verse_ref = COALESCE(?, verse_ref),
          verse_text = COALESCE(?, verse_text),
          book_id = ?,
          chapter_num = ?,
          verse_num = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          input.title ?? null,
          input.verseRef ?? null,
          input.verseText ?? null,
          input.bookId ?? null,
          input.chapterNum ?? null,
          input.verseNum ?? null,
          now,
          id,
        ]
      );
      await refresh();
    },
    [db, refresh]
  );

  const deleteMeditation = useCallback(
    async (id: number): Promise<void> => {
      if (!db) return;
      await db.runAsync('DELETE FROM meditations WHERE id = ?', [id]);
      await refresh();
    },
    [db, refresh]
  );

  return { meditations, refresh, getMeditation, createMeditation, updateMeditation, deleteMeditation };
}
