# iOS Screen Time setup

The Tracker now has a real connection flow instead of sample metrics. It reads and requests Apple's `FamilyControls` authorization through the local Expo module in `modules/reboot-screen-time`.

There are two distinct stages:

1. **Connect Screen Time** — implemented in this repository. The user taps the button, iOS authenticates them, and the Tracker reflects the real authorization state.
2. **Show live usage** — requires a separate Device Activity Report Extension target. Apple intentionally renders this data inside a sandboxed SwiftUI extension; it is not normal React Native or backend data.

## What you need

- A unique iOS bundle identifier, such as `com.yourcompany.reboot`.
- An Apple Developer account and access to Certificates, Identifiers & Profiles. The Account Holder must make the distribution entitlement request.
- A physical iPhone running iOS 16 or newer for the individual authorization flow.
- Either a Mac with current Xcode, or an Expo/EAS account for cloud iOS builds. A Mac is still the simplest place to create and debug the report-extension target.
- A custom development build. Expo Go cannot load the Swift module included in this project.

## 1. Set the final bundle identifier

Add your real identifier to `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.reboot",
      "supportsTablet": true,
      "entitlements": {
        "com.apple.developer.family-controls": true
      }
    }
  }
}
```

Do this before generating signing credentials. Changing it later creates a different App ID.

## 2. Enable Family Controls in Apple Developer

In Certificates, Identifiers & Profiles:

1. Register the main App ID using the bundle identifier from step 1.
2. Enable the **Family Controls** capability for that identifier.
3. For development, use automatic signing or regenerate the development provisioning profile after enabling the capability.
4. Before TestFlight or App Store distribution, have the Apple Developer Account Holder request the **Family Controls (Distribution)** managed capability.

The entitlement is already declared in `app.json`, so Expo prebuild will add `com.apple.developer.family-controls = true` to the main app. The provisioning profile still has to grant the same entitlement; declaring it in code is not enough.

Apple's setup references:

