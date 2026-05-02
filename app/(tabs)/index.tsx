import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyLibrary } from '@/components/library/empty-library';
import { MeditationCard } from '@/components/library/meditation-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Spacing } from '@/constants/theme';
import { useMeditation } from '@/hooks/use-meditation';
import type { Meditation } from '@/types';

export default function LibraryScreen() {
  const { meditations, refresh, deleteMeditation } = useMeditation();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  function handleDelete(meditation: Meditation) {
    Alert.alert(
      'Delete Meditation',
      `Delete "${meditation.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMeditation(meditation.id),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>Selah</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
          onPress={() => router.push('/meditation/new')}
          accessibilityLabel="Add meditation"
          hitSlop={8}>
          <IconSymbol name="plus" size={22} color={Colors.accent} />
        </Pressable>
      </View>

      {meditations.length === 0 ? (
        <EmptyLibrary onBrowse={() => router.replace('/(tabs)/bible')} />
      ) : (
        <FlatList
          data={meditations}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MeditationCard
              meditation={item}
              onPress={() => router.push(`/meditate/${item.id}`)}
              onEdit={() => router.push(`/meditation/${item.id}/edit`)}
              onDelete={() => handleDelete(item)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceRaised,
    ...Shadows.sm,
  },
  wordmark: {
    fontSize: 34,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPressed: {
    opacity: 0.6,
  },
  list: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
