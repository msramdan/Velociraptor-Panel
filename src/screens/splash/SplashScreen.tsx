import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as NativeSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { SplashStatus } from '../../components/splash/SplashStatus';
import { useSession } from '../../context/SessionContext';
import { darkColors } from '../../theme';

NativeSplash.preventAutoHideAsync().catch(() => undefined);

export function SplashScreen({ onRetry }: { onRetry?: () => void }) {
  const splash = useSession();
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    NativeSplash.hideAsync().catch(() => undefined);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.heroClip} pointerEvents="none">
        <Image
          source={require('../../../assets/splash-hero.png')}
          style={styles.hero}
          contentFit="cover"
          contentPosition="top"
        />
        <LinearGradient
          colors={['transparent', 'rgba(18,19,17,0.2)', darkColors.bg]}
          locations={[0.52, 0.78, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.View
        style={[styles.footer, { opacity: fade, transform: [{ translateY: rise }] }]}
      >
        <SplashStatus
          phase={splash.phase}
          label={splash.label}
          vmCount={splash.vms.length}
          runningCount={splash.vms.filter((vm) => vm.status === 'running').length}
          error={splash.error}
        />
        {splash.phase === 'error' && onRetry ? (
          <Pressable onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>Coba lagi</Text>
          </Pressable>
        ) : (
          <Text style={styles.hint}>
            {splash.phase === 'ready' ? 'Masuk ke konsol...' : 'Direct API · header apikey'}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: darkColors.bg,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  heroClip: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  hero: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.92,
  },
  footer: {
    marginTop: 'auto',
    gap: 14,
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(226,232,240,0.4)',
    fontSize: 12,
  },
  retry: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryText: {
    color: darkColors.accent,
    fontWeight: '700',
  },
});
