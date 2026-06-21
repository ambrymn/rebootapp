import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';

const bars = [
  { hour: '6', height: 38, color: colors.blue },
  { hour: '7', height: 56, color: colors.lavender },
  { hour: '8', height: 34, color: colors.blue },
  { hour: '9', height: 72, color: colors.orange },
  { hour: '10', height: 48, color: colors.berry },
  { hour: '11', height: 20, color: colors.mint },
  { hour: '12', height: 32, color: colors.mint },
];

const sleepBlocks = [
  { w: '18%', color: colors.lavender, label: 'Wind down' },
  { w: '34%', color: colors.primary, label: 'Deep rest' },
  { w: '12%', color: colors.berry, label: 'Restless' },
  { w: '26%', color: colors.mint, label: 'Light rest' },
  { w: '10%', color: colors.orange, label: 'Awake' },
];

const rewards = [
  { icon: 'moon-outline', title: 'Moon badge', tone: colors.lavender },
  { icon: 'shield-checkmark-outline', title: 'Focus shield', tone: colors.moss },
  { icon: 'flash-outline', title: '+240 XP', tone: colors.primary },
] as const;

export function ScreenTimeSleepScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>NIGHT COLORS</Text>
        <Text style={styles.title}>Wind-down map</Text>
        <Text style={styles.subtitle}>Phone time, sleep phases, and wrist motion in one bedtime story.</Text>
      </View>

      <Card style={styles.summary}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardLabel}>After 9 PM phone time</Text>
            <Text style={styles.big}>42m</Text>
          </View>
          <View style={styles.iconTile}>
            <Ionicons name="phone-portrait" size={29} color={colors.blueSurface} />
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
          <View style={styles.progressMarker} />
        </View>
        <View style={styles.progressFooter}>
          <Text style={styles.progressText}>Goal: under 45 minutes</Text>
          <Text style={styles.progressWin}>On track</Text>
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Evening use</Text>
          <Text style={styles.tinyBadge}>9 PM peak</Text>
        </View>
        <View style={styles.barChart}>
          {bars.map((bar, index) => (
            <View key={bar.hour} style={styles.barSlot}>
              <View style={[styles.bar, index === 3 && styles.barPeak, { height: bar.height, backgroundColor: bar.color }]} />
              <Text style={styles.barLabel}>{bar.hour}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.timelineCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Sleep phases</Text>
          <Text style={styles.timeRange}>11:14-6:56</Text>
        </View>
        <View style={styles.timeline}>
          {sleepBlocks.map((block) => (
            <View key={block.label} style={[styles.sleepBlock, { width: block.w as any, backgroundColor: block.color }]} />
          ))}
        </View>

        <View style={styles.legend}>
          {sleepBlocks.map((block) => (
            <View key={block.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: block.color }]} />
              <Text style={styles.legendText}>{block.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.motionCard}>
        <View style={styles.motionIcon}>
          <Ionicons name="pulse-outline" size={25} color={colors.bg} />
        </View>
        <View style={styles.motionCopy}>
          <Text style={styles.motionTitle}>Wrist stayed calm</Text>
          <Text style={styles.motionText}>Restless motion was concentrated before midnight, then dropped for the longest rest block.</Text>
        </View>
      </Card>

      <Card style={styles.rewards}>
        <Text style={styles.cardTitle}>Rewards unlocked</Text>
        <View style={styles.rewardRow}>
          {rewards.map((reward) => (
            <View key={reward.title} style={styles.reward}>
              <View style={[styles.rewardIcon, { backgroundColor: reward.tone }]}>
                <Ionicons name={reward.icon} size={19} color={colors.bg} />
              </View>
              <Text style={styles.rewardText}>{reward.title}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  summary: { marginBottom: space.lg, backgroundColor: colors.blueSurface, borderColor: '#334A75' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  cardLabel: { color: colors.muted, fontFamily: font.rounded, fontWeight: '800', fontSize: type.caption },
  big: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: type.display,
    fontWeight: '900',
    lineHeight: 48,
    marginTop: space.xs,
  },
  iconTile: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 14,
    backgroundColor: colors.panel,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: space.lg,
  },
  progressFill: {
    width: '93%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressMarker: {
    position: 'absolute',
    right: '6%',
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.bg,
  },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
  progressText: { color: colors.muted, fontFamily: font.rounded, fontWeight: '700', fontSize: type.caption },
  progressWin: { color: colors.primarySoft, fontFamily: font.rounded, fontWeight: '900', fontSize: type.caption },
  chartCard: { marginBottom: space.lg, backgroundColor: colors.lavenderSurface, borderColor: '#4A3F69' },
  cardTitle: { color: colors.text, fontFamily: font.rounded, fontWeight: '900', fontSize: 20 },
  tinyBadge: {
    color: colors.primaryDeep,
    backgroundColor: colors.orange,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.eyebrow,
  },
  barChart: {
    height: 118,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: space.lg,
  },
  barSlot: { alignItems: 'center', gap: space.sm },
  bar: {
    width: 26,
    borderRadius: 8,
    opacity: 0.82,
  },
  barPeak: { backgroundColor: colors.orange, opacity: 1 },
  barLabel: { color: colors.muted, fontFamily: font.rounded, fontWeight: '900', fontSize: type.caption },
  timelineCard: { marginBottom: space.lg, backgroundColor: colors.amberSurface, borderColor: colors.primaryDeep },
  timeRange: { color: colors.quiet, fontFamily: font.rounded, fontWeight: '800', fontSize: type.caption },
  timeline: {
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: space.lg,
    backgroundColor: colors.panel,
  },
  sleepBlock: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.panel,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: 999,
  },
  legendDot: { width: 9, height: 9, borderRadius: 99 },
  legendText: { color: colors.soft, fontFamily: font.rounded, fontWeight: '800', fontSize: type.caption },
  motionCard: {
    marginBottom: space.lg,
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
    backgroundColor: colors.mossSurface,
    borderColor: colors.mossDeep,
  },
  motionIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionCopy: { flex: 1 },
  motionTitle: { color: colors.text, fontFamily: font.rounded, fontWeight: '900', fontSize: type.bodyLarge },
  motionText: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: space.xs,
  },
  rewards: { backgroundColor: colors.berrySurface, borderColor: colors.berryDeep },
  rewardRow: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  reward: {
    flex: 1,
    minWidth: 0,
    minHeight: 92,
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    color: colors.text,
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.caption,
    textAlign: 'center',
    marginTop: space.sm,
  },
});
