import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SleepRing } from '../components/SleepRing';
import { StatPill } from '../components/StatPill';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';

const questCards = [
  {
    icon: 'phone-portrait-outline',
    title: 'Quiet phone',
    copy: 'Stay under 45 minutes after 9 PM.',
    reward: '+80 XP',
    accent: colors.orange,
    surface: colors.amberSurface,
  },
  {
    icon: 'hand-left-outline',
    title: 'Still wrist',
    copy: 'Hold a calm-motion streak before bed.',
    reward: '+120 XP',
    accent: colors.moss,
    surface: colors.mossSurface,
  },
] as const;

const days = [
  { label: 'M', done: true },
  { label: 'T', done: true },
  { label: 'W', done: true },
  { label: 'T', done: true },
  { label: 'F', done: true },
  { label: 'S', done: false },
  { label: 'S', done: false },
];

export function DashboardScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>SLEEPBAND QUEST</Text>
          <Text style={styles.title}>Good morning, Yaman</Text>
          <Text style={styles.subtitle}>Calm streak earned. Keep tonight easy.</Text>
        </View>
      </View>

      <Card style={styles.hero}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroLabel}>Last night</Text>
            <Text style={styles.heroTitle}>Level 8 Rest</Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="sparkles" size={14} color={colors.primaryDeep} />
            <Text style={styles.xpText}>+240 XP</Text>
          </View>
        </View>

        <SleepRing score={86} />

        <View style={styles.restReadout}>
          <View style={styles.restLine} />
          <Text style={styles.restCopy}>Deep rest carried the night. Restlessness stayed below average.</Text>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Asleep" value="7h 42m" detail="+18m" accent={colors.primary} />
          <StatPill label="Restless" value="34m" detail="-9m" accent={colors.berry} />
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tonight's quests</Text>
        <Text style={styles.sectionMeta}>2 ready</Text>
      </View>

      <View style={styles.questGrid}>
        {questCards.map((quest) => (
          <Card key={quest.title} style={[styles.quest, { backgroundColor: quest.surface }]}>
            <View style={[styles.questIcon, { backgroundColor: quest.accent }]}>
              <Ionicons name={quest.icon} size={21} color={colors.bg} />
            </View>
            <Text style={styles.questTitle}>{quest.title}</Text>
            <Text style={styles.questCopy}>{quest.copy}</Text>
            <Text style={[styles.questReward, { color: quest.accent }]}>{quest.reward}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.streakCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardTitle}>Weekly trail</Text>
            <Text style={styles.cardSub}>5 nights logged before the weekend.</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={colors.primaryDeep} />
            <Text style={styles.streakText}>5</Text>
          </View>
        </View>

        <View style={styles.days}>
          {days.map((day, index) => (
            <View key={`${day.label}-${index}`} style={[styles.day, day.done && styles.dayDone]}>
              <Text style={[styles.dayText, day.done && styles.dayDoneText]}>{day.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: space.xl,
  },
  headerCopy: { minWidth: 0 },
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
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    marginTop: space.sm,
    flexShrink: 1,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontSize: type.body,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: space.sm,
  },
  hero: {
    padding: space.xl,
    marginBottom: space.xl,
    backgroundColor: colors.amberSurface,
  },
  heroHeader: {
    alignItems: 'flex-start',
    gap: space.md,
  },
  heroLabel: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontSize: type.caption,
    fontWeight: '800',
  },
  heroTitle: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 31,
    marginTop: 2,
    flexShrink: 1,
  },
  xpBadge: {
    minHeight: 34,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  xpText: {
    color: colors.primaryDeep,
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.caption,
  },
  restReadout: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
    paddingVertical: space.md,
  },
  restLine: {
    width: 36,
    height: 1,
    backgroundColor: colors.primary,
  },
  restCopy: {
    flex: 1,
    color: colors.soft,
    fontFamily: font.rounded,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  statsRow: { gap: space.md, marginTop: space.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: 22,
    fontWeight: '900',
  },
  sectionMeta: {
    color: colors.quiet,
    fontFamily: font.rounded,
    fontSize: type.caption,
    fontWeight: '800',
  },
  questGrid: { gap: space.md, marginBottom: space.lg },
  quest: {
    minWidth: 0,
    minHeight: 142,
    justifyContent: 'space-between',
    backgroundColor: colors.panelRaised,
  },
  questIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTitle: {
    color: colors.text,
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.bodyLarge,
    marginTop: space.md,
  },
  questCopy: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontWeight: '700',
    fontSize: type.caption,
    lineHeight: 18,
    marginTop: space.xs,
  },
  questReward: {
    fontFamily: font.rounded,
    fontWeight: '900',
    fontSize: type.caption,
    marginTop: space.md,
  },
  streakCard: { backgroundColor: colors.mossSurface, borderColor: colors.mossDeep },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  cardTitle: { color: colors.text, fontFamily: font.rounded, fontWeight: '900', fontSize: type.bodyLarge },
  cardSub: {
    color: colors.muted,
    fontFamily: font.rounded,
    fontWeight: '700',
    marginTop: space.xs,
    lineHeight: 19,
  },
  streakBadge: {
    minWidth: 48,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  streakText: { color: colors.primaryDeep, fontFamily: font.heavy, fontWeight: '900', fontSize: type.bodyLarge },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xl },
  day: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.panelRaised,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { color: colors.muted, fontFamily: font.rounded, fontWeight: '900' },
  dayDoneText: { color: colors.primaryDeep },
});
