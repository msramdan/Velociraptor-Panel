import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  addDisk,
  changeVmPassword,
  deleteVm,
  getVm,
  modifyDisk,
  modifyVm,
  reinstallVm,
  releasePublicIp,
  reservePublicIp,
  startVm,
  stopVm,
  toggleBackup,
} from '../../api';
import { Badge, vmTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { useNav } from '../../navigation/NavigationContext';
import { colors } from '../../theme';
import type { VirtualMachine } from '../../types';
import { ramLabel } from '../../utils/format';

export function VmDetailScreen({ uuid, locationSlug }: { uuid: string; locationSlug: string }) {
  const { back } = useNav();
  const { vms, refreshVms, locations } = useSession();
  const listed = vms.find((vm) => vm.uuid === uuid);
  const locationName = listed?.locationName ?? locations.find((item) => item.slug === locationSlug)?.display_name ?? locationSlug;
  const [vm, setVm] = useState<VirtualMachine | null>(listed ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState(listed?.name ?? '');
  const [vcpu, setVcpu] = useState(String(listed?.vcpu ?? 2));
  const [ram, setRam] = useState(String(listed?.memory ?? 2048));
  const [password, setPassword] = useState('');
  const [diskGb, setDiskGb] = useState('20');
  const [resizeGb, setResizeGb] = useState('');

  async function reload() {
    const next = await getVm(uuid, locationSlug);
    setVm(next);
    setName(next.name);
    setVcpu(String(next.vcpu));
    setRam(String(next.memory));
    const primary = next.storage?.find((disk) => disk.primary) ?? next.storage?.[0];
    if (primary) setResizeGb(String(primary.size));
  }

  useEffect(() => {
    reload().catch((error) => Alert.alert('Gagal memuat VM', error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, locationSlug]);

  async function run(key: string, task: () => Promise<unknown>, success?: string) {
    setBusy(key);
    try {
      await task();
      await reload();
      await refreshVms();
      if (success) Alert.alert('Berhasil', success);
    } catch (error) {
      Alert.alert('Gagal', error instanceof Error ? error.message : 'Aksi VM gagal');
    } finally {
      setBusy(null);
    }
  }

  if (!vm) {
    return (
      <View style={styles.root}>
        <Header title="Detail VPS" onBack={back} />
        <Text style={styles.muted}>Memuat...</Text>
      </View>
    );
  }

  const primaryDisk = vm.storage?.find((disk) => disk.primary) ?? vm.storage?.[0];
  const stopped = vm.status === 'stopped';
  const ip = vm.public_ipv4 || vm.private_ipv4 || '—';

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title={vm.name}
        subtitle={`${locationName} · ${vm.os_name} ${vm.os_version}`}
        onBack={back}
        right={<Badge label={vm.status} tone={vmTone(vm.status)} />}
      />
      <Screen scroll>
        <Card>
          <Row label="Hostname" value={vm.hostname} />
          <Row
            label="IP"
            value={ip}
            onCopy={() => Clipboard.setStringAsync(String(ip))}
          />
          <Row label="Username" value={vm.username} />
          <Row label="vCPU / RAM" value={`${vm.vcpu} / ${ramLabel(vm.memory)}`} />
          <Row label="Disk" value={`${primaryDisk?.size ?? 0} GB ${primaryDisk?.name ?? ''}`} />
          <Row label="Backup" value={vm.backup ? 'Aktif' : 'Mati'} />
        </Card>

        <SectionTitle>POWER</SectionTitle>
        <View style={styles.rowBtns}>
          <Button
            label="Start"
            variant="success"
            loading={busy === 'start'}
            disabled={vm.status === 'running'}
            onPress={() => run('start', () => startVm(uuid, locationSlug), 'VM dinyalakan')}
            style={styles.flex}
          />
          <Button
            label="Stop"
            variant="ghost"
            loading={busy === 'stop'}
            disabled={stopped}
            onPress={() =>
              Alert.alert('Matikan VM?', 'ACPI shutdown (graceful).', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Stop', onPress: () => run('stop', () => stopVm(uuid, locationSlug, false), 'VM dimatikan') },
                { text: 'Force', style: 'destructive', onPress: () => run('stop', () => stopVm(uuid, locationSlug, true), 'VM di-force stop') },
              ])
            }
            style={styles.flex}
          />
        </View>

        <SectionTitle>SPESIFIKASI</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Nama" value={name} onChangeText={setName} />
          <Field label="vCPU" value={vcpu} onChangeText={setVcpu} keyboardType="number-pad" editable={stopped} />
          <Field label="RAM (MB)" value={ram} onChangeText={setRam} keyboardType="number-pad" editable={stopped} />
          <Text style={styles.hint}>vCPU dan RAM hanya bisa diubah saat VM stopped.</Text>
          <Button
            label="Simpan perubahan"
            loading={busy === 'modify'}
            onPress={() =>
              run(
                'modify',
                () =>
                  modifyVm(
                    {
                      uuid,
                      name,
                      ...(stopped ? { vcpu: Number(vcpu), ram: Number(ram) } : {}),
                    },
                    locationSlug,
                  ),
                'Spesifikasi diperbarui',
              )
            }
          />
        </Card>

        <SectionTitle>PASSWORD</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label={`Password user ${vm.username}`} value={password} onChangeText={setPassword} secure />
          <Button
            label="Ganti password"
            loading={busy === 'password'}
            disabled={!password}
            onPress={() =>
              run('password', () => changeVmPassword(uuid, password, vm.username, locationSlug), 'Password diganti')
            }
          />
        </Card>

        <SectionTitle>DISK</SectionTitle>
        <Card style={{ gap: 12 }}>
          {vm.storage?.map((disk) => (
            <Text key={disk.uuid} style={styles.disk}>
              {disk.name} · {disk.size} GB {disk.primary ? '· primary' : ''}
            </Text>
          ))}
          <Field label="Tambah disk (GB)" value={diskGb} onChangeText={setDiskGb} keyboardType="number-pad" />
          <Button
            label="Tambah disk"
            variant="ghost"
            loading={busy === 'add-disk'}
            onPress={() => run('add-disk', () => addDisk(uuid, Number(diskGb), locationSlug), 'Disk ditambahkan')}
          />
          {primaryDisk ? (
            <>
              <Field label={`Resize ${primaryDisk.name} (GB, tidak boleh lebih kecil)`} value={resizeGb} onChangeText={setResizeGb} keyboardType="number-pad" />
              <Button
                label="Resize disk"
                variant="ghost"
                loading={busy === 'resize'}
                onPress={() =>
                  run('resize', () => modifyDisk(uuid, primaryDisk.uuid, Number(resizeGb), locationSlug), 'Disk diresize')
                }
              />
            </>
          ) : null}
        </Card>

        <SectionTitle>JARINGAN & BACKUP</SectionTitle>
        <View style={styles.rowBtns}>
          <Button
            label={vm.public_ipv4 ? 'Lepas IP publik' : 'Reserve IP publik'}
            variant="ghost"
            loading={busy === 'ip'}
            onPress={() =>
              run(
                'ip',
                () => (vm.public_ipv4 ? releasePublicIp(uuid, locationSlug) : reservePublicIp(uuid, locationSlug)),
                'IP publik diperbarui',
              )
            }
            style={styles.flex}
          />
          <Button
            label={vm.backup ? 'Matikan backup' : 'Nyalakan backup'}
            variant="ghost"
            loading={busy === 'backup'}
            onPress={() => run('backup', () => toggleBackup(uuid, locationSlug), 'Backup diperbarui')}
            style={styles.flex}
          />
        </View>

        <SectionTitle>BAHAYA</SectionTitle>
        <View style={{ gap: 10, marginBottom: 24 }}>
          <Button
            label="Reinstall OS"
            variant="danger"
            loading={busy === 'reinstall'}
            onPress={() =>
              Alert.alert('Reinstall VM?', 'Disk OS akan ditimpa image baru. Data hilang.', [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Reinstall',
                  style: 'destructive',
                  onPress: () => run('reinstall', () => reinstallVm(uuid, locationSlug), 'Reinstall dimulai'),
                },
              ])
            }
          />
          <Button
            label="Hapus VM"
            variant="danger"
            loading={busy === 'delete'}
            onPress={() =>
              Alert.alert('Hapus VM permanen?', vm.name, [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  style: 'destructive',
                  onPress: () =>
                    run(
                      'delete',
                      async () => {
                        await deleteVm(uuid, locationSlug);
                        await refreshVms();
                        back();
                      },
                      'VM dihapus',
                    ),
                },
              ])
            }
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.k}>{label}</Text>
      <Text style={styles.v} onPress={onCopy}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  muted: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  rowBtns: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  disk: { color: colors.white, fontSize: 13 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  k: { color: colors.muted, fontSize: 13 },
  v: { color: colors.white, fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
});
