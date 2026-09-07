import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}> = ({ title, subtitle, actionText = 'See All', onAction, iconName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <View style={styles.titleRow}>
          {iconName && <Ionicons name={iconName} size={18} color={Colors.gold} style={styles.icon} />}
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onAction && (
        <TouchableOpacity onPress={onAction} style={styles.actionBtn} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const QuickCineCoinWidget: React.FC<{
  balance: number;
  onPress: () => void;
  onSpinPress?: () => void;
}> = ({ balance, onPress, onSpinPress }) => {
  return (
    <TouchableOpacity style={styles.widget} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.widgetLeft}>
        <View style={styles.coinIcon}>
          <Ionicons name="sparkles" size={20} color={Colors.gold} />
        </View>
        <View>
          <Text style={styles.widgetTitle}>CineCoins Rewards</Text>
          <Text style={styles.widgetBalance}>
            <Text style={styles.balanceHighlight}>{balance.toLocaleString()}</Text> Coins Available
          </Text>
        </View>
      </View>
      {onSpinPress ? (
        <TouchableOpacity style={styles.spinBtn} onPress={onSpinPress}>
          <Text style={styles.spinBtnText}>SPIN & WIN</Text>
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Colors.gold} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  titleWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  title: {
    ...Typography.h3,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
    marginRight: 2,
  },
  widget: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  widgetTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  widgetBalance: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  balanceHighlight: {
    color: Colors.gold,
    fontWeight: '800',
    fontSize: 16,
  },
  spinBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  spinBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
