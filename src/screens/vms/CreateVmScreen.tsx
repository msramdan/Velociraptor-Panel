import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { createVm, listHostPools, listVmImages } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Chip, Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { useNav } from '../../navigation/NavigationContext';
import { colors } from '../../theme';
import type { OsImage } from '../../types';

export function CreateVmScreen() {
  const { back } = useNav();
  const { locations, account, refreshVms } = useSession();
  const [images, setImages] = useState<OsImage[]>([]);
  const [locationSlug, setLocationSlug] = useState(locations.find((item) => item.is_preferred)?.slug || locations[0]?.slug || 'jkt01');
  const [osName, setOsName] = useState('ubuntu');
  const [osVersion, setOsVersion] = useState('22.04-lts');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [vcpu, setVcpu] = useState('2');
  const [ram, setRam] = useState('2048');
  const [disks, setDisks] = useState('20');
  const [publicIp, setPublicIp] = useState(true);
  const [loading, setLoading] = useState(false);

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
      .catch(() => undefined);
  }, []);

  const versions = useMemo(
    () => images.find((item) => item.os_name === osName)?.versions ?? [],
    [images, osName],
  );

  async function submit() {
    if (!name || !password || !username) {
      Alert.alert('Lengkapi form', 'Nama, username, dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const pools = await listHostPools(locationSlug).catch(() => []);
      const pool = pools.find((item) => item.is_default_designated) ?? pools.find((item) => item.is_visible) ?? pools[0];
      await createVm(
        {
          name,
          os_name: osName,
          os_version: osVersion,
          vcpu: Number(vcpu),
          ram: Number(ram),
          disks,
          username,
          password,
          reserve_public_ip: publicIp,
          ...(account ? { billing_account_id: account.id } : {}),
          ...(pool ? { designated_pool_uuid: pool.uuid } : {}),
        },
        locationSlug,
      );
      await refreshVms();
      Alert.alert('VPS dibuat', `${name} sedang disiapkan.`);
      back();
    } catch (error) {
      Alert.alert('Gagal membuat VPS', error instanceof Error ? error.message : 'Create VM gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Buat VPS" subtitle="Create VM IDCloudHost" onBack={back} />
      <Screen scroll>
        <SectionTitle>LOKASI</SectionTitle>
        <View style={styles.chips}>
          {locations.map((location) => (
            <Chip
              key={location.slug}
              label={location.display_name}
              active={locationSlug === location.slug}
              onPress={() => setLocationSlug(location.slug)}
            />
          ))}
        </View>

        <SectionTitle>OS</SectionTitle>
        <View style={styles.chips}>
          {images.slice(0, 10).map((image) => (
            <Chip
              key={image.os_name}
              label={image.display_name}
              active={osName === image.os_name}
              onPress={() => {
                setOsName(image.os_name);
                setOsVersion(image.versions[0]?.os_version ?? '');
              }}
            />
          ))}
        </View>
        <View style={styles.chips}>
          {versions.map((version) => (
            <Chip
              key={version.os_version}
              label={version.display_name || version.os_version}
              active={osVersion === version.os_version}
              onPress={() => setOsVersion(version.os_version)}
            />
          ))}
        </View>

        <SectionTitle>SPESIFIKASI</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Nama VPS" value={name} onChangeText={setName} placeholder="web-server" />
          <Field label="vCPU" value={vcpu} onChangeText={setVcpu} keyboardType="number-pad" />
          <Field label="RAM (MB)" value={ram} onChangeText={setRam} keyboardType="number-pad" />
          <Field label="Disk (GB)" value={disks} onChangeText={setDisks} keyboardType="number-pad" />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Reserve public IPv4</Text>
            <Switch value={publicIp} onValueChange={setPublicIp} trackColor={{ true: colors.cyan }} />
          </View>
        </Card>

        <SectionTitle>AKSES</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Username" value={username} onChangeText={setUsername} />
          <Field label="Password" value={password} onChangeText={setPassword} secure />
          <Button label="Buat VPS" loading={loading} onPress={submit} />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: colors.white, fontWeight: '600' },
});
