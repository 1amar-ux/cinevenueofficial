import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { bookingApi } from '../../api/bookingApi';
import { BookingRecord } from '../../types/booking';

export const MyBookingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (e) {
      // Demo / fallback state
      setBookings([
        {
          id: 'bk-101',
          bookingNumber: 'CV-892147',
          movieTitle: 'Avatar: The Way of Water (3D)',
          theatreName: 'PVR ICON Gold Screen 4',
          screenName: 'Screen 4 (Dolby Atmos)',
          showTime: '07:30 PM',
          date: 'Sep 12, 2026',
          seats: ['J12', 'J13'],
          totalAmount: 700,
          status: 'CONFIRMED',
          qrCodeData: 'CV-892147-J12-J13',
          posBookingReference: 'POS-PVR-784102',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'bk-102',
          bookingNumber: 'CV-541290',
          movieTitle: 'Oppenheimer (IMAX 70mm)',
          theatreName: 'INOX Megaplex Grand Cinema',
          screenName: 'IMAX Screen 1',
          showTime: '04:15 PM',
          date: 'Aug 24, 2026',
          seats: ['G08', 'G09', 'G10'],
          totalAmount: 1450,
          status: 'COMPLETED',
          qrCodeData: 'CV-541290-G08-G09-G10',
          createdAt: '2026-08-24T12:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Bookings"
        subtitle="Manage tickets, active QR passes & past shows"
        showBack
      />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="ticket-outline" size={54} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySub}>
                Explore currently showing blockbusters and reserve your VIP seats today!
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('MoviesTab')}
              >
                <Text style={styles.exploreBtnText}>EXPLORE MOVIES</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const isConfirmed = item.status === 'CONFIRMED';
            return (
              <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => navigation.navigate('TicketView', { bookingId: item.id })}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.movieTitle} numberOfLines={1}>
                      {item.movieTitle}
                    </Text>
                    <Text style={styles.theatreName}>{item.theatreName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isConfirmed ? Colors.goldGlow : Colors.surfaceLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isConfirmed ? Colors.gold : Colors.textSecondary },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Details Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>DATE & TIME</Text>
                    <Text style={styles.infoVal}>
                      {item.date} • {item.showTime}
                    </Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>SEATS</Text>
                    <Text style={styles.infoVal}>{item.seats.join(', ')}</Text>
                  </View>
                </View>

                {/* Footer Strip */}
                <View style={styles.cardFooter}>
                  <Text style={styles.bookingRef}>Ref: {item.bookingNumber}</Text>
                  <View style={styles.viewPassRow}>
                    <Text style={styles.viewPassText}>VIEW DIGITAL PASS</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
  },
  emptySub: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  exploreBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  exploreBtnText: {
    fontWeight: '800',
    color: '#000000',
    fontSize: 12,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  movieTitle: {
    ...Typography.h3,
    maxWidth: 220,
  },
  theatreName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textMuted,
  },
  infoVal: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookingRef: {
    ...Typography.caption,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  viewPassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewPassText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.gold,
  },
});
