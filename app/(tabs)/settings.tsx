import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiBibleSetup } from '@/components/settings/api-bible-setup';
import { SettingsRow } from '@/components/settings/settings-row';
import { FONT_STEPS, PITCH_STEPS, RATE_STEPS, Stepper } from '@/components/settings/speed-slider';
import { TranslationPicker } from '@/components/settings/translation-picker';
import { VoicePicker } from '@/components/settings/voice-picker';
import { Colors, Fonts, Shadows, Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/settings-context';

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSetting } = useSettings();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Playback" />

        <SettingsRow
          label="Speech Speed"
          description={`${settings.ttsRate}× — affects how fast the verse is read`}>
          <Stepper
            value={settings.ttsRate}
            steps={RATE_STEPS}
            onValueChange={v => updateSetting('ttsRate', v)}
            format={v => `${v}×`}
          />
        </SettingsRow>

        <SettingsRow
          label="Speech Pitch"
          description={`${settings.ttsPitch} — adjusts the voice pitch`}>
          <Stepper
            value={settings.ttsPitch}
            steps={PITCH_STEPS}
            onValueChange={v => updateSetting('ttsPitch', v)}
            format={v => String(v)}
          />
        </SettingsRow>

        <SettingsRow
          label="Voice"
          description="Choose the reading voice">
          <VoicePicker />
        </SettingsRow>

        <SectionHeader title="Bible" />

        <SettingsRow
          label="Translation"
          description="Which version to read and browse">
          <TranslationPicker />
        </SettingsRow>

        <SectionHeader title="Online Translations" />

        <SettingsRow
          label="API.Bible"
          description="Connect to unlock NKJV, NIV, NLT, AMP, and The Message">
          <ApiBibleSetup />
        </SettingsRow>

        <SectionHeader title="Display" />

        <SettingsRow label="Verse Font Size" description={`${settings.fontSize}pt`}>
          <Stepper
            value={settings.fontSize}
            steps={FONT_STEPS}
            onValueChange={v => updateSetting('fontSize', v)}
            format={v => `${v}pt`}
          />
        </SettingsRow>

        <SectionHeader title="About" />

        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App</Text>
          <Text style={[styles.aboutValue, styles.italic]}>Selah</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceRaised,
    ...Shadows.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  scroll: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  aboutLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  aboutValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  italic: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
  },
});
