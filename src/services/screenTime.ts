import { Linking, Platform } from 'react-native';
import ScreenTimeNative, {
  NativeScreenTimeStatus,
} from '../../modules/reboot-screen-time';

export type ScreenTimeStatus =
  | NativeScreenTimeStatus
  | 'checking'
  | 'requesting'
  | 'nativeModuleMissing'
  | 'nonIos'
  | 'error';

export async function getScreenTimeStatus(): Promise<ScreenTimeStatus> {
  if (Platform.OS !== 'ios') return 'nonIos';
  if (!ScreenTimeNative) return 'nativeModuleMissing';

  try {
    return await ScreenTimeNative.getAuthorizationStatus();
  } catch {
    return 'error';
  }
}

export async function requestScreenTimeAccess(): Promise<ScreenTimeStatus> {
  if (Platform.OS !== 'ios') return 'nonIos';
  if (!ScreenTimeNative) return 'nativeModuleMissing';

  try {
    return await ScreenTimeNative.requestAuthorization();
  } catch {
    return getScreenTimeStatus();
  }
}

export function openScreenTimeSettings() {
  return Linking.openSettings();
}
