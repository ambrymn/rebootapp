import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { font, type } from '../theme/type';

export function SleepRing({ score = 86 }: { score?: number }) {
  const size = 188;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 26}
          stroke={colors.lineSoft}
          strokeWidth={1}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.lineSoft}
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>REST SCORE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
  center: { position: 'absolute', alignItems: 'center' },
  score: {
    color: colors.text,
    fontFamily: font.heavy,
    fontSize: type.display,
    fontWeight: '900',
  },
  label: {
    color: colors.primary,
    fontFamily: font.rounded,
    fontSize: type.eyebrow,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: -2,
  },
});
