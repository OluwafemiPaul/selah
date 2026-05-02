import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIGHLIGHT_COLORS } from '@/contexts/highlights-context';
import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';
import type { HighlightColor, VerseRef } from '@/types';

interface HighlightCardProps {
  verse: VerseRef & { color: HighlightColor };
  onMeditate: () => void;
  onRemove: () => void;
}

export function HighlightCard({ verse, onMeditate, onRemove }: HighlightCardProps) {
  const { bg, border } = HIGHLIGHT_COLORS[verse.color];
  return (
    <View style={[styles.card, { backgroundColor: bg, borderLeftColor: border }]}>
      <View style={styles.header}>
        <Text style={[styles.reference, { color: border }]}>{verse.reference}</Text>
        <Pressable
          onPress={onRemove}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}
          accessibilityLabel="Remove highlight">
          <View style={[styles.colorDot, { backgroundColor: border }]} />
        </Pressable>
      </View>

      <Text style={styles.verseText} numberOfLines={4}>
        {verse.text}
      </Text>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.meditateButton, pressed && styles.meditatePressed]}
          onPress={onMeditate}
          hitSlop={8}>
          <Text style={styles.meditateLabel}>Meditate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  reference: {
    fontSize: 12,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pressed: {
    opacity: 0.6,
  },
  verseText: {
    fontSize: 15,
    fontFamily: Fonts.serif,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  meditateButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
  },
  meditatePressed: {
    opacity: 0.8,
  },
  meditateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accentText,
    letterSpacing: 0.3,
  },
});
