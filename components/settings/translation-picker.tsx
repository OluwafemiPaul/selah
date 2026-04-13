import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/settings-context';
import { useBibleData } from '@/hooks/use-bible-data';

export function TranslationPicker() {
  const { settings, updateSetting } = useSettings();
  const { translations } = useBibleData();
  const [modalVisible, setModalVisible] = useState(false);

  const current = translations.find(t => t.code === settings.bibleTranslation);
  const displayName = current?.name ?? settings.bibleTranslation.toUpperCase();

  function select(code: string) {
    updateSetting('bibleTranslation', code);
    setModalVisible(false);
  }

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.selector, pressed && styles.selectorPressed]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Selected translation: ${displayName}. Tap to change.`}>
        <Text style={styles.selectedName}>{displayName}</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bible Translation</Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={12}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {translations.map(t => (
              <Pressable
                key={t.code}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => select(t.code)}
                accessibilityRole="button">
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{t.name}</Text>
                  <Text style={styles.rowCode}>{t.code.toUpperCase()}</Text>
                </View>
                {settings.bibleTranslation === t.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorPressed: {
    opacity: 0.6,
  },
  selectedName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  done: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowPressed: {
    backgroundColor: Colors.surface,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    color: Colors.text,
  },
  rowCode: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
});
