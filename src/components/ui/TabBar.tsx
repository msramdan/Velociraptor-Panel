import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useNav, type TabName } from '../../navigation/NavigationContext';

const TABS: { key: TabName; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'vms', label: 'VPS', icon: 'server-outline', iconActive: 'server' },
  { key: 'billing', label: 'Billing', icon: 'wallet-outline', iconActive: 'wallet' },
  { key: 'profile', label: 'Profil', icon: 'person-outline', iconActive: 'person' },
];

export function TabBar() {
  const insets = useSafeAreaInsets();
  const { route, switchTab } = useNav();
  const { colors } = useTheme();
  const active = route.name === 'profile' ? 'profile' : route.name.startsWith('vm') ? 'vms' : 'billing';

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10), backgroundColor: colors.bg }]}>
      <View style={[styles.bar, { backgroundColor: colors.tabBar, borderColor: colors.line }]}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const color = isActive ? colors.accent : colors.muted;
          return (
            <Pressable
              key={tab.key}
              onPress={() => switchTab(tab.key)}
              style={[styles.item, isActive && { backgroundColor: colors.accentDim }]}
            >
              <Ionicons name={isActive ? tab.iconActive : tab.icon} size={20} color={color} />
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 22,
    padding: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 8,
    borderRadius: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
