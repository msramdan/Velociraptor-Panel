import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';

import { colors } from '../../theme';

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
  const bodyStyle = [styles.body, padded && styles.padded, contentContainerStyle];

  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={bodyStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, bodyStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
