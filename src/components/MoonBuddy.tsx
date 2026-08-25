import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useReducedMotion } from './Motion';

export function MoonBuddy({
  size = 72,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: (value) => 1 - Math.pow(1 - value, 4),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2100,
          easing: (value) => 1 - Math.pow(1 - value, 4),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [float, reduced]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [
            { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
            { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '3deg'] }) },
          ],
        },
      ]}
    >
      <View style={[styles.craterLarge, { width: size * 0.22, height: size * 0.22 }]} />
      <View style={[styles.craterSmall, { width: size * 0.12, height: size * 0.12 }]} />
      <View style={[styles.eye, { left: size * 0.27, top: size * 0.43 }]} />
      <View style={[styles.eye, { right: size * 0.27, top: size * 0.43 }]} />
      <View style={[styles.smile, { width: size * 0.22, height: size * 0.12, top: size * 0.52 }]} />
      <View style={[styles.sparkle, { right: -size * 0.08, top: -size * 0.06 }]}>
        <Ionicons name="sparkles" size={Math.max(16, size * 0.25)} color={colors.orange} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: colors.primaryShadow,
    shadowColor: colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
    alignItems: 'center',
  },
  craterLarge: {
    position: 'absolute',
    left: '12%',
    top: '17%',
    borderRadius: 99,
    backgroundColor: colors.primarySoft,
    opacity: 0.48,
  },
  craterSmall: {
    position: 'absolute',
    right: '15%',
    bottom: '17%',
    borderRadius: 99,
    backgroundColor: colors.primaryShadow,
    opacity: 0.55,
  },
  eye: {
    position: 'absolute',
    width: 5,
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.primaryDeep,
  },
  smile: {
    position: 'absolute',
    borderBottomWidth: 3,
    borderColor: colors.primaryDeep,
    borderRadius: 99,
  },
  sparkle: { position: 'absolute' },
});
