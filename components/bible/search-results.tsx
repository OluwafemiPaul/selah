import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useBookmarks } from '@/contexts/bookmarks-context';
import { HIGHLIGHT_COLORS, useHighlights } from '@/contexts/highlights-context';
import type { HighlightColor, VerseRef } from '@/types';

interface SearchResultsProps {
  results: VerseRef[];
  isLoading: boolean;
  query: string;
  selectedIds: Set<number>;
  onToggleVerse: (verse: VerseRef) => void;
  onConfirm: () => void;
}

export function SearchResults({
  results,
  isLoading,
  query,
  selectedIds,
  onToggleVerse,
  onConfirm,
}: SearchResultsProps) {
  const count = selectedIds.size;
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { getHighlight, setHighlight, removeHighlight } = useHighlights();
  const [pickerVerseId, setPickerVerseId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.textMuted} />
      </View>
    );
  }

  if (query.length > 1 && results.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No verses found for "{query}"</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={item => `${item.book.id}-${item.chapter}-${item.verse}`}
        contentContainerStyle={[styles.content, count > 0 && styles.contentWithFooter]}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          const bookmarked = isBookmarked(item.id);
          const highlight = getHighlight(item.id);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.resultRow,
                isSelected && styles.resultSelected,
                !isSelected && highlight && { backgroundColor: HIGHLIGHT_COLORS[highlight].bg },
                pressed && !isSelected && styles.resultPressed,
              ]}
              onPress={() => {
                if (pickerVerseId !== null) { setPickerVerseId(null); return; }
                onToggleVerse(item);
              }}>
              <View style={styles.resultHeader}>
                <Text style={styles.reference}>{item.reference}</Text>
                <View style={styles.resultActions}>
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
                  <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                    {isSelected && <Text style={styles.indicatorCheck}>✓</Text>}
                  </View>
                </View>
              </View>
              <Text style={styles.verseText} numberOfLines={3}>
                {item.text}
              </Text>
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
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  contentWithFooter: {
    paddingBottom: 96,
  },
  resultRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  resultSelected: {
    backgroundColor: Colors.accentLight,
  },
  resultPressed: {
    backgroundColor: Colors.surface,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reference: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  verseText: {
    fontSize: 14,
    fontFamily: Fonts.serif,
    color: Colors.text,
    lineHeight: 20,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
