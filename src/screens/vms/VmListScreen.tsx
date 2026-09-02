import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge, vmTone } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { useNav } from '../../navigation/NavigationContext';
import { colors } from '../../theme';
import type { LocatedVm } from '../../types';
import { ramLabel } from '../../utils/format';

export function VmListScreen() {
  const { vms, refreshVms, user } = useSession();
  const { push } = useNav();
  const [refreshing, setRefreshing] = useState(false);
  const running = vms.filter((vm) => vm.status === 'running').length;
  const firstName = user?.profile_data?.first_name || 'Cloud';

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshVms();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <View style={styles.root}>
      <Header title="VPS" subtitle={`Halo ${firstName} · ${running}/${vms.length} running`} />
      <Screen
        scroll
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cyan} />}
      >
        <Pressable style={styles.create} onPress={() => push({ name: 'vm-create' })}>
          <Ionicons name="add-circle-outline" size={18} color={colors.cyan} />
          <Text style={styles.createText}>Buat VPS baru</Text>
        </Pressable>

        {vms.length === 0 ? (
          <Text style={styles.empty}>Belum ada VPS di akun ini.</Text>
        ) : (
          vms.map((vm) => <VmCard key={`${vm.locationSlug}-${vm.uuid}`} vm={vm} onPress={() => push({ name: 'vm-detail', uuid: vm.uuid, locationSlug: vm.locationSlug })} />)
        )}
      </Screen>
    </View>
  );
}

function VmCard({ vm, onPress }: { vm: LocatedVm; onPress: () => void }) {
  const disk = vm.storage?.reduce((sum, item) => sum + (item.size ?? 0), 0) ?? 0;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{vm.name}</Text>
          <Text style={styles.meta}>
            {vm.os_name} {vm.os_version} · {vm.locationName}
          </Text>
        </View>
        <Badge label={vm.status} tone={vmTone(vm.status)} />
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>{vm.vcpu} vCPU</Text>
        <Text style={styles.stat}>{ramLabel(vm.memory)}</Text>
        <Text style={styles.stat}>{disk} GB disk</Text>
      </View>
      <Text style={styles.ip}>{vm.public_ipv4 || vm.private_ipv4 || vm.hostname}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  create: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cyanDim,
  },
  createText: { color: colors.cyan, fontWeight: '700' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 48 },
  card: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { color: colors.white, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  stats: { flexDirection: 'row', gap: 14, marginTop: 12 },
  stat: { color: 'rgba(226,232,240,0.8)', fontSize: 12, fontWeight: '600' },
  ip: { marginTop: 10, color: colors.cyan, fontSize: 12, fontWeight: '600' },
});
