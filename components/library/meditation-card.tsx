import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Meditation } from '@/types';

interface MeditationCardProps {
  meditation: Meditation;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MeditationCard({ meditation, onPress, onEdit, onDelete }: MeditationCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      <View style={styles.header}>
        {meditation.verseRef ? (
          <Text style={styles.reference}>{meditation.verseRef}</Text>
        ) : (
          <Text style={styles.customBadge}>Custom text</Text>
        )}
        <Text style={styles.date}>{formatDate(meditation.updatedAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {meditation.title}
      </Text>

      <Text style={styles.preview} numberOfLines={2}>
        {meditation.verseText}
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          onPress={onPress}
          hitSlop={8}>
          <Text style={styles.meditateLabel}>Meditate</Text>
        </Pressable>
        <View style={styles.actionRight}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.actionPressed]}
            onPress={onEdit}
            hitSlop={8}>
            <Text style={styles.actionIcon}>Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.actionPressed]}
            onPress={onDelete}
            hitSlop={8}>
            <Text style={[styles.actionIcon, styles.deleteAction]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
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
  cardPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  reference: {
    fontSize: 11,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customBadge: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  preview: {
    fontSize: 14,
    fontFamily: Fonts.serif,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
  },
  actionPressed: {
    opacity: 0.6,
  },
  meditateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accentText,
    letterSpacing: 0.3,
  },
  actionRight: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconButton: {
    paddingVertical: 4,
  },
  actionIcon: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deleteAction: {
    color: Colors.destructive,
  },
});
