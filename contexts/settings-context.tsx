import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useDB } from '@/contexts/database-context';
import type { AppSettings } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1.0,
  ttsPitch: 1.0,
  fontSize: 20,
  ttsVoice: null,
  bibleTranslation: 'kjv',
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSetting: async () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { db, isReady } = useDB();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!db || !isReady) return;

    async function loadSettings() {
      const rows = await db!.getAllAsync<{ key: string; value: string }>(
        "SELECT key, value FROM settings WHERE key IN ('tts_rate', 'tts_pitch', 'font_size', 'tts_voice', 'bible_translation')"
      );

      const loaded: Partial<AppSettings> = {};
      for (const row of rows) {
        if (row.key === 'tts_rate') loaded.ttsRate = parseFloat(row.value);
        if (row.key === 'tts_pitch') loaded.ttsPitch = parseFloat(row.value);
        if (row.key === 'font_size') loaded.fontSize = parseInt(row.value, 10);
        if (row.key === 'tts_voice') loaded.ttsVoice = row.value === '' ? null : row.value;
        if (row.key === 'bible_translation') loaded.bibleTranslation = row.value;
      }

      setSettings(prev => ({ ...prev, ...loaded }));
    }

    loadSettings();
  }, [db, isReady]);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      if (!db) return;

      const dbKey =
        key === 'ttsRate' ? 'tts_rate'
        : key === 'ttsPitch' ? 'tts_pitch'
        : key === 'ttsVoice' ? 'tts_voice'
        : key === 'bibleTranslation' ? 'bible_translation'
        : 'font_size';
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [dbKey, String(value)]
      );
      setSettings(prev => ({ ...prev, [key]: value }));
    },
    [db]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}
