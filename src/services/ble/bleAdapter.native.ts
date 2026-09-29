import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import type { BleManager, BleError, Subscription } from 'react-native-ble-plx';
import { CONNECTION_TIMEOUT_MS, PROTOCOL_VERSION_UUID, REBOOT_SERVICE_UUID } from './protocol';
import { Advertisement, BleAdapter, BleFailure, BleIssue, RadioState } from './types';
import { unavailableAdapter } from './unavailableAdapter';

type Library = typeof import('react-native-ble-plx');

class NativeBleAdapter implements BleAdapter {
  readonly unavailableReason = null;
  private manager?: BleManager;
  private radioSubscription?: Subscription;
  private radioListeners = new Set<(state: RadioState) => void>();
  private destroyed = false;
  private preparing?: Promise<void>;
  private cancelPreparation?: () => void;

  constructor(private library: Library) {}

  private getManager() {
    if (this.destroyed) throw new BleFailure('connectionFailed');
    if (!this.manager) {
      this.manager = new this.library.BleManager();
      this.radioSubscription = this.manager.onStateChange(state => {
        this.radioListeners.forEach(listener => listener(state));
      }, true);
    }
    return this.manager;
  }

  private failure(error: unknown, fallback: BleIssue) {
    if (error instanceof BleFailure) return error;
    const code = (error as BleError | null)?.errorCode;
    const codes = this.library.BleErrorCode;
    const issue: BleIssue = code === codes.BluetoothPoweredOff ? 'bluetoothOff'
      : code === codes.BluetoothUnauthorized ? 'permissionBlocked'
      : code === codes.BluetoothUnsupported ? 'unsupported'
      : code === codes.LocationServicesDisabled ? 'locationOff'
      : code === codes.OperationTimedOut ? 'timeout'
      : code === codes.ServiceNotFound || code === codes.CharacteristicNotFound ? 'incompatible'
      : code === codes.DeviceDisconnected || code === codes.DeviceNotConnected ? 'disconnected'
      : fallback;
    return new BleFailure(issue);
  }

  prepare() {
    // A cancelled UI request cannot dismiss an OS permission dialog. Reuse that
    // in-flight request if the user taps Connect again before the dialog resolves.
    if (!this.preparing) {
      this.preparing = this.prepareOnce().finally(() => { this.preparing = undefined; });
    }
    return this.preparing;
  }

  private async prepareOnce() {
    if (Platform.OS === 'android') {
      const permissions = Number(Platform.Version) >= 31
        ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const results = await PermissionsAndroid.requestMultiple(permissions);
      if (permissions.some(permission => results[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
        throw new BleFailure('permissionBlocked');
      }
      if (permissions.some(permission => results[permission] !== PermissionsAndroid.RESULTS.GRANTED)) {
        throw new BleFailure('permissionDenied');
      }
    }
    const manager = this.getManager();
    // iOS starts Unknown while CoreBluetooth initializes or asks for authorization.
    await new Promise<void>((resolve, reject) => {
      let subscription: Subscription | undefined;
      let finished = false;
      const finish = (issue?: BleIssue) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        subscription?.remove();
        this.cancelPreparation = undefined;
        if (issue) reject(new BleFailure(issue)); else resolve();
      };
      const timer = setTimeout(() => finish('timeout'), 15_000);
      this.cancelPreparation = () => finish('connectionFailed');
      subscription = manager.onStateChange(state => {
        if (state === 'PoweredOn') finish();
        else if (state === 'PoweredOff') finish('bluetoothOff');
        else if (state === 'Unauthorized') finish('permissionBlocked');
        else if (state === 'Unsupported') finish('unsupported');
      }, true);
      if (finished) subscription.remove();
    });
  }

  onRadioState(listener: (state: RadioState) => void) {
    this.radioListeners.add(listener);
    return () => { this.radioListeners.delete(listener); };
  }

  async startScan(listener: (error: BleFailure | null, device: Advertisement | null) => void) {
    try {
      await this.getManager().startDeviceScan([REBOOT_SERVICE_UUID], { allowDuplicates: true }, (error, device) => {
        if (error) { listener(this.failure(error, 'scanFailed'), null); return; }
        if (device) listener(null, {
          id: device.id, name: device.localName || device.name || 'Reboot Sleep',
          rssi: device.rssi, serviceUUIDs: device.serviceUUIDs ?? [],
        });
      });
    } catch (error) { throw this.failure(error, 'scanFailed'); }
  }

  async stopScan() { await this.manager?.stopDeviceScan(); }

  async connect(id: string) {
    try {
      await this.getManager().connectToDevice(id, { timeout: CONNECTION_TIMEOUT_MS, autoConnect: false });
    } catch (error) { throw this.failure(error, 'connectionFailed'); }
  }

  async readProtocolVersion(id: string) {
    try {
      const manager = this.getManager();
      await manager.discoverAllServicesAndCharacteristicsForDevice(id);
      const characteristic = await manager.readCharacteristicForDevice(id, REBOOT_SERVICE_UUID, PROTOCOL_VERSION_UUID);
      // BLE PLX returns Base64. Exactly one byte with value 1 is "AQ==".
      // Reject extra bytes and malformed/unsupported values rather than accepting a prefix.
      if (!characteristic.isReadable || characteristic.value !== 'AQ==') throw new BleFailure('incompatible');
      return 1;
    } catch (error) { throw this.failure(error, 'connectionFailed'); }
  }

  onDisconnect(id: string, listener: () => void) {
    const subscription = this.getManager().onDeviceDisconnected(id, listener);
    return () => subscription.remove();
  }

  async disconnect(id: string) {
    if (!this.manager || this.destroyed) return;
    try { await this.manager.cancelDeviceConnection(id); }
    catch (error) {
      const code = (error as BleError)?.errorCode;
      if (code !== this.library.BleErrorCode.DeviceNotConnected && code !== this.library.BleErrorCode.DeviceNotFound) throw error;
    }
  }

  async isConnected(id: string) { return this.manager?.isDeviceConnected(id) ?? false; }

  async destroy() {
    this.destroyed = true;
    this.cancelPreparation?.();
    this.radioSubscription?.remove();
    this.radioListeners.clear();
    await this.manager?.destroy();
  }
}

export function createBleAdapter(): BleAdapter {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient || !NativeModules.BlePlx) {
    return unavailableAdapter('Bluetooth needs a Reboot development build. Install a build with Bluetooth support, then open the app on your phone.');
  }
  try {
    // Deliberately guarded: importing BLE PLX in Expo Go must never initialize its native bridge.
    const library: Library = require('react-native-ble-plx');
    return new NativeBleAdapter(library);
  } catch {
    return unavailableAdapter('Bluetooth could not load. Install a fresh Reboot development build on your phone.');
  }
}
