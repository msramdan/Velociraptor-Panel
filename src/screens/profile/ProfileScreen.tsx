import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { colors } from '../../theme';

export function ProfileScreen() {
  const { user, vms, account, patchUserProfile } = useSession();
  const profile = user?.profile_data;
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [phone, setPhone] = useState(profile?.phone_number ?? '');
  const [personalId, setPersonalId] = useState(profile?.personal_id_number ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await patchUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        personal_id_number: personalId || undefined,
      });
      Alert.alert('Tersimpan', 'Profil IDCloudHost diperbarui.');
    } catch (error) {
      Alert.alert('Gagal menyimpan', error instanceof Error ? error.message : 'Update profil gagal');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <Header title="Profil" subtitle={profile?.email || user?.name} />
      <Screen scroll>
        <Card style={styles.hero}>
          <Image
            source={profile?.avatar ? { uri: profile.avatar } : require('../../../assets/icon.png')}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text style={styles.meta}>{profile?.email}</Text>
            <Text style={styles.meta}>{vms.length} VPS · {account?.title || 'Billing account'}</Text>
          </View>
        </Card>

        <SectionTitle>DATA USER</SectionTitle>
        <Card style={{ gap: 12 }}>
          <Field label="Nama depan" value={firstName} onChangeText={setFirstName} />
          <Field label="Nama belakang" value={lastName} onChangeText={setLastName} />
          <Field label="No. HP" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="NIK / ID" value={personalId} onChangeText={setPersonalId} />
          <Button label="Simpan profil" loading={saving} onPress={save} />
        </Card>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.navy },
  name: { color: colors.white, fontSize: 20, fontWeight: '800' },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
});
