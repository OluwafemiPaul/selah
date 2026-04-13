export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS translations (
    id   INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS books (
    id        INTEGER PRIMARY KEY,
    name      TEXT NOT NULL,
    abbrev    TEXT NOT NULL,
    testament TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id),
    number  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verses (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id        INTEGER NOT NULL REFERENCES books(id),
    chapter_id     INTEGER NOT NULL REFERENCES chapters(id),
    number         INTEGER NOT NULL,
    text           TEXT NOT NULL,
    translation_id INTEGER NOT NULL DEFAULT 1 REFERENCES translations(id)
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts
    USING fts5(text, verse_id UNINDEXED);

  CREATE TABLE IF NOT EXISTS meditations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    verse_ref   TEXT,
    verse_text  TEXT NOT NULL,
    book_id     INTEGER,
    chapter_num INTEGER,
    verse_num   INTEGER,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
