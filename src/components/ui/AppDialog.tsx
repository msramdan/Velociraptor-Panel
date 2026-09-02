import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii } from '../../theme';

export type DialogTone = 'success' | 'error' | 'warning' | 'info' | 'danger';

export type DialogAction = {
  id: string;
  label: string;
  variant?: 'primary' | 'ghost' | 'danger';
};

export type DialogRequest = {
  title: string;
  message?: string;
  tone?: DialogTone;
  actions?: DialogAction[];
};

const ICONS: Record<DialogTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'alert-circle',
  info: 'information-circle',
  danger: 'warning',
};

export function AppDialog({
  request,
  onAction,
}: {
  request: DialogRequest | null;
  onAction: (id: string | null) => void;
}) {
  const { colors } = useTheme();
  const tone = request?.tone ?? 'info';
  const iconColor =
    tone === 'success' ? colors.success : tone === 'error' || tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : colors.accent;

  useEffect(() => {
    if (!request) return;
    const feedback =
      tone === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : tone === 'error' || tone === 'danger'
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Warning;
    Haptics.notificationAsync(feedback).catch(() => undefined);
  }, [request, tone]);

  const actions: DialogAction[] = request?.actions?.length
    ? request.actions
    : [{ id: 'ok', label: 'OK', variant: 'primary' }];
  const stacked = actions.length > 2;

  return (
    <Modal visible={Boolean(request)} transparent animationType="fade" onRequestClose={() => onAction(null)} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable
          style={styles.dismiss}
          onPress={() => (actions.length === 1 ? onAction(actions[0].id) : undefined)}
        />
        <View style={[styles.card, { backgroundColor: colors.bgElevated, borderColor: colors.line }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
            <Ionicons name={ICONS[tone]} size={36} color={iconColor} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{request?.title}</Text>
          {request?.message ? <Text style={[styles.message, { color: colors.muted }]}>{request.message}</Text> : null}
          <View style={[styles.actions, stacked && styles.actionsStack]}>
            {actions.map((action) => {
              const variant = action.variant ?? 'primary';
              const bg =
                variant === 'danger' ? `${colors.danger}22` : variant === 'ghost' ? colors.overlay : colors.accent;
              const fg = variant === 'danger' ? colors.danger : variant === 'ghost' ? colors.text : colors.onAccent;
              return (
                <Pressable
                  key={action.id}
                  onPress={() => onAction(action.id)}
                  style={({ pressed }) => [
                    styles.action,
                    stacked && styles.actionFull,
                    { backgroundColor: bg, opacity: pressed ? 0.82 : 1 },
                  ]}
                >
                  <Text style={[styles.actionLabel, { color: fg }]}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 8, 6, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  dismiss: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    zIndex: 1,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    width: '100%',
  },
  actionsStack: {
    flexDirection: 'column-reverse',
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionFull: {
    flex: undefined,
    width: '100%',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
