export const Colors = {
  // Backgrounds
  background: '#0A0A0B',
  surface: '#121216',
  surfaceLight: '#18181F',
  surfaceCard: 'rgba(255, 255, 255, 0.04)',
  surfaceModal: '#0F0F13',

  // Primary & Luxury Accents
  gold: '#D4AF37',
  goldLight: '#F3E5AB',
  goldDark: '#997D22',
  goldGlow: 'rgba(212, 175, 55, 0.15)',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0AB',
  textMuted: '#6B6B7A',
  textGold: '#E5C158',

  // Status & Feedback
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',
  purple: '#8B5CF6',

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderGold: 'rgba(212, 175, 55, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.75)',
  shimmer: 'rgba(255, 255, 255, 0.05)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.textPrimary, letterSpacing: 0.2 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.textPrimary, letterSpacing: 0.1 },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.textPrimary },
  h4: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  body1: { fontSize: 15, fontWeight: '400' as const, color: Colors.textPrimary, lineHeight: 22 },
  body2: { fontSize: 13, fontWeight: '400' as const, color: Colors.textSecondary, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, color: Colors.textMuted },
  mono: { fontFamily: 'monospace', fontSize: 12, color: Colors.textPrimary },
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goldGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
};
