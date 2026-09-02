import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as NativeSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '../../components/splash/BrandMark';
import { GlowOrb } from '../../components/splash/GlowOrb';
import { SplashStatus } from '../../components/splash/SplashStatus';
import { useSession } from '../../context/SessionContext';
import { colors } from '../../theme';

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
      <Image source={require('../../../assets/splash-hero.png')} style={styles.hero} contentFit="cover" />
      <LinearGradient
        colors={['rgba(7,8,6,0.28)', 'rgba(7,8,6,0.62)', '#070806']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.stage}>
        <GlowOrb size={280} />
        <GlowOrb size={170} delay={700} />
        <BrandMark />
      </View>

      <Animated.View style={[styles.copy, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <Text style={styles.kicker}>PANEL</Text>
        <Text style={styles.title}>Velociraptor</Text>
        <Text style={styles.subtitle}>Kontrol VPS, profil, billing, dan topup.</Text>
      </Animated.View>

      <View style={styles.footer}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 36,
  },
  hero: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.55,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginTop: 24,
  },
  copy: {
    alignItems: 'center',
    marginTop: 8,
  },
  kicker: {
    color: colors.cyan,
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
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
    color: colors.cyan,
    fontWeight: '700',
  },
});
