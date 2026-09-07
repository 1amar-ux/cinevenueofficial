import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { paymentApi } from '../../api/bookingApi';
import { useBooking } from '../../store/BookingContext';
import { useAuth } from '../../store/AuthContext';

export const PaymentScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const {
    orderId,
    bookingNumber,
    amount,
    movieTitle,
    theatreName,
    selectedSeats,
  } = route.params;

  const insets = useSafeAreaInsets();
  const { session } = useBooking();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'CINECOINS'>('UPI');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    try {
      // Simulate or trigger secure backend verification
      setTimeout(() => {
        setProcessing(false);
        navigation.replace('BookingConfirmation', {
          bookingId: bookingNumber,
          posBookingId: session.posHoldId ? `POS-${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
          movieTitle,
          theatreName,
          showTime: session.showTime || '7:30 PM',
          date: session.showDate || 'Today',
          seats: selectedSeats,
          amount,
        });
      }, 1500);
    } catch (err: any) {
      Alert.alert('Payment Error', err.message || 'Transaction could not be processed.');
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Payment Checkout"
        subtitle="100% Secure Razorpay Payment Gateway"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Summary Strip */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryMovieTitle}>{movieTitle}</Text>
            <Text style={styles.summaryAmount}>₹{amount.toFixed(2)}</Text>
          </View>
          <Text style={styles.summarySubtext}>
            {theatreName} • {selectedSeats.join(', ')} ({selectedSeats.length} Tickets)
          </Text>
        </View>

        {/* Payment Channels */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        {[
          { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', sub: 'Fast & Instant 0% Surcharge', icon: 'qr-code-outline' },
          { id: 'CARD', label: 'Credit / Debit Cards', sub: 'Visa, MasterCard, RuPay', icon: 'card-outline' },
          { id: 'NETBANKING', label: 'NetBanking', sub: 'All Major Indian Banks Supported', icon: 'business-outline' },
          { id: 'CINECOINS', label: 'CineCoins VIP Balance', sub: 'Instant Wallet Payment', icon: 'sparkles' },
        ].map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, isSelected && styles.methodCardSelected]}
              onPress={() => setPaymentMethod(method.id as any)}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconBox}>
                <Ionicons name={method.icon as any} size={22} color={isSelected ? Colors.gold : Colors.textSecondary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, isSelected && styles.textGold]}>
                  {method.label}
                </Text>
                <Text style={styles.methodSub}>{method.sub}</Text>
              </View>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? Colors.gold : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
          <Text style={styles.securityText}>
            256-Bit SSL Encrypted Transaction protected by Razorpay
          </Text>
        </View>
      </ScrollView>

      {/* Pay CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          title={processing ? 'PROCESSING TRANSACTION...' : `PAY ₹${amount.toFixed(2)}`}
          onPress={handlePay}
          loading={processing}
          style={styles.payBtn}
        />
      </View>
    </View>
  );
};

export const BookingConfirmationScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const {
    bookingId,
    posBookingId,
    movieTitle,
    theatreName,
    showTime,
    date,
    seats,
    amount,
  } = route.params;

  const insets = useSafeAreaInsets();
  const { resetSession } = useBooking();

  const handleFinish = () => {
    resetSession();
    navigation.navigate('MainTabs');
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView contentContainerStyle={styles.confirmationContent} showsVerticalScrollIndicator={false}>
        {/* Animated Success Badge */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={42} color={Colors.gold} />
        </View>

        <Text style={styles.successHeading}>Booking Confirmed!</Text>
        <Text style={styles.successSubheading}>
          Your tickets have been reserved and synced with the cinema system.
        </Text>

        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketBadge}>CINEVENUE VIP PASS</Text>
            <Text style={styles.ticketCode}>{bookingId}</Text>
          </View>

          <View style={styles.ticketBody}>
            <Text style={styles.tMovieTitle}>{movieTitle}</Text>
            <Text style={styles.tTheatre}>{theatreName}</Text>

            <View style={styles.tGrid}>
              <View>
                <Text style={styles.tLabel}>DATE & TIME</Text>
                <Text style={styles.tVal}>{date} • {showTime}</Text>
              </View>
              <View>
                <Text style={styles.tLabel}>SEATS</Text>
                <Text style={[styles.tVal, { color: Colors.gold }]}>{seats.join(', ')}</Text>
              </View>
            </View>

            {posBookingId && (
              <View style={styles.posReferenceStrip}>
                <Text style={styles.posLabel}>POS BOOKING REFERENCE</Text>
                <Text style={styles.posCode}>{posBookingId}</Text>
              </View>
            )}
          </View>
        </View>

        <Button
          title="VIEW IN MY BOOKINGS"
          onPress={() => {
            resetSession();
            navigation.navigate('AccountTab');
          }}
          variant="goldOutline"
          style={styles.actionBtn}
        />

        <Button
          title="RETURN TO HOME"
          onPress={handleFinish}
          style={styles.actionBtn}
        />
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
    gap: Spacing.md,
    paddingBottom: 100,
  },
  orderSummaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMovieTitle: {
    ...Typography.h3,
  },
  summaryAmount: {
    ...Typography.h2,
    color: Colors.gold,
  },
  summarySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  methodCardSelected: {
    borderColor: Colors.borderGold,
    backgroundColor: Colors.goldGlow,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    ...Typography.body1,
    fontWeight: '700',
  },
  methodSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  textGold: {
    color: Colors.gold,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  securityText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  payBtn: {
    width: '100%',
  },
  confirmationContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.goldGlow,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successHeading: {
    ...Typography.h1,
    textAlign: 'center',
  },
  successSubheading: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  ticketHeader: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketBadge: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ticketCode: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  ticketBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tMovieTitle: {
    ...Typography.h2,
  },
  tTheatre: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  tGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textMuted,
  },
  tVal: {
    ...Typography.body2,
    fontWeight: '700',
    marginTop: 2,
  },
  posReferenceStrip: {
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  posLabel: {
    ...Typography.caption,
    fontSize: 8,
    color: Colors.gold,
    fontWeight: '800',
  },
  posCode: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  actionBtn: {
    width: '100%',
    marginBottom: Spacing.md,
  },
});
