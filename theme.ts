export const colors = {
  primary: '#778873',
  secondary: '#A1BC98',
  surface: '#DCCFC0',
  background: '#FDF6ED',

  card: '#FFFFFF',
  text: '#3A3A35',
  textMuted: '#8A8577',
  white: '#FFFFFF',
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
