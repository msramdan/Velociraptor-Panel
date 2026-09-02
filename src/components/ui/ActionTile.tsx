import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export function ActionTile({
  icon,
  label,
  onPress,
  tone = 'default',
  disabled,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useTheme();
  const accent = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.tile,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.line,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        {loading ? <ActivityIndicator color={accent} size="small" /> : <Ionicons name={icon} size={18} color={accent} />}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
