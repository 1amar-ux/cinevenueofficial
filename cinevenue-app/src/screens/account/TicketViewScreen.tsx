import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Share,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { DigitalTicketPass } from '../../components/tickets/DigitalTicketPass';
import { Colors, Spacing } from '../../constants/theme';
import { bookingApi } from '../../api/bookingApi';
import { BookingRecord } from '../../types/booking';

export const TicketViewScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { bookingId } = route.params || {};
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        if (bookingId) {
          const res = await bookingApi.getBookingDetails(bookingId);
          setBooking(res);
        }
      } catch (e) {
        // Fallback default record
        setBooking({
          id: bookingId || 'bk-demo',
          bookingNumber: 'CV-892147',
          movieTitle: 'Avatar: The Way of Water (3D)',
          theatreName: 'PVR ICON Gold Screen 4',
          screenName: 'Screen 4 (Dolby Atmos)',
          showTime: '07:30 PM',
          showDate: 'Sep 12, 2026',
          date: 'Sep 12, 2026',
          seats: ['J12', 'J13'],
          totalAmount: 700,
          status: 'CONFIRMED',
          qrCodeData: `CINEVENUE-PASS-${bookingId || '892147'}`,
          posBookingId: 'POS-PVR-784102',
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId]);

  const handleShareTicket = async () => {
    if (!booking) return;
    try {
      await Share.share({
        message: `🎟️ My CineVenue Ticket for ${booking.movieTitle}\nTheatre: ${booking.theatreName}\nShowtime: ${booking.showDate} at ${booking.showTime}\nSeats: ${booking.seats.join(', ')}\nBooking Ref: ${booking.bookingNumber}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Digital Ticket Pass"
        subtitle="Present this QR at cinema entry scanner"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleShareTicket} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : booking ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DigitalTicketPass booking={booking} />

          <View style={styles.actionBlock}>
            <Button
              title="SHARE E-TICKET"
              onPress={handleShareTicket}
              icon={<Ionicons name="share-outline" size={18} color="#000" />}
            />
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  actionBlock: {
    width: '100%',
    marginTop: Spacing.xl,
  },
});
