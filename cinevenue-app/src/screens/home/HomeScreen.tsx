import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { movieApi, theatreApi } from '../../api/movieApi';
import { eventApi, cineCoinApi } from '../../api/services';
import { Movie, Theatre } from '../../types/movie';
import { EventItem, CineCoinWallet } from '../../types';
import { MovieBannerCarousel, MoviePosterCard, EventCard } from '../../components/home/MovieBannerCarousel';
import { SectionHeader, QuickCineCoinWidget } from '../../components/home/SectionHeader';
import { useLocation } from '../../store/LocationContext';
import { useAuth } from '../../store/AuthContext';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { selectedCity } = useLocation();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [wallet, setWallet] = useState<CineCoinWallet | null>(null);

  const loadData = async () => {
    try {
      const [nowMovies, upMovies, eventList, theatreList, walletData] = await Promise.all([
        movieApi.getNowShowing(selectedCity).catch(() => []),
        movieApi.getUpcoming().catch(() => []),
        eventApi.getEvents().catch(() => []),
        theatreApi.getTheatresByCity(selectedCity).catch(() => []),
        cineCoinApi.getWallet().catch(() => null),
      ]);

      setNowShowing(nowMovies);
      setUpcoming(upMovies);
      setEvents(eventList);
      setTheatres(theatreList);
      if (walletData) setWallet(walletData);
    } catch (e) {
      // Handled gracefully
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>CINEVENUE</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => navigation.navigate('LocationSelect')}
            activeOpacity={0.7}
          >
            <Ionicons name="location-sharp" size={14} color={Colors.gold} />
            <Text style={styles.locationText}>{selectedCity}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('GlobalSearch')}
          >
            <Ionicons name="search" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick CineCoin Rewards Banner */}
        <QuickCineCoinWidget
          balance={user?.cineCoinsBalance || wallet?.balance || 150}
          onPress={() => navigation.navigate('CineCoinsTab')}
          onSpinPress={() => navigation.navigate('DailySpin')}
        />

        {/* Hero Featured Movies Carousel */}
        {nowShowing.length > 0 && (
          <MovieBannerCarousel
            movies={nowShowing}
            onMoviePress={(movie) =>
              navigation.navigate('MovieDetails', { movieId: movie.id, title: movie.title })
            }
          />
        )}

        {/* Now Showing Section */}
        <SectionHeader
          title="Now Showing"
          subtitle={`Movies in ${selectedCity}`}
          iconName="film"
          onAction={() => navigation.navigate('MoviesTab')}
        />

        <FlatList
          data={nowShowing}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MoviePosterCard
              movie={item}
              onPress={() =>
                navigation.navigate('MovieDetails', { movieId: item.id, title: item.title })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyInlineText}>No movies currently scheduled for this location.</Text>
          }
        />

        {/* Live Events & Concerts */}
        <SectionHeader
          title="Events & Experiences"
          subtitle="Concerts, Comedy & VIP Shows"
          iconName="ticket-outline"
          onAction={() => navigation.navigate('EventsTab')}
        />

        <FlatList
          data={events}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() =>
                navigation.navigate('EventDetails', { eventId: item.id, title: item.title })
              }
            />
          )}
        />

        {/* Popular Theatres */}
        {theatres.length > 0 && (
          <>
            <SectionHeader
              title="Featured Cinemas"
              subtitle="Luxury Auditoriums & IMAX"
              iconName="business-outline"
            />
            <View style={styles.theatreListContainer}>
              {theatres.slice(0, 3).map((theatre) => (
                <TouchableOpacity
                  key={theatre.id}
                  style={styles.theatreCard}
                  onPress={() => navigation.navigate('MoviesTab')}
                  activeOpacity={0.8}
                >
                  <View style={styles.theatreIconBox}>
                    <Ionicons name="film-outline" size={20} color={Colors.gold} />
                  </View>
                  <View style={styles.theatreInfo}>
                    <Text style={styles.theatreName}>{theatre.name}</Text>
                    <Text style={styles.theatreAddress} numberOfLines={1}>
                      {theatre.address}, {theatre.city}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Upcoming Movies */}
        {upcoming.length > 0 && (
          <>
            <SectionHeader
              title="Coming Soon"
              subtitle="Advance bookings opening soon"
              iconName="calendar-outline"
              onAction={() => navigation.navigate('MoviesTab')}
            />
            <FlatList
              data={upcoming}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MoviePosterCard
                  movie={item}
                  onPress={() =>
                    navigation.navigate('MovieDetails', { movieId: item.id, title: item.title })
                  }
                />
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandContainer: {
    gap: 2,
  },
  brandTitle: {
    ...Typography.h3,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  emptyInlineText: {
    ...Typography.caption,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
  },
  theatreListContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  theatreCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  theatreIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  theatreInfo: {
    flex: 1,
  },
  theatreName: {
    ...Typography.body2,
    fontWeight: '700',
  },
  theatreAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
