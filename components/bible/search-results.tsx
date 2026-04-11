import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { VerseRef } from '@/types';

interface SearchResultsProps {
  results: VerseRef[];
  isLoading: boolean;
  query: string;
  onSelectVerse: (verse: VerseRef) => void;
}

export function SearchResults({ results, isLoading, query, onSelectVerse }: SearchResultsProps) {
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
    <FlatList
      data={results}
      keyExtractor={item => `${item.book.id}-${item.chapter}-${item.verse}`}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.resultRow, pressed && styles.resultPressed]}
          onPress={() => onSelectVerse(item)}>
          <Text style={styles.reference}>{item.reference}</Text>
          <Text style={styles.verseText} numberOfLines={3}>
            {item.text}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
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
  resultRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  resultPressed: {
    backgroundColor: Colors.surface,
  },
  reference: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verseText: {
    fontSize: 14,
    fontFamily: Fonts.serif,
    color: Colors.text,
    lineHeight: 20,
  },
});
