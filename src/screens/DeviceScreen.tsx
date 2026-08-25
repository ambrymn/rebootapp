import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Enter, PressableScale, useReducedMotion } from '../components/Motion';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';

function BandBuddy() {
  const reduced = useReducedMotion();
  const float = useRef(new Animated.Value(0)).current;
  const signal = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (reduced) return;
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2100, useNativeDriver: true }),
      ])
    );
    const signalLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(signal, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(signal, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ])
    );
    floatLoop.start();
    signalLoop.start();
    return () => {
      floatLoop.stop();
      signalLoop.stop();
    };
  }, [float, reduced, signal]);

  return (
    <View style={styles.deviceStage}>
      <View style={styles.orbit} />
      <Animated.View
        style={[
          styles.band,
          {
            transform: [
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) },
              { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
            ],
          },
        ]}
      >
        <View style={styles.bandStrapTop} />
        <View style={styles.watchFace}>
          <View style={styles.watchShine} />
          <View style={styles.watchEyes}>
            <View style={styles.watchEye} />
            <View style={styles.watchEye} />
          </View>
          <View style={styles.watchSmile} />
          <Ionicons name="moon" size={16} color={colors.primarySoft} style={styles.watchMoon} />
        </View>
        <View style={styles.bandStrapBottom} />
      </Animated.View>
      <View style={styles.signalStack}>
        {[20, 31, 43].map((height, index) => (
          <Animated.View
            key={height}
            style={[
              styles.signalBar,
              {
                height,
                backgroundColor: index === 0 ? colors.moss : index === 1 ? colors.mint : colors.primary,
                opacity: signal.interpolate({
                  inputRange: [0.35, 1],
                  outputRange: [Math.max(0.28, 0.7 - index * 0.2), 1],
                }),
              },
            ]}
          />
        ))}
      </View>
      <Ionicons name="sparkles" size={24} color={colors.orange} style={styles.deviceSparkle} />
    </View>
  );
}

export function DeviceScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <Enter delay={0}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}><Ionicons name="bluetooth" size={19} color={colors.mint} /></View>
          <Text style={styles.eyebrow}>BAND SIGNAL</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Meet your sleepy sidekick</Text>
          <Text style={styles.subtitle}>Keep the band nearby. Once pairing is live, every sleep quest will sync here.</Text>
        </View>
      </Enter>

      <Enter delay={100}>
        <Card style={styles.deviceCard}>
          <BandBuddy />

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>WAITING FOR PAIRING</Text>
          </View>
          <Text style={styles.emptyTitle}>No band connected yet</Text>
          <Text style={styles.emptyCopy}>Bluetooth pairing is the next prototype step. Your dashboard is already ready for it.</Text>

          <PressableScale style={styles.primaryAction} onPress={() => undefined} accessibilityLabel="Pairing opens soon">
            <View style={styles.primaryActionContent}>
              <Ionicons name="bluetooth" size={19} color={colors.primaryDeep} />
              <Text style={styles.primaryActionText}>Pairing opens soon</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryDeep} />
            </View>
          </PressableScale>
        </Card>
      </Enter>

    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.md },
  headerIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mintDeep, borderWidth: 1.5, borderColor: colors.mossShadow },
  header: { marginBottom: space.xl },
  eyebrow: { color: colors.mint, fontFamily: font.strong, fontSize: type.eyebrow, letterSpacing: 1.2 },
  title: { color: colors.text, fontFamily: font.heavy, fontSize: type.title, lineHeight: 36 },
  subtitle: { color: colors.muted, fontFamily: font.body, fontSize: type.body, lineHeight: 22, marginTop: 6 },
  deviceCard: { alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.lg, backgroundColor: colors.blueSurface, borderColor: '#42588D', borderBottomColor: colors.primaryShadow },
  deviceStage: { width: 220, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  orbit: { position: 'absolute', width: 174, height: 174, borderRadius: 99, borderWidth: 2, borderColor: '#405889', borderStyle: 'dashed' },
  band: { width: 98, height: 174, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  bandStrapTop: { position: 'absolute', top: 0, width: 46, height: 47, backgroundColor: colors.primaryShadow, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 3, borderColor: colors.primaryDeep },
  bandStrapBottom: { position: 'absolute', bottom: 0, width: 46, height: 47, backgroundColor: colors.primaryShadow, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, borderWidth: 3, borderColor: colors.primaryDeep },
  watchFace: { width: 98, height: 96, borderRadius: 29, backgroundColor: colors.primary, borderWidth: 3, borderBottomWidth: 7, borderColor: colors.primaryShadow, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  watchShine: { position: 'absolute', width: 50, height: 110, backgroundColor: colors.primarySoft, opacity: 0.16, left: -13, top: -12, transform: [{ rotate: '20deg' }] },
  watchEyes: { flexDirection: 'row', gap: 22, marginTop: 4 },
  watchEye: { width: 7, height: 11, borderRadius: 6, backgroundColor: colors.primaryDeep },
  watchSmile: { width: 25, height: 13, borderBottomWidth: 4, borderColor: colors.primaryDeep, borderRadius: 99, marginTop: 3 },
  watchMoon: { position: 'absolute', right: 11, top: 10 },
  signalStack: { position: 'absolute', right: 2, bottom: 24, height: 58, flexDirection: 'row', alignItems: 'flex-end', gap: 5, padding: 8, borderRadius: 15, backgroundColor: colors.panel, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  signalBar: { width: 8, borderRadius: 99 },
  deviceSparkle: { position: 'absolute', left: 8, top: 18 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.panel, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.lineSoft },
  statusDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: colors.orange },
  statusPillText: { color: colors.orange, fontFamily: font.strong, fontSize: 9, letterSpacing: 0.8 },
  emptyTitle: { color: colors.text, fontFamily: font.heavy, fontSize: 25, textAlign: 'center', marginTop: space.md },
  emptyCopy: { maxWidth: 320, color: colors.soft, fontFamily: font.body, textAlign: 'center', lineHeight: 21, marginTop: 5 },
  primaryAction: { width: '100%', minHeight: 54, marginTop: space.xl, backgroundColor: colors.primary, borderRadius: 17, borderWidth: 2, borderBottomWidth: 6, borderColor: colors.primaryShadow, overflow: 'hidden' },
  primaryActionContent: { flex: 1, minHeight: 48, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  primaryActionText: { flex: 1, color: colors.primaryDeep, fontFamily: font.strong, fontSize: type.body, textAlign: 'center' },
});
