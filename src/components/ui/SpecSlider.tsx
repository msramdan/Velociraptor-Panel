import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TextInput, View } from 'react-native';

const THUMB = 18;

function clampStep(value: number, min: number, max: number, step: number) {
  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

export function SpecSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  const trackWidth = useRef(1);
  const trackPageX = useRef(0);
  const trackRef = useRef<View>(null);
  const onChangeRef = useRef(onChange);
  const rangeRef = useRef({ min, max, step });

  onChangeRef.current = onChange;
  rangeRef.current = { min, max, step };

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit(raw: string) {
    const parsed = Number(raw);
    const next = clampStep(Number.isFinite(parsed) ? parsed : min, min, max, step);
    onChange(next);
    setDraft(String(next));
  }

  function valueFromPageX(pageX: number) {
    const { min: lo, max: hi, step: size } = rangeRef.current;
    const ratio = Math.min(1, Math.max(0, (pageX - trackPageX.current) / trackWidth.current));
    return clampStep(lo + ratio * (hi - lo), lo, hi, size);
  }

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          onChangeRef.current(valueFromPageX(event.nativeEvent.pageX));
        },
        onPanResponderMove: (event) => {
          onChangeRef.current(valueFromPageX(event.nativeEvent.pageX));
        },
      }),
    [],
  );

  const span = Math.max(max - min, 1);
  const progress = Math.min(1, Math.max(0, (value - min) / span));

  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.trackWrap}>
        <View style={styles.bounds}>
          <Text style={styles.bound}>{min}</Text>
          <Text style={styles.bound}>{max}</Text>
        </View>
        <View
          ref={trackRef}
          style={styles.hit}
          pointerEvents={disabled ? 'none' : 'auto'}
          onLayout={() => {
            trackRef.current?.measure((_x, _y, width, _h, pageX) => {
              trackWidth.current = Math.max(width - THUMB, 1);
              trackPageX.current = pageX + THUMB / 2;
            });
          }}
          {...(disabled ? {} : pan.panHandlers)}
        >
          <View style={styles.rail}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
        </View>
      </View>
      <TextInput
        value={draft}
        onChangeText={disabled ? undefined : setDraft}
        onBlur={disabled ? undefined : () => commit(draft)}
        onSubmitEditing={disabled ? undefined : () => commit(draft)}
        keyboardType="number-pad"
        selectTextOnFocus
        editable={!disabled}
        style={styles.value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabled: { opacity: 0.45 },
  label: {
    width: 62,
    color: '#FFF8F3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  trackWrap: {
    flex: 1,
    minWidth: 0,
  },
  bounds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  bound: {
    color: 'rgba(255, 248, 243, 0.7)',
    fontSize: 10,
    fontWeight: '700',
  },
  hit: {
    height: 28,
    justifyContent: 'center',
  },
  rail: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 248, 243, 0.28)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFF8F3',
  },
  thumb: {
    position: 'absolute',
    marginLeft: -THUMB / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFF8F3',
  },
  value: {
    width: 46,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(18, 19, 17, 0.42)',
    color: '#FFF8F3',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    paddingVertical: 0,
  },
});
