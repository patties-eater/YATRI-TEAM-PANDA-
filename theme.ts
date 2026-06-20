export const colors = {
  // Brand
  primary: '#F97316',
  primary1: '#F39C12',
  primary2: '#F97316',
  primary3: '#F24A1D',
  secondary: '#F39C12',

  // Surfaces
  background: '#FFFFFF',
  card: '#F3F4F6',
  surface: '#E5E7EB',
  border: '#E5E7EB',

  // Text
  text: '#1F2937',
  textMuted: '#6B7280',
  dark: '#374151',

  // Accents
  accentBlue: '#60A5FA',
  accentYellow: '#FBBF24',

  white: '#FFFFFF',
} as const;

// Brand gradient: linear-gradient(90deg, #F39C12 0%, #F24A1D 100%)
export const gradients = {
  primary: ['#F39C12', '#F24A1D'] as [string, string],
} as const;

export const font = {
  family: undefined as string | undefined,
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
