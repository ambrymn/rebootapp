import { unavailableAdapter } from './unavailableAdapter';

// Metro selects bleAdapter.native.ts on iOS and Android. Web never loads BLE native code.
export function createBleAdapter() {
  return unavailableAdapter('Open Reboot on an iPhone or Android phone using a development build to connect your device.');
}
