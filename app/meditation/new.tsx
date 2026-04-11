import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { MeditationForm } from '@/components/meditation-form';
import { useMeditation } from '@/hooks/use-meditation';
import type { CreateMeditationInput } from '@/types';

export default function NewMeditationScreen() {
  const params = useLocalSearchParams<{
    bookId?: string;
    chapter?: string;
    verse?: string;
    verseIds?: string;
  }>();
  const { createMeditation } = useMeditation();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(input: CreateMeditationInput) {
    setIsSaving(true);
    try {
      await createMeditation(input);
      router.dismissTo('/(tabs)/');
    } finally {
      setIsSaving(false);
    }
  }

  // Parse comma-separated verse IDs from multi-select flow
  const verseIds = params.verseIds
    ? params.verseIds.split(',').map(Number).filter(Boolean)
    : undefined;

  return (
    <MeditationForm
      initialVerseIds={verseIds}
      initialBookId={params.bookId ? parseInt(params.bookId, 10) : undefined}
      initialChapter={params.chapter ? parseInt(params.chapter, 10) : undefined}
      initialVerse={params.verse ? parseInt(params.verse, 10) : undefined}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
