import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export const SupportPoliciesScreen: React.FC<{ navigation: any }> = () => {
  const handleCallSupport = () => {
    Linking.openURL('tel:18001234567').catch(() => {
      Alert.alert('Customer Support', 'Call CineVenue Concierge at: +91 1800-123-4567');
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@cinevenue.in?subject=CineVenue Mobile App Support').catch(() => {
      Alert.alert('Customer Support', 'Email us at support@cinevenue.in');
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Help & Policies" subtitle="Customer Concierge, Terms & FAQ" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Direct Action Cards */}
        <Text style={styles.sectionHeading}>24/7 VIP CONCIERGE</Text>
        <View style={styles.supportRow}>
          <TouchableOpacity style={styles.supportCard} onPress={handleCallSupport}>
            <Ionicons name="call" size={24} color={Colors.gold} />
            <Text style={styles.supportCardTitle}>Toll-Free Helpline</Text>
            <Text style={styles.supportCardSub}>1800-123-4567</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportCard} onPress={handleEmailSupport}>
            <Ionicons name="mail" size={24} color={Colors.gold} />
            <Text style={styles.supportCardTitle}>Email Support</Text>
            <Text style={styles.supportCardSub}>support@cinevenue.in</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqList}>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>How do I enter the cinema using my e-ticket?</Text>
            <Text style={styles.faqA}>
              Open your ticket in "My Bookings" and present the QR code at the theatre usher gate. It scans instantly on all connected POS systems.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>How do CineCoins work during checkout?</Text>
            <Text style={styles.faqA}>
              Each CineCoin equals ₹1.00. You can toggle "Redeem CineCoins" during payment to deduct the value immediately from your ticket total.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Can I cancel or reschedule a ticket?</Text>
            <Text style={styles.faqA}>
              Cancellations depend on individual theatre policies. If supported, you can cancel up to 2 hours before showtime for a refund or CineCoins credit.
            </Text>
          </View>
        </View>

        {/* Legal Policies */}
        <Text style={styles.sectionHeading}>TERMS & COMPLIANCE</Text>
        <View style={styles.card}>
          <Text style={styles.policyText}>
            CineVenue Entertainments strictly adheres to digital entertainment ticketing guidelines, encrypted PCI-DSS payment compliance, and authorized theatre POS synchronization protocols. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionHeading: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  supportRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  supportCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  supportCardTitle: {
    ...Typography.body2,
    fontWeight: '700',
    marginTop: 4,
  },
  supportCardSub: {
    ...Typography.caption,
    color: Colors.gold,
  },
  faqList: {
    gap: Spacing.sm,
  },
  faqItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqQ: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  faqA: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  policyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
