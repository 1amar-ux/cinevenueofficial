import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useBooking } from '../../store/BookingContext';
import { useAppSettings } from '../../store/AppSettingsContext';
import { MaintenanceScreen } from '../maintenance/MaintenanceScreen';

export const EventDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { settings } = useAppSettings();
  const eventBookingControl = settings?.serviceControls?.eventBooking;
  const isEventBookingDisabled = eventBookingControl && eventBookingControl.status === false;

  const insets = useSafeAreaInsets();
  const { eventId, title, banner, venue, date, time, price, description, organizer } =
    route.params || {};
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const eventPrice = price || 499;
  const eventTitle = title || 'Exclusive CineVenue Concert & Gala';
  const eventVenue = venue || 'Grand Arena, Film City';
  const eventDate = date || 'Saturday, Sep 20, 2026';
  const eventTime = time || '7:00 PM onwards';
  const eventBanner =
    banner ||
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${eventTitle} on CineVenue! Book tickets now: https://cinevenue.in/events/${eventId || 'vip'}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleBookTickets = () => {
    const totalAmount = eventPrice * ticketCount;
    navigation.navigate('Payment', {
      orderId: `EVT-${Date.now()}`,
      bookingNumber: `EVT-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: totalAmount,
      movieTitle: eventTitle,
      theatreName: eventVenue,
      selectedSeats: [`Pass x${ticketCount}`],
    });
  };

  if (isEventBookingDisabled) {
    return (
      <MaintenanceScreen
        isSubService
        serviceName="Event Booking"
        title={eventBookingControl?.title || 'Event Booking Temporarily Unavailable'}
        message={eventBookingControl?.message || 'Concerts and live events booking is currently offline for maintenance.'}
        expectedTime={eventBookingControl?.expectedTime || 'Shortly'}
        icon="calendar-outline"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Event Details"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <Image source={{ uri: eventBanner }} style={styles.bannerImage} resizeMode="cover" />

        <View style={styles.contentPadding}>
          {/* Badge & Title */}
          <View style={styles.tagRow}>
            <View style={styles.vipTag}>
              <Text style={styles.vipTagText}>VIP LIVE EXPERIENCE</Text>
            </View>
            <View style={styles.genreTag}>
              <Text style={styles.genreTagText}>CONCERT & SHOW</Text>
            </View>
          </View>

          <Text style={styles.eventTitle}>{eventTitle}</Text>

          {/* Quick Info Grid */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.gold} />
              <Text style={styles.infoText}>{eventDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={Colors.gold} />
              <Text style={styles.infoText}>{eventTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={Colors.gold} />
              <Text style={styles.infoText}>{eventVenue}</Text>
            </View>
          </View>

          {/* About Section */}
          <Text style={styles.sectionHeading}>ABOUT THE EVENT</Text>
          <Text style={styles.descriptionText}>
            {description ||
              'Experience an unforgettable night featuring leading artists, mesmerizing visuals, Dolby Atmos live audio amplification, and premium VIP lounge hospitality hosted exclusively by CineVenue Entertainments.'}
          </Text>

          {/* Terms / Highlights */}
          <Text style={styles.sectionHeading}>EVENT HIGHLIGHTS</Text>
          <View style={styles.highlightList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
              <Text style={styles.bulletText}>Complimentary CineCoins redemption available</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
              <Text style={styles.bulletText}>Instant QR code entry pass on your device</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
              <Text style={styles.bulletText}>Age Limit: 12+ years | Valet parking at venue</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.qtyBox}>
            <Text style={styles.qtyLabel}>Select Quantity</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setTicketCount(Math.max(1, ticketCount - 1))}
              >
                <Ionicons name="remove" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{ticketCount}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setTicketCount(Math.min(10, ticketCount + 1))}
              >
                <Ionicons name="add" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceTotalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.priceTotalValue}>₹{(eventPrice * ticketCount).toLocaleString()}</Text>
        </View>
        <Button
          title="BOOK TICKETS"
          onPress={handleBookTickets}
          loading={loading}
          style={styles.bookBtn}
          icon={<Ionicons name="flash" size={18} color="#000" />}
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
  shareBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  bannerImage: {
    width: '100%',
    height: 240,
  },
  contentPadding: {
    padding: Spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  vipTag: {
    backgroundColor: Colors.goldGlow,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  vipTagText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  genreTag: {
    backgroundColor: Colors.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
  },
  genreTagText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  eventTitle: {
    ...Typography.h1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.body2,
    color: Colors.textPrimary,
  },
  sectionHeading: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  highlightList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    marginTop: Spacing.xl,
  },
  qtyLabel: {
    ...Typography.body1,
    fontWeight: '700',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyValue: {
    ...Typography.h2,
    color: Colors.gold,
    minWidth: 24,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  priceContainer: {
    flex: 1,
  },
  priceTotalLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  priceTotalValue: {
    ...Typography.h2,
    color: Colors.gold,
  },
  bookBtn: {
    flex: 1.2,
  },
});
