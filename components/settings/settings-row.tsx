import { StyleSheet, Text, View, type ReactNode } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelGroup}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <View style={styles.control}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  labelGroup: {
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  description: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  control: {
    marginTop: 2,
  },
});
