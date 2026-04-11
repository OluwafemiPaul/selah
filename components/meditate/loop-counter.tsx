import { StyleSheet, Text } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

interface LoopCounterProps {
  count: number;
}

export function LoopCounter({ count }: LoopCounterProps) {
  if (count === 0) return null;

  return (
    <Text style={styles.counter} accessibilityLabel={`Looped ${count} times`}>
      {count === 1 ? 'Loop 1' : `Loop ${count}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontSize: 13,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
