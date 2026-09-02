import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export function StatChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: colors.overlay }]}>
      <Ionicons name={icon} size={13} color={colors.muted} />
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
