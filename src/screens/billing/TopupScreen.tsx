import { useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { DUITKU_LABELS, parseLinkMethods, requestTopupInvoice } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Chip, Field } from '../../components/ui/Field';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { useNav } from '../../navigation/NavigationContext';
import { colors } from '../../theme';
import { formatIdr } from '../../utils/format';

const PRESETS = [50000, 100000, 200000, 350000];

export function TopupScreen() {
  const { back } = useNav();
  const { account, user, refreshBilling } = useSession();
  const [amount, setAmount] = useState('100000');
  const [loading, setLoading] = useState(false);

  const methods = useMemo(() => parseLinkMethods(account?.additional_data), [account]);

  async function submit() {
    if (!account) {
      Alert.alert('Billing tidak ditemukan');
      return;
    }
    const value = Number(amount);
    if (!value || value < 10000) {
      Alert.alert('Nominal tidak valid', 'Minimum topup Rp 10.000');
      return;
    }
    setLoading(true);
    try {
      await requestTopupInvoice(account.id, value);
      await refreshBilling();
      Alert.alert(
        'Invoice topup dibuat',
        `Invoice ${formatIdr(value)} dikirim ke ${account.email || user?.profile_data?.email || 'email akun'}. Bayar sesuai invoice untuk menambah kredit.`,
      );
      back();
    } catch (error) {
      Alert.alert('Topup gagal', error instanceof Error ? error.message : 'Gagal membuat invoice topup');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Header title="Topup" subtitle={`Saldo ${formatIdr(account?.credit_amount ?? 0)}`} onBack={back} />
      <Screen scroll>
        <SectionTitle>NOMINAL</SectionTitle>
        <View style={styles.chips}>
          {PRESETS.map((preset) => (
            <Chip
              key={preset}
              label={formatIdr(preset)}
              active={amount === String(preset)}
              onPress={() => setAmount(String(preset))}
            />
          ))}
        </View>
        <Card style={{ gap: 12, marginTop: 14 }}>
          <Field label="Nominal custom (IDR)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
          <Button label={`Buat invoice ${formatIdr(Number(amount) || 0)}`} loading={loading} onPress={submit} />
        </Card>

        <SectionTitle>METODE DI PANEL</SectionTitle>
        <Card>
          <Text style={styles.copy}>
            API resmi topup: request invoice transfer. Metode Duitku di akun kamu juga tersedia di panel IDCloudHost.
          </Text>
          <View style={[styles.chips, { marginTop: 12 }]}>
            {methods.map((method) => (
              <Chip key={method} label={DUITKU_LABELS[method] || method} active={false} onPress={() => undefined} />
            ))}
          </View>
          <Button
            label="Buka console IDCloudHost"
            variant="ghost"
            style={{ marginTop: 14 }}
            onPress={() => Linking.openURL('https://console.idcloudhost.com')}
          />
        </Card>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  copy: { color: colors.muted, lineHeight: 20, fontSize: 13 },
});
