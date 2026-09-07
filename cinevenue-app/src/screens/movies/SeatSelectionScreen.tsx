import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { InteractiveSeatMap } from '../../components/movies/InteractiveSeatMap';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { showApi } from '../../api/movieApi';
import { bookingApi } from '../../api/bookingApi';
import { SeatInfo } from '../../types/movie';
import { useBooking } from '../../store/BookingContext';

export const SeatSelectionScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const {
    showId,
    movieTitle,
    theatreId,
    theatreName,
    screenName,
    showTime,
    date,
    pricePerSeat = 250,
  } = route.params;

  const insets = useSafeAreaInsets();
  const { session, toggleSeat, updateSession } = useBooking();

  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    // Generate standard seat grid or fetch real-time from server
    showApi
      .getSeats(showId, theatreId)
      .then((data) => {
        if (data.seats && data.seats.length > 0) {
          setSeats(data.seats);
        } else {
          // Build standard CineVenue auditorium grid (A to G, 1 to 10)
          const fallbackSeats: SeatInfo[] = [];
          const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          rows.forEach((r) => {
            for (let col = 1; col <= 10; col++) {
              const isSold = ['A3', 'A4', 'C5', 'D6', 'E2'].includes(`${r}${col}`);
              const isVip = ['A', 'B'].includes(r);
              fallbackSeats.push({
                id: `${r}${col}`,
                seatNumber: `${r}${col}`,
                row: r,
                column: col,
                tier: isVip ? 'VIP' : 'SILVER',
                price: isVip ? pricePerSeat * 1.5 : pricePerSeat,
                status: isSold ? 'SOLD' : 'AVAILABLE',
              });
            }
          });
          setSeats(fallbackSeats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [showId]);

  const selectedCount = session.selectedSeats.length;
  const totalPrice = session.selectedSeats.reduce((sum, seatId) => {
    const s = seats.find((seat) => seat.id === seatId || seat.seatNumber === seatId);
    return sum + (s?.price || pricePerSeat);
  }, 0);

  const handleProceedToSummary = async () => {
    if (selectedCount === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat to proceed.');
      return;
    }

    setLocking(true);
    try {
      // 1. Server-side authoritative seat lock (POS or Redis engine)
      const lockRes = await bookingApi.lockSeats(showId, session.selectedSeats, theatreId);
      
      updateSession({
        selectedSeats: session.selectedSeats,
        pricePerSeat,
        posHoldId: lockRes.data?.posHoldId || lockRes.posHoldId,
      });

      navigation.navigate('BookingSummary', {
        showId,
        movieTitle,
        theatreName,
        screenName,
        showTime,
        date,
        selectedSeats: session.selectedSeats,
        posHoldId: lockRes.data?.posHoldId || lockRes.posHoldId,
        basePrice: totalPrice,
      });
    } catch (err: any) {
      Alert.alert('Seat Hold Notice', err.message || 'One or more selected seats were locked by another user.');
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Real-Time Seat Layout..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={movieTitle}
        subtitle={`${theatreName} • ${showTime}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <InteractiveSeatMap
        seats={seats}
        selectedSeats={session.selectedSeats}
        onToggleSeat={toggleSeat}
        screenName={screenName}
      />

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.priceSummary}>
          <Text style={styles.seatsSelectedLabel}>
            {selectedCount > 0 ? `${selectedCount} Seat(s) Selected` : 'Select Seats'}
          </Text>
          <Text style={styles.seatsListText}>
            {session.selectedSeats.join(', ') || 'None'}
          </Text>
          <Text style={styles.totalPriceText}>₹{totalPrice}</Text>
        </View>

        <Button
          title={selectedCount > 0 ? 'PROCEED TO SUMMARY' : 'SELECT SEATS'}
          onPress={handleProceedToSummary}
          disabled={selectedCount === 0}
          loading={locking}
          style={styles.proceedBtn}
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
  bottomBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSummary: {
    flex: 1,
  },
  seatsSelectedLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  seatsListText: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 1,
  },
  totalPriceText: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  proceedBtn: {
    paddingHorizontal: Spacing.xl,
  },
});
