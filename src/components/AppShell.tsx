import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const stars = [
  { top: 64, left: 38, opacity: 0.42 },
  { top: 92, right: 84, opacity: 0.28 },
  { top: 156, left: 112, opacity: 0.34 },
  { top: 218, right: 38, opacity: 0.2 },
  { top: 298, left: 24, opacity: 0.24 },
  { top: 380, right: 112, opacity: 0.18 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.bg2, '#21182B', '#241B22']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.horizonTop} />
      <View style={styles.horizonMid} />
      <View style={styles.horizonLow} />
      {stars.map((star, index) => (
        <View key={index} style={[styles.star, star]} />
      ))}
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
  horizonTop: {
    position: 'absolute',
    top: 86,
    left: -30,
    right: -30,
    height: 1,
    backgroundColor: colors.berryDeep,
    opacity: 0.44,
  },
  horizonMid: {
    position: 'absolute',
    top: 118,
    left: 20,
    right: 52,
    height: 1,
    backgroundColor: colors.primary,
    opacity: 0.22,
  },
  horizonLow: {
    position: 'absolute',
    bottom: 110,
    left: -20,
    right: -20,
    height: 86,
    borderTopWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.berryDeep,
    opacity: 0.18,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primarySoft,
  },
});
