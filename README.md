# SleepBand Mock UI — Expo SDK 54

A UI-only React Native / Expo mock for a gamified sleep tracker wrist wearable.

## SDK target

This version targets:

- Expo SDK `54.0.0`
- React Native `0.81.x`
- React `19.1.0`

## Includes

- Rounded, playful visual shell
- Gamified home dashboard
- Empty device connection page
- Fake iOS Screen Time-inspired tracker page
- No real BLE yet
- No real hardware sync yet

## Run

```bash
npm install
npx expo install --fix
npx expo start
```

Then open in Expo Go or an iOS simulator.

## Screens

- Home: sleep score, Dream XP, quests, streaks
- Device: empty BLE connection state
- Tracker: fake iOS-style screen time and sleep timeline visuals

## Next step

After the UI is approved, add real BLE scanning using `react-native-ble-plx`.


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
