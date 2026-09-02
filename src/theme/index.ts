export type ThemeScheme = 'light' | 'dark';
export type ThemePreference = ThemeScheme | 'system';

export type ThemeColors = {
  bg: string;
  bgElevated: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentDim: string;
  gold: string;
  tabBar: string;
  inputBg: string;
  overlay: string;
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
  placeholder: string;
};

export const darkColors: ThemeColors = {
  bg: '#121311',
  bgElevated: '#1C1D1A',
  surface: '#242622',
  text: '#F1EFEA',
  muted: '#8E8F89',
  line: 'rgba(241, 239, 234, 0.08)',
  accent: '#C4622D',
  accentDim: 'rgba(196, 98, 45, 0.14)',
  gold: '#B89B6A',
  tabBar: '#161715',
  inputBg: '#171816',
  overlay: 'rgba(241, 239, 234, 0.08)',
  onAccent: '#FFF8F3',
  success: '#4A9A7A',
  warning: '#C4A15A',
  danger: '#C47A74',
  placeholder: 'rgba(142, 143, 137, 0.75)',
};

export const lightColors: ThemeColors = {
  bg: '#F4F1EB',
  bgElevated: '#FFFCF7',
  surface: '#EBE7DF',
  text: '#1E1D1A',
  muted: '#6E6C66',
  line: 'rgba(30, 29, 26, 0.08)',
  accent: '#B24E24',
  accentDim: 'rgba(178, 78, 36, 0.10)',
  gold: '#8F7344',
  tabBar: '#FFFCF7',
  inputBg: '#F7F4EE',
  overlay: 'rgba(30, 29, 26, 0.05)',
  onAccent: '#FFF8F3',
  success: '#2E7A5C',
  warning: '#A07C32',
  danger: '#B05A54',
  placeholder: 'rgba(110, 108, 102, 0.7)',
};

export const palettes: Record<ThemeScheme, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;
