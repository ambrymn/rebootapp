import { requireOptionalNativeModule } from 'expo-modules-core';

export type NativeScreenTimeStatus =
  | 'notDetermined'
  | 'denied'
  | 'approved'
  | 'unsupported';

export type RebootScreenTimeNativeModule = {
  getAuthorizationStatus(): Promise<NativeScreenTimeStatus>;
  requestAuthorization(): Promise<NativeScreenTimeStatus>;
};

export default requireOptionalNativeModule<RebootScreenTimeNativeModule>(
  'RebootScreenTime'
);
