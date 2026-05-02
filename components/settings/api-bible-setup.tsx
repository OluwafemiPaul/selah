import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useDB } from '@/contexts/database-context';
import { useSettings } from '@/contexts/settings-context';
import { discoverAndRegisterApiTranslations } from '@/services/api-bible';
import type { Translation } from '@/types';

export function ApiBibleSetup() {
  const { db, bumpTranslationsVersion } = useDB();
  const { settings, updateSetting } = useSettings();

  const [draftKey, setDraftKey] = useState(settings.apiBibleKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<Translation[]>([]);

  const isConnected = settings.apiBibleKey.length > 0 && found.length > 0;

  async function handleConnect() {
    if (!db || !draftKey.trim()) return;
    setLoading(true);
    setError(null);
    setFound([]);
    try {
      const registered = await discoverAndRegisterApiTranslations(db, draftKey.trim());
      if (registered.length === 0) {
        setError('No supported translations found for this API key. Make sure you have access to NKJV, NIV, NLT, AMP, or The Message on scripture.api.bible.');
        return;
      }
      await updateSetting('apiBibleKey', draftKey.trim());
      bumpTranslationsVersion();
      setFound(registered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect. Check your API key and internet connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    await updateSetting('apiBibleKey', '');
    setDraftKey('');
    setFound([]);
    setError(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Get a free key at scripture.api.bible to unlock NKJV, NIV, NLT, AMP, and The Message.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draftKey}
          onChangeText={setDraftKey}
          placeholder="Paste your API key here"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={settings.apiBibleKey.length > 0}
          editable={!loading}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {found.length > 0 ? (
        <Text style={styles.success}>
          Connected — {found.map(t => t.code.toUpperCase()).join(', ')} unlocked
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={loading || !draftKey.trim()}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : (
            <Text style={styles.buttonText}>Connect</Text>
          )}
        </Pressable>

        {settings.apiBibleKey ? (
          <Pressable
            style={({ pressed }) => [styles.buttonOutline, pressed && styles.buttonPressed]}
            onPress={handleDisconnect}>
            <Text style={styles.buttonOutlineText}>Disconnect</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  inputRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  input: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  error: {
    fontSize: 13,
    color: Colors.destructive,
    lineHeight: 18,
  },
  success: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accentText,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  buttonOutlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
