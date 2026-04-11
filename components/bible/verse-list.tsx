import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Book, Chapter, VerseRef } from '@/types';

interface VerseListProps {
  book: Book;
  chapter: Chapter;
  verses: VerseRef[];
  onSelectVerse: (verse: VerseRef) => void;
  onBack: () => void;
}

export function VerseList({ book, chapter, verses, onSelectVerse, onBack }: VerseListProps) {
  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.backRow, pressed && styles.backPressed]} onPress={onBack}>
        <Text style={styles.backText}>‹ {book.name}</Text>
      </Pressable>
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterTitle}>{book.name} {chapter.number}</Text>
        <Text style={styles.subtitle}>Select a verse to meditate on</Text>
      </View>
      <FlatList
        data={verses}
        keyExtractor={item => `${item.chapter}-${item.verse}`}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.verseRow, pressed && styles.versePressed]}
            onPress={() => onSelectVerse(item)}>
            <Text style={styles.verseNumber}>{item.verse}</Text>
            <Text style={styles.verseText}>{item.text}</Text>
          </Pressable>
        )}
      />
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
  verseRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  versePressed: {
    backgroundColor: Colors.surface,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    width: 24,
    paddingTop: 2,
  },
  verseText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.serif,
    color: Colors.text,
    lineHeight: 22,
  },
});
