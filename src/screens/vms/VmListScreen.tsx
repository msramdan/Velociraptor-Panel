import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ServerArt } from '../../components/ui/ServerArt';
import { StatChip } from '../../components/ui/StatChip';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../navigation/NavigationContext';
import type { LocatedVm } from '../../types';
import { ramLabel } from '../../utils/format';
import { osIcon, osLabel } from '../../utils/osMeta';

export function VmListScreen() {
  const { vms, refreshVms, user } = useSession();
  const { colors } = useTheme();
  const { push } = useNav();
  const [refreshing, setRefreshing] = useState(false);
  const running = vms.filter((vm) => vm.status === 'running').length;
  const stopped = vms.length - running;
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
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Header title="VPS" subtitle={`Halo ${firstName}`} />
      <Screen
        scroll
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.overview}>
          <OverviewTile icon="flash-outline" label="Running" value={String(running)} tone={colors.success} />
          <OverviewTile icon="pause-outline" label="Stopped" value={String(stopped)} tone={colors.muted} />
          <OverviewTile icon="server-outline" label="Total" value={String(vms.length)} tone={colors.accent} />
        </View>

        <Pressable
          style={[styles.create, { borderColor: colors.line, backgroundColor: colors.bgElevated }]}
          onPress={() => push({ name: 'vm-create' })}
        >
          <View style={[styles.createIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="add" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.createTitle, { color: colors.text }]}>Deploy VPS</Text>
            <Text style={[styles.createMeta, { color: colors.muted }]}>Buat mesin baru di lokasi pilihan</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>

        {vms.length === 0 ? (
          <View style={styles.empty}>
            <ServerArt size={88} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada mesin</Text>
            <Text style={[styles.emptyMeta, { color: colors.muted }]}>Deploy VPS pertama dari tombol di atas.</Text>
          </View>
        ) : (
          vms.map((vm) => (
            <VmCard
              key={`${vm.locationSlug}-${vm.uuid}`}
              vm={vm}
              onPress={() => push({ name: 'vm-detail', uuid: vm.uuid, locationSlug: vm.locationSlug })}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

function OverviewTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.overviewTile, { backgroundColor: colors.bgElevated, borderColor: colors.line }]}>
      <Ionicons name={icon} size={16} color={tone} />
      <Text style={[styles.overviewValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.overviewLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function VmCard({ vm, onPress }: { vm: LocatedVm; onPress: () => void }) {
  const { colors } = useTheme();
  const disk = vm.storage?.reduce((sum, item) => sum + (item.size ?? 0), 0) ?? 0;
  const live = vm.status === 'running';
  const ip = vm.public_ipv4 || vm.private_ipv4 || vm.hostname;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.bgElevated, borderColor: colors.line }]}
    >
      <View style={styles.cardTop}>
        <View>
          <ServerArt size={58} />
          <View style={[styles.pulse, { backgroundColor: live ? colors.success : colors.muted, borderColor: colors.bgElevated }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {vm.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name={osIcon(vm.os_name)} size={13} color={colors.muted} />
            <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
              {osLabel(vm.os_name, vm.os_version)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.muted} />
            <Text style={[styles.meta, { color: colors.muted }]}>{vm.locationName}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </View>

      <View style={styles.stats}>
        <StatChip icon="hardware-chip-outline" label={`${vm.vcpu} vCPU`} />
        <StatChip icon="speedometer-outline" label={ramLabel(vm.memory)} />
        <StatChip icon="disc-outline" label={`${disk} GB`} />
      </View>

      <View style={[styles.ipRow, { backgroundColor: colors.overlay }]}>
        <Ionicons name="globe-outline" size={14} color={colors.accent} />
        <Text style={[styles.ip, { color: colors.text }]} numberOfLines={1}>
          {ip}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overview: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  overviewTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  overviewValue: { fontSize: 20, fontWeight: '800' },
  overviewLabel: { fontSize: 11, fontWeight: '600' },
  create: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTitle: { fontWeight: '800', fontSize: 15 },
  createMeta: { marginTop: 2, fontSize: 12 },
  empty: { alignItems: 'center', gap: 8, marginTop: 36 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyMeta: { fontSize: 13, textAlign: 'center' },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pulse: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  name: { fontSize: 16, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  meta: { fontSize: 12, flexShrink: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  ipRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ip: { fontSize: 12, fontWeight: '700', flex: 1 },
});
