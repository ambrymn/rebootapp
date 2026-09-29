const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadTypeScript } = require('./helpers/load-typescript.cjs');
const protocol = loadTypeScript('src/services/ble/protocol.ts');
// Use the installed library's bridge name, so the mock cannot hide a stale guard.
const nativeModuleName = fs.readFileSync('node_modules/react-native-ble-plx/src/BleModule.js', 'utf8').match(/NativeModules\.(\w+)/)[1];

function native({ os = 'android', api = 35, permission = 'granted', radio = 'PoweredOn', expoGo = false, missing = false } = {}) {
  const calls = [];
  let value = 'AQ==';
  const manager = {
    onStateChange: listener => { listener(radio); return { remove() {} }; },
    discoverAllServicesAndCharacteristicsForDevice: async () => { calls.push('discover'); },
    readCharacteristicForDevice: async (...args) => { calls.push(args); return { value, isReadable: true }; },
  };
  const bleLibrary = {
    BleManager: class { constructor() { calls.push('manager'); return manager; } },
    BleErrorCode: { ServiceNotFound: 302, CharacteristicNotFound: 404 },
  };
  const permissions = {
    PERMISSIONS: { BLUETOOTH_SCAN: 'scan', BLUETOOTH_CONNECT: 'connect', ACCESS_FINE_LOCATION: 'location' },
    RESULTS: { GRANTED: 'granted', NEVER_ASK_AGAIN: 'blocked' },
    requestMultiple: async list => { calls.push(list); return Object.fromEntries(list.map(p => [p, permission])); },
  };
  const { createBleAdapter } = loadTypeScript('src/services/ble/bleAdapter.native.ts', {
    'expo-constants': { __esModule: true, default: { executionEnvironment: expoGo ? 'storeClient' : 'bare' }, ExecutionEnvironment: { StoreClient: 'storeClient' } },
    'react-native': { NativeModules: missing ? {} : { [nativeModuleName]: {} }, PermissionsAndroid: permissions, Platform: { OS: os, Version: api } },
    'react-native-ble-plx': bleLibrary,
  });
  return { adapter: createBleAdapter(), calls, manager, setValue: next => { value = next; } };
}
test('Expo Go and missing native module produce a safe unavailable adapter', () => {
  for (const options of [{ expoGo: true }, { missing: true }]) {
    const { adapter, calls } = native(options);
    assert.ok(adapter.unavailableReason);
    assert.deepEqual(calls, []);
  }
});
test('web uses a fallback without importing the native library', async () => {
  const { createBleAdapter } = loadTypeScript('src/services/ble/bleAdapter.ts');
  const adapter = createBleAdapter();
  assert.ok(adapter.unavailableReason.includes('development build'));
  assert.equal(await adapter.isConnected('one'), false);
});
test('Android 12+ requests scan/connect; Android 11 requests location', async () => {
  for (const [api, expected] of [[35, ['scan', 'connect']], [30, ['location']]]) {
    const { adapter, calls } = native({ api });
    assert.deepEqual(calls, []); // Lazy initialization avoids launch-time permission prompts.
    await adapter.prepare();
    assert.deepEqual(calls[0], expected);
    assert.equal(calls[1], 'manager');
  }
});
test('Android denial and permanent denial are distinct and do not initialize manager', async () => {
  for (const [permission, issue] of [['denied', 'permissionDenied'], ['blocked', 'permissionBlocked']]) {
    const { adapter, calls } = native({ permission });
    await assert.rejects(adapter.prepare(), error => error.issue === issue);
    assert.equal(calls.length, 1);
  }
});
test('overlapping preparation reuses a single OS permission request', async () => {
  const { adapter, calls } = native();
  await Promise.all([adapter.prepare(), adapter.prepare()]);
  assert.deepEqual(calls, [['scan', 'connect'], 'manager']);
});
test('iOS uses CoreBluetooth authorization without Android permissions', async () => {
  const { adapter, calls } = native({ os: 'ios' });
  await adapter.prepare();
  assert.deepEqual(calls, ['manager']);
  const denied = native({ os: 'ios', radio: 'Unauthorized' });
  await assert.rejects(denied.adapter.prepare(), error => error.issue === 'permissionBlocked');
});
test('native reader verifies exact one-byte version and service/characteristic IDs', async () => {
  const { adapter, calls, setValue } = native();
  assert.equal(await adapter.readProtocolVersion('one'), 1);
  assert.deepEqual(calls.at(-1), ['one', protocol.REBOOT_SERVICE_UUID, protocol.PROTOCOL_VERSION_UUID]);
  for (const value of [null, '', 'Ag==', 'AQE=', 'AQ', 'garbage']) {
    setValue(value);
    await assert.rejects(adapter.readProtocolVersion('one'), error => error.issue === 'incompatible');
  }
});
test('missing characteristic maps to incompatible firmware', async () => {
  const { adapter, manager } = native();
  manager.readCharacteristicForDevice = async () => { throw { errorCode: 404 }; };
  await assert.rejects(adapter.readProtocolVersion('one'), error => error.issue === 'incompatible');
});
test('firmware and app share the exact connection contract', () => {
  const sketch = fs.readFileSync('firmware/reboot_sleep/reboot_sleep.ino', 'utf8');
  assert.ok(sketch.includes(`"${protocol.REBOOT_SERVICE_UUID}"`));
  assert.ok(sketch.includes(`"${protocol.PROTOCOL_VERSION_UUID}"`));
  assert.ok(sketch.includes(`protocolVersion = ${protocol.PROTOCOL_VERSION}`));
});
