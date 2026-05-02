import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';
import type { VerseRef } from '@/types';

interface BookmarkCardProps {
  verse: VerseRef;
  onMeditate: () => void;
  onRemove: () => void;
}

export function BookmarkCard({ verse, onMeditate, onRemove }: BookmarkCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.reference}>{verse.reference}</Text>
        <Pressable
          onPress={onRemove}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}
          accessibilityLabel="Remove bookmark">
          <IconSymbol name="bookmark.fill" size={18} color={Colors.accent} />
        </Pressable>
      </View>

      <Text style={styles.verseText} numberOfLines={4}>
        {verse.text}
      </Text>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.meditateButton, pressed && styles.pressed]}
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
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
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
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
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
  meditateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accentText,
    letterSpacing: 0.3,
  },
});
