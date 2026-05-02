import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { TTSStatus } from '@/types';

interface PlayerControlsProps {
  status: TTSStatus;
  canPause: boolean;
  onToggle: () => void;
  onStop: () => void;
}

export function PlayerControls({ status, canPause, onToggle, onStop }: PlayerControlsProps) {
  const isPlaying = status === 'playing';

  return (
    <View style={styles.container}>
      {/* Stop button */}
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={onStop}
        hitSlop={8}
        accessibilityLabel="Stop"
        accessibilityRole="button">
        <IconSymbol name="stop.fill" size={20} color={Colors.textSecondary} />
      </Pressable>

      {/* Play / Pause button */}
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={onToggle}
        hitSlop={8}
        accessibilityLabel={isPlaying ? (canPause ? 'Pause' : 'Stop') : 'Play'}
        accessibilityRole="button">
        <IconSymbol
          name={isPlaying ? 'pause.fill' : 'play.fill'}
          size={28}
          color={Colors.accentText}
        />
      </Pressable>

      {/* Spacer to center the primary button */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 44,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
});
