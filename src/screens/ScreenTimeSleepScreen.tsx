import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Enter, PressableScale, useReducedMotion } from '../components/Motion';
import {
  getScreenTimeStatus,
  openScreenTimeSettings,
  requestScreenTimeAccess,
  ScreenTimeStatus,
} from '../services/screenTime';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';

const connectionSteps = [
  {
    icon: 'hand-left',
    title: 'Tap connect',
    copy: 'Start whenever you’re ready.',
  },
  {
    icon: 'scan',
    title: 'Follow the prompt',
    copy: 'Complete the quick confirmation on your iPhone.',
  },
  {
    icon: 'moon',
    title: 'See your insights',
    copy: 'Explore how your evening habits and sleep fit together.',
  },
] as const;

type StatusPresentation = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
  tone: string;
  ink: string;
  surface: string;
  border: string;
  borderBottom: string;
};

function getStatusPresentation(status: ScreenTimeStatus): StatusPresentation {
  switch (status) {
    case 'approved':
      return {
        label: 'READY',
        icon: 'checkmark-circle',
        title: 'You’re all set',
        copy: 'Screen Time is connected. Your evening insights will appear here.',
        tone: colors.moss,
        ink: colors.mossDeep,
        surface: colors.mossSurface,
        border: '#2D6646',
        borderBottom: colors.mossShadow,
      };
    case 'denied':
      return {
        label: 'CONNECTION PAUSED',
        icon: 'close-circle',
        title: 'Turn on Screen Time access',
        copy: 'You can update access in Settings whenever you’re ready.',
        tone: colors.berry,
        ink: colors.berryDeep,
        surface: colors.berrySurface,
        border: '#6B3B50',
        borderBottom: colors.berryDeep,
      };
    case 'nativeModuleMissing':
      return {
        label: 'IPHONE APP',
        icon: 'phone-portrait',
        title: 'Continue in the Reboot app',
        copy: 'Screen Time connection isn’t available in this preview.',
        tone: colors.orange,
        ink: colors.orangeDeep,
        surface: colors.amberSurface,
        border: '#67502C',
        borderBottom: colors.honey,
      };
    case 'nonIos':
      return {
        label: 'IPHONE APP',
        icon: 'logo-apple',
        title: 'Continue on your iPhone',
        copy: 'Screen Time connection is available in the Reboot iPhone app.',
        tone: colors.primary,
        ink: colors.primaryDeep,
        surface: colors.blueSurface,
        border: '#42588D',
        borderBottom: colors.primaryShadow,
      };
    case 'unsupported':
      return {
        label: 'UPDATE NEEDED',
        icon: 'arrow-up-circle',
        title: 'A newer iOS version is needed',
        copy: 'Update your iPhone to use Screen Time with Reboot.',
        tone: colors.orange,
        ink: colors.orangeDeep,
        surface: colors.amberSurface,
        border: '#67502C',
        borderBottom: colors.honey,
      };
    case 'error':
      return {
        label: 'TRY AGAIN',
        icon: 'refresh-circle',
        title: 'We couldn’t connect just yet',
        copy: 'Nothing changed. Try again in a moment.',
        tone: colors.orange,
        ink: colors.orangeDeep,
        surface: colors.amberSurface,
        border: '#67502C',
        borderBottom: colors.honey,
      };
    case 'checking':
    case 'requesting':
      return {
        label: status === 'requesting' ? 'FINISH ON IPHONE' : 'ONE MOMENT',
        icon: 'time',
        title: status === 'requesting' ? 'Follow the prompt' : 'Checking your connection',
        copy: status === 'requesting'
          ? 'Complete the steps on your iPhone to continue.'
          : 'This should only take a moment.',
        tone: colors.primary,
        ink: colors.primaryDeep,
        surface: colors.blueSurface,
        border: '#42588D',
        borderBottom: colors.primaryShadow,
      };
    case 'notDetermined':
    default:
      return {
        label: 'OPTIONAL',
        icon: 'lock-closed',
        title: 'Connect Screen Time',
        copy: 'See how your evening phone habits may affect your sleep. You can disconnect anytime.',
        tone: colors.primary,
        ink: colors.primaryDeep,
        surface: colors.blueSurface,
        border: '#42588D',
        borderBottom: colors.primaryShadow,
      };
  }
}

