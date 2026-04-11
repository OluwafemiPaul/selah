// Bible domain
export interface Book {
  id: number;
  name: string;
  abbrev: string;
  testament: 'OT' | 'NT';
}

export interface Chapter {
  id: number;
  bookId: number;
  number: number;
}

export interface Verse {
  id: number;
  bookId: number;
  chapterId: number;
  number: number;
  text: string;
}

export interface VerseRef {
  book: Book;
  chapter: number;
  verse: number;
  text: string;
  reference: string; // e.g. "John 3:16"
}

// User data
export interface Meditation {
  id: number;
  title: string;
  verseRef: string | null;
  verseText: string;
  bookId: number | null;
  chapterNum: number | null;
  verseNum: number | null;
  createdAt: number; // Unix ms
  updatedAt: number;
}

export interface CreateMeditationInput {
  title: string;
  verseRef: string | null;
  verseText: string;
  bookId: number | null;
  chapterNum: number | null;
  verseNum: number | null;
}

// Settings
export interface AppSettings {
  ttsRate: number;   // 0.25–2.0, default 1.0
  ttsPitch: number;  // 0.5–2.0, default 1.0
  fontSize: number;  // 14–32, default 20
}

// TTS state
export type TTSStatus = 'idle' | 'playing' | 'paused' | 'stopped';

// KJV JSON asset shape (from thiagobodruk/bible format)
export interface RawBibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

export type RawBible = RawBibleBook[];
