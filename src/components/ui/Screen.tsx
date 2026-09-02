import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export function Screen({
  children,
  scroll,
  contentContainerStyle,
  padded = true,
  refreshControl,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
  padded?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
}) {
  const { colors } = useTheme();
  const bodyStyle = [styles.body, padded && styles.padded, contentContainerStyle];

  if (scroll) {
    return (
      <ScrollView
        style={[styles.root, { backgroundColor: colors.bg }]}
        contentContainerStyle={bodyStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, { backgroundColor: colors.bg }, bodyStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
