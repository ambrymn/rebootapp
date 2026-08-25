import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const icon = label === 'Asleep' ? 'moon' : 'pulse';

  return (
    <View style={styles.pill}>
      <View style={[styles.icon, { borderColor: accent }]}>
        <Ionicons name={icon} size={14} color={accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {detail ? <Text style={[styles.detail, { color: accent }]}>{detail} vs usual</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minWidth: 0,
    minHeight: 98,
    borderRadius: 17,
    backgroundColor: colors.panel,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.lineSoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0 },
  value: {
    fontFamily: font.heavy,
    color: colors.text,
    fontSize: type.bodyLarge,
    marginTop: 2,
  },
  label: {
    fontFamily: font.rounded,
    color: colors.muted,
    fontSize: type.caption,
  },
  detail: {
    fontFamily: font.strong,
    fontSize: 10,
    marginTop: 2,
  },
});
