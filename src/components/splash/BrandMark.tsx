import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../../theme';

export function BrandMark() {
  const enter = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      damping: 12,
      stiffness: 90,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: enter,
          transform: [
            {
              scale: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [0.72, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
        <View style={styles.ringDot} />
        <View style={[styles.ringDot, styles.ringDotAlt]} />
      </Animated.View>
      <View style={styles.core}>
        <Image source={require('../../../assets/icon.png')} style={styles.icon} contentFit="cover" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 84,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 106, 42, 0.4)',
    borderStyle: 'dashed',
  },
  ringDot: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  ringDotAlt: {
    top: undefined,
    bottom: -5,
    backgroundColor: colors.indigo,
    shadowColor: colors.indigo,
  },
  core: {
    width: 122,
    height: 122,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.bgElevated,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
});
