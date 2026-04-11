import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookList } from '@/components/bible/book-list';
import { ChapterList } from '@/components/bible/chapter-list';
import { SearchBar } from '@/components/bible/search-bar';
import { SearchResults } from '@/components/bible/search-results';
import { VerseList } from '@/components/bible/verse-list';
import { Colors } from '@/constants/theme';
import { useBibleData } from '@/hooks/use-bible-data';
import type { Book, Chapter, VerseRef } from '@/types';

type Level = 'books' | 'chapters' | 'verses';

export default function BibleScreen() {
  const { loadChapters, loadVerses, searchVerses } = useBibleData();

  const [query, setQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<VerseRef[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [level, setLevel] = useState<Level>('books');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<VerseRef[]>([]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchMode(query.length > 0);
      return;
    }

    setIsSearchMode(true);
    setIsSearching(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchVerses(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, searchVerses]);

  const handleSelectBook = useCallback(
    async (book: Book) => {
      setSelectedBook(book);
      const loaded = await loadChapters(book.id);
      setChapters(loaded);
      setLevel('chapters');
    },
    [loadChapters]
  );

  const handleSelectChapter = useCallback(
    async (chapter: Chapter) => {
      setSelectedChapter(chapter);
      const loaded = await loadVerses(chapter.id);
      setVerses(loaded);
      setLevel('verses');
    },
    [loadVerses]
  );

  function handleSelectVerse(verse: VerseRef) {
    router.push(
      `/meditation/new?bookId=${verse.book.id}&chapter=${verse.chapter}&verse=${verse.verse}`
    );
  }

  function handleClearSearch() {
    setQuery('');
    setIsSearchMode(false);
    setSearchResults([]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SearchBar
        value={query}
        onChangeText={text => {
          setQuery(text);
          if (!text) handleClearSearch();
        }}
      />

      <View style={styles.content}>
        {isSearchMode ? (
          <SearchResults
            results={searchResults}
            isLoading={isSearching}
            query={query}
            onSelectVerse={handleSelectVerse}
          />
        ) : level === 'books' ? (
          <BookList onSelectBook={handleSelectBook} />
        ) : level === 'chapters' && selectedBook ? (
          <ChapterList
            book={selectedBook}
            chapters={chapters}
            onSelectChapter={handleSelectChapter}
            onBack={() => setLevel('books')}
          />
        ) : level === 'verses' && selectedBook && selectedChapter ? (
          <VerseList
            book={selectedBook}
            chapter={selectedChapter}
            verses={verses}
            onSelectVerse={handleSelectVerse}
            onBack={() => setLevel('chapters')}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
