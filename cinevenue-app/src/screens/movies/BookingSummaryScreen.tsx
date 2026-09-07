import React, { useState, useEffect } from 'react';
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
import { Input } from '../../components/common/Input';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { bookingApi } from '../../api/bookingApi';
import { cineCoinApi } from '../../api/services';
import { PriceBreakdown } from '../../types/booking';
import { useBooking } from '../../store/BookingContext';
import { useAuth } from '../../store/AuthContext';

export const BookingSummaryScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const {
    showId,
    movieTitle,
    theatreName,
    screenName,
    showTime,
    date,
    selectedSeats,
    basePrice,
  } = route.params;

  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { updateSession } = useBooking();

  const [couponCode, setCouponCode] = useState('');
  const [redeemCineCoins, setRedeemCineCoins] = useState(false);
  const [coinsBalance, setCoinsBalance] = useState(user?.cineCoinsBalance || 150);
  const [breakdown, setBreakdown] = useState<PriceBreakdown>({
    ticketSubtotal: totalPrice(),
    convenienceFee: 30,
    platformFee: 15,
    ticketTax: 18,
    convenienceFeeTax: 5.4,
    totalTaxes: 23.4,
    discountAmount: 0,
    cineCoinsRedeemed: 0,
    cineCoinsDiscount: 0,
    total: totalPrice() + 30 + 15 + 23.4,
  });
  const [loading, setLoading] = useState(false);

  function totalPrice() {
    return basePrice || selectedSeats.length * 250;
  }

  const fetchBreakdown = async () => {
    try {
      const data = await bookingApi.calculatePrice({
        showId,
        seatIds: selectedSeats,
        couponCode: couponCode.trim() || undefined,
        cineCoinsToRedeem: redeemCineCoins ? Math.min(coinsBalance, 100) : 0,
      });
      if (data) {
        setBreakdown(data);
        updateSession({ breakdown: data });
      }
    } catch (e) {
      // Fallback local breakdown
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, [redeemCineCoins]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Coupon Required', 'Please type a valid coupon code.');
      return;
    }
    fetchBreakdown();
    Alert.alert('Coupon Applied', `Code "${couponCode.toUpperCase()}" evaluated.`);
  };

  const handleProceedToPayment = () => {
    navigation.navigate('Payment', {
      orderId: `ORD-${Date.now()}`,
      bookingNumber: `CV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: breakdown.total,
      movieTitle,
      theatreName,
      selectedSeats,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Booking Summary"
        subtitle="Review your order & loyalty benefits"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cinema & Showtime Card */}
        <View style={styles.card}>
          <Text style={styles.movieTitle}>{movieTitle}</Text>
          <Text style={styles.theatreMeta}>{theatreName} • {screenName}</Text>
          <View style={styles.timeTagRow}>
            <View style={styles.infoPill}>
              <Ionicons name="calendar-outline" size={14} color={Colors.gold} />
              <Text style={styles.pillText}>{date}</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="time-outline" size={14} color={Colors.gold} />
              <Text style={styles.pillText}>{showTime}</Text>
            </View>
          </View>
          <View style={styles.seatsRow}>
            <Text style={styles.seatsLabel}>Seats ({selectedSeats.length}):</Text>
            <Text style={styles.seatsValue}>{selectedSeats.join(', ')}</Text>
          </View>
        </View>

        {/* CineCoins Loyalty Redemption Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.flexRow}>
              <Ionicons name="sparkles" size={18} color={Colors.gold} />
              <Text style={styles.cardHeaderTitle}>Redeem CineCoins</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, redeemCineCoins && styles.toggleBtnActive]}
              onPress={() => setRedeemCineCoins(!redeemCineCoins)}
            >
              <Text style={[styles.toggleBtnText, redeemCineCoins && styles.textBlack]}>
                {redeemCineCoins ? 'APPLIED' : 'APPLY'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cineCoinHint}>
            Balance: <Text style={{ color: Colors.gold, fontWeight: '700' }}>{coinsBalance} Coins</Text>. Save up to ₹50 on this ticket order.
          </Text>
        </View>

        {/* Coupon Box */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Promotional Coupon</Text>
          <View style={styles.couponRow}>
            <Input
              placeholder="Enter Promo Code (e.g. CINE50)"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              style={styles.couponInput}
            />
            <Button
              title="APPLY"
              size="sm"
              onPress={handleApplyCoupon}
              style={styles.couponBtn}
            />
          </View>
        </View>

        {/* Detailed Itemized Ledger */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Price Breakdown</Text>
          
          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Base Tickets Subtotal</Text>
            <Text style={styles.ledgerValue}>₹{breakdown.ticketSubtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Convenience Fee</Text>
            <Text style={styles.ledgerValue}>+₹{breakdown.convenienceFee.toFixed(2)}</Text>
          </View>

          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Platform & Maintenance Fee</Text>
            <Text style={styles.ledgerValue}>+₹{breakdown.platformFee.toFixed(2)}</Text>
          </View>

          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Integrated Taxes (GST 18%)</Text>
            <Text style={styles.ledgerValue}>+₹{breakdown.totalTaxes.toFixed(2)}</Text>
          </View>

          {breakdown.discountAmount > 0 && (
            <View style={styles.ledgerItem}>
              <Text style={[styles.ledgerLabel, { color: Colors.purple }]}>Coupon Discount</Text>
              <Text style={[styles.ledgerValue, { color: Colors.purple }]}>-₹{breakdown.discountAmount.toFixed(2)}</Text>
            </View>
          )}

          {redeemCineCoins && (
            <View style={styles.ledgerItem}>
              <Text style={[styles.ledgerLabel, { color: Colors.gold }]}>CineCoins VIP Discount</Text>
              <Text style={[styles.ledgerValue, { color: Colors.gold }]}>-₹50.00</Text>
            </View>
          )}

          <View style={[styles.ledgerItem, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              ₹{(redeemCineCoins ? Math.max(breakdown.total - 50, 0) : breakdown.total).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View>
          <Text style={styles.totalPayableLabel}>TOTAL PAYABLE</Text>
          <Text style={styles.grandPriceText}>
            ₹{(redeemCineCoins ? Math.max(breakdown.total - 50, 0) : breakdown.total).toFixed(2)}
          </Text>
        </View>
        <Button
          title="PROCEED TO PAY"
          onPress={handleProceedToPayment}
          style={styles.payBtn}
        />
      </View>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  movieTitle: {
    ...Typography.h2,
    fontSize: 18,
  },
  theatreMeta: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  timeTagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  pillText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  seatsLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  seatsValue: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.gold,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardHeaderTitle: {
    ...Typography.h3,
    fontSize: 15,
  },
  toggleBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.gold,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.gold,
  },
  textBlack: {
    color: '#000000',
  },
  cineCoinHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  couponInput: {
    flex: 1,
  },
  couponBtn: {
    height: 48,
    marginTop: -Spacing.md,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  ledgerLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  ledgerValue: {
    ...Typography.body2,
    fontFamily: 'monospace',
    color: Colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    ...Typography.h3,
    fontSize: 16,
  },
  totalValue: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.gold,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPayableLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textMuted,
  },
  grandPriceText: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.gold,
  },
  payBtn: {
    paddingHorizontal: Spacing.xl,
  },
});
