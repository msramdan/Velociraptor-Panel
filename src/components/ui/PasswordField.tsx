import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii } from '../../theme';
import { generateVmPassword, isValidVmPassword, VM_PASSWORD_HINT } from '../../utils/password';

export function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const invalid = value.length > 0 && !isValidVmPassword(value);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <Pressable
          onPress={() => {
            onChangeText(generateVmPassword());
            setVisible(true);
          }}
          style={[styles.generate, { backgroundColor: colors.accentDim, borderColor: colors.line }]}
        >
          <Ionicons name="dice-outline" size={14} color={colors.accent} />
          <Text style={[styles.generateText, { color: colors.accent }]}>Generate</Text>
        </Pressable>
      </View>
      <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: invalid ? colors.danger : colors.line }]}>
        <TextInput
          key={visible ? 'visible' : 'hidden'}
          value={value}
          onChangeText={onChangeText}
          placeholder="••••••••"
          placeholderTextColor={colors.placeholder}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password-new"
          style={[styles.input, { color: colors.text }]}
        />
        <Pressable onPress={() => setVisible((current) => !current)} hitSlop={8} style={styles.eye}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
        </Pressable>
      </View>
      <Text style={[styles.hint, { color: invalid ? colors.danger : colors.muted }]}>
        {invalid ? 'Belum memenuhi pola password.' : VM_PASSWORD_HINT}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  generate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  generateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  eye: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
});
