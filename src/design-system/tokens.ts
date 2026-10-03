export const colors = {
  background: '#050505',
  surface: '#0E0E10',
  surfaceElevated: '#16161A',
  surfaceMuted: '#1E1E23',
  textPrimary: '#F5F5F5',
  textSecondary: '#A5A5AD',
  textMuted: '#6B6B73',
  accent: '#E10600',
  accentStrong: '#FF2D20',
  accentMuted: '#7A0B08',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#232329',
  divider: '#1A1A1F',
  overlay: 'rgba(5, 5, 5, 0.72)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 15, lineHeight: 21 },
  title: { fontSize: 18, lineHeight: 24 },
  headline: { fontSize: 24, lineHeight: 30 },
  display: { fontSize: 34, lineHeight: 40 },
} as const;

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  countdownTick: 1000,
} as const;

export const elevation = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
