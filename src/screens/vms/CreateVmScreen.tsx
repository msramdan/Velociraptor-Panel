import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { createVm, getPricingPolicy, listHostPools, listVmImages } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { OsLogo } from '../../components/ui/OsLogo';
import { PasswordField } from '../../components/ui/PasswordField';
import { Screen } from '../../components/ui/Screen';
import { SpecSlider } from '../../components/ui/SpecSlider';
import { useDialog } from '../../context/DialogContext';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../navigation/NavigationContext';
import type { HostPool, OsImage, PricingRule } from '../../types';
import { formatIdr } from '../../utils/format';
import { isValidVmPassword } from '../../utils/password';
import { estimateVmPrice } from '../../utils/vmPrice';

export function CreateVmScreen() {
  const { back } = useNav();
  const { colors } = useTheme();
  const dialog = useDialog();
  const { locations, account, refreshVms } = useSession();
  const [images, setImages] = useState<OsImage[]>([]);
  const [locationSlug, setLocationSlug] = useState(locations.find((item) => item.is_preferred)?.slug || locations[0]?.slug || 'jkt01');
  const [osName, setOsName] = useState('ubuntu');
  const [osVersion, setOsVersion] = useState('22.04-lts');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [vcpu, setVcpu] = useState(2);
  const [ramGb, setRamGb] = useState(2);
  const [diskGb, setDiskGb] = useState(20);
  const [publicIp, setPublicIp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [pools, setPools] = useState<HostPool[]>([]);
  const [poolUuid, setPoolUuid] = useState('');
  const [policy, setPolicy] = useState<PricingRule[]>([]);

  useEffect(() => {
    listVmImages()
      .then((next) => {
        setImages(next);
        const ubuntu = next.find((item) => item.os_name === 'ubuntu') ?? next[0];
        if (ubuntu) {
          setOsName(ubuntu.os_name);
          setOsVersion(ubuntu.versions[0]?.os_version ?? '');
        }
      })
      .catch(() => undefined)
      .finally(() => setImagesLoading(false));
  }, []);

  useEffect(() => {
    getPricingPolicy()
      .then(setPolicy)
      .catch(() => setPolicy([]));
  }, []);

  useEffect(() => {
    listHostPools(locationSlug)
      .then((next) => {
        const visible = next
          .filter((item) => item.is_visible !== false)
          .sort((a, b) => (a.ui_position ?? 0) - (b.ui_position ?? 0));
        const options = visible.length ? visible : next;
        setPools(options);
        const preferred =
          options.find((item) => item.is_default_designated) ?? options[0];
        if (preferred) setPoolUuid(preferred.uuid);
      })
      .catch(() => setPools([]));
  }, [locationSlug]);

  const selectedOs = images.find((item) => item.os_name === osName);
  const versions = useMemo(() => selectedOs?.versions ?? [], [selectedOs]);
  const selectedPool = pools.find((item) => item.uuid === poolUuid) ?? pools[0];
  const cpuRange = selectedPool?.guest_limits?.cpu ?? { min: 2, max: 32 };
  const ramRange = {
    min: Math.round((selectedPool?.guest_limits?.ram_mb?.min ?? 2048) / 1024),
    max: Math.round((selectedPool?.guest_limits?.ram_mb?.max ?? 65536) / 1024),
  };
  const diskRange = selectedPool?.guest_limits?.disk_gb ?? { min: 20, max: 1000 };
  const price = estimateVmPrice({
    vcpu,
    ramGb,
    diskGb,
    policy,
    poolName: selectedPool?.name,
  });

  async function submit() {
    if (!name || !password || !username) {
      await dialog.warn('Lengkapi form', 'Nama, username, dan password wajib diisi.');
      return;
    }
    if (!isValidVmPassword(password)) {
      await dialog.warn('Password belum sesuai', 'Minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.');
      return;
    }
    setLoading(true);
    try {
      const pool = selectedPool ?? pools[0];
      await createVm(
        {
          name,
          os_name: osName,
          os_version: osVersion,
          vcpu,
          ram: ramGb * 1024,
          disks: diskGb,
          username,
          password,
          reserve_public_ip: publicIp,
          ...(account ? { billing_account_id: account.id } : {}),
          ...(pool ? { designated_pool_uuid: pool.uuid } : {}),
        },
        locationSlug,
      );
      await refreshVms();
      await dialog.success('VPS dibuat', `${name} sedang disiapkan.`);
      back();
    } catch (error) {
      await dialog.error('Gagal membuat VPS', error instanceof Error ? error.message : 'Create VM gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Buat VPS" subtitle="Pilih lokasi, OS, lalu spek mesin" onBack={back} />
      <Screen scroll>
        <SectionTitle>LOKASI</SectionTitle>
        <View style={styles.grid}>
          {locations.map((location) => {
            const active = locationSlug === location.slug;
            return (
              <Pressable
                key={location.slug}
                onPress={() => setLocationSlug(location.slug)}
                style={[
                  styles.placeCard,
                  {
                    backgroundColor: colors.bgElevated,
                    borderColor: active ? colors.accent : colors.line,
                  },
                ]}
              >
                <View style={[styles.placeIcon, { backgroundColor: active ? colors.accentDim : colors.overlay }]}>
                  <Ionicons name="location-outline" size={16} color={active ? colors.accent : colors.muted} />
                </View>
                <Text style={[styles.osName, { color: colors.text }]}>{location.display_name}</Text>
                <Text style={[styles.osMeta, { color: colors.muted }]}>{location.slug}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle>SISTEM OPERASI</SectionTitle>
        <View style={styles.grid}>
          {imagesLoading
            ? [0, 1, 2, 3].map((key) => (
                <View
                  key={key}
                  style={[styles.osCard, { backgroundColor: colors.bgElevated, borderColor: colors.line }]}
                >
                  <View style={[styles.logoTile, { backgroundColor: colors.overlay }]} />
                  <View style={styles.osCopy}>
                    <View style={[styles.skeletonLine, { backgroundColor: colors.overlay }]} />
                    <View style={[styles.skeletonLine, styles.skeletonShort, { backgroundColor: colors.overlay }]} />
                  </View>
                </View>
              ))
            : images.map((image) => {
                const active = osName === image.os_name;
                return (
                  <Pressable
                    key={image.os_name}
                    onPress={() => {
                      setOsName(image.os_name);
                      setOsVersion(image.versions[0]?.os_version ?? '');
                    }}
                    style={[
                      styles.osCard,
                      {
                        backgroundColor: active ? colors.accentDim : colors.bgElevated,
                        borderColor: active ? colors.accent : colors.line,
                      },
                    ]}
                  >
                    <View style={[styles.logoTile, { backgroundColor: colors.overlay }]}>
                      <OsLogo osName={image.os_name} icon={image.icon} size={26} />
                    </View>
                    <View style={styles.osCopy}>
                      <Text style={[styles.osName, { color: colors.text }]} numberOfLines={1}>
                        {image.display_name}
                      </Text>
                      <Text style={[styles.osMeta, { color: active ? colors.accent : colors.muted }]}>
                        {image.versions.length} versi
                      </Text>
                    </View>
                    {active ? (
                      <View style={[styles.check, { backgroundColor: colors.accent }]}>
                        <Ionicons name="checkmark" size={10} color={colors.onAccent} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
        </View>

        <SectionTitle>{`VERSI ${selectedOs?.display_name?.toUpperCase() ?? 'OS'}`}</SectionTitle>
        <View style={styles.versionWrap}>
          {versions.map((version) => {
            const active = osVersion === version.os_version;
            return (
              <Pressable
                key={version.os_version}
                onPress={() => setOsVersion(version.os_version)}
                style={[
                  styles.versionCard,
                  {
                    backgroundColor: active ? colors.accentDim : colors.bgElevated,
                    borderColor: active ? colors.accent : colors.line,
                  },
                ]}
              >
                <Text style={[styles.versionText, { color: active ? colors.accent : colors.text }]}>
                  {version.display_name || version.os_version}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle>KELAS SERVER</SectionTitle>
        <View style={styles.classGrid}>
          {pools.map((pool) => {
            const active = poolUuid === pool.uuid;
            const title =
              pool.name === 'Basic' && pool.description ? `${pool.name} ${pool.description}` : pool.name;
            const subtitle = pool.name === 'Basic' ? undefined : pool.description;
            return (
              <Pressable
                key={pool.uuid}
                onPress={() => setPoolUuid(pool.uuid)}
                style={[
                  styles.classCard,
                  {
                    backgroundColor: active ? colors.accent : colors.bgElevated,
                    borderColor: active ? colors.accent : colors.line,
                  },
                ]}
              >
                <View style={[styles.classIcon, { backgroundColor: active ? 'rgba(255,248,243,0.16)' : colors.overlay }]}>
                  <Ionicons name="hardware-chip-outline" size={16} color={active ? colors.onAccent : colors.muted} />
                </View>
                <Text style={[styles.classTitle, { color: active ? colors.onAccent : colors.text }]} numberOfLines={2}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={[styles.classMeta, { color: active ? 'rgba(255,248,243,0.78)' : colors.muted }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <SectionTitle>SPESIFIKASI</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Nama VPS" value={name} onChangeText={setName} placeholder="web-server" />
        </Card>
        <View style={[styles.specCard, { backgroundColor: colors.accent }]}>
          {price ? (
            <View style={styles.priceBlock}>
              <Text style={styles.priceMonth}>{formatIdr(price.monthly)} / bulan</Text>
              <Text style={styles.priceHour}>{formatIdr(price.hourly)} / jam</Text>
              <Text style={styles.priceHint}>Estimasi dari tarif API</Text>
            </View>
          ) : null}
          <View style={styles.specSliders}>
            <SpecSlider label="CPU" value={vcpu} min={cpuRange.min} max={cpuRange.max} step={2} onChange={setVcpu} />
            <SpecSlider label="GB RAM" value={ramGb} min={ramRange.min} max={ramRange.max} step={2} onChange={setRamGb} />
            <SpecSlider
              label="GB DISK"
              value={diskGb}
              min={diskRange.min}
              max={diskRange.max}
              step={10}
              onChange={setDiskGb}
            />
          </View>
        </View>
        <Card>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Reserve public IPv4</Text>
            <Switch
              value={publicIp}
              onValueChange={setPublicIp}
              trackColor={{ false: colors.overlay, true: colors.accent }}
              thumbColor={colors.onAccent}
            />
          </View>
        </Card>

        <SectionTitle>AKSES</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Username" value={username} onChangeText={setUsername} />
          <PasswordField label="Password" value={password} onChangeText={setPassword} />
          <Button label="Buat VPS" loading={loading} onPress={submit} />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  osCard: {
    flexGrow: 1,
    flexBasis: '46%',
    maxWidth: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  logoTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  osCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 10,
    width: '78%',
    borderRadius: 5,
  },
  skeletonShort: {
    width: '44%',
    height: 8,
  },
  placeCard: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    gap: 6,
  },
  placeIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  osName: { fontSize: 13, fontWeight: '800' },
  osMeta: { fontSize: 11, fontWeight: '600' },
  versionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  versionCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  versionText: { fontSize: 13, fontWeight: '700' },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 6,
  },
  classIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classTitle: { fontSize: 13, fontWeight: '800' },
  classMeta: { fontSize: 11, fontWeight: '600' },
  specCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    marginTop: 10,
    gap: 8,
  },
  priceBlock: {
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 248, 243, 0.22)',
  },
  priceMonth: {
    color: '#FFF8F3',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  priceHour: {
    color: 'rgba(255, 248, 243, 0.78)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  priceHint: {
    color: 'rgba(255, 248, 243, 0.55)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  specSliders: {
    gap: 6,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontWeight: '600' },
});
