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

import { IconSymbol } from '@/components/ui/icon-symbol';
import { VersePickerModal } from '@/components/bible/verse-picker-modal';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useBibleData } from '@/hooks/use-bible-data';
import type { CreateMeditationInput, VerseRef } from '@/types';

interface MeditationFormProps {
  initialVerseIds?: number[];
  initialBookId?: number;
  initialChapter?: number;
  initialVerse?: number;
  initialTitle?: string;
  initialText?: string;
  initialRef?: string;
  onSave: (input: CreateMeditationInput) => Promise<void>;
  isSaving?: boolean;
}

function buildCompositeReference(verses: VerseRef[]): string {
  const groups: { bookName: string; chapter: number; verseNums: number[] }[] = [];
  for (const v of verses) {
    const last = groups[groups.length - 1];
    if (last && last.bookName === v.book.name && last.chapter === v.chapter) {
      last.verseNums.push(v.verse);
    } else {
      groups.push({ bookName: v.book.name, chapter: v.chapter, verseNums: [v.verse] });
    }
  }

  return groups
    .map(g => {
      const sorted = [...g.verseNums].sort((a, b) => a - b);
      const isConsecutive = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
      const verseStr =
        sorted.length === 1
          ? String(sorted[0])
          : isConsecutive
            ? `${sorted[0]}-${sorted[sorted.length - 1]}`
            : sorted.join(', ');
      return `${g.bookName} ${g.chapter}:${verseStr}`;
    })
    .join('; ');
}

export function MeditationForm({
  initialVerseIds,
  initialBookId,
  initialChapter,
  initialVerse,
  initialTitle = '',
  initialText = '',
  initialRef = '',
  onSave,
  isSaving = false,
}: MeditationFormProps) {
  const { getVerse, getVersesByIds } = useBibleData();

  const [title, setTitle] = useState(initialTitle);
  const [verseText, setVerseText] = useState(initialText);
  const [verseRef, setVerseRef] = useState<VerseRef | null>(null);
  const [compositeRef, setCompositeRef] = useState('');
  // Default to "Bible verse" mode. Only switch to "Custom" when editing an
  // existing custom meditation — i.e. it has saved text but no verse reference.
  const [isCustom, setIsCustom] = useState(!!initialText && !initialRef);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Load verses via initialVerseIds (multi-select flow)
  useEffect(() => {
    if (!initialVerseIds?.length) return;

    setIsLoadingVerse(true);
    getVersesByIds(initialVerseIds).then(refs => {
      if (refs.length === 0) {
        setIsLoadingVerse(false);
        return;
      }

      if (refs.length === 1) {
        setVerseRef(refs[0]);
        setVerseText(refs[0].text);
        if (!initialTitle) setTitle(refs[0].reference);
      } else {
        const ref = buildCompositeReference(refs);
        setCompositeRef(ref);
        setVerseText(refs.map(v => v.text).join('\n'));
        if (!initialTitle) setTitle(ref);
      }
      setIsLoadingVerse(false);
    });
  }, [initialVerseIds, getVersesByIds, initialTitle]);

  // Load verse from legacy single-verse params (edit flow)
  useEffect(() => {
    if (initialVerseIds?.length || !initialBookId || !initialChapter || !initialVerse) return;

    setIsLoadingVerse(true);
    getVerse(initialBookId, initialChapter, initialVerse).then(ref => {
      if (ref) {
        setVerseRef(ref);
        setVerseText(ref.text);
        if (!initialTitle) setTitle(ref.reference);
      }
      setIsLoadingVerse(false);
    });
  }, [initialVerseIds, initialBookId, initialChapter, initialVerse, getVerse, initialTitle]);

  const canSave = title.trim().length > 0 && verseText.trim().length > 0;

  const displayRef = compositeRef || verseRef?.reference || initialRef || null;

  function handleVersesSelected(selected: VerseRef[]) {
    if (selected.length === 1) {
      const v = selected[0];
      setVerseRef(v);
      setCompositeRef('');
      setVerseText(v.text);
      setTitle(prev => (!prev || prev === displayRef) ? v.reference : prev);
    } else {
      const ref = buildCompositeReference(selected);
      setCompositeRef(ref);
      setVerseRef(null);
      setVerseText(selected.map(v => v.text).join('\n'));
      setTitle(prev => (!prev || prev === displayRef) ? ref : prev);
    }
  }

  const handleSave = useCallback(async () => {
    if (!canSave || isSaving) return;

    await onSave({
      title: title.trim(),
      verseRef: isCustom ? null : (displayRef ?? null),
      verseText: verseText.trim(),
      bookId: isCustom ? null : (verseRef?.book.id ?? initialBookId ?? null),
      chapterNum: isCustom ? null : (verseRef?.chapter ?? initialChapter ?? null),
      verseNum: isCustom ? null : compositeRef ? null : (verseRef?.verse ?? initialVerse ?? null),
    });
  }, [
    canSave,
    isSaving,
    onSave,
    title,
    isCustom,
    displayRef,
    verseRef,
    compositeRef,
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
              setCompositeRef('');
            }}>
            <Text style={[styles.toggleLabel, isCustom && styles.toggleLabelActive]}>
              Custom text
            </Text>
          </Pressable>
        </View>

        {/* Verse reference — tappable to open Bible picker */}
        {!isCustom && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Verse reference</Text>
            {isLoadingVerse ? (
              <ActivityIndicator style={styles.loader} color={Colors.textMuted} />
            ) : (
              <Pressable
                style={({ pressed }) => [styles.refDisplay, pressed && styles.refPressed]}
                onPress={() => setShowPicker(true)}
                accessibilityLabel="Choose a verse">
                <Text style={[styles.refText, !displayRef && styles.refPlaceholder]}>
                  {displayRef ?? 'Tap to choose a verse…'}
                </Text>
                <IconSymbol name="chevron.right" size={16} color={Colors.textMuted} />
              </Pressable>
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
            <ActivityIndicator color={Colors.accentText} />
          ) : (
            <Text style={styles.saveLabel}>Save</Text>
          )}
        </Pressable>
      </ScrollView>

      <VersePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={handleVersesSelected}
      />
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
    backgroundColor: Colors.accent,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleLabelActive: {
    color: Colors.accentText,
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
    backgroundColor: Colors.surface,
  },
  textArea: {
    fontFamily: Fonts.serif,
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
    lineHeight: 24,
  },
  refDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  refPressed: {
    opacity: 0.7,
  },
  refText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  refPlaceholder: {
    color: Colors.textMuted,
    fontStyle: 'normal',
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.accent,
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
    color: Colors.accentText,
    letterSpacing: 0.3,
  },
});
