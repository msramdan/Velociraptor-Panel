import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export function ServerArt({ size = 64, style }: { size?: number; style?: ViewStyle }) {
  const { scheme } = useTheme();
  const source =
    scheme === 'light'
      ? require('../../../assets/illustrations/server-light.png')
      : require('../../../assets/illustrations/server-dark.png');

  return (
    <View style={[{ width: size, height: size, borderRadius: size * 0.28, overflow: 'hidden' }, style]}>
      <Image source={source} style={styles.image} contentFit="cover" />
    </View>
  );
}

export function WalletArt({ size = 72, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size * 0.28, overflow: 'hidden' }, style]}>
      <Image source={require('../../../assets/illustrations/wallet.png')} style={styles.image} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
