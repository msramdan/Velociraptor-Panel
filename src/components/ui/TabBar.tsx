import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNav, type TabName } from '../../navigation/NavigationContext';
import { colors } from '../../theme';

const TABS: { key: TabName; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'vms', label: 'VPS', icon: 'server-outline' },
  { key: 'billing', label: 'Billing', icon: 'wallet-outline' },
  { key: 'profile', label: 'Profil', icon: 'person-outline' },
];

export function TabBar() {
  const insets = useSafeAreaInsets();
  const { route, switchTab } = useNav();
  const active = route.name === 'topup' ? 'billing' : route.name.startsWith('vm') ? 'vms' : route.name === 'profile' ? 'profile' : 'billing';

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable key={tab.key} onPress={() => switchTab(tab.key)} style={styles.item}>
            <Ionicons name={tab.icon} size={20} color={isActive ? colors.cyan : colors.muted} />
            <Text style={[styles.label, isActive && styles.active]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#0C0D0B',
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  active: {
    color: colors.cyan,
  },
});
