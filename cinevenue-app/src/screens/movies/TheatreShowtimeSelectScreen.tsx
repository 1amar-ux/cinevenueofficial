import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { ShowtimeChip } from '../../components/movies/ShowtimeChip';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { showApi } from '../../api/movieApi';
import { Theatre, ShowSchedule } from '../../types/movie';
import { useLocation } from '../../store/LocationContext';
import { useBooking } from '../../store/BookingContext';

export const TheatreShowtimeSelectScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { movieId, title } = route.params;
  const { selectedCity } = useLocation();
  const { updateSession } = useBooking();

  // Next 7 days date generator
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  });

  const [selectedDate, setSelectedDate] = useState(dates[0].dateString);
  const [theatreSchedules, setTheatreSchedules] = useState<{ [id: string]: { theatre: Theatre; shows: ShowSchedule[] } }>({});
  const [loading, setLoading] = useState(true);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const data = await showApi.getShowtimes({
        movieId,
        date: selectedDate,
        city: selectedCity,
      });
      setTheatreSchedules(data);
    } catch (e) {
      setTheatreSchedules({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [movieId, selectedDate, selectedCity]);

  const handleShowSelect = (theatre: Theatre, show: ShowSchedule) => {
    updateSession({
      theatreId: theatre.id,
      theatreName: theatre.name,
      screenName: show.screenName,
      showId: show.id,
      showTime: show.startTime,
      showDate: show.date || selectedDate,
      pricePerSeat: show.pricePerSeat || 250,
      selectedSeats: [],
    });

    navigation.navigate('SeatSelection', {
      showId: show.id,
      movieId,
      movieTitle: title,
      theatreId: theatre.id,
      theatreName: theatre.name,
      screenName: show.screenName,
      showTime: show.startTime,
      date: show.date || selectedDate,
      pricePerSeat: show.pricePerSeat || 250,
      integrationType: theatre.integrationType,
    });
  };

  const scheduleList = Object.values(theatreSchedules);

  return (
    <View style={styles.container}>
      <Header
        title={title}
        subtitle={`Select Cinema & Showtime in ${selectedCity}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Date Selector Strip */}
      <View style={styles.dateStripContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
          {dates.map((d) => {
            const isSelected = d.dateString === selectedDate;
            return (
              <TouchableOpacity
                key={d.dateString}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDate(d.dateString)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayName, isSelected && styles.textBlack]}>{d.dayName}</Text>
                <Text style={[styles.dayNumber, isSelected && styles.textBlack]}>{d.dayNumber}</Text>
                <Text style={[styles.monthName, isSelected && styles.textBlack]}>{d.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingSpinner message="Checking Available Showtimes..." />
      ) : (
        <ScrollView contentContainerStyle={styles.theatreList} showsVerticalScrollIndicator={false}>
          {scheduleList.length > 0 ? (
            scheduleList.map(({ theatre, shows }) => (
              <View key={theatre.id} style={styles.theatreBlock}>
                <View style={styles.theatreHeader}>
                  <Text style={styles.theatreName}>{theatre.name}</Text>
                  <Text style={styles.theatreAddress} numberOfLines={1}>
                    {theatre.address}
                  </Text>
                  {theatre.integrationType === 'POS_INTEGRATION' && (
                    <View style={styles.posTag}>
                      <Text style={styles.posTagText}>⚡ Live POS Sync</Text>
                    </View>
                  )}
                </View>

                <View style={styles.showtimesRow}>
                  {shows.map((show) => (
                    <ShowtimeChip
                      key={show.id}
                      show={show}
                      onPress={() => handleShowSelect(theatre, show)}
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Showtimes Available</Text>
              <Text style={styles.emptySubtitle}>
                No screenings found for this date. Please choose another date or city.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dateStripContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  dateCard: {
    width: 60,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateCardActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.goldLight,
  },
  dayName: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  monthName: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  textBlack: {
    color: '#000000',
  },
  theatreList: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  theatreBlock: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  theatreHeader: {
    gap: 2,
  },
  theatreName: {
    ...Typography.h3,
    fontSize: 16,
  },
  theatreAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  posTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  posTagText: {
    color: Colors.gold,
    fontSize: 9,
    fontWeight: '800',
  },
  showtimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body2,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
