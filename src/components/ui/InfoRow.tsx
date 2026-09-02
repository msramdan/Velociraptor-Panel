import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export function InfoRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: colors.overlay }]}>
        <Ionicons name={icon} size={15} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]} onPress={onPress}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600' },
  value: { fontSize: 14, fontWeight: '700', marginTop: 2 },
});
