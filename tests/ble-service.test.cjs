const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadTypeScript } = require('./helpers/load-typescript.cjs');
// Share the error class across the test/controller modules (instanceof is intentional).
const types = loadTypeScript('src/services/ble/types.ts');
const { BleService } = loadTypeScript('src/services/ble/BleService.ts', { './types': types });
const { BleFailure } = types;
const { REBOOT_SERVICE_UUID, SCAN_DURATION_MS, CONNECTION_TIMEOUT_MS } = loadTypeScript('src/services/ble/protocol.ts');
const device = { id: 'one', name: 'Reboot Sleep A123', rssi: -50 };
const flush = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve; let reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

class FakeAdapter {
  unavailableReason = null;
  connected = false;
  version = 1;
  calls = [];
  prepare = async () => { this.calls.push('prepare'); };
  onRadioState = listener => { this.radio = listener; return () => { this.radio = undefined; }; };
  startScan = async listener => { this.calls.push('scan'); this.scanListener = listener; };
  stopScan = async () => { this.calls.push('stop'); };
  connect = async id => { this.calls.push(`connect:${id}`); this.connected = true; };
  readProtocolVersion = async () => { this.calls.push('read'); return this.version; };
  onDisconnect = (id, listener) => { this.disconnected = listener; return () => { this.disconnected = undefined; }; };
  disconnect = async id => { this.calls.push(`disconnect:${id}`); this.connected = false; };
  isConnected = async () => this.connected;
  destroy = async () => { this.calls.push('destroy'); };
  advertise(item = device, services = [REBOOT_SERVICE_UUID]) {
    this.scanListener(null, { ...item, serviceUUIDs: services });
  }
}
function setup(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const adapter = new FakeAdapter();
  const service = new BleService(adapter);
  t.after(() => service.destroy());
  return { adapter, service, state: service.getSnapshot };
}
async function discover(service, adapter) { await service.scan(); adapter.advertise(); }

