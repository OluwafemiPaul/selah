import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MeditationForm } from '@/components/meditation-form';
import { Colors } from '@/constants/theme';
import { useMeditation } from '@/hooks/use-meditation';
import type { CreateMeditationInput, Meditation } from '@/types';

export default function EditMeditationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMeditation, updateMeditation } = useMeditation();
  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMeditation(parseInt(id, 10)).then(setMeditation);
  }, [id, getMeditation]);

  async function handleSave(input: CreateMeditationInput) {
    if (!id) return;
    setIsSaving(true);
    try {
      await updateMeditation(parseInt(id, 10), input);
      router.dismissTo('/(tabs)/');
    } finally {
      setIsSaving(false);
    }
  }

  if (!meditation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.textMuted} />
      </View>
    );
  }

  return (
    <MeditationForm
      initialTitle={meditation.title}
      initialText={meditation.verseText}
      initialRef={meditation.verseRef ?? ''}
      initialBookId={meditation.bookId ?? undefined}
      initialChapter={meditation.chapterNum ?? undefined}
      initialVerse={meditation.verseNum ?? undefined}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
