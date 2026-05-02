import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookmarkCard } from '@/components/saved/bookmark-card';
import { HighlightCard } from '@/components/saved/highlight-card';
import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';
import { useBookmarks } from '@/contexts/bookmarks-context';
import { useHighlights } from '@/contexts/highlights-context';
import type { HighlightColor, VerseRef } from '@/types';

type Segment = 'bookmarks' | 'highlights';

export default function SavedScreen() {
  const { loadBookmarkedVerses, removeBookmark } = useBookmarks();
  const { loadHighlightedVerses, removeHighlight } = useHighlights();
  const [segment, setSegment] = useState<Segment>('bookmarks');
  const [bookmarkedVerses, setBookmarkedVerses] = useState<VerseRef[]>([]);
  const [highlightedVerses, setHighlightedVerses] = useState<Array<VerseRef & { color: HighlightColor }>>([]);

  useFocusEffect(
    useCallback(() => {
      loadBookmarkedVerses().then(setBookmarkedVerses);
      loadHighlightedVerses().then(setHighlightedVerses);
    }, [loadBookmarkedVerses, loadHighlightedVerses])
  );

  function handleRemoveBookmark(verseId: number) {
    removeBookmark(verseId);
    setBookmarkedVerses(prev => prev.filter(v => v.id !== verseId));
  }

  function handleRemoveHighlight(verseId: number) {
    removeHighlight(verseId);
    setHighlightedVerses(prev => prev.filter(v => v.id !== verseId));
  }

  function handleMeditate(verse: VerseRef) {
    router.push({
      pathname: '/meditation/new',
      params: { verseIds: String(verse.id) },
    });
  }

  const showingBookmarks = segment === 'bookmarks';
  const isEmpty = showingBookmarks ? bookmarkedVerses.length === 0 : highlightedVerses.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>

      <View style={styles.segmentBar}>
        <Pressable
          style={[styles.segmentBtn, segment === 'bookmarks' && styles.segmentActive]}
          onPress={() => setSegment('bookmarks')}>
          <Text style={[styles.segmentLabel, segment === 'bookmarks' && styles.segmentLabelActive]}>
            Bookmarks
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, segment === 'highlights' && styles.segmentActive]}
          onPress={() => setSegment('highlights')}>
          <Text style={[styles.segmentLabel, segment === 'highlights' && styles.segmentLabelActive]}>
            Highlights
          </Text>
        </Pressable>
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptySymbol}>{showingBookmarks ? '✦' : '○'}</Text>
          <Text style={styles.emptyHeading}>
            {showingBookmarks ? 'No bookmarks yet' : 'No highlights yet'}
          </Text>
          <Text style={styles.emptyBody}>
            {showingBookmarks
              ? 'Tap the bookmark icon on any verse while reading the Bible to save it here.'
              : 'Tap the circle icon on any verse while reading the Bible to color-highlight it.'}
          </Text>
        </View>
      ) : showingBookmarks ? (
        <FlatList
          data={bookmarkedVerses}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BookmarkCard
              verse={item}
              onMeditate={() => handleMeditate(item)}
              onRemove={() => handleRemoveBookmark(item.id)}
            />
          )}
        />
      ) : (
        <FlatList
          data={highlightedVerses}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HighlightCard
              verse={item}
              onMeditate={() => handleMeditate(item)}
              onRemove={() => handleRemoveHighlight(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceRaised,
    ...Shadows.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.surfaceRaised,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  segmentLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  list: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  emptySymbol: {
    fontSize: 40,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 15,
    fontFamily: Fonts.serif,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
