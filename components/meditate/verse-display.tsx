import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

interface VerseDisplayProps {
  verseRef: string | null;
  verseText: string;
  fontSize: number;
}

export function VerseDisplay({ verseRef, verseText, fontSize }: VerseDisplayProps) {
  return (
    <View style={styles.container}>
      {verseRef ? (
        <Text style={styles.reference}>{verseRef}</Text>
      ) : null}
      <Text style={[styles.verseText, { fontSize, lineHeight: fontSize * 1.6 }]}>
        {verseText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  reference: {
    fontSize: 13,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  verseText: {
    fontFamily: Fonts.serif,
    color: Colors.text,
    textAlign: 'center',
  },
});
