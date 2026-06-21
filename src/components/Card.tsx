import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    alignSelf: 'stretch',
    backgroundColor: colors.panelRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
