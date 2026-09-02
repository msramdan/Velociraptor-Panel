import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useDialog } from '../../context/DialogContext';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import type { ThemePreference } from '../../theme';

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'system', label: 'Sistem', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Terang', icon: 'sunny-outline' },
  { key: 'dark', label: 'Gelap', icon: 'moon-outline' },
];

export function ProfileScreen() {
  const { user, vms, account, patchUserProfile } = useSession();
  const { colors, preference, setPreference } = useTheme();
  const dialog = useDialog();
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
      await dialog.success('Tersimpan', 'Profil IDCloudHost diperbarui.');
    } catch (error) {
      await dialog.error('Gagal menyimpan', error instanceof Error ? error.message : 'Update profil gagal');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Header title="Profil" subtitle={profile?.email || user?.name} />
      <Screen scroll>
        <Card style={styles.hero}>
          <Image
            source={profile?.avatar ? { uri: profile.avatar } : require('../../../assets/icon.png')}
            style={[styles.avatar, { backgroundColor: colors.surface }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{profile?.email}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {vms.length} VPS · {account?.title || 'Billing account'}
            </Text>
          </View>
        </Card>

        <SectionTitle>TAMPILAN</SectionTitle>
        <Card>
          <Text style={[styles.meta, { color: colors.muted, marginBottom: 12 }]}>Mode terang dan gelap, tanpa kontras berlebihan.</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((option) => {
              const active = preference === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setPreference(option.key)}
                  style={[
                    styles.themeTile,
                    {
                      backgroundColor: active ? colors.accentDim : colors.overlay,
                      borderColor: active ? colors.accent : colors.line,
                    },
                  ]}
                >
                  <Ionicons name={option.icon} size={18} color={active ? colors.accent : colors.muted} />
                  <Text style={{ color: active ? colors.accent : colors.text, fontWeight: '700', fontSize: 12 }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
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
  root: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 20, fontWeight: '800' },
  meta: { marginTop: 4, fontSize: 13 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
});
