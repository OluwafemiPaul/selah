import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useBookmarks } from '@/contexts/bookmarks-context';
import { HIGHLIGHT_COLORS, useHighlights } from '@/contexts/highlights-context';
import type { Book, Chapter, HighlightColor, VerseRef } from '@/types';

interface VerseListProps {
  book: Book;
  chapter: Chapter;
  verses: VerseRef[];
  selectedIds: Set<number>;
  onToggleVerse: (verse: VerseRef) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function VerseList({
  book,
  chapter,
  verses,
  selectedIds,
  onToggleVerse,
  onConfirm,
  onBack,
}: VerseListProps) {
  const count = selectedIds.size;
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { getHighlight, setHighlight, removeHighlight } = useHighlights();
  const [pickerVerseId, setPickerVerseId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.backRow, pressed && styles.backPressed]} onPress={onBack}>
        <Text style={styles.backText}>‹ {book.name}</Text>
      </Pressable>
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterTitle}>{book.name} {chapter.number}</Text>
        <Text style={styles.subtitle}>Tap to select · Hold circle to highlight</Text>
      </View>
      <FlatList
        data={verses}
        keyExtractor={item => `${item.chapter}-${item.verse}`}
        contentContainerStyle={[styles.content, count > 0 && styles.contentWithFooter]}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          const bookmarked = isBookmarked(item.id);
          const highlight = getHighlight(item.id);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.verseRow,
                isSelected && styles.verseSelected,
                !isSelected && highlight && { backgroundColor: HIGHLIGHT_COLORS[highlight].bg },
                pressed && !isSelected && styles.versePressed,
              ]}
              onPress={() => {
                if (pickerVerseId !== null) { setPickerVerseId(null); return; }
                onToggleVerse(item);
              }}>
              <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                {isSelected && <Text style={styles.indicatorCheck}>✓</Text>}
              </View>
              <Text style={[styles.verseNumber, isSelected && styles.verseNumberSelected]}>
                {item.verse}
              </Text>
              <Text style={styles.verseText}>{item.text}</Text>
              <Pressable
                hitSlop={10}
                onPress={() => setPickerVerseId(pickerVerseId === item.id ? null : item.id)}
                accessibilityLabel="Highlight verse">
                <IconSymbol
                  name={highlight ? 'circle.fill' : 'circle'}
                  size={14}
                  color={highlight ? HIGHLIGHT_COLORS[highlight].border : Colors.border}
                />
              </Pressable>
              <Pressable
                hitSlop={10}
                onPress={() => bookmarked ? removeBookmark(item.id) : addBookmark(item)}
                accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark verse'}>
                <IconSymbol
                  name={bookmarked ? 'bookmark.fill' : 'bookmark'}
                  size={16}
                  color={bookmarked ? Colors.accent : Colors.textMuted}
                />
              </Pressable>
              {pickerVerseId === item.id && (
                <View style={styles.colorPicker}>
                  {(['yellow', 'green', 'blue', 'pink', 'purple'] as HighlightColor[]).map(c => (
                    <Pressable
                      key={c}
                      hitSlop={6}
                      onPress={() => { void setHighlight(item, c); setPickerVerseId(null); }}>
                      <View style={[
                        styles.colorSwatch,
                        { backgroundColor: HIGHLIGHT_COLORS[c].bg, borderColor: HIGHLIGHT_COLORS[c].border },
                        highlight === c && styles.colorSwatchActive,
                      ]} />
                    </Pressable>
                  ))}
                  {highlight && (
                    <Pressable
                      hitSlop={6}
                      onPress={() => { void removeHighlight(item.id); setPickerVerseId(null); }}>
                      <View style={styles.colorRemove}>
                        <Text style={styles.colorRemoveText}>✕</Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              )}
            </Pressable>
          );
        }}
      />
      {count > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmPressed]}
            onPress={onConfirm}>
            <Text style={styles.confirmLabel}>
              Meditate with {count} verse{count !== 1 ? 's' : ''}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backRow: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backPressed: {
    backgroundColor: Colors.surface,
  },
  backText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  chapterHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  contentWithFooter: {
    paddingBottom: 96,
  },
  verseRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  verseSelected: {
    backgroundColor: Colors.accentLight,
  },
  versePressed: {
    backgroundColor: Colors.surface,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  indicatorSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  indicatorCheck: {
    color: Colors.accentText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    width: 24,
    paddingTop: 2,
  },
  verseNumberSelected: {
    color: Colors.textSecondary,
  },
  verseText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.serif,
    color: Colors.text,
    lineHeight: 22,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  colorSwatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
  },
  colorSwatchActive: {
    borderWidth: 3.5,
  },
  colorRemove: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  colorRemoveText: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 12,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  confirmButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  confirmPressed: {
    opacity: 0.8,
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accentText,
    letterSpacing: 0.3,
  },
});
