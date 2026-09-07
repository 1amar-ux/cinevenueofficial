import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { ShowSchedule } from '../../types/movie';

export const ShowtimeChip: React.FC<{
  show: ShowSchedule;
  onPress: () => void;
}> = ({ show, onPress }) => {
  const isFillingFast = show.fillingStatus === 'FILLING_FAST';
  const isSoldOut = show.fillingStatus === 'SOLD_OUT';

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isFillingFast && styles.chipFillingFast,
        isSoldOut && styles.chipSoldOut,
      ]}
      onPress={onPress}
      disabled={isSoldOut}
      activeOpacity={0.8}
    >
      <Text style={[styles.timeText, isSoldOut && styles.textMuted]}>
        {show.startTime}
      </Text>
      <View style={styles.badgeRow}>
        {show.format && <Text style={styles.formatText}>{show.format}</Text>}
        {show.language && <Text style={styles.langText}>{show.language}</Text>}
      </View>
      {isFillingFast && (
        <Text style={styles.fillingFastLabel}>Filling Fast</Text>
      )}
      {isSoldOut && (
        <Text style={styles.soldOutLabel}>Sold Out</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  chipFillingFast: {
    borderColor: Colors.warning,
  },
  chipSoldOut: {
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  textMuted: {
    color: Colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  formatText: {
    fontSize: 9,
    color: Colors.gold,
    fontWeight: '700',
  },
  langText: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  fillingFastLabel: {
    fontSize: 8,
    color: Colors.warning,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  soldOutLabel: {
    fontSize: 8,
    color: Colors.error,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
