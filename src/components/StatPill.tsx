import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { font, type } from '../theme/type';
import { colors } from '../theme/colors';

export function StatPill({
  label,
  value,
  accent,
  detail,
}: {
  label: string;
  value: string;
  accent: string;
  detail?: string;
}) {
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexGrow: 1,
    width: '100%',
    minWidth: 0,
    minHeight: 82,
    borderRadius: 8,
    backgroundColor: colors.panelRaised,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 99, marginTop: 5 },
  value: {
    fontFamily: font.rounded,
    fontWeight: '900',
    color: colors.text,
    fontSize: type.bodyLarge,
  },
  label: {
    fontFamily: font.rounded,
    color: colors.muted,
    fontWeight: '700',
    fontSize: type.caption,
    marginTop: 2,
  },
  detail: {
    color: colors.quiet,
    fontFamily: font.rounded,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
