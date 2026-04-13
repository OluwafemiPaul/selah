import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/settings-context';

export function VoicePicker() {
  const { settings, updateSetting } = useSettings();
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(allVoices => {
      const english = allVoices.filter(v => v.language.startsWith('en'));
      // Enhanced quality first, then alphabetically by name
      english.sort((a, b) => {
        if (a.quality !== b.quality) {
          return a.quality === 'Enhanced' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      setVoices(english);
    });
  }, []);

  const currentVoice = voices.find(v => v.identifier === settings.ttsVoice);
  const displayName = currentVoice ? currentVoice.name : 'System Default';

  function select(identifier: string | null) {
    updateSetting('ttsVoice', identifier);
    setModalVisible(false);
  }

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.selector, pressed && styles.selectorPressed]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Selected voice: ${displayName}. Tap to change.`}>
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
            <Text style={styles.modalTitle}>Select Voice</Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={12}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Pressable
              style={({ pressed }) => [styles.voiceRow, pressed && styles.voiceRowPressed]}
              onPress={() => select(null)}
              accessibilityRole="button">
              <View style={styles.voiceInfo}>
                <Text style={styles.voiceName}>System Default</Text>
                <Text style={styles.voiceDetail}>Device default voice</Text>
              </View>
              {settings.ttsVoice === null && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>

            {voices.map(voice => (
              <Pressable
                key={voice.identifier}
                style={({ pressed }) => [styles.voiceRow, pressed && styles.voiceRowPressed]}
                onPress={() => select(voice.identifier)}
                accessibilityRole="button">
                <View style={styles.voiceInfo}>
                  <Text style={styles.voiceName}>{voice.name}</Text>
                  <Text style={styles.voiceDetail}>
                    {voice.language}
                    {voice.quality === 'Enhanced' ? ' · Enhanced' : ''}
                  </Text>
                </View>
                {settings.ttsVoice === voice.identifier && (
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
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  voiceRowPressed: {
    backgroundColor: Colors.surface,
  },
  voiceInfo: {
    flex: 1,
    gap: 2,
  },
  voiceName: {
    fontSize: 15,
    color: Colors.text,
  },
  voiceDetail: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
});
