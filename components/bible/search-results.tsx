import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { VerseRef } from '@/types';

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
          return (
            <Pressable
              style={({ pressed }) => [
                styles.resultRow,
                isSelected && styles.resultSelected,
                pressed && !isSelected && styles.resultPressed,
              ]}
              onPress={() => onToggleVerse(item)}>
              <View style={styles.resultHeader}>
                <Text style={styles.reference}>{item.reference}</Text>
                <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                  {isSelected && <Text style={styles.indicatorCheck}>✓</Text>}
                </View>
              </View>
              <Text style={styles.verseText} numberOfLines={3}>
                {item.text}
              </Text>
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
    backgroundColor: Colors.surface,
  },
  resultPressed: {
    backgroundColor: Colors.surface,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  indicatorCheck: {
    color: Colors.background,
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
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  confirmButton: {
    backgroundColor: Colors.text,
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
    color: Colors.background,
    letterSpacing: 0.3,
  },
});
