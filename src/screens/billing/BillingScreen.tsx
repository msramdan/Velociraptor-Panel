import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { getUnpaidAmount, listCredits, listInvoices } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { WalletArt } from '../../components/ui/ServerArt';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import type { CreditRecord, Invoice } from '../../types';
import { formatIdr, formatUnix, invoiceStatusLabel } from '../../utils/format';

export function BillingScreen() {
  const { account, refreshBilling } = useSession();
  const { colors } = useTheme();
  const [unpaid, setUnpaid] = useState(0);
  const [credits, setCredits] = useState<CreditRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!account) return;
    const [nextUnpaid, nextCredits, nextInvoices] = await Promise.all([
      getUnpaidAmount(account.id),
      listCredits(account.id),
      listInvoices(account.id),
    ]);
    setUnpaid(nextUnpaid);
    setCredits(nextCredits.slice(0, 8));
    setInvoices(nextInvoices.slice(0, 8));
  }, [account]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshBilling();
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  const credit = account?.credit_amount ?? 0;
  const ongoing = account?.precalc_ongoing ?? account?.running_totals?.ongoing ?? 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Header title="Billing" subtitle={account?.title || 'Akun IDCloudHost'} />
      <Screen
        scroll
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <Card>
          <View style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: colors.muted }]}>Saldo kredit</Text>
              <Text style={[styles.balance, { color: colors.text }]}>{formatIdr(credit)}</Text>
              <Badge label={account?.status || account?.restriction_level || 'ACTIVE'} tone="accent" />
            </View>
            <WalletArt size={76} />
          </View>
          <View style={styles.metrics}>
            <Metric icon="trending-up-outline" label="Usage berjalan" value={formatIdr(ongoing)} />
            <Metric icon="alert-circle-outline" label="Belum dibayar" value={formatIdr(unpaid)} />
          </View>
        </Card>

        <SectionTitle>MUTASI KREDIT</SectionTitle>
        <Card>
          {credits.length === 0 ? (
            <Text style={{ color: colors.muted }}>Belum ada mutasi.</Text>
          ) : (
            credits.map((item) => (
              <View key={item.id} style={[styles.row, { borderBottomColor: colors.line }]}>
                <View style={[styles.rowIcon, { backgroundColor: item.amount >= 0 ? `${colors.success}22` : `${colors.danger}22` }]}>
                  <Ionicons
                    name={item.amount >= 0 ? 'arrow-down-outline' : 'arrow-up-outline'}
                    size={16}
                    color={item.amount >= 0 ? colors.success : colors.danger}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{item.description}</Text>
                  <Text style={[styles.rowMeta, { color: colors.muted }]}>{formatUnix(item.created)}</Text>
                </View>
                <Text style={[styles.amount, { color: item.amount >= 0 ? colors.success : colors.danger }]}>
                  {item.amount >= 0 ? '+' : ''}
                  {formatIdr(item.amount)}
                </Text>
              </View>
            ))
          )}
        </Card>

        <SectionTitle>INVOICE</SectionTitle>
        <Card>
          {invoices.length === 0 ? (
            <Text style={{ color: colors.muted }}>Tidak ada invoice.</Text>
          ) : (
            invoices.map((invoice) => (
              <View key={invoice.id} style={[styles.row, { borderBottomColor: colors.line }]}>
                <View style={[styles.rowIcon, { backgroundColor: colors.overlay }]}>
                  <Ionicons name="document-text-outline" size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{invoice.document_number || `#${invoice.id}`}</Text>
                  <Text style={[styles.rowMeta, { color: colors.muted }]}>Jatuh tempo {formatUnix(invoice.due_date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.amount, { color: colors.text }]}>{formatIdr(invoice.totals?.total ?? 0)}</Text>
                  <Badge label={invoiceStatusLabel(invoice.status)} tone={invoice.status === 10 ? 'success' : 'warning'} />
                </View>
              </View>
            ))
          )}
        </Card>
      </Screen>
    </View>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: colors.overlay }]}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  balance: { fontSize: 30, fontWeight: '800', marginTop: 6, marginBottom: 10 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metric: { flex: 1, borderRadius: 14, padding: 12, gap: 6 },
  metricLabel: { fontSize: 11 },
  metricValue: { fontSize: 14, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontWeight: '700', fontSize: 13 },
  rowMeta: { fontSize: 11, marginTop: 3 },
  amount: { fontWeight: '800', fontSize: 13 },
});
