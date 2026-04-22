import type { SQLiteDatabase } from 'expo-sqlite';
import type { Translation } from '@/types';

const BASE = 'https://api.scripture.api.bible/v1';

export interface ApiBibleInfo {
  id: string;
  abbreviation: string;
  abbreviationLocal: string;
  name: string;
  nameLocal: string;
  language: { id: string; name: string; nameLocal: string };
}

export interface ApiBibleVerse {
  verseNumber: number;
  text: string;
}

// Translations to discover and register from the user's API.Bible account.
// Fixed IDs (101+) avoid collisions with bundled translations (1–99).
const TARGET_TRANSLATIONS: Array<{
  id: number;
  code: string;
  pattern: RegExp;
}> = [
  { id: 101, code: 'nkjv', pattern: /^nkjv$/i },
  { id: 102, code: 'niv',  pattern: /^niv$/i },
  { id: 103, code: 'nlt',  pattern: /^nlt$/i },
  { id: 104, code: 'amp',  pattern: /^ampc?$/i },
  { id: 105, code: 'msg',  pattern: /^msg$/i },
];

async function apiFetch<T>(url: string, apiKey: string): Promise<T> {
  const res = await fetch(url, { headers: { 'api-key': apiKey } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API.Bible ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function fetchAvailableBibles(apiKey: string): Promise<ApiBibleInfo[]> {
  return apiFetch<ApiBibleInfo[]>(`${BASE}/bibles?language=eng`, apiKey);
}

function extractVerseNumber(verseId: string): number {
  const parts = verseId.split('.');
  return parseInt(parts[parts.length - 1], 10) || 0;
}

export async function fetchChapterVerses(
  apiKey: string,
  bibleId: string,
  bookUsfm: string,
  chapterNumber: number
): Promise<ApiBibleVerse[]> {
  const chapterId = `${bookUsfm}.${chapterNumber}`;

  const verseList = await apiFetch<Array<{ id: string; reference: string }>>(
    `${BASE}/bibles/${bibleId}/chapters/${chapterId}/verses`,
    apiKey
  );

  const verses = await Promise.all(
    verseList.map(async v => {
      const data = await apiFetch<{ id: string; content: string }>(
        `${BASE}/bibles/${bibleId}/verses/${v.id}?content-type=text&include-verse-numbers=false&include-titles=false&include-chapter-numbers=false`,
        apiKey
      );
      return {
        verseNumber: extractVerseNumber(v.id),
        text: data.content.trim(),
      };
    })
  );

  return verses.sort((a, b) => a.verseNumber - b.verseNumber);
}

export async function discoverAndRegisterApiTranslations(
  db: SQLiteDatabase,
  apiKey: string
): Promise<Translation[]> {
  const bibles = await fetchAvailableBibles(apiKey);
  const registered: Translation[] = [];

  for (const target of TARGET_TRANSLATIONS) {
    const match = bibles.find(b => target.pattern.test(b.abbreviation));
    if (!match) continue;

    await db.runAsync(
      `INSERT OR REPLACE INTO translations (id, code, name, bible_id, is_api) VALUES (?, ?, ?, ?, 1)`,
      [target.id, target.code, match.name, match.id]
    );

    registered.push({
      id: target.id,
      code: target.code,
      name: match.name,
      bibleId: match.id,
      isApi: true,
    });
  }

  return registered;
}
