/**
 * Border radius theme configuration
 * Friendly rounded borders (12px default)
 */
export const RADIUS = {
  none: '0px',
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px - default
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px - cards, modals
  '3xl': '2rem', // 32px - large containers
  full: '9999px', // pills, avatars
} as const;

export const DEFAULT_RADIUS = RADIUS.lg;

