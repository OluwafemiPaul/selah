import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { NT_BOOKS, OT_BOOKS } from '@/constants/bible';
import type { Book } from '@/types';

interface BookListProps {
  onSelectBook: (book: Book) => void;
}

const SECTIONS = [
  { title: 'Old Testament', data: OT_BOOKS },
  { title: 'New Testament', data: NT_BOOKS },
];

export function BookList({ onSelectBook }: BookListProps) {
  return (
    <SectionList
      sections={SECTIONS}
      keyExtractor={item => String(item.id)}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => onSelectBook(item)}>
          <Text style={styles.bookName}>{item.name}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
      stickySectionHeadersEnabled
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  rowPressed: {
    backgroundColor: Colors.surface,
  },
  bookName: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: Fonts.serif,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
  },
});
