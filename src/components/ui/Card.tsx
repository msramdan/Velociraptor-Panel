import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii } from '../../theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bgElevated, borderColor: colors.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.section, { color: colors.muted }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 16,
  },
  section: {
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 18,
  },
});
