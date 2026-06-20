import { Platform } from 'react-native';

export const colors = {
  primary: '#F97316',
  primary1: '#F39C12',
  primary2: '#F97316',
  primary3: '#F24A1D',
  secondary: '#F39C12',

  background: '#FFFFFF',
  card: '#F3F4F6',
  surface: '#E5E7EB',
  border: '#E5E7EB',

  text: '#1F2937',
  textMuted: '#6B7280',
  dark: '#374151',

  accentBlue: '#60A5FA',
  accentYellow: '#FBBF24',

  white: '#FFFFFF',
} as const;

export const gradients = {
  primary: ['#F39C12', '#F24A1D'] as [string, string],
} as const;

export const fontFamily = Platform.select({
  ios: 'Times New Roman',
  android: 'serif',
  default: 'Times New Roman',
}) as string;

export const font = {
  family: fontFamily,
  sizes: {
    title: 30,
    tagline: 14,
    label: 12,
    body: 15,
    button: 16,
    small: 12,
  },
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const spacing = (n: number): number => n * 4;
