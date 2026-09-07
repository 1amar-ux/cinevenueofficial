import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const Badge: React.FC<{
  label: string;
  variant?: 'gold' | 'success' | 'warning' | 'error' | 'muted';
}> = ({ label, variant = 'gold' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'gold':
        return { bg: Colors.goldGlow, text: Colors.gold, border: Colors.borderGold };
      case 'success':
        return { bg: Colors.successLight, text: Colors.success, border: 'rgba(16,185,129,0.3)' };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning, border: 'rgba(245,158,11,0.3)' };
      case 'error':
        return { bg: Colors.errorLight, text: Colors.error, border: 'rgba(239,68,68,0.3)' };
      default:
        return { bg: Colors.surfaceLight, text: Colors.textSecondary, border: Colors.border };
    }
  };

  const styleConfig = getStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: styleConfig.bg, borderColor: styleConfig.border },
      ]}
    >
      <Text style={[styles.badgeText, { color: styleConfig.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
