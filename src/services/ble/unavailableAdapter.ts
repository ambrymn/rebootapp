import { BleAdapter, BleFailure } from './types';

export function unavailableAdapter(reason: string): BleAdapter {
  return {
    unavailableReason: reason,
    prepare: async () => { throw new BleFailure('unsupported'); },
    onRadioState: () => () => undefined,
    startScan: async () => undefined,
    stopScan: async () => undefined,
    connect: async () => { throw new BleFailure('unsupported'); },
    readProtocolVersion: async () => { throw new BleFailure('unsupported'); },
    onDisconnect: () => () => undefined,
    disconnect: async () => undefined,
    isConnected: async () => false,
    destroy: async () => undefined,
  };
}
