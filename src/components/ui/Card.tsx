import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radii } from '../../theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 16,
  },
  section: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 18,
  },
});
