export type BleIssue =
  | 'bluetoothOff' | 'permissionDenied' | 'permissionBlocked' | 'unsupported'
  | 'locationOff' | 'scanFailed' | 'connectionFailed' | 'incompatible'
  | 'timeout' | 'disconnected' | 'disconnectFailed';

export class BleFailure extends Error {
  constructor(public readonly issue: BleIssue) {
    super(issue);
    this.name = 'BleFailure';
  }
}

export type DeviceSummary = { id: string; name: string; rssi: number | null };
export type Advertisement = DeviceSummary & { serviceUUIDs: string[] };
export type RadioState = 'PoweredOn' | 'PoweredOff' | 'Unauthorized' | 'Unsupported' | 'Unknown' | 'Resetting';
export type BlePhase = 'idle' | 'requesting' | 'scanning' | 'results' | 'connecting'
  | 'connected' | 'disconnecting' | 'error' | 'unavailable';

export type BleSnapshot = {
  phase: BlePhase;
  devices: DeviceSummary[];
  device: DeviceSummary | null;
  issue: BleIssue | null;
  unavailableReason: string | null;
};

// Only this adapter knows about the native library; the controller is testable on Node.
export interface BleAdapter {
  readonly unavailableReason: string | null;
  prepare(): Promise<void>;
  onRadioState(listener: (state: RadioState) => void): () => void;
  startScan(listener: (error: BleFailure | null, device: Advertisement | null) => void): Promise<void>;
  stopScan(): Promise<void>;
  connect(id: string): Promise<void>;
  readProtocolVersion(id: string): Promise<number>;
  onDisconnect(id: string, listener: () => void): () => void;
  disconnect(id: string): Promise<void>;
  isConnected(id: string): Promise<boolean>;
  destroy(): Promise<void>;
}
