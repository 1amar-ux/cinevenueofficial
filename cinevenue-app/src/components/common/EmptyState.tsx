import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading CineVenue...' }) => {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.gold} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
}> = ({
  title,
  description,
  iconName = 'film-outline',
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={36} color={Colors.gold} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyDescription: {
    ...Typography.body2,
    textAlign: 'center',
    color: Colors.textSecondary,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: Colors.gold,
    fontWeight: '700',
    fontSize: 13,
  },
});