test('filters by service UUID, deduplicates, and updates names/RSSI', async t => {
  const { service, adapter, state } = setup(t);
  await service.scan();
  adapter.advertise({ ...device, id: 'unrelated' }, ['different']);
  adapter.advertise();
  adapter.advertise({ ...device, rssi: -35 }, [REBOOT_SERVICE_UUID.toUpperCase()]);
  assert.deepEqual(state().devices, [{ ...device, rssi: -35 }]);
});
test('stops after ten seconds and ignores late scan results', async t => {
  const { service, adapter, state } = setup(t);
  await service.scan();
  t.mock.timers.tick(SCAN_DURATION_MS);
  await flush();
  adapter.advertise();
  assert.equal(state().phase, 'results');
  assert.equal(state().devices.length, 0);
  assert.ok(adapter.calls.includes('stop'));
  await service.scan();
  assert.equal(state().phase, 'scanning');
});
for (const issue of ['permissionDenied', 'permissionBlocked', 'bluetoothOff', 'locationOff', 'unsupported']) {
  test(`reports ${issue} without scanning`, async t => {
    const { service, adapter, state } = setup(t);
    adapter.prepare = async () => { throw new BleFailure(issue); };
    await service.scan();
    assert.equal(state().issue, issue);
    assert.ok(!adapter.calls.includes('scan'));
  });
}
test('cancel during permissions never starts a late scan', async t => {
  const { service, adapter, state } = setup(t);
  const permission = deferred();
  adapter.prepare = () => permission.promise;
  const pending = service.scan();
  await flush();
  service.cancel();
  permission.resolve();
  await pending;
  assert.equal(state().phase, 'idle');
  assert.ok(!adapter.calls.includes('scan'));
});
test('cancelled scan callbacks cannot modify a new scan', async t => {
  const { service, adapter, state } = setup(t);
  await service.scan();
  const oldScan = adapter.scanListener;
  service.cancel();
  await service.scan();
  oldScan(new BleFailure('scanFailed'), null);
  oldScan(null, { ...device, serviceUUIDs: [REBOOT_SERVICE_UUID] });
  assert.equal(state().phase, 'scanning');
  assert.deepEqual(state().devices, []);
});
test('connection only succeeds after protocol read and stays across subscribers', async t => {
  const { service, adapter, state } = setup(t);
  await discover(service, adapter);
  const version = deferred();
  adapter.readProtocolVersion = () => version.promise;
  const pending = service.connect(device);
  await flush();
  assert.equal(state().phase, 'connecting');
  version.resolve(1);
  await pending;
  assert.equal(state().phase, 'connected');
  const unsubscribe = service.subscribe(() => {});
  unsubscribe();
  assert.equal(state().phase, 'connected');
  await service.disconnect();
  assert.equal(state().phase, 'idle');
  assert.equal(state().device, null);
});
test('rejects unsupported firmware and closes its connection', async t => {
  const { service, adapter, state } = setup(t);
  adapter.version = 2;
  await discover(service, adapter);
  await service.connect(device);
  await flush();
  assert.equal(state().issue, 'incompatible');
  assert.ok(adapter.calls.includes('disconnect:one'));
});
test('missing version characteristic closes the connection', async t => {
  const { service, adapter, state } = setup(t);
  adapter.readProtocolVersion = async () => { throw new BleFailure('incompatible'); };
  await discover(service, adapter);
  await service.connect(device);
  await flush();
  assert.equal(state().issue, 'incompatible');
  assert.equal(adapter.connected, false);
});
test('overall connection timeout includes discovery and version read', async t => {
  const { service, adapter, state } = setup(t);
  const version = deferred();
  adapter.readProtocolVersion = () => version.promise;
  await discover(service, adapter);
  const pending = service.connect(device);
  await flush();
  t.mock.timers.tick(CONNECTION_TIMEOUT_MS);
  await flush();
  assert.equal(state().issue, 'timeout');
  version.resolve(1);
  await pending;
  assert.equal(state().phase, 'error');
  assert.equal(adapter.connected, false);
});
test('a connection arriving after cancellation is closed', async t => {
  const { service, adapter, state } = setup(t);
  const connection = deferred();
  adapter.connect = () => connection.promise;
  await discover(service, adapter);
  const pending = service.connect(device);
  await flush();
  service.cancel();
  await flush();
  adapter.calls = [];
  adapter.connected = true;
  connection.resolve();
  await pending;
  assert.equal(state().phase, 'idle');
  assert.equal(adapter.connected, false);
  assert.deepEqual(adapter.calls, ['disconnect:one']);
});
test('does not overlap scans or connect calls', async t => {
  const { service, adapter } = setup(t);
  await Promise.all([service.scan(), service.scan()]);
  adapter.advertise();
  await Promise.all([service.connect(device), service.connect(device), service.scan()]);
  assert.equal(adapter.calls.filter(call => call === 'scan').length, 1);
  assert.equal(adapter.calls.filter(call => call === 'connect:one').length, 1);
});
test('ignores attempts to connect to a device outside scan results', async t => {
  const { service, adapter, state } = setup(t);
  await service.scan();
  await service.connect(device);
  assert.equal(state().phase, 'scanning');
  assert.ok(!adapter.calls.includes('connect:one'));
});
test('unexpected disconnect updates UI and never automatically reconnects', async t => {
  const { service, adapter, state } = setup(t);
  await discover(service, adapter);
  await service.connect(device);
  adapter.disconnected();
  await flush();
  assert.equal(state().issue, 'disconnected');
  assert.equal(state().device, null);
  assert.equal(adapter.calls.filter(call => call === 'connect:one').length, 1);
});
test('Bluetooth off invalidates connected state', async t => {
  const { service, adapter, state } = setup(t);
  await discover(service, adapter);
  await service.connect(device);
  adapter.radio('PoweredOff');
  assert.equal(state().issue, 'bluetoothOff');
  assert.equal(state().device, null);
});
test('background cancels scanning and prevents new operations', async t => {
  const { service, adapter, state } = setup(t);
  await service.scan();
  await service.setForeground(false);
  adapter.advertise();
  await service.scan();
  assert.equal(state().phase, 'idle');
  await service.setForeground(true);
  await service.scan();
  assert.equal(state().phase, 'scanning');
});
test('background cancels pending verification', async t => {
  const { service, adapter, state } = setup(t);
  const version = deferred();
  adapter.readProtocolVersion = () => version.promise;
  await discover(service, adapter);
  const pending = service.connect(device);
  await flush();
  await service.setForeground(false);
  version.resolve(1);
  await pending;
  assert.equal(state().phase, 'idle');
});
test('resume rechecks a connection missed while suspended', async t => {
  const { service, adapter, state } = setup(t);
  await discover(service, adapter);
  await service.connect(device);
  await service.setForeground(false);
  assert.equal(state().phase, 'connected');
  adapter.connected = false;
  await service.setForeground(true);
  assert.equal(state().issue, 'disconnected');
});
test('failed manual disconnect remains retryable', async t => {
  const { service, adapter, state } = setup(t);
  await discover(service, adapter);
  await service.connect(device);
  adapter.disconnect = async () => { throw new Error('failure'); };
  await service.disconnect();
  assert.equal(state().phase, 'connected');
  assert.equal(state().issue, 'disconnectFailed');
});
test('unavailable environments never attempt native operations', async t => {
  const adapter = new FakeAdapter();
  adapter.unavailableReason = 'Build required';
  const service = new BleService(adapter);
  assert.equal(service.getSnapshot().phase, 'unavailable');
  await service.scan();
  assert.deepEqual(adapter.calls, []);
  await service.destroy();
});
test('destroy cleans up connection, listeners and timers', async t => {
  const { service, adapter } = setup(t);
  await discover(service, adapter);
  await service.connect(device);
  await service.destroy();
  assert.equal(adapter.radio, undefined);
  assert.equal(adapter.disconnected, undefined);
  assert.equal(adapter.connected, false);
  assert.ok(adapter.calls.includes('destroy'));
});
