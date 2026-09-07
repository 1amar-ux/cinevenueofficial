import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { movieApi } from '../../api/movieApi';
import { Movie } from '../../types/movie';
import { useBooking } from '../../store/BookingContext';

export const MovieDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { movieId } = route.params;
  const insets = useSafeAreaInsets();
  const { updateSession } = useBooking();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    movieApi
      .getMovieDetails(movieId)
      .then((data) => setMovie(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [movieId]);

  const handleBookNow = () => {
    if (!movie) return;
    updateSession({
      movieId: movie.id,
      movieTitle: movie.title,
      posterUrl: movie.posterUrl,
    });
    navigation.navigate('TheatreShowtimes', {
      movieId: movie.id,
      title: movie.title,
      poster: movie.posterUrl,
    });
  };

  if (loading || !movie) {
    return <LoadingSpinner message="Fetching Movie Details..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Backdrop Banner */}
        <View style={styles.backdropContainer}>
          <Image
            source={{
              uri:
                movie.backdropUrl ||
                movie.posterUrl ||
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(10,10,11,0.3)', 'rgba(10,10,11,1)']}
            style={styles.backdropGradient}
          />
          <TouchableOpacity
            style={[styles.floatingBackBtn, { top: Math.max(insets.top, 16) }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Poster & Main Meta Card */}
        <View style={styles.metaContainer}>
          <View style={styles.posterRow}>
            <Image
              source={{
                uri:
                  movie.posterUrl ||
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              <View style={styles.tagRow}>
                {movie.certification && (
                  <View style={styles.certBadge}>
                    <Text style={styles.badgeText}>{movie.certification}</Text>
                  </View>
                )}
                {movie.languages?.map((lang) => (
                  <View key={lang} style={styles.langBadge}>
                    <Text style={styles.badgeText}>{lang}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.runtimeText}>
                {movie.duration} mins • {movie.genres?.join(', ') || 'Action'}
              </Text>
              {movie.rating ? (
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={14} color={Colors.gold} />
                  <Text style={styles.ratingText}>{movie.rating.toFixed(1)} / 10</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Formats Strip */}
          <View style={styles.formatsStrip}>
            <Text style={styles.formatsLabel}>Available in:</Text>
            {movie.formats?.map((fmt) => (
              <View key={fmt} style={styles.formatPill}>
                <Text style={styles.formatPillText}>{fmt}</Text>
              </View>
            )) || <Text style={styles.formatPillText}>2D • IMAX</Text>}
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Synopsis</Text>
            <Text style={styles.synopsisText}>
              {movie.description ||
                'Experience the cinematic journey of this acclaimed masterpiece with state-of-the-art Dolby Atmos acoustics and laser projection.'}
            </Text>
          </View>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Cast & Crew</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castRow}>
                {movie.cast.map((person, idx) => (
                  <View key={idx} style={styles.castCard}>
                    <View style={styles.castAvatar}>
                      <Ionicons name="person" size={24} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.castName} numberOfLines={1}>
                      {person.name}
                    </Text>
                    <Text style={styles.castRole} numberOfLines={1}>
                      {person.role}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          title="BOOK TICKETS"
          onPress={handleBookNow}
          style={styles.bookBtn}
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
    paddingBottom: 100,
  },
  backdropContainer: {
    width: '100%',
    height: 260,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  floatingBackBtn: {
    position: 'absolute',
    left: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: -40,
    gap: Spacing.lg,
  },
  posterRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  poster: {
    width: 110,
    height: 160,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 4,
  },
  title: {
    ...Typography.h2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  certBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  langBadge: {
    backgroundColor: Colors.goldGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
  },
  runtimeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    color: Colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  formatsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatsLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  formatPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  formatPillText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.xs,
  },
  sectionHeading: {
    ...Typography.h3,
    fontSize: 16,
  },
  synopsisText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  castRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  castCard: {
    width: 80,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  castAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  castName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  castRole: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  bookBtn: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
