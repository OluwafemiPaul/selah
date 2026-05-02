import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { BookmarksProvider } from '@/contexts/bookmarks-context';
import { DatabaseProvider } from '@/contexts/database-context';
import { HighlightsProvider } from '@/contexts/highlights-context';
import { SettingsProvider } from '@/contexts/settings-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9F6F1',
    card: '#FFFFFF',
    text: '#1C1917',
    border: '#DDD6CB',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={LightTheme}>
      <DatabaseProvider>
        <SettingsProvider>
          <BookmarksProvider>
          <HighlightsProvider>
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
                headerTitleStyle: { color: '#1C1917', fontWeight: '600' },
              }}
            />
            <Stack.Screen
              name="meditation/[id]/edit"
              options={{
                title: 'Edit Meditation',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTitleStyle: { color: '#1C1917', fontWeight: '600' },
              }}
            />
          </Stack>
          <StatusBar style="dark" />
          </HighlightsProvider>
          </BookmarksProvider>
        </SettingsProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
