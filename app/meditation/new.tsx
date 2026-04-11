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
  }>();
  const { createMeditation } = useMeditation();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(input: CreateMeditationInput) {
    setIsSaving(true);
    try {
      const id = await createMeditation(input);
      router.dismissTo('/(tabs)/');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <MeditationForm
      initialBookId={params.bookId ? parseInt(params.bookId, 10) : undefined}
      initialChapter={params.chapter ? parseInt(params.chapter, 10) : undefined}
      initialVerse={params.verse ? parseInt(params.verse, 10) : undefined}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
