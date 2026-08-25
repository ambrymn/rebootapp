import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useReducedMotion } from './Motion';

const stars = [
  { top: 72, left: '9%', size: 3, delay: 0 },
  { top: 118, right: '17%', size: 4, delay: 280 },
  { top: 196, left: '24%', size: 2, delay: 560 },
  { top: 286, right: '8%', size: 3, delay: 840 },
  { top: 410, left: '7%', size: 4, delay: 1120 },
  { top: 540, right: '24%', size: 2, delay: 1400 },
] as const;

function Twinkle({ star, index }: { star: (typeof stars)[number]; index: number }) {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (reduced) {
      pulse.setValue(0.55);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 1500 + index * 120,
          delay: star.delay,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.28,
          duration: 1800 + index * 90,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [index, pulse, reduced, star.delay]);

  return (
    <Animated.View
      style={[
        styles.star,
        star,
        { width: star.size, height: star.size, borderRadius: star.size, opacity: pulse },
      ]}
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.bg2, '#18282F']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.nightHalo} />
      <View style={styles.hillBack} />
      <View style={styles.hillFront} />
      {stars.map((star, index) => <Twinkle key={index} star={star} index={index} />)}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  nightHalo: {
    position: 'absolute',
    top: -190,
    left: '50%',
    width: 520,
    height: 520,
    marginLeft: -260,
    borderRadius: 260,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    opacity: 0.6,
  },
  hillBack: {
    position: 'absolute',
    bottom: -210,
    left: -150,
    width: 620,
    height: 340,
    borderRadius: 310,
    backgroundColor: '#172A31',
    transform: [{ rotate: '-5deg' }],
  },
  hillFront: {
    position: 'absolute',
    bottom: -260,
    right: -230,
    width: 650,
    height: 380,
    borderRadius: 325,
    backgroundColor: '#1B3037',
    transform: [{ rotate: '8deg' }],
  },
  star: {
    position: 'absolute',
    backgroundColor: colors.primarySoft,
  },
});
