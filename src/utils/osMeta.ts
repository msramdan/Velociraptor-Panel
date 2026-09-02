import { Ionicons } from '@expo/vector-icons';

type IonName = keyof typeof Ionicons.glyphMap;

export function osIcon(osName?: string): IonName {
  const key = (osName ?? '').toLowerCase();
  if (key.includes('ubuntu')) return 'terminal-outline';
  if (key.includes('debian')) return 'planet-outline';
  if (key.includes('windows')) return 'logo-windows';
  if (key.includes('centos') || key.includes('alma') || key.includes('rocky')) return 'cube-outline';
  if (key.includes('fedora')) return 'ellipse-outline';
  return 'server-outline';
}

export function osLabel(osName?: string, version?: string) {
  const name = osName ? osName.charAt(0).toUpperCase() + osName.slice(1) : 'Custom';
  return version ? `${name} ${version}` : name;
}
