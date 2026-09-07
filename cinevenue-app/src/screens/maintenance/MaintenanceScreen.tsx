import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAppSettings } from '../../store/AppSettingsContext';

interface MaintenanceScreenProps {
  title?: string;
  message?: string;
  expectedTime?: string | null;
  serviceName?: string;
  icon?: string;
  onRetry?: () => Promise<void>;
  isSubService?: boolean;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  title,
  message,
  expectedTime,
  serviceName = 'CineVenue Mobile',
  icon = 'construct-outline',
  onRetry,
  isSubService = false,
}) => {
  const { settings, refreshSettings } = useAppSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayTitle = title || settings.maintenanceTitle || 'Platform Under Maintenance';
  const displayMessage =
    message ||
    settings.maintenanceMessage ||
    "We are upgrading our booking servers to provide a faster, seamless VIP entertainment experience. We'll be back online shortly.";
  const displayTime =
    expectedTime ||
    settings.maintenanceEndTime ||
    settings.serviceControls?.website?.expectedTime ||
    'Shortly';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        await refreshSettings();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Glow Header Accent */}
        <View style={styles.glowCircle} />

        {/* Brand Header */}
        <View style={styles.brandRow}>
          <Text style={styles.brandCine}>CINE</Text>
          <Text style={styles.brandVenue}>VENUE</Text>
        </View>

        {/* Maintenance Status Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>
            {isSubService ? `${serviceName.toUpperCase()} OFFLINE` : 'SYSTEM STANDBY MODE'}
          </Text>
        </View>

        {/* Card Box */}
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.08)', 'rgba(18, 18, 22, 0.95)']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={(icon as any) || 'construct-outline'} size={40} color={Colors.gold} />
          </View>

          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>

          {/* Expected Return Notice */}
          <View style={styles.timeCard}>
            <Ionicons name="time-outline" size={18} color={Colors.gold} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>ESTIMATED RESUMPTION</Text>
              <Text style={styles.timeValue}>{displayTime}</Text>
            </View>
          </View>

          {/* Notice Points */}
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={15} color={Colors.success} style={styles.infoIcon} />
              <Text style={styles.infoText}>Existing confirmed tickets and CineCoins remain 100% safe.</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={15} color={Colors.gold} style={styles.infoIcon} />
              <Text style={styles.infoText}>Financial settlement and payment ledgers are secure.</Text>
            </View>
          </View>

          {/* Refresh / Check Status Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleManualRefresh}
            activeOpacity={0.8}
            disabled={isRefreshing}
          >
            <LinearGradient
              colors={[Colors.gold, '#B8860B']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color="#000" />
                  <Text style={styles.buttonText}>Check System Status</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Footer */}
        <Text style={styles.footerText}>
          CineVenue Global Service Orchestrator • Mobile App Failsafe
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  glowCircle: {
    position: 'absolute',
    top: 40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    filter: 'blur(40px)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandCine: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandVenue: {
    ...Typography.h2,
    color: Colors.gold,
    fontWeight: '900',
    letterSpacing: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  badgeText: {
    ...Typography.caption,
    color: '#FDA4AF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: '800',
  },
  message: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeValue: {
    ...Typography.body2,
    color: Colors.gold,
    fontWeight: '700',
    marginTop: 2,
  },
  infoList: {
    width: '100%',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
  refreshButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  buttonText: {
    ...Typography.body2,
    color: '#000000',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: 10,
  },
});

export default MaintenanceScreen;
