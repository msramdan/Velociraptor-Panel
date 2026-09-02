import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import {
  addDisk,
  changeVmPassword,
  deleteVm,
  getVm,
  listHostPools,
  modifyDisk,
  modifyVm,
  reinstallVm,
  releasePublicIp,
  reservePublicIp,
  startVm,
  stopVm,
  toggleBackup,
} from '../../api';
import { ActionTile } from '../../components/ui/ActionTile';
import { Badge, vmTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { InfoRow } from '../../components/ui/InfoRow';
import { PasswordField } from '../../components/ui/PasswordField';
import { Screen } from '../../components/ui/Screen';
import { ServerArt } from '../../components/ui/ServerArt';
import { SpecSlider } from '../../components/ui/SpecSlider';
import { useDialog } from '../../context/DialogContext';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../navigation/NavigationContext';
import type { HostPool, VirtualMachine } from '../../types';
import { ramLabel } from '../../utils/format';
import { isValidVmPassword } from '../../utils/password';

function evenStep(value: number, min = 2) {
  return Math.max(min, Math.round(value / 2) * 2);
}

export function VmDetailScreen({ uuid, locationSlug }: { uuid: string; locationSlug: string }) {
  const { back } = useNav();
  const { colors } = useTheme();
  const dialog = useDialog();
  const { vms, refreshVms, locations } = useSession();
  const listed = vms.find((vm) => vm.uuid === uuid);
  const locationName = listed?.locationName ?? locations.find((item) => item.slug === locationSlug)?.display_name ?? locationSlug;
  const [vm, setVm] = useState<VirtualMachine | null>(listed ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState(listed?.name ?? '');
  const [vcpu, setVcpu] = useState(evenStep(listed?.vcpu ?? 2));
  const [ramGb, setRamGb] = useState(evenStep(Math.round((listed?.memory ?? 2048) / 1024)));
  const [password, setPassword] = useState('');
  const [diskGb, setDiskGb] = useState('20');
  const [resizeGb, setResizeGb] = useState('');
  const [pool, setPool] = useState<HostPool | null>(null);

  async function reload() {
    const next = await getVm(uuid, locationSlug);
    setVm(next);
    setName(next.name);
    setVcpu(evenStep(next.vcpu));
    setRamGb(evenStep(Math.round(next.memory / 1024)));
    const primary = next.storage?.find((disk) => disk.primary) ?? next.storage?.[0];
    if (primary) setResizeGb(String(primary.size));
  }

  useEffect(() => {
    reload().catch((error) => {
      void dialog.error('Gagal memuat VM', error.message);
    });
    listHostPools(locationSlug)
      .then((pools) => {
        const match =
          pools.find((item) => item.uuid === listed?.designated_pool_uuid) ??
          pools.find((item) => item.is_default_designated) ??
          pools.find((item) => item.is_visible) ??
          pools[0];
        setPool(match ?? null);
      })
      .catch(() => setPool(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, locationSlug]);

  async function run(key: string, task: () => Promise<unknown>, success?: string, skipReload = false) {
    setBusy(key);
    try {
      await task();
      if (!skipReload) {
        await reload();
        await refreshVms();
      }
      if (success) await dialog.success('Berhasil', success);
    } catch (error) {
      await dialog.error('Gagal', error instanceof Error ? error.message : 'Aksi VM gagal');
    } finally {
      setBusy(null);
    }
  }

  if (!vm) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <Header title="Detail VPS" onBack={back} />
        <Text style={[styles.muted, { color: colors.muted }]}>Memuat...</Text>
      </View>
    );
  }

  const primaryDisk = vm.storage?.find((disk) => disk.primary) ?? vm.storage?.[0];
  const stopped = vm.status === 'stopped';
  const ip = vm.public_ipv4 || vm.private_ipv4 || '—';
  const cpuRange = pool?.guest_limits?.cpu ?? { min: 2, max: 32 };
  const ramRange = {
    min: evenStep(Math.round((pool?.guest_limits?.ram_mb?.min ?? 2048) / 1024)),
    max: evenStep(Math.round((pool?.guest_limits?.ram_mb?.max ?? 65536) / 1024)),
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title={vm.name}
        subtitle={`${locationName} · ${vm.os_name} ${vm.os_version}`}
        onBack={back}
        right={<Badge label={vm.status} tone={vmTone(vm.status)} />}
      />
      <Screen scroll>
        <View style={styles.hero}>
          <ServerArt size={72} />
        </View>
        <Card>
          <InfoRow icon="desktop-outline" label="Hostname" value={vm.hostname} />
          <InfoRow icon="globe-outline" label="IP" value={ip} onPress={() => Clipboard.setStringAsync(String(ip))} />
          <InfoRow icon="person-outline" label="Username" value={vm.username} />
          <InfoRow icon="hardware-chip-outline" label="vCPU / RAM" value={`${vm.vcpu} / ${ramLabel(vm.memory)}`} />
          <InfoRow icon="disc-outline" label="Disk" value={`${primaryDisk?.size ?? 0} GB ${primaryDisk?.name ?? ''}`} />
          <InfoRow icon="cloud-outline" label="Backup" value={vm.backup ? 'Aktif' : 'Mati'} />
        </Card>

        <SectionTitle>POWER</SectionTitle>
        <View style={styles.rowBtns}>
          <ActionTile
            icon="play"
            label="Start"
            tone="success"
            loading={busy === 'start'}
            disabled={vm.status === 'running'}
            onPress={() => run('start', () => startVm(uuid, locationSlug), 'VM dinyalakan')}
          />
          <ActionTile
            icon="stop"
            label="Stop"
            loading={busy === 'stop'}
            disabled={stopped}
            onPress={async () => {
              const choice = await dialog.show({
                title: 'Matikan VM?',
                message: 'ACPI shutdown (graceful). Force stop mematikan langsung.',
                tone: 'warning',
                actions: [
                  { id: 'cancel', label: 'Batal', variant: 'ghost' },
                  { id: 'force', label: 'Force stop', variant: 'danger' },
                  { id: 'stop', label: 'Stop', variant: 'primary' },
                ],
              });
              if (choice === 'stop') {
                void run('stop', () => stopVm(uuid, locationSlug, false), 'VM dimatikan');
              }
              if (choice === 'force') {
                void run('stop', () => stopVm(uuid, locationSlug, true), 'VM di-force stop');
              }
            }}
          />
        </View>

        <SectionTitle>SPESIFIKASI</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Nama" value={name} onChangeText={setName} />
        </Card>
        <View style={[styles.specCard, { backgroundColor: colors.accent }]}>
          <SpecSlider
            label="CPU"
            value={vcpu}
            min={cpuRange.min}
            max={cpuRange.max}
            step={2}
            onChange={setVcpu}
            disabled={!stopped}
          />
          <SpecSlider
            label="GB RAM"
            value={ramGb}
            min={ramRange.min}
            max={ramRange.max}
            step={2}
            onChange={setRamGb}
            disabled={!stopped}
          />
        </View>
        <Card style={{ gap: 12, marginTop: 10 }}>
          <Text style={[styles.hint, { color: colors.muted }]}>vCPU dan RAM hanya bisa diubah saat VM stopped. Kelipatan 2.</Text>
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
                      ...(stopped ? { vcpu, ram: ramGb * 1024 } : {}),
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
          <PasswordField label={`Password user ${vm.username}`} value={password} onChangeText={setPassword} />
          <Button
            label="Ganti password"
            loading={busy === 'password'}
            disabled={!password}
            onPress={() => {
              if (!isValidVmPassword(password)) {
                void dialog.warn('Password belum sesuai', 'Minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.');
                return;
              }
              void run('password', () => changeVmPassword(uuid, password, vm.username, locationSlug), 'Password diganti');
            }}
          />
        </Card>

        <SectionTitle>DISK</SectionTitle>
        <Card style={{ gap: 12 }}>
          {vm.storage?.map((disk) => (
            <InfoRow
              key={disk.uuid}
              icon="disc-outline"
              label={disk.primary ? `${disk.name} · primary` : disk.name}
              value={`${disk.size} GB`}
            />
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
          <ActionTile
            icon="globe-outline"
            label={vm.public_ipv4 ? 'Lepas IP' : 'Reserve IP'}
            loading={busy === 'ip'}
            onPress={() =>
              run(
                'ip',
                () => (vm.public_ipv4 ? releasePublicIp(uuid, locationSlug) : reservePublicIp(uuid, locationSlug)),
                'IP publik diperbarui',
              )
            }
          />
          <ActionTile
            icon="cloud-outline"
            label={vm.backup ? 'Backup off' : 'Backup on'}
            loading={busy === 'backup'}
            onPress={() => run('backup', () => toggleBackup(uuid, locationSlug), 'Backup diperbarui')}
          />
        </View>

        <SectionTitle>BAHAYA</SectionTitle>
        <View style={{ gap: 10, marginBottom: 24 }}>
          <Button
            label="Reinstall OS"
            variant="danger"
            loading={busy === 'reinstall'}
            onPress={async () => {
              const ok = await dialog.confirm({
                title: 'Reinstall VM?',
                message: 'Disk OS akan ditimpa image baru. Data hilang.',
                confirmLabel: 'Reinstall',
                tone: 'danger',
                confirmVariant: 'danger',
              });
              if (ok) {
                void run('reinstall', () => reinstallVm(uuid, locationSlug), 'Reinstall dimulai');
              }
            }}
          />
          <Button
            label="Hapus VM"
            variant="danger"
            loading={busy === 'delete'}
            onPress={async () => {
              const ok = await dialog.confirm({
                title: 'Hapus VM permanen?',
                message: vm.name,
                confirmLabel: 'Hapus',
                tone: 'danger',
                confirmVariant: 'danger',
              });
              if (ok) {
                void run(
                  'delete',
                  async () => {
                    await deleteVm(uuid, locationSlug);
                    await refreshVms();
                    back();
                  },
                  'VM dihapus',
                  true,
                );
              }
            }}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: 'center', marginBottom: 14 },
  muted: { textAlign: 'center', marginTop: 40 },
  rowBtns: { flexDirection: 'row', gap: 10 },
  hint: { fontSize: 12, lineHeight: 18 },
  specCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginTop: 10,
    gap: 6,
  },
});
