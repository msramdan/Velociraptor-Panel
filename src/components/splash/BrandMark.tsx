import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import type { SplashPhase } from '../../context/SessionContext';
import { darkColors } from '../../theme';

const PROGRESS: Record<SplashPhase, number> = {
  booting: 0.2,
  connecting: 0.42,
  syncing: 0.72,
  ready: 1,
  error: 0.28,
};

export function BrandMark({ phase }: { phase: SplashPhase }) {
  const fill = useRef(new Animated.Value(PROGRESS[phase])).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: PROGRESS[phase],
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [fill, phase]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: phase === 'error' ? darkColors.danger : darkColors.accent,
            width: fill.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(241, 239, 234, 0.14)',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
