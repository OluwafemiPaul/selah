import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoopCounter } from '@/components/meditate/loop-counter';
import { PlayerControls } from '@/components/meditate/player-controls';
import { VerseDisplay } from '@/components/meditate/verse-display';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/settings-context';
import { useMeditation } from '@/hooks/use-meditation';
import { useTTS } from '@/hooks/use-tts';
import type { Meditation } from '@/types';

export default function MeditateScreen() {
  useKeepAwake();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMeditation } = useMeditation();
  const { settings } = useSettings();

  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    getMeditation(parseInt(id, 10)).then(setMeditation);
  }, [id, getMeditation]);

  const tts = useTTS({
    text: meditation?.verseText ?? '',
    rate: settings.ttsRate,
    pitch: settings.ttsPitch,
    voice: settings.ttsVoice,
  });

  // Auto-start once meditation is loaded
  useEffect(() => {
    if (meditation && !hasStartedRef.current) {
      hasStartedRef.current = true;
      tts.play();
    }
  }, [meditation, tts]);

  // Navigate back after stop
  useEffect(() => {
    if (tts.status === 'stopped' && hasStartedRef.current) {
      const timeout = setTimeout(() => {
        router.back();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [tts.status]);

  function handleStop() {
    tts.stop();
  }

  if (!meditation) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar hidden />
        <ActivityIndicator color={Colors.textMuted} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar hidden />

      {/* Close button */}
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
        onPress={handleStop}
        hitSlop={12}
        accessibilityLabel="Stop and close"
        accessibilityRole="button">
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      {/* Verse */}
      <VerseDisplay
        verseRef={meditation.verseRef}
        verseText={meditation.verseText}
        fontSize={settings.fontSize}
      />

      {/* Loop counter */}
      <View style={styles.counterContainer}>
        <LoopCounter count={tts.loopCount} />
      </View>

      {/* Player controls */}
      <PlayerControls
        status={tts.status}
        canPause={tts.canPause}
        onToggle={tts.toggle}
        onStop={handleStop}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.md,
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: {
    opacity: 0.5,
  },
  closeText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  counterContainer: {
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
});
