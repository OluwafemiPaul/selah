import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

interface EmptyLibraryProps {
  onBrowse: () => void;
}

export function EmptyLibrary({ onBrowse }: EmptyLibraryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>✦</Text>
      <Text style={styles.heading}>No meditations yet</Text>
      <Text style={styles.body}>
        Browse the Bible to find a verse, or add your own text to begin meditating.
      </Text>
      <Text style={styles.cta} onPress={onBrowse}>
        Browse the Bible →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  symbol: {
    fontSize: 40,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    fontFamily: Fonts.serif,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
    marginTop: Spacing.sm,
  },
});
