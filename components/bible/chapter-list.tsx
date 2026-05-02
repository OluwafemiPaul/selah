import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Book, Chapter } from '@/types';

interface ChapterListProps {
  book: Book;
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onBack: () => void;
}

export function ChapterList({ book, chapters, onSelectChapter, onBack }: ChapterListProps) {
  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.backRow, pressed && styles.backPressed]} onPress={onBack}>
        <Text style={styles.backText}>‹ Books</Text>
      </Pressable>
      <View style={styles.bookHeader}>
        <Text style={styles.bookName}>{book.name}</Text>
        <Text style={styles.subtitle}>Choose a chapter</Text>
      </View>
      <FlatList
        data={chapters}
        keyExtractor={item => String(item.id)}
        numColumns={5}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.chapterButton, pressed && styles.chapterPressed]}
            onPress={() => onSelectChapter(item)}>
            <Text style={styles.chapterNumber}>{item.number}</Text>
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
  bookHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  bookName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  grid: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  chapterButton: {
    flex: 1,
    margin: Spacing.xs,
    aspectRatio: 1,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  chapterPressed: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  chapterNumber: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
});
