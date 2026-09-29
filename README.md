# Reboot — Expo SDK 54

A playful React Native / Expo sleep companion for a wearable band, with an iOS Screen Time connection flow.

## SDK target

This version targets:

- Expo SDK `54.0.0`
- React Native `0.81.x`
- React `19.1.0`

## Includes

- Rounded, playful visual shell
- Gamified home dashboard
- BLE device discovery, verified connection, and manual disconnect on iOS and Android
- Real iOS Screen Time authorization states with no sample activity data
- A local Swift Expo module for Family Controls authorization
- Matching XIAO ESP32-S3 Arduino BLE firmware
- No real hardware sync yet

## Run

React Native 0.81 requires Node `20.19.4` or newer. This machine already has Node 20.20.2 available through NVM:

```bash
nvm install 20.20.2
nvm use 20.20.2
```

```bash
npm install
npx expo install --fix
npm start
```

`npm start` explicitly targets Expo Go and automatically advertises the active Wi-Fi/Ethernet address. This matters on this machine because VMware, VirtualBox, and VPN adapters can otherwise cause Expo to put an unreachable address in the QR code. It also chooses a free Metro port automatically.

Make sure the computer and phone are connected to the same Wi-Fi, then scan the newly generated QR code. If Windows asks about network access, allow Node.js on **Private networks**.

The unmodified Expo LAN launcher remains available for other environments:

```bash
npm run start:plain
```

Most UI can be previewed in Expo Go. The Tracker displays a build-required state instead of calling unavailable native code. Actual Screen Time authorization still requires a custom iOS development build on a physical iPhone.

## Screens

- Home: sleep score, Dream XP, quests, streaks
- Device: scan for nearby Reboot Sleep devices, connect, and disconnect
- Tracker: Apple Screen Time connection and privacy flow

## iOS Screen Time setup

See [docs/ios-screen-time-setup.md](docs/ios-screen-time-setup.md) for Apple entitlements, development builds, physical-device testing, and the Device Activity Report Extension needed to display live usage.

## Bluetooth device setup

See [docs/ble-setup.md](docs/ble-setup.md) for corrected LIS3DH wiring, Arduino
firmware upload, native development builds, permissions, and physical-device tests.
BLE requires a development build; Expo Go and web show a build-required state.
Use `npm run start:dev` after installing that build. `npm start` still uses Expo Go.

The first BLE milestone verifies a connection only. Sensor streaming and sleep
recording are not implemented yet. Run `npm test` and `npm run typecheck` for the
connection controller and native adapter checks.


## Troubleshooting

If you see:

```text
Cannot find module 'babel-preset-expo'
```

run:

```bash
npm install
npx expo install babel-preset-expo
npx expo start -c
```

This fixed package already includes `babel-preset-expo` in `devDependencies`.
