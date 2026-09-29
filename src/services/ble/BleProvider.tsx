import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { BleService } from './BleService';
import { createBleAdapter } from './bleAdapter';

const BleContext = createContext<BleService | null>(null);

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<BleService | null>(null);
  useEffect(() => {
    const instance = new BleService(createBleAdapter());
    setService(instance);
    void instance.setForeground(AppState.currentState !== 'background');
    const subscription = AppState.addEventListener('change', state => {
      // A system permission dialog can make iOS inactive; do not cancel that request.
      if (state === 'active' || state === 'background') void instance.setForeground(state === 'active');
    });
    return () => { subscription.remove(); void instance.destroy(); };
  }, []);
  // Create native resources in an effect, never during a discarded React render.
  if (!service) return null;
  return <BleContext.Provider value={service}>{children}</BleContext.Provider>;
}

export function useBle() {
  const service = useContext(BleContext);
  if (!service) throw new Error('useBle must be used inside BleProvider');
  const state = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  return { ...state, scan: service.scan, cancel: service.cancel, connect: service.connect, disconnect: service.disconnect };
}
