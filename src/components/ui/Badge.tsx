import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii } from '../../theme';

export function Badge({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: 'success' | 'danger' | 'warning' | 'muted' | 'accent' | 'cyan';
}) {
  const { colors } = useTheme();
  const color = {
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    muted: colors.muted,
    accent: colors.accent,
    cyan: colors.accent,
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

export function vmTone(status: string): 'success' | 'danger' | 'warning' | 'muted' {
  if (status === 'running') return 'success';
  if (status === 'stopped') return 'danger';
  return 'warning';
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
