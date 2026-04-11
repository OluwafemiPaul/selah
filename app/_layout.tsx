import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DatabaseProvider } from '@/contexts/database-context';
import { SettingsProvider } from '@/contexts/settings-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#EEEEEE',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={LightTheme}>
      <DatabaseProvider>
        <SettingsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="meditate/[id]"
              options={{ headerShown: false, presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="meditation/new"
              options={{
                title: 'New Meditation',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTitleStyle: { color: '#000000', fontWeight: '600' },
              }}
            />
            <Stack.Screen
              name="meditation/[id]/edit"
              options={{
                title: 'Edit Meditation',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTitleStyle: { color: '#000000', fontWeight: '600' },
              }}
            />
          </Stack>
          <StatusBar style="dark" />
        </SettingsProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
