import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);

  return reduced;
}

export function Enter({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration: 520,
      easing: (value) => 1 - Math.pow(1 - value, 4),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress, reduced]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function PressableScale({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const reduced = useReducedMotion();
  const pressed = useRef(new Animated.Value(0)).current;

  const move = (toValue: number) => {
    if (reduced) {
      pressed.setValue(toValue);
      return;
    }
    Animated.timing(pressed, {
      toValue,
      duration: toValue ? 110 : 180,
      easing: (value) => 1 - Math.pow(1 - value, 4),
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => move(1)}
      onPressOut={() => move(0)}
      style={[
        style,
        {
          transform: [
            { translateY: pressed.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) },
            { scale: pressed.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] }) },
          ],
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
