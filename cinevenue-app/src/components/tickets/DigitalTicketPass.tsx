import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { BookingRecord } from '../../types/booking';

export const DigitalTicketPass: React.FC<{
  booking: BookingRecord;
}> = ({ booking }) => {
  const qrData = booking.qrCodeData || booking.posBookingId || booking.bookingNumber || booking.id;

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.badgeText}>E-TICKET CONFIRMED</Text>
        <Text style={styles.bookingNumberText}>{booking.bookingNumber}</Text>
      </View>

      {/* Movie Details */}
      <View style={styles.body}>
        <Text style={styles.movieTitle}>{booking.movieTitle}</Text>
        <Text style={styles.theatreName}>
          {booking.theatreName} • {booking.screenName}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SHOW DATE</Text>
            <Text style={styles.detailValue}>{booking.showDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SHOWTIME</Text>
            <Text style={styles.detailValue}>{booking.showTime}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SEATS ({booking.seats.length})</Text>
            <Text style={[styles.detailValue, { color: Colors.gold }]}>
              {booking.seats.join(', ')}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TOTAL PAID</Text>
            <Text style={styles.detailValue}>₹{booking.totalAmount}</Text>
          </View>
        </View>

        {booking.posBookingId && (
          <View style={styles.posReferenceBanner}>
            <Text style={styles.posLabel}>POS BOOKING REFERENCE</Text>
            <Text style={styles.posValue}>{booking.posBookingId}</Text>
          </View>
        )}
      </View>

      {/* Perforated Divider */}
      <View style={styles.perforatedRow}>
        <View style={styles.notchLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.notchRight} />
      </View>

      {/* QR Code Gate Pass */}
      <View style={styles.qrSection}>
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={120}
            color="#000000"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.qrInstruction}>
          Scan this digital mobile pass at the cinema turnstile entrance
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  cardHeader: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bookingNumberText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  movieTitle: {
    ...Typography.h2,
    fontSize: 20,
  },
  theatreName: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.caption,
    fontSize: 9,
    letterSpacing: 0.5,
    color: Colors.textMuted,
  },
  detailValue: {
    ...Typography.body1,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  posReferenceBanner: {
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  posLabel: {
    ...Typography.caption,
    fontSize: 8,
    color: Colors.gold,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  posValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    overflow: 'hidden',
  },
  notchLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginLeft: -12,
  },
  notchRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginRight: -12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  qrSection: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  qrContainer: {
    padding: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  qrInstruction: {
    ...Typography.caption,
    textAlign: 'center',
    maxWidth: 240,
  },
});
