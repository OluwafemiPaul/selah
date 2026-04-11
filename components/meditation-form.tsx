import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useBibleData } from '@/hooks/use-bible-data';
import type { CreateMeditationInput, VerseRef } from '@/types';

interface MeditationFormProps {
  initialBookId?: number;
  initialChapter?: number;
  initialVerse?: number;
  initialTitle?: string;
  initialText?: string;
  initialRef?: string;
  onSave: (input: CreateMeditationInput) => Promise<void>;
  isSaving?: boolean;
}

export function MeditationForm({
  initialBookId,
  initialChapter,
  initialVerse,
  initialTitle = '',
  initialText = '',
  initialRef = '',
  onSave,
  isSaving = false,
}: MeditationFormProps) {
  const { getVerse } = useBibleData();

  const [title, setTitle] = useState(initialTitle);
  const [verseText, setVerseText] = useState(initialText);
  const [verseRef, setVerseRef] = useState<VerseRef | null>(null);
  const [isCustom, setIsCustom] = useState(!initialBookId);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);

  // Load verse from Bible params on mount
  useEffect(() => {
    if (!initialBookId || !initialChapter || !initialVerse) return;

    setIsLoadingVerse(true);
    getVerse(initialBookId, initialChapter, initialVerse).then(ref => {
      if (ref) {
        setVerseRef(ref);
        setVerseText(ref.text);
        if (!initialTitle) setTitle(ref.reference);
      }
      setIsLoadingVerse(false);
    });
  }, [initialBookId, initialChapter, initialVerse, getVerse, initialTitle]);

  const canSave = title.trim().length > 0 && verseText.trim().length > 0;

  const handleSave = useCallback(async () => {
    if (!canSave || isSaving) return;

    await onSave({
      title: title.trim(),
      verseRef: isCustom ? null : (verseRef?.reference ?? initialRef ?? null),
      verseText: verseText.trim(),
      bookId: isCustom ? null : (verseRef?.book.id ?? initialBookId ?? null),
      chapterNum: isCustom ? null : (verseRef?.chapter ?? initialChapter ?? null),
      verseNum: isCustom ? null : (verseRef?.verse ?? initialVerse ?? null),
    });
  }, [
    canSave,
    isSaving,
    onSave,
    title,
    isCustom,
    verseRef,
    initialRef,
    verseText,
    initialBookId,
    initialChapter,
    initialVerse,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleButton, !isCustom && styles.toggleActive]}
            onPress={() => setIsCustom(false)}>
            <Text style={[styles.toggleLabel, !isCustom && styles.toggleLabelActive]}>
              Bible verse
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, isCustom && styles.toggleActive]}
            onPress={() => {
              setIsCustom(true);
              setVerseRef(null);
            }}>
            <Text style={[styles.toggleLabel, isCustom && styles.toggleLabelActive]}>
              Custom text
            </Text>
          </Pressable>
        </View>

        {/* Verse reference (read-only if from Bible) */}
        {!isCustom && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Verse reference</Text>
            {isLoadingVerse ? (
              <ActivityIndicator style={styles.loader} color={Colors.textMuted} />
            ) : (
              <View style={styles.refDisplay}>
                <Text style={styles.refText}>
                  {verseRef?.reference ?? initialRef ?? 'No verse selected'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Name this meditation…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
            maxLength={80}
          />
        </View>

        {/* Verse / custom text */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{isCustom ? 'Text' : 'Verse text'}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={verseText}
            onChangeText={setVerseText}
            placeholder={isCustom ? 'Enter the text to meditate on…' : 'Verse will appear here…'}
            placeholderTextColor={Colors.textMuted}
            multiline
            editable={isCustom || !!verseText}
            scrollEnabled={false}
          />
        </View>

        {/* Save button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (!canSave || isSaving) && styles.saveButtonDisabled,
            pressed && styles.savePressed,
          ]}
          onPress={handleSave}
          disabled={!canSave || isSaving}>
          {isSaving ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.saveLabel}>Save</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  toggleRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  toggleActive: {
    backgroundColor: Colors.text,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleLabelActive: {
    color: Colors.background,
  },
  field: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  textArea: {
    fontFamily: Fonts.serif,
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
    lineHeight: 24,
  },
  refDisplay: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  refText: {
    fontSize: 15,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  savePressed: {
    opacity: 0.8,
  },
  saveLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
    letterSpacing: 0.3,
  },
});
