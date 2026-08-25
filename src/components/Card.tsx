import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { PressableScale } from './Motion';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ children, style, onPress, accessibilityLabel }: CardProps) {
  if (onPress) {
    return (
      <PressableScale
        style={[styles.card, style]}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </PressableScale>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    alignSelf: 'stretch',
    backgroundColor: colors.panelRaised,
    borderRadius: 22,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.line,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
    overflow: 'hidden',
  },
});
