'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme';

/**
 * Get system color scheme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve theme to actual light/dark value
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * Theme provider component
 * Handles theme state, persistence, and system preference sync
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  // Initialize theme from storage or use default
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored && ['light', 'dark', 'system'].includes(stored) ? stored : defaultTheme;
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const initialResolved = resolveTheme(getInitialTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(initialResolved);
  const [mounted, setMounted] = useState(false);

  // Apply theme on mount and set mounted flag
  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [theme]);

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? 'dark' : 'light';
      // Update state in callback - this is intentional for theme sync with system preference
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);

    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

