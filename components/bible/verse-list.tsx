import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Book, Chapter, VerseRef } from '@/types';

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

  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.backRow, pressed && styles.backPressed]} onPress={onBack}>
        <Text style={styles.backText}>‹ {book.name}</Text>
      </Pressable>
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterTitle}>{book.name} {chapter.number}</Text>
        <Text style={styles.subtitle}>Tap verses to select</Text>
      </View>
      <FlatList
        data={verses}
        keyExtractor={item => `${item.chapter}-${item.verse}`}
        contentContainerStyle={[styles.content, count > 0 && styles.contentWithFooter]}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.verseRow,
                isSelected && styles.verseSelected,
                pressed && !isSelected && styles.versePressed,
              ]}
              onPress={() => onToggleVerse(item)}>
              <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                {isSelected && <Text style={styles.indicatorCheck}>✓</Text>}
              </View>
              <Text style={[styles.verseNumber, isSelected && styles.verseNumberSelected]}>
                {item.verse}
              </Text>
              <Text style={styles.verseText}>{item.text}</Text>
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
  },
  verseSelected: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  indicatorCheck: {
    color: Colors.background,
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
