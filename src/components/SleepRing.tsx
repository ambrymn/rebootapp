import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { font, type } from '../theme/type';
import { MoonBuddy } from './MoonBuddy';
import { useReducedMotion } from './Motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function SleepRing({ score = 86 }: { score?: number }) {
  const size = 190;
  const stroke = 17;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 850,
      delay: 240,
      easing: (value) => 1 - Math.pow(1 - value, 5),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduced]);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.lineSoft}
          strokeWidth={stroke}
          fill={colors.panel}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress.interpolate({
            inputRange: [0, 1],
            outputRange: [circumference, offset],
          })}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>REST SCORE</Text>
        <View style={styles.rating}><Text style={styles.ratingText}>Great</Text></View>
      </View>
      <MoonBuddy size={60} style={styles.buddy} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 222,
    height: 205,
    alignSelf: 'center',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: 12,
  },
  center: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: type.display,
    lineHeight: 51,
  },
  label: {
    color: colors.primarySoft,
    fontFamily: font.strong,
    fontSize: type.eyebrow,
    letterSpacing: 1.1,
  },
  rating: {
    marginTop: 7,
    borderRadius: 99,
    backgroundColor: colors.mossSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.mossShadow,
  },
  ratingText: {
    color: colors.moss,
    fontFamily: font.strong,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  buddy: {
    position: 'absolute',
    right: 0,
    top: 23,
  },
});
