import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Enter } from '../components/Motion';
import { SleepRing } from '../components/SleepRing';
import { StatPill } from '../components/StatPill';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';

const questCards = [
  {
    icon: 'phone-portrait',
    title: 'Quiet phone',
    copy: 'Keep scrolling under 45 minutes after 9 PM.',
    reward: '+80 XP',
    accent: colors.orange,
    ink: colors.orangeDeep,
    surface: colors.amberSurface,
  },
  {
    icon: 'hand-left',
    title: 'Still wrist',
    copy: 'Build a calm-motion streak before lights out.',
    reward: '+120 XP',
    accent: colors.moss,
    ink: colors.mossDeep,
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
      <Enter delay={0}>
        <View style={styles.utilityBar}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}><Ionicons name="moon" size={15} color={colors.primarySoft} /></View>
            <Text style={styles.brandText}>Reboot</Text>
          </View>
          <View style={styles.counters}>
            <View style={styles.counter}>
              <Ionicons name="flame" size={17} color={colors.orange} />
              <Text style={styles.counterText}>5</Text>
            </View>
            <View style={styles.counter}>
              <Ionicons name="diamond" size={15} color={colors.primarySoft} />
              <Text style={styles.counterText}>1.2k</Text>
            </View>
          </View>
        </View>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MORNING CHECK-IN</Text>
          <Text style={styles.title}>Good morning, Yaman</Text>
          <Text style={styles.subtitle}>Your calmest night this week. Nice work.</Text>
        </View>
      </Enter>

      <Enter delay={90}>
        <Card style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={styles.heroHeading}>
              <Text style={styles.heroLabel}>Last night's result</Text>
              <Text style={styles.heroTitle}>Level 8 Rest</Text>
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="flash" size={15} color={colors.orangeDeep} />
              <Text style={styles.xpText}>+240 XP</Text>
            </View>
          </View>

          <SleepRing score={86} />

          <View style={styles.restReadout}>
            <View style={styles.restIcon}>
              <Ionicons name="checkmark" size={18} color={colors.mossDeep} />
            </View>
            <Text style={styles.restCopy}>Deep rest carried the night, and restlessness stayed below your average.</Text>
          </View>

          <View style={styles.statsRow}>
            <StatPill label="Asleep" value="7h 42m" detail="+18m" accent={colors.primarySoft} />
            <StatPill label="Restless" value="34m" detail="-9m" accent={colors.berry} />
          </View>
        </Card>
      </Enter>

      <Enter delay={190}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Tonight's quests</Text>
            <Text style={styles.sectionSubtitle}>Small wins for a softer landing.</Text>
          </View>
          <View style={styles.readyBadge}><Text style={styles.readyText}>2 READY</Text></View>
        </View>
      </Enter>

      <View style={styles.questList}>
        {questCards.map((quest, index) => (
          <Enter key={quest.title} delay={260 + index * 90}>
            <Card
              style={[styles.quest, { backgroundColor: quest.surface }]}
              onPress={() => undefined}
              accessibilityLabel={`${quest.title}, ${quest.reward}`}
            >
              <View style={[styles.questIcon, { backgroundColor: quest.accent, borderColor: quest.ink }]}>
                <Ionicons name={quest.icon} size={23} color={quest.ink} />
              </View>
              <View style={styles.questCopyWrap}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questCopy}>{quest.copy}</Text>
                <Text style={[styles.questReward, { color: quest.accent }]}>{quest.reward}</Text>
              </View>
              <View style={styles.questArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.soft} />
              </View>
            </Card>
          </Enter>
        ))}
      </View>

      <Enter delay={470}>
        <Card style={styles.streakCard}>
          <View style={styles.rowBetween}>
            <View style={styles.streakCopy}>
              <Text style={styles.cardTitle}>Weekly trail</Text>
              <Text style={styles.cardSub}>Five cozy nights. Keep the trail glowing.</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={19} color={colors.orangeDeep} />
              <Text style={styles.streakText}>5</Text>
            </View>
          </View>

          <View style={styles.days}>
            {days.map((day, index) => (
              <View key={`${day.label}-${index}`} style={styles.daySlot}>
                <View style={[styles.day, day.done && styles.dayDone]}>
                  {day.done
                    ? <Ionicons name="checkmark" size={16} color={colors.mossDeep} />
                    : <Text style={styles.dayFuture}>·</Text>}
                </View>
                <Text style={[styles.dayText, day.done && styles.dayDoneText]}>{day.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Enter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  utilityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: colors.primaryDeep,
    borderWidth: 1.5,
    borderColor: colors.primaryShadow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.text, fontFamily: font.heavy, fontSize: 18, letterSpacing: 0.2 },
  counters: { flexDirection: 'row', gap: 8 },
  counter: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  counterText: { color: colors.soft, fontFamily: font.strong, fontSize: type.caption },
  header: { marginBottom: space.xl },
  eyebrow: {
    color: colors.primarySoft,
    fontFamily: font.strong,
    fontSize: type.eyebrow,
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: 30,
    lineHeight: 35,
    marginTop: space.sm,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: font.body,
    fontSize: type.body,
    lineHeight: 22,
    marginTop: 6,
  },
  hero: {
    padding: space.lg,
    marginBottom: space.xl,
    backgroundColor: colors.blueSurface,
    borderColor: '#42588D',
    borderBottomColor: colors.primaryShadow,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  heroHeading: { flex: 1, minWidth: 0 },
  heroLabel: { color: colors.primarySoft, fontFamily: font.rounded, fontSize: type.caption },
  heroTitle: { color: colors.text, fontFamily: font.heavy, fontSize: 27, lineHeight: 31, marginTop: 2 },
  xpBadge: {
    minHeight: 36,
    backgroundColor: colors.orange,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderColor: colors.honey,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: { color: colors.orangeDeep, fontFamily: font.strong, fontSize: type.caption },
  restReadout: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.lineSoft,
    padding: space.md,
  },
  restIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restCopy: { flex: 1, color: colors.soft, fontFamily: font.body, fontSize: 13, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: space.md,
    marginBottom: space.md,
  },
  sectionTitle: { color: colors.text, fontFamily: font.heavy, fontSize: 23 },
  sectionSubtitle: { color: colors.quiet, fontFamily: font.body, fontSize: type.caption, marginTop: 2 },
  readyBadge: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryShadow,
  },
  readyText: { color: colors.primarySoft, fontFamily: font.strong, fontSize: 9, letterSpacing: 0.8 },
  questList: { gap: space.md, marginBottom: space.xl },
  quest: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  questIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    borderWidth: 2,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questCopyWrap: { flex: 1, minWidth: 0 },
  questTitle: { color: colors.text, fontFamily: font.heavy, fontSize: type.bodyLarge },
  questCopy: { color: colors.soft, fontFamily: font.body, fontSize: type.caption, lineHeight: 17, marginTop: 2 },
  questReward: { fontFamily: font.strong, fontSize: type.caption, marginTop: 6 },
  questArrow: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },
  streakCard: {
    backgroundColor: colors.mossSurface,
    borderColor: '#2D6646',
    borderBottomColor: colors.mossShadow,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  streakCopy: { flex: 1, minWidth: 0 },
  cardTitle: { color: colors.text, fontFamily: font.heavy, fontSize: 20 },
  cardSub: { color: colors.soft, fontFamily: font.body, marginTop: 2, lineHeight: 19, fontSize: 13 },
  streakBadge: {
    minWidth: 52,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderColor: colors.honey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  streakText: { color: colors.orangeDeep, fontFamily: font.heavy, fontSize: type.bodyLarge },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xl },
  daySlot: { alignItems: 'center', gap: 5 },
  day: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: colors.moss, borderColor: colors.mossShadow },
  dayFuture: { color: colors.quiet, fontFamily: font.heavy, fontSize: 20, lineHeight: 16 },
  dayText: { color: colors.quiet, fontFamily: font.strong, fontSize: 10 },
  dayDoneText: { color: colors.moss },
});
