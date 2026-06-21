import { Platform } from 'react-native';

export const font = {
  rounded: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-rounded',
    default: 'System',
  }),
  heavy: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-condensed',
    default: 'System',
  }),
};

export const type = {
  eyebrow: 11,
  caption: 12,
  body: 15,
  bodyLarge: 17,
  title: 30,
  display: 42,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
