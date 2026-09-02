import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { getUnpaidAmount, listCredits, listInvoices } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { useSession } from '../../context/SessionContext';
import { useNav } from '../../navigation/NavigationContext';
import { colors } from '../../theme';
import type { CreditRecord, Invoice } from '../../types';
import { formatIdr, formatUnix, invoiceStatusLabel } from '../../utils/format';

export function BillingScreen() {
  const { account, refreshBilling } = useSession();
  const { push } = useNav();
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
    <View style={styles.root}>
      <Header title="Billing" subtitle={account?.title || 'Akun IDCloudHost'} />
      <Screen scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cyan} />}>
        <Card>
          <Text style={styles.kicker}>Saldo kredit</Text>
          <Text style={styles.balance}>{formatIdr(credit)}</Text>
          <View style={styles.metrics}>
            <Metric label="Usage berjalan" value={formatIdr(ongoing)} />
            <Metric label="Tagihan belum dibayar" value={formatIdr(unpaid)} />
          </View>
          <View style={styles.badgeRow}>
            <Badge label={account?.status || account?.restriction_level || 'ACTIVE'} tone="cyan" />
            <Badge label={`PPN ${account?.vat_percentage ?? 11}%`} tone="muted" />
          </View>
          <Button label="Topup kredit" onPress={() => push({ name: 'topup' })} style={{ marginTop: 16 }} />
        </Card>

        <SectionTitle>MUTASI KREDIT</SectionTitle>
        <Card>
          {credits.length === 0 ? (
            <Text style={styles.empty}>Belum ada mutasi.</Text>
          ) : (
            credits.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.description}</Text>
                  <Text style={styles.rowMeta}>{formatUnix(item.created)}</Text>
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
            <Text style={styles.empty}>Tidak ada invoice.</Text>
          ) : (
            invoices.map((invoice) => (
              <View key={invoice.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{invoice.document_number || `#${invoice.id}`}</Text>
                  <Text style={styles.rowMeta}>Jatuh tempo {formatUnix(invoice.due_date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.amount}>{formatIdr(invoice.totals?.total ?? 0)}</Text>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  kicker: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  balance: { color: colors.white, fontSize: 32, fontWeight: '800', marginTop: 6 },
  metrics: { flexDirection: 'row', gap: 16, marginTop: 16 },
  metricLabel: { color: colors.muted, fontSize: 12 },
  metricValue: { color: colors.white, fontSize: 16, fontWeight: '700', marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  empty: { color: colors.muted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowTitle: { color: colors.white, fontWeight: '700', fontSize: 13 },
  rowMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  amount: { color: colors.white, fontWeight: '800', fontSize: 13 },
});
