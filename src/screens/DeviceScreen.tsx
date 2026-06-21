import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';

const signalSteps = [18, 30, 44];

export function DeviceScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BAND SIGNAL</Text>
        <Text style={styles.title}>Pair your band</Text>
        <Text style={styles.subtitle}>Keep the band nearby when pairing opens. Your sleep quests will sync here.</Text>
      </View>

      <Card style={styles.deviceCard}>
        <View style={styles.deviceStage}>
          <View style={styles.watchFace}>
            <Ionicons name="watch-outline" size={72} color={colors.mint} />
          </View>
          <View style={styles.signalStack}>
            {signalSteps.map((height, index) => (
              <View key={height} style={[styles.signalBar, { height, backgroundColor: index === 0 ? colors.moss : index === 1 ? colors.mint : colors.primary }]} />
            ))}
          </View>
        </View>

        <Text style={styles.emptyTitle}>No band connected</Text>
        <Text style={styles.emptyCopy}>SleepBand will appear here when Bluetooth pairing is ready for this prototype.</Text>

        <View style={styles.primaryAction}>
          <Ionicons name="bluetooth" size={18} color={colors.mintDeep} />
          <Text style={styles.primaryActionText}>Pairing opens soon</Text>
        </View>
      </Card>

      <View style={styles.statusGrid}>
        <Card style={[styles.statusCard, styles.statusCardWarm]}>
          <Text style={styles.statusKicker}>Prototype step</Text>
          <Text style={styles.statusTitle}>Advertise as SleepBand-001</Text>
        </Card>
        <Card style={[styles.statusCard, styles.statusCardCool]}>
          <Text style={styles.statusKicker}>First sync</Text>
          <Text style={styles.statusTitle}>Battery and motion packets</Text>
        </Card>
      </View>

      <Card style={styles.noteCard}>
        <Ionicons name="shield-checkmark-outline" size={23} color={colors.moss} />
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle}>Ready for the next build</Text>
          <Text style={styles.noteText}>The interface already has room for device state, battery, and nightly sync once BLE is added.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  header: { marginBottom: space.xl },
  eyebrow: {
    color: colors.primary,
    fontFamily: font.rounded,
    fontSize: type.eyebrow,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: type.title,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: space.sm,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontWeight: '700',
    fontSize: type.body,
    lineHeight: 22,
    marginTop: space.sm,
  },
  deviceCard: {
    alignItems: 'center',
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
    backgroundColor: colors.mossSurface,
    borderColor: colors.mossDeep,
  },
  deviceStage: {
    width: 180,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  watchFace: {
    width: 132,
    height: 132,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mintDeep,
    backgroundColor: colors.mintDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalStack: {
    position: 'absolute',
    right: 0,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    padding: space.sm,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  signalBar: {
    width: 8,
    borderRadius: 999,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: font.heavy,
    fontWeight: '900',
    fontSize: 25,
    textAlign: 'center',
  },
  emptyCopy: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: space.sm,
  },
  primaryAction: {
    minHeight: 48,
    marginTop: space.xl,
    backgroundColor: colors.mint,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  primaryActionText: {
    color: colors.mintDeep,
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.body,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.lg,
  },
  statusCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 102,
  },
  statusCardWarm: { backgroundColor: colors.amberSurface, borderColor: colors.primaryDeep },
  statusCardCool: { backgroundColor: colors.blueSurface, borderColor: '#334A75' },
  statusKicker: {
    color: colors.quiet,
    fontFamily: font.rounded,
    fontSize: type.caption,
    fontWeight: '900',
  },
  statusTitle: {
    color: colors.text,
    fontFamily: font.rounded,
    fontSize: type.body,
    fontWeight: '900',
    lineHeight: 21,
    marginTop: space.sm,
  },
  noteCard: {
    marginTop: space.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: colors.mossSurface,
    borderColor: colors.mossDeep,
  },
  noteCopy: { flex: 1 },
  noteTitle: {
    color: colors.text,
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.bodyLarge,
  },
  noteText: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: space.xs,
  },
});
