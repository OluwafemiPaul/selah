import { Platform } from 'react-native';

export const Colors = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  border: '#EEEEEE',
  text: '#000000',
  textSecondary: '#555555',
  textMuted: '#999999',
  tint: '#000000',
  icon: '#888888',
  tabIconDefault: '#AAAAAA',
  tabIconSelected: '#000000',
  destructive: '#CC0000',
};

export const Fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: "Georgia, 'Times New Roman', serif",
  }) as string,
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui',
  }) as string,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
};
