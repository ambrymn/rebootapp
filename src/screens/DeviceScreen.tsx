import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Linking, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Enter, PressableScale, useReducedMotion } from '../components/Motion';
import { colors } from '../theme/colors';
import { font, space, type } from '../theme/type';
import { useBle } from '../services/ble/BleProvider';
import { BleIssue } from '../services/ble/types';

const issueCopy: Record<BleIssue, { title: string; copy: string }> = {
  bluetoothOff: { title: 'Bluetooth is off', copy: 'Turn on Bluetooth on your phone, then try connecting again.' },
  permissionDenied: { title: 'Allow Bluetooth access', copy: 'Reboot needs access to find your device. Tap Connect to try again.' },
  permissionBlocked: { title: 'Bluetooth access is off', copy: 'Open Settings and allow Bluetooth or Nearby Devices access for Reboot. Older Android phones also need location permission.' },
  unsupported: { title: 'Bluetooth is unavailable', copy: 'Use a physical iPhone or Android phone that supports Bluetooth Low Energy.' },
  locationOff: { title: 'Turn on Location services', copy: 'This Android version needs Location services enabled to find Bluetooth devices. Reboot does not use your location.' },
  scanFailed: { title: 'Could not search for devices', copy: 'Keep your device powered on and nearby, then try again.' },
  connectionFailed: { title: 'Could not connect', copy: 'Keep your device nearby and disconnect it from any other phone, then try again.' },
  incompatible: { title: 'Device needs matching firmware', copy: 'Install the Reboot Sleep connection firmware on your device, then connect again.' },
  timeout: { title: 'Connection timed out', copy: 'Check that Bluetooth is on and your device is powered on nearby, then try again.' },
  disconnected: { title: 'Device disconnected', copy: 'Your device may be out of range or powered off. Bring it nearby and tap Connect.' },
  disconnectFailed: { title: 'Could not disconnect', copy: 'Try Disconnect again, or turn Bluetooth off on your phone.' },
};

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
  const ble = useBle();
  const [settingsError, setSettingsError] = useState(false);
  const searching = ble.phase === 'scanning';
  const working = ['requesting', 'connecting', 'disconnecting'].includes(ble.phase);
  const connected = ble.phase === 'connected';
  const showDevices = searching || ble.phase === 'results';
  const canCancel = searching || ['requesting', 'connecting', 'results'].includes(ble.phase);
  const showSettings = ble.issue === 'permissionBlocked' || ble.issue === 'locationOff';
  const error = ble.issue ? issueCopy[ble.issue] : null;
  const title = error?.title ?? (connected ? `${ble.device?.name} is connected`
    : ble.phase === 'connecting' ? `Connecting to ${ble.device?.name}`
    : searching ? 'Looking for your device'
    : ble.phase === 'requesting' ? 'Getting Bluetooth ready'
    : ble.phase === 'disconnecting' ? 'Disconnecting your device'
    : ble.phase === 'unavailable' ? 'Connect from your phone'
    : ble.phase === 'results' ? (ble.devices.length ? 'Choose your Reboot Sleep' : 'No devices found')
    : 'No device connected yet');
  const copy = error?.copy ?? (ble.unavailableReason || (connected
    ? 'Your Bluetooth connection is ready. Movement readings and sleep recording are coming later.'
    : ble.phase === 'connecting' ? 'Checking your device and its firmware.'
    : ble.phase === 'requesting' ? 'Allow Bluetooth access if your phone asks.'
    : showDevices && ble.devices.length ? 'Select your device below. The four-character code helps tell devices apart.'
    : 'Power on your Reboot Sleep device and keep it close to your phone.'));
  const primaryLabel = connected ? 'Disconnect' : searching ? 'Searching…'
    : ble.phase === 'requesting' ? 'Preparing…' : ble.phase === 'connecting' ? 'Connecting…'
    : ble.phase === 'disconnecting' ? 'Disconnecting…'
    : ble.phase === 'unavailable' ? 'Development build required'
    : ble.phase === 'results' ? 'Scan again' : 'Connect';
  const statusColor = connected && !error ? colors.mint : colors.orange;

  const openSettings = async () => {
    setSettingsError(false);
    try {
      if (ble.issue === 'locationOff') await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      else await Linking.openSettings();
    } catch { setSettingsError(true); }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Enter delay={0}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}><Ionicons name="bluetooth" size={19} color={colors.mint} /></View>
          <Text style={styles.eyebrow}>BAND SIGNAL</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Meet your sleepy sidekick</Text>
          <Text style={styles.subtitle}>Keep your Reboot Sleep nearby. Connect here to get your device ready.</Text>
        </View>
      </Enter>

      <Enter delay={100}>
        <Card style={styles.deviceCard}>
          <BandBuddy />

          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusPillText, { color: statusColor }]}>{connected ? 'CONNECTED' : searching ? 'SEARCHING' : working ? 'PLEASE WAIT' : 'NOT CONNECTED'}</Text>
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.emptyTitle}>{title}</Text>
          <Text style={styles.emptyCopy}>{copy}</Text>

          {showDevices && ble.devices.length > 0 && (
            <View style={styles.deviceList}>
              {ble.devices.map(device => (
                <PressableScale key={device.id} style={styles.deviceRow} onPress={() => { void ble.connect(device); }} accessibilityLabel={`Connect to ${device.name}, ${device.id.slice(-5)}`}>
                  <View style={styles.deviceRowContent}>
                    <Ionicons name="bluetooth" size={22} color={colors.mint} />
                    <View style={styles.deviceRowText}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceDetail}>Nearby · {device.id.slice(-5)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.soft} />
                  </View>
                </PressableScale>
              ))}
            </View>
          )}

          {showSettings && (
            <PressableScale style={styles.secondaryAction} onPress={() => { void openSettings(); }} accessibilityLabel="Open Settings">
              <Text style={styles.secondaryActionText}>Open Settings</Text>
            </PressableScale>
          )}
          {settingsError && <Text accessibilityLiveRegion="polite" style={styles.emptyCopy}>Open your phone’s Settings manually to update access.</Text>}

          <PressableScale style={styles.primaryAction} busy={working || searching} disabled={ble.phase === 'unavailable'} onPress={() => { setSettingsError(false); void (connected ? ble.disconnect() : ble.scan()); }} accessibilityLabel={primaryLabel}>
            <View style={styles.primaryActionContent}>
              {working || searching ? <ActivityIndicator color={colors.primaryDeep} /> : <Ionicons name={connected ? 'close-circle-outline' : 'bluetooth'} size={19} color={colors.primaryDeep} />}
              <Text style={styles.primaryActionText}>{primaryLabel}</Text>
              {!working && !searching && <Ionicons name="arrow-forward" size={18} color={colors.primaryDeep} />}
            </View>
          </PressableScale>
          {canCancel && (
            <PressableScale style={styles.secondaryAction} onPress={ble.cancel} accessibilityLabel="Cancel connection">
              <Text style={styles.secondaryActionText}>Cancel</Text>
            </PressableScale>
          )}
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
  deviceList: { width: '100%', gap: space.sm, marginTop: space.lg },
  deviceRow: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.lineSoft, borderRadius: 16 },
  deviceRowContent: { minHeight: 66, flexDirection: 'row', alignItems: 'center', padding: space.md, gap: space.sm },
  deviceRowText: { flex: 1 },
  deviceName: { color: colors.text, fontFamily: font.strong, fontSize: type.body },
  deviceDetail: { color: colors.muted, fontFamily: font.body, fontSize: 12, marginTop: 3 },
  secondaryAction: { minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.lg, marginTop: space.sm },
  secondaryActionText: { color: colors.primarySoft, fontFamily: font.strong, fontSize: type.body },
});