function ScreenTimeBuddy({ connected }: { connected: boolean }) {
  const reduced = useReducedMotion();
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2100, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [float, reduced]);

  return (
    <View style={styles.illustration}>
      <View style={styles.illustrationOrbit} />
      <Animated.View
        style={[
          styles.phone,
          {
            transform: [
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
              { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
            ],
          },
        ]}
      >
        <View style={styles.phoneSpeaker} />
        <View style={styles.phoneScreen}>
          <View style={styles.chartBars}>
            <View style={[styles.chartBar, styles.chartBarShort]} />
            <View style={[styles.chartBar, styles.chartBarTall]} />
            <View style={[styles.chartBar, styles.chartBarMedium]} />
          </View>
          <View style={styles.screenMoon}>
            <Ionicons name="moon" size={20} color={colors.primarySoft} />
          </View>
        </View>
      </Animated.View>
      <View style={[styles.permissionBadge, connected && styles.permissionBadgeConnected]}>
        <Ionicons
          name={connected ? 'checkmark' : 'lock-closed'}
          size={21}
          color={connected ? colors.mossDeep : colors.orangeDeep}
        />
      </View>
      <Ionicons name="sparkles" size={23} color={colors.orange} style={styles.sparkle} />
    </View>
  );
}

export function ScreenTimeSleepScreen() {
  const [status, setStatus] = useState<ScreenTimeStatus>('checking');

  const refreshStatus = useCallback(async () => {
    setStatus('checking');
    setStatus(await getScreenTimeStatus());
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') refreshStatus();
    });
    return () => subscription.remove();
  }, [refreshStatus]);

  const connect = async () => {
    setStatus('requesting');
    setStatus(await requestScreenTimeAccess());
  };

  const presentation = getStatusPresentation(status);
  const isBusy = status === 'checking' || status === 'requesting';
  const canConnect = status === 'notDetermined';
  const canOpenSettings = status === 'denied';
  const canRetry = status === 'error';

  return (
    <Screen>
      <Enter delay={0}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}><Ionicons name="hourglass" size={18} color={colors.primarySoft} /></View>
          <Text style={styles.headerChip}>APPLE SCREEN TIME</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Connect your wind-down</Text>
          <Text style={styles.subtitle}>Bring your evening phone habits into the same calm story as your sleep.</Text>
        </View>
      </Enter>

      <Enter delay={90}>
        <Card
          style={[
            styles.connectionCard,
            {
              backgroundColor: presentation.surface,
              borderColor: presentation.border,
              borderBottomColor: presentation.borderBottom,
            },
          ]}
        >
          <ScreenTimeBuddy connected={status === 'approved'} />

          <View style={styles.statusBadge}>
            <View style={[styles.statusIcon, { backgroundColor: presentation.tone }]}>
              <Ionicons name={presentation.icon} size={14} color={presentation.ink} />
            </View>
            <Text style={[styles.statusLabel, { color: presentation.tone }]}>{presentation.label}</Text>
          </View>

          <Text style={styles.connectionTitle}>{presentation.title}</Text>
          <Text style={styles.connectionCopy}>{presentation.copy}</Text>

          {isBusy ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primarySoft} />
              <Text style={styles.loadingText}>{status === 'requesting' ? 'Finishing up…' : 'Checking…'}</Text>
            </View>
          ) : null}

          {canConnect ? (
            <PressableScale style={styles.primaryAction} onPress={connect} accessibilityLabel="Connect Apple Screen Time">
              <View style={styles.primaryActionContent}>
                <Ionicons name="logo-apple" size={20} color={colors.primaryDeep} />
                <Text style={styles.primaryActionText}>Connect Screen Time</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primaryDeep} />
              </View>
            </PressableScale>
          ) : null}

          {canOpenSettings ? (
            <View style={styles.actionStack}>
              <PressableScale style={styles.deniedAction} onPress={openScreenTimeSettings} accessibilityLabel="Open iOS Settings">
                <View style={styles.primaryActionContent}>
                  <Ionicons name="settings" size={19} color={colors.berryDeep} />
                  <Text style={styles.deniedActionText}>Open iOS Settings</Text>
                  <Ionicons name="open-outline" size={17} color={colors.berryDeep} />
                </View>
              </PressableScale>
              <PressableScale style={styles.secondaryAction} onPress={refreshStatus} accessibilityLabel="Check Screen Time access again">
                <Text style={styles.secondaryActionText}>Check again</Text>
              </PressableScale>
            </View>
          ) : null}

          {canRetry ? (
            <PressableScale style={styles.secondaryActionWide} onPress={refreshStatus} accessibilityLabel="Check Screen Time access again">
              <Text style={styles.secondaryActionText}>Check connection again</Text>
            </PressableScale>
          ) : null}
        </Card>
      </Enter>

      <Enter delay={190}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What to expect</Text>
          <Text style={styles.sectionMeta}>3 SIMPLE STEPS</Text>
        </View>
        <View style={styles.stepList}>
          {connectionSteps.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepRail}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                {index < connectionSteps.length - 1 ? <View style={styles.railLine} /> : null}
              </View>
              <View style={styles.stepIcon}><Ionicons name={step.icon} size={20} color={colors.primarySoft} /></View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.copy}</Text>
              </View>
            </View>
          ))}
        </View>
      </Enter>

      <Enter delay={300}>
        <Card style={styles.privacyCard}>
          <View style={styles.privacyIcon}><Ionicons name="shield-checkmark" size={23} color={colors.mossDeep} /></View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>You’re in control</Text>
            <Text style={styles.privacyText}>Connecting is optional, and you can change access anytime in iPhone Settings.</Text>
          </View>
        </Card>
      </Enter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.md },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDeep,
    borderWidth: 1.5,
    borderColor: colors.primaryShadow,
  },
  headerChip: { color: colors.primarySoft, fontFamily: font.strong, fontSize: type.eyebrow, letterSpacing: 1.1 },
  header: { marginBottom: space.xl },
  title: { color: colors.text, fontFamily: font.heavy, fontSize: type.title, lineHeight: 36 },
  subtitle: { color: colors.muted, fontFamily: font.body, fontSize: type.body, lineHeight: 22, marginTop: 6 },
  connectionCard: { alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.lg },
  illustration: { width: 220, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  illustrationOrbit: { position: 'absolute', width: 172, height: 172, borderRadius: 99, borderWidth: 2, borderStyle: 'dashed', borderColor: '#465C91' },
  phone: { width: 105, height: 158, borderRadius: 29, backgroundColor: colors.primary, borderWidth: 3, borderBottomWidth: 7, borderColor: colors.primaryShadow, alignItems: 'center', padding: 9, zIndex: 2 },
  phoneSpeaker: { width: 28, height: 5, borderRadius: 99, backgroundColor: colors.primaryDeep, opacity: 0.7, marginBottom: 8 },
  phoneScreen: { flex: 1, width: '100%', borderRadius: 18, backgroundColor: colors.panel, borderWidth: 2, borderColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  chartBars: { height: 48, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  chartBar: { width: 12, borderRadius: 5, backgroundColor: colors.primarySoft },
  chartBarShort: { height: 22 },
  chartBarMedium: { height: 32 },
  chartBarTall: { height: 44, backgroundColor: colors.orange },
  screenMoon: { marginTop: 10 },
  permissionBadge: { position: 'absolute', right: 24, bottom: 23, width: 52, height: 52, borderRadius: 18, backgroundColor: colors.orange, borderWidth: 3, borderBottomWidth: 6, borderColor: colors.honey, alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  permissionBadgeConnected: { backgroundColor: colors.moss, borderColor: colors.mossShadow },
  sparkle: { position: 'absolute', left: 27, top: 22 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.panel, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 11, borderWidth: 1, borderColor: colors.lineSoft },
  statusIcon: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontFamily: font.strong, fontSize: 9, letterSpacing: 0.8 },
  connectionTitle: { color: colors.text, fontFamily: font.heavy, fontSize: 25, lineHeight: 30, textAlign: 'center', marginTop: space.md },
  connectionCopy: { maxWidth: 332, color: colors.soft, fontFamily: font.body, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 5 },
  loadingState: { minHeight: 54, marginTop: space.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.primarySoft, fontFamily: font.rounded, fontSize: type.body },
  primaryAction: { width: '100%', minHeight: 56, marginTop: space.xl, backgroundColor: colors.primary, borderRadius: 18, borderWidth: 2, borderBottomWidth: 6, borderColor: colors.primaryShadow, overflow: 'hidden' },
  primaryActionContent: { flex: 1, minHeight: 49, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  primaryActionText: { flex: 1, color: colors.primaryDeep, fontFamily: font.strong, fontSize: type.body, textAlign: 'center' },
  actionStack: { width: '100%', gap: space.sm, marginTop: space.xl },
  deniedAction: { width: '100%', minHeight: 54, backgroundColor: colors.berry, borderRadius: 17, borderWidth: 2, borderBottomWidth: 6, borderColor: colors.berryDeep, overflow: 'hidden' },
  deniedActionText: { flex: 1, color: colors.berryDeep, fontFamily: font.strong, fontSize: type.body, textAlign: 'center' },
  secondaryAction: { alignSelf: 'center', paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: 12 },
  secondaryActionWide: { alignSelf: 'stretch', marginTop: space.lg, paddingVertical: space.md, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line },
  secondaryActionText: { color: colors.soft, fontFamily: font.strong, fontSize: type.caption, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md, marginTop: space.xxl, marginBottom: space.lg },
  sectionTitle: { color: colors.text, fontFamily: font.heavy, fontSize: 22 },
  sectionMeta: { color: colors.quiet, fontFamily: font.strong, fontSize: 9, letterSpacing: 0.7 },
  stepList: { gap: 0 },
  stepRow: { minHeight: 94, flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  stepRail: { width: 28, alignSelf: 'stretch', alignItems: 'center' },
  stepNumber: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.primary, borderWidth: 1.5, borderBottomWidth: 3, borderColor: colors.primaryShadow, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepNumberText: { color: colors.primaryDeep, fontFamily: font.heavy, fontSize: 14 },
  railLine: { flex: 1, width: 3, backgroundColor: colors.lineSoft, marginTop: 4, borderRadius: 99 },
  stepIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.primaryDeep, borderWidth: 1.5, borderColor: colors.primaryShadow, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, minWidth: 0, paddingTop: 1 },
  stepTitle: { color: colors.text, fontFamily: font.heavy, fontSize: type.bodyLarge },
  stepText: { color: colors.muted, fontFamily: font.body, fontSize: 13, lineHeight: 19, marginTop: 3 },
  privacyCard: { marginTop: space.sm, flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.mossSurface, borderColor: '#2D6646', borderBottomColor: colors.mossShadow },
  privacyIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.moss, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.mossShadow, alignItems: 'center', justifyContent: 'center' },
  privacyCopy: { flex: 1, minWidth: 0 },
  privacyTitle: { color: colors.text, fontFamily: font.heavy, fontSize: type.bodyLarge },
  privacyText: { color: colors.soft, fontFamily: font.body, fontSize: 13, lineHeight: 19, marginTop: 3 },
});