- [Configuring Family Controls](https://developer.apple.com/documentation/xcode/configuring-family-controls)
- [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/FamilyControls/requesting-the-family-controls-entitlement)

## 3. Create an iOS development build

Install the development client once:

```bash
npx expo install expo-dev-client
```

### From a Mac

Connect the iPhone, enable Developer Mode on it, then run:

```bash
npx expo run:ios --device
```

Expo runs prebuild automatically when the native folders do not exist. The local module under `modules/reboot-screen-time` is discovered by Expo Autolinking.

### From Windows or with EAS

```bash
npm install --global eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
```

Register the test iPhone when EAS prompts you. Install the resulting development build on that device. Rebuild the native client after changing Swift code, entitlements, native targets, or native dependencies; restarting Metro is not sufficient.

Expo references:

- [Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Add custom native code](https://docs.expo.dev/workflow/customizing/)
- [Create an iOS development build for a device](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/)

## 4. Test the connection flow

On the physical iPhone:

1. Open Tracker.
2. Tap **Connect Screen Time**.
3. Approve Apple's system request with Face ID, Touch ID, or the device passcode.
4. Confirm that Tracker changes to **Screen Time is connected**.
5. Turn access off in iOS Settings, return to the app, and confirm the denied state and Settings recovery flow.

The native bridge uses `AuthorizationCenter.shared.requestAuthorization(for: .individual)`. Apple owns the authentication screen and authorization status. Once approved, repeated authorization calls do not show the biometric prompt again.

- [AuthorizationCenter.requestAuthorization(for:)](https://developer.apple.com/documentation/familycontrols/authorizationcenter/requestauthorization%28for%3A%29)

If Tracker says **Build required**, the app is running in Expo Go or in an older build that does not include the local Swift module.

## 5. Add the live bedtime report

Authorization does not provide raw usage records to JavaScript. For a normal worldwide release, add a **Device Activity Report Extension** and render the usage summary there.

On a Mac in Xcode:

1. Generate/open the native project with `npx expo run:ios` or `npx expo prebuild`.
2. Choose **File > New > Target** and add a **Device Activity Report Extension**.
3. Name it something stable, for example `RebootScreenTimeReport`.
4. Give it a unique bundle identifier such as `com.yourcompany.reboot.screen-time-report`.
5. Add the **Family Controls** capability to the extension target as well as the main target.
6. Register the extension's App ID in Apple Developer and regenerate its provisioning profile.
7. Submit a separate Family Controls distribution-entitlement request for the extension. Apple explicitly requires a request for each Screen Time API extension.
8. Implement a `DeviceActivityReportScene` for a bedtime context and render it from the extension's `DeviceActivityReportExtension` entry point.
9. In the app's native iOS layer, present `DeviceActivityReport(context, filter:)` using a `DeviceActivityFilter` for the selected evening interval, user, and iPhone.

The filter can limit the report to a date interval, user, device, applications, categories, and web domains. Keep the report focused on bedtime totals and category trends so it complements the sleep data without exposing more activity than the user needs.

Apple references:

- [DeviceActivityReport](https://developer.apple.com/documentation/DeviceActivity/DeviceActivityReport)
- [DeviceActivityReportExtension](https://developer.apple.com/documentation/deviceactivity/deviceactivityreportextension)
- [DeviceActivityReportScene](https://developer.apple.com/documentation/deviceactivity/deviceactivityreportscene)
- [DeviceActivityFilter](https://developer.apple.com/documentation/deviceactivity/deviceactivityfilter)
- [WWDC22: What's new in Screen Time API](https://developer.apple.com/videos/play/wwdc2022/110336/)

### Preserve the report target in Expo

Do not create the extension manually and then run `expo prebuild --clean` unless a config plugin also recreates that target; a clean prebuild replaces generated native projects.

For a prototype, the quickest route is to generate and commit the `ios` project after adding the Xcode target. For long-term Continuous Native Generation, move the target creation and source copying into an Expo config plugin.

When using EAS Build, declare the extension so EAS can create and validate its credentials before the Xcode project exists:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "build": {
          "experimental": {
            "ios": {
              "appExtensions": [
                {
                  "targetName": "RebootScreenTimeReport",
                  "bundleIdentifier": "com.yourcompany.reboot.screen-time-report",
                  "entitlements": {
                    "com.apple.developer.family-controls": true
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

This declaration manages credentials; it does not create the Xcode target by itself.

- [Expo: iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/)

## Privacy constraint to keep

Apple's standard Device Activity report extension cannot make network requests or move sensitive usage content outside the extension's address space. Render the bedtime report in the extension and do not attempt to copy app or website activity into React Native, shared preferences, analytics, or your backend.

That means the clean product architecture is:

```text
Tracker button -> native Family Controls authorization
               -> native DeviceActivityReport host
               -> sandboxed SwiftUI report extension
```

Apple introduced `FamilyActivityData` and `approvedWithDataAccess` for more direct data access, but customer installations can receive that authorization only in the European Union, and only one app can hold it on a device. Do not make that the default architecture for a worldwide Reboot release.

- [AuthorizationStatus.approvedWithDataAccess](https://developer.apple.com/documentation/FamilyControls/AuthorizationStatus/approvedWithDataAccess)

## Release checklist

- [ ] Final main-app and report-extension bundle identifiers are registered.
- [ ] Family Controls is enabled for both identifiers.
- [ ] Development profiles contain the Family Controls entitlement.
- [ ] Distribution entitlement requests are approved for both targets.
- [ ] The main app and extension are signed by the same Apple Developer team.
- [ ] A physical iPhone test covers not determined, approved, denied, Settings changes, and app relaunch.
- [ ] The live report is tested with Screen Time enabled and real device activity.
- [ ] The privacy policy explains the on-device Screen Time report and how to revoke access.
- [ ] App Review notes explain why Family Controls is used and where the reviewer can exercise the flow.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Tracker shows **Build required** | Install a newly compiled development build, not Expo Go. |
| Authorization throws immediately | Verify iOS 16+, the main target entitlement, App ID capability, team, and provisioning profile. |
| Tracker shows **Access off** | Enable Screen Time access for Reboot in iOS Settings, then return to the app. |
| Authorization works but no live report appears | The Device Activity Report Extension still needs to be added, signed, and embedded. |
| Report is empty | Test on a physical iPhone with Screen Time enabled and activity in the chosen filter interval. |
| EAS cannot sign the extension | Confirm the extension declaration, unique bundle ID, Apple App ID, entitlement approval, and provisioning profile. |
