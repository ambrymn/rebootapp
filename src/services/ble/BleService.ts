import { CONNECTION_TIMEOUT_MS, PROTOCOL_VERSION, REBOOT_SERVICE_UUID, SCAN_DURATION_MS } from './protocol';
import { BleAdapter, BleFailure, BleIssue, BleSnapshot, DeviceSummary, RadioState } from './types';

export class BleService {
  private snapshot: BleSnapshot;
  private listeners = new Set<() => void>();
  private generation = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private removeDisconnect?: () => void;
  private removeRadio: () => void;
  private foreground = true;
  private disposed = false;
  private pendingId: string | null = null;
  // Serializes native cleanup before another operation starts.
  private cleanup: Promise<void> = Promise.resolve();

  constructor(private adapter: BleAdapter) {
    this.snapshot = {
      phase: adapter.unavailableReason ? 'unavailable' : 'idle',
      devices: [], device: null, issue: null, unavailableReason: adapter.unavailableReason,
    };
    this.removeRadio = adapter.onRadioState(this.radioChanged);
  }

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private update(patch: Partial<BleSnapshot>) {
    if (this.disposed) return;
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach(listener => listener());
  }

  private current(token: number) { return !this.disposed && token === this.generation; }
  private clearTimer() { clearTimeout(this.timer); this.timer = undefined; }
  private issue(error: unknown, fallback: BleIssue): BleIssue {
    return error instanceof BleFailure ? error.issue : fallback;
  }
  private enqueueCleanup(id: string | null) {
    this.cleanup = this.cleanup.then(async () => {
      await this.adapter.stopScan().catch(() => undefined);
      if (id) await this.adapter.disconnect(id).catch(() => undefined);
    });
    return this.cleanup;
  }

  private end(issue: BleIssue | null) {
    ++this.generation;
    this.clearTimer();
    this.removeDisconnect?.();
    this.removeDisconnect = undefined;
    const id = this.pendingId ?? this.snapshot.device?.id ?? null;
    this.pendingId = null;
    this.enqueueCleanup(id);
    this.update({ phase: issue ? 'error' : 'idle', issue, device: null });
  }

  private radioChanged = (state: RadioState) => {
    if (this.disposed || this.snapshot.phase === 'unavailable' || state === 'PoweredOn' || state === 'Unknown') return;
    // prepare() maps authorization errors itself; idle adapters need no visible error.
    if (['idle', 'error', 'requesting'].includes(this.snapshot.phase)) return;
    this.end(state === 'Unauthorized' ? 'permissionBlocked' : state === 'Unsupported' ? 'unsupported' : 'bluetoothOff');
  };

  scan = async () => {
    if (this.disposed || !this.foreground || !['idle', 'results', 'error'].includes(this.snapshot.phase)) return;
    const token = ++this.generation;
    this.update({ phase: 'requesting', devices: [], device: null, issue: null });
    try {
      await this.cleanup;
      if (!this.current(token)) return;
      await this.adapter.prepare();
      if (!this.current(token)) return;
      this.update({ phase: 'scanning' });
      this.timer = setTimeout(() => {
        if (!this.current(token)) return;
        ++this.generation;
        this.clearTimer();
        this.enqueueCleanup(null);
        this.update({ phase: 'results' });
      }, SCAN_DURATION_MS);
      await this.adapter.startScan((error, advertisement) => {
        if (!this.current(token) || this.snapshot.phase !== 'scanning') return;
        if (error) { this.end(error.issue); return; }
        if (!advertisement?.serviceUUIDs.some(uuid => uuid.toLowerCase() === REBOOT_SERVICE_UUID)) return;
        const { id, name, rssi } = advertisement;
        const devices = [...this.snapshot.devices];
        const index = devices.findIndex(device => device.id === id);
        const device = { id, name: name || 'Reboot Sleep', rssi };
        if (index < 0) devices.push(device); else devices[index] = device;
        this.update({ devices });
      });
    } catch (error) {
      if (this.current(token)) this.end(this.issue(error, 'scanFailed'));
    }
  };

  connect = async (device: DeviceSummary) => {
    if (this.disposed || !this.foreground || !['scanning', 'results'].includes(this.snapshot.phase)) return;
    if (!this.snapshot.devices.some(candidate => candidate.id === device.id)) return;
    const token = ++this.generation;
    this.clearTimer();
    this.pendingId = device.id;
    this.update({ phase: 'connecting', device, issue: null });
    this.timer = setTimeout(() => {
      if (this.current(token)) this.end('timeout');
    }, CONNECTION_TIMEOUT_MS);
    try {
      await this.cleanup;
      if (!this.current(token)) return;
      await this.adapter.stopScan();
      if (!this.current(token)) return;
      await this.adapter.connect(device.id);
      if (!this.current(token)) {
        // A newer operation on this same peripheral owns its native connection.
        if (this.pendingId !== device.id && this.snapshot.device?.id !== device.id) {
          await this.adapter.disconnect(device.id).catch(() => undefined);
        }
        return;
      }
      this.removeDisconnect = this.adapter.onDisconnect(device.id, () => {
        if (this.current(token)) this.end('disconnected');
      });
      const version = await this.adapter.readProtocolVersion(device.id);
      if (!this.current(token)) return;
      if (version !== PROTOCOL_VERSION) throw new BleFailure('incompatible');
      const connected = await this.adapter.isConnected(device.id);
      if (!this.current(token)) return;
      if (!connected) throw new BleFailure('disconnected');
      this.clearTimer();
      this.pendingId = null;
      this.update({ phase: 'connected', devices: [] });
    } catch (error) {
      if (this.current(token)) this.end(this.issue(error, 'connectionFailed'));
    }
  };

  cancel = () => {
    if (['requesting', 'scanning', 'connecting', 'results'].includes(this.snapshot.phase)) this.end(null);
  };

  disconnect = async () => {
    const device = this.snapshot.device;
    if (this.snapshot.phase !== 'connected' || !device) return;
    const token = ++this.generation;
    this.removeDisconnect?.();
    this.removeDisconnect = undefined;
    this.update({ phase: 'disconnecting', issue: null });
    try {
      await this.adapter.disconnect(device.id);
      if (this.current(token)) this.update({ phase: 'idle', device: null });
    } catch {
      if (!this.current(token)) return;
      // Preserve ownership so the user can retry a failed disconnect.
      this.removeDisconnect = this.adapter.onDisconnect(device.id, () => {
        if (this.current(token)) this.end('disconnected');
      });
      this.update({ phase: 'connected', issue: 'disconnectFailed' });
    }
  };

  setForeground = async (active: boolean) => {
    this.foreground = active;
    if (!active) { this.cancel(); return; }
    const device = this.snapshot.device;
    const token = this.generation;
    if (this.snapshot.phase !== 'connected' || !device) return;
    try {
      const connected = await this.adapter.isConnected(device.id);
      if (this.current(token) && !connected) this.end('disconnected');
    } catch {
      if (this.current(token)) this.end('disconnected');
    }
  };

  destroy = async () => {
    if (this.disposed) return;
    this.end(null);
    this.disposed = true;
    this.removeRadio();
    this.listeners.clear();
    await this.cleanup;
    await this.adapter.destroy().catch(() => undefined);
  };
}
