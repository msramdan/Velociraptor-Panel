import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { getStoredThemePreference, setStoredThemePreference } from '../storage/secureStore';
import { palettes, type ThemeColors, type ThemePreference, type ThemeScheme } from '../theme';

type ThemeValue = {
  preference: ThemePreference;
  scheme: ThemeScheme;
  colors: ThemeColors;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function resolveScheme(preference: ThemePreference, system: ThemeScheme): ThemeScheme {
  return preference === 'system' ? system : preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme: ThemeScheme = useColorScheme() === 'light' ? 'light' : 'dark';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    getStoredThemePreference().then((stored) => {
      if (stored) setPreferenceState(stored);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setStoredThemePreference(next).catch(() => undefined);
  }, []);

  const scheme = resolveScheme(preference, systemScheme);
  const colors = palettes[scheme];

  const value = useMemo(
    () => ({ preference, scheme, colors, setPreference }),
    [preference, scheme, colors, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}

export function useThemedStyles<T extends Record<string, object>>(factory: (colors: ThemeColors) => T) {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
