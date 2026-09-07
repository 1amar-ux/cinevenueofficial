import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Movie } from '../../types/movie';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const BANNER_HEIGHT = 200;

export const MovieBannerCarousel: React.FC<{
  movies: Movie[];
  onMoviePress: (movie: Movie) => void;
}> = ({ movies, onMoviePress }) => {
  if (movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={movies.slice(0, 5)}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={BANNER_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bannerCard}
            onPress={() => onMoviePress(item)}
            activeOpacity={0.9}
          >
            <Image
              source={{
                uri:
                  item.backdropUrl ||
                  item.posterUrl ||
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(10,10,11,0.95)']}
              style={styles.gradient}
            >
              <View style={styles.bannerInfo}>
                <View style={styles.tagRow}>
                  {item.certification && (
                    <Text style={styles.certBadge}>{item.certification}</Text>
                  )}
                  {item.formats?.[0] && (
                    <Text style={styles.formatBadge}>{item.formats[0]}</Text>
                  )}
                  {item.languages?.[0] && (
                    <Text style={styles.langBadge}>{item.languages[0]}</Text>
                  )}
                </View>
                <Text style={styles.movieTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.genresText} numberOfLines={1}>
                  {item.genres?.join(' • ') || 'Action • Thriller'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const MoviePosterCard: React.FC<{
  movie: Movie;
  onPress: () => void;
}> = ({ movie, onPress }) => {
  return (
    <TouchableOpacity style={styles.posterCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.posterWrapper}>
        <Image
          source={{
            uri:
              movie.posterUrl ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80',
          }}
          style={styles.posterImage}
          resizeMode="cover"
        />
        {movie.rating ? (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {movie.rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.posterTitle} numberOfLines={1}>
        {movie.title}
      </Text>
      <Text style={styles.posterMeta} numberOfLines={1}>
        {movie.languages?.[0] || 'Telugu'} • {movie.formats?.[0] || '2D'}
      </Text>
    </TouchableOpacity>
  );
};

export const EventCard: React.FC<{
  event: any;
  onPress: () => void;
}> = ({ event, onPress }) => {
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{
          uri:
            event.bannerUrl ||
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
        }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventCategory}>{event.category || 'LIVE CONCERT'}</Text>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.eventDate}>{event.date || 'Upcoming'}</Text>
        <Text style={styles.eventPrice}>From ₹{event.minPrice || 499}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  bannerInfo: {
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  certBadge: {
    backgroundColor: Colors.surfaceLight,
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  formatBadge: {
    backgroundColor: Colors.goldGlow,
    color: Colors.gold,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  langBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  movieTitle: {
    ...Typography.h2,
    fontSize: 19,
  },
  genresText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  posterCard: {
    width: 140,
    marginRight: Spacing.md,
  },
  posterWrapper: {
    width: 140,
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  ratingText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  posterTitle: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  posterMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  eventCard: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventInfo: {
    padding: Spacing.sm,
    gap: 2,
  },
  eventCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
    textTransform: 'uppercase',
  },
  eventTitle: {
    ...Typography.body2,
    fontWeight: '700',
  },
  eventDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  eventPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
});
