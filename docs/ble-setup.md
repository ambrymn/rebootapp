# Reboot Sleep Bluetooth setup

This milestone connects one phone to one XIAO ESP32-S3. It verifies the Reboot
Bluetooth service and protocol version, then keeps that connection while you
switch app tabs. It does not collect movement, record sleep, save a device, or
automatically reconnect. No operating-system pairing/PIN/bond is required.

## 1. Wire the board

Use the XIAO ESP32-S3 board's pin labels, not breadboard coordinates alone.
Breadboard holes A4 and D4 share a connection only on a conventional unbroken
five-hole row; verify the rail layout on your breadboard.

| XIAO ESP32-S3 | LIS3DH | Wire | Purpose |
| --- | --- | --- | --- |
| 3V3 | VIN | Red | Power |
| GND | GND | Black | Ground |
| D4 / GPIO5 / SDA | SDA | Blue | I²C data |
| D5 / GPIO6 / SCL | SCL | Yellow | I²C clock |

**The black wire connects GND to the negative rail. Do not connect SCL to ground.**
The earlier wiring notes that called the black wire SCL were a typo. Follow pin
labels if your cable colors differ. The connection-only firmware works even
without the accelerometer attached; it does not initialize I²C or read the LIS3DH.

References: [Seeed XIAO ESP32-S3 setup](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/),
[Adafruit LIS3DH wiring](https://learn.adafruit.com/adafruit-lis3dh-triple-axis-accelerometer-breakout/arduino).

## 2. Upload the firmware with Arduino IDE

1. Install [Arduino IDE 2](https://www.arduino.cc/en/software/).
2. In **File > Preferences > Additional Boards Manager URLs**, add
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`.
3. In Boards Manager install **esp32 by Espressif Systems**, version **3.3.11**
   (the version used to compile this sketch). BLE support is included; do not
   install a separate ArduinoBLE library.
4. Open `firmware/reboot_sleep/reboot_sleep.ino` from this repository.
5. Connect the XIAO with a USB data cable. Select **XIAO_ESP32S3** under the ESP32
   boards and select its USB port. Enable **USB CDC On Boot** for USB serial logs.
6. Click **Verify**, then **Upload**. If the upload cannot find the bootloader,
   hold **BOOT**, tap **RESET**, release **BOOT**, and select the newly appearing
   port before retrying. Tap RESET after uploading if needed.
7. Open Serial Monitor at **115200 baud** and reset the board. Look for
   `Reboot Sleep XXXX advertising; protocol version 1`. Note the four-character
   suffix to identify this board in the app.

The sketch starts advertising without a serial monitor or computer attached.
Power it through USB for the initial test. After a phone disconnects, the log
should say `Advertising again`.

Optional command-line compile with an installed Arduino CLI/core:

```sh
arduino-cli compile --fqbn esp32:esp32:XIAO_ESP32S3 firmware/reboot_sleep
```

## 3. Install a native Reboot development build

Expo Go and web previews cannot connect to BLE hardware. They show an unavailable
state without initializing the Bluetooth bridge. Adding this native dependency
requires a new development build; restarting Metro alone cannot add BLE support.

Install dependencies with Node 20.19.4 or later:

```sh
npm install
```

For cloud builds from Windows, use an Expo account and EAS CLI:

```sh
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile development
npx eas-cli device:create
npx eas-cli build --platform ios --profile development
```

EAS will link or create your project and configure signing. The Android build is
an installable APK. The iOS build requires Apple Developer signing and registration
of the physical iPhone. Both package identifiers are `com.cac.reboot`; configure
them for your own team before creating credentials if that identifier is unavailable.
The app also includes Family Controls: follow
[the existing iOS Screen Time signing setup](ios-screen-time-setup.md).

Alternatively, with Android SDK/JDK installed, use `npx expo run:android --device`.
On a Mac with Xcode use `npx expo run:ios --device`.

After installing the development build on the phone, start Metro:

```sh
npm run start:dev
```

This Windows launcher selects the active LAN address, like the existing Expo Go
launcher. On other systems use `npm run start:dev:plain`. Keep the phone and
computer on the same network and open the development-client QR/deep link.
`npm start` continues to launch Expo Go for UI-only previews.

## 4. Connect

1. Power on the board. Close other Bluetooth apps that might already be connected.
2. Open **Device**, tap **Connect**, and allow Bluetooth access.
3. Select **Reboot Sleep XXXX** from the nearby devices list. Scanning lasts ten
   seconds; use **Scan again** if needed.
4. The app discovers the service and reads its version. Only then does it show
   **Connected**. Connection and verification have a combined 15-second timeout.
5. Switch tabs and return: the connection stays available. Tap **Disconnect**
   to release it. Tap **Connect** to find it again.

Android 12+ requests **Nearby Devices** access. Earlier Android versions require
location permission and Location services for scanning. Reboot does not derive
location from scan results. On iOS, allow Bluetooth when prompted. If permission
is permanently denied, use **Open Settings** on the Device page and retry.

Backgrounding cancels scanning or a pending connection. An established connection
is not deliberately disconnected, but background operation is not guaranteed.
When the app returns, it checks whether the connection still exists. There is no
background BLE mode or automatic reconnection.

## Bluetooth contract

| Item | Value |
| --- | --- |
| Device name | `Reboot Sleep XXXX`; four hex digits derived from the board's eFuse MAC |
| Service UUID | `7b6f0001-6c2d-4a89-9f31-42e51b6a8c90` |
| Protocol-version UUID | `7b6f0002-6c2d-4a89-9f31-42e51b6a8c90` |
| Version value | One byte, `0x01` (Base64 `AQ==` in BLE PLX) |
| Characteristic properties | Read only |
| Advertisement | Primary packet: flags and service UUID; scan response: complete name |

The app filters by service UUID, not the advertised name. Missing characteristics,
malformed values, and versions other than 1 are rejected and disconnected.
This version check establishes compatibility, not authenticated device identity.
No personal/sleep data is exchanged in this prototype.

The controller in `src/services/ble/BleService.ts` owns lifecycle and state. Its
adapter separates native permissions and BLE PLX from React; the provider owns
one controller across tabs. The firmware and `protocol.ts` must change together
when this contract changes.

## Validation and remaining hardware checks

Software checks:

```sh
npm run typecheck
npm test
npx expo export --platform web
npx expo config --type introspect
```

The Node test suite uses a fake adapter and mocked native permission APIs. It
covers discovery, permissions, protocol rejection, timeouts, cancellation, late
callbacks, lifecycle changes, and unavailable environments. It does not replace
radio testing on physical phones. Node 20 may print an experimental MockTimers
warning while running these tests.

Implementation validation: TypeScript and 33 automated tests passed; the sketch
compiled with ESP32 core 3.3.11. Generated Expo native configuration contains the
iOS Bluetooth explanation, Android scan/connect permissions, and location
permissions capped at Android API 30. No background BLE modes are enabled.
Web and iOS/Android JavaScript bundles also generated successfully. Interactive
visual QA was unavailable because no browser was connected to the automation tool.

**Physical iPhone/Android tests and signed native builds are still pending.**
Before calling the hardware integration validated, run this checklist on both:

- [ ] Discover the powered board; exclude unrelated Bluetooth devices.
- [ ] Select the correct board when multiple boards are nearby.
- [ ] Connect, verify protocol 1, switch tabs, disconnect, and manually reconnect.
- [ ] Cancel during scanning and connection; retry without stale UI changes.
- [ ] Deny permission, recover through Settings, and toggle Bluetooth off/on.
- [ ] Power off the board or move it out of range; show disconnected state.
- [ ] Background during scan/connect; return after losing an established connection.
- [ ] Reject firmware with a missing version characteristic or version 2.
- [ ] Confirm the board advertises after disconnect and boots without Serial Monitor.
- [ ] Verify scanning on Android 11 with Location services off and on.

Library reference: [react-native-ble-plx setup](https://github.com/dotintent/react-native-ble-plx).
