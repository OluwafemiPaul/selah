import { Platform } from 'react-native';

export const Colors = {
  background: '#F9F6F1',
  surface: '#EDE8E0',
  surfaceRaised: '#FFFFFF',
  border: '#DDD6CB',
  text: '#1C1917',
  textSecondary: '#735F52',
  textMuted: '#A8948A',
  accent: '#5046E5',
  accentLight: '#EEF0FF',
  accentText: '#FFFFFF',
  tint: '#5046E5',
  icon: '#8C7B6E',
  tabIconDefault: '#B8A99A',
  tabIconSelected: '#5046E5',
  destructive: '#DC2626',
};

export const Shadows = {
  sm: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },
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
