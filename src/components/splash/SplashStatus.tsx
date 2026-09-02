import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from './BrandMark';
import type { SplashPhase } from '../../context/SessionContext';
import { darkColors, radii } from '../../theme';

const LABELS: Record<SplashPhase, string> = {
  booting: 'BOOT',
  connecting: 'AUTH',
  syncing: 'SYNC',
  ready: 'ONLINE',
  error: 'ERROR',
};

export function SplashStatus({
  phase,
  label,
  vmCount,
  runningCount,
  error,
}: {
  phase: SplashPhase;
  label: string;
  vmCount: number;
  runningCount: number;
  error: string | null;
}) {
  const tone = phase === 'error' ? darkColors.danger : phase === 'ready' ? darkColors.success : darkColors.accent;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: tone }]} />
        <Text style={[styles.badge, { color: tone }]}>{LABELS[phase]}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      {phase === 'ready' ? (
        <Text style={styles.meta}>
          {runningCount}/{vmCount} VPS running · IDCloudHost
        </Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.meta}>Direct API · apikey header</Text>
      )}
      <View style={styles.loader}>
        <BrandMark phase={phase} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(18, 19, 17, 0.78)',
    borderWidth: 1,
    borderColor: darkColors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: '700',
  },
  label: {
    color: darkColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    marginTop: 6,
    color: darkColors.muted,
    fontSize: 13,
  },
  error: {
    marginTop: 6,
    color: darkColors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  loader: {
    marginTop: 16,
  },
});
