/**
 * Theme colors - Gnosis Green palette with dark mode first
 */
export const COLORS = {
  // Primary - Gnosis Green
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Accent - Gnosis Olive/Gold
  accent: {
    300: '#e8f5a1',
    400: '#d8eb81',
    500: '#919e3a',
    600: '#707a2d',
    700: '#5a6223',
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Dark theme (default)
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#141414',
    cardForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#27272a',
    ring: '#22c55e',
  },

  // Light theme
  light: {
    background: '#fafafa',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    ring: '#16a34a',
  },
} as const;

