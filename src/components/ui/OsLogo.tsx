import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useTheme } from '../../context/ThemeContext';
import { osIcon } from '../../utils/osMeta';

function decodeSvg(icon?: string): string | null {
  if (!icon) return null;
  const raw = icon.trim();
  if (raw.startsWith('<svg') || raw.startsWith('<?xml')) return raw;

  const dataSvg = raw.match(/^data:image\/svg\+xml([^,]*),(.+)$/i);
  if (dataSvg) {
    const meta = dataSvg[1] ?? '';
    const payload = dataSvg[2] ?? '';
    try {
      const xml = /base64/i.test(meta)
        ? globalThis.atob(payload.replace(/\s/g, ''))
        : decodeURIComponent(payload);
      return xml.includes('<svg') ? xml : null;
    } catch {
      return null;
    }
  }

  try {
    const decoded = globalThis.atob(raw.replace(/\s/g, ''));
    return decoded.includes('<svg') ? decoded : null;
  } catch {
    return null;
  }
}

function isRasterUri(icon?: string) {
  if (!icon) return false;
  const raw = icon.trim();
  return /^https?:\/\//i.test(raw) || /^data:image\/(png|jpe?g|webp|gif)/i.test(raw);
}

export function OsLogo({
  osName,
  icon,
  size = 36,
}: {
  osName: string;
  icon?: string;
  size?: number;
}) {
  const { colors } = useTheme();
  const xml = useMemo(() => decodeSvg(icon), [icon]);

  if (xml) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <SvgXml xml={xml} width={size} height={size} />
      </View>
    );
  }

  if (isRasterUri(icon)) {
    return (
      <Image
        source={{ uri: icon }}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: colors.overlay }]}>
      <Ionicons name={osIcon(osName)} size={Math.round(size * 0.55)} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
