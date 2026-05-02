import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

const RATE_STEPS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const PITCH_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const FONT_STEPS = [14, 16, 18, 20, 24, 28, 32];

interface StepperProps {
  value: number;
  steps: number[];
  onValueChange: (value: number) => void;
  format?: (v: number) => string;
}

export function Stepper({ value, steps, onValueChange, format }: StepperProps) {
  const currentIndex = steps.indexOf(value);
  const canDecrease = currentIndex > 0;
  const canIncrease = currentIndex < steps.length - 1;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canDecrease && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
        onPress={() => canDecrease && onValueChange(steps[currentIndex - 1])}
        disabled={!canDecrease}
        hitSlop={8}
        accessibilityLabel="Decrease">
        <Text style={[styles.buttonText, !canDecrease && styles.buttonTextDisabled]}>−</Text>
      </Pressable>

      <Text style={styles.value}>{format ? format(value) : String(value)}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canIncrease && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
        onPress={() => canIncrease && onValueChange(steps[currentIndex + 1])}
        disabled={!canIncrease}
        hitSlop={8}
        accessibilityLabel="Increase">
        <Text style={[styles.buttonText, !canIncrease && styles.buttonTextDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

export { RATE_STEPS, PITCH_STEPS, FONT_STEPS };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.accent,
    lineHeight: 22,
  },
  buttonTextDisabled: {
    color: Colors.textMuted,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.accent,
    minWidth: 40,
    textAlign: 'center',
  },
});
