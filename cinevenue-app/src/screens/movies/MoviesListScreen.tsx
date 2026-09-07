import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { MoviePosterCard } from '../../components/home/MovieBannerCarousel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { movieApi } from '../../api/movieApi';
import { Movie } from '../../types/movie';
import { useLocation } from '../../store/LocationContext';

export const MoviesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { selectedCity } = useLocation();
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'UPCOMING'>('NOW_SHOWING');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = async () => {
    try {
      if (activeTab === 'NOW_SHOWING') {
        const data = await movieApi.getNowShowing(selectedCity);
        setMovies(data);
      } else {
        const data = await movieApi.getUpcoming();
        setMovies(data);
      }
    } catch (e) {
      setMovies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMovies();
  }, [activeTab, selectedCity]);

  return (
    <View style={styles.container}>
      <Header
        title="Movies"
        subtitle={`Exploring films in ${selectedCity}`}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('GlobalSearch')}>
            <Text style={styles.searchLink}>Search</Text>
          </TouchableOpacity>
        }
      />

      {/* Segmented Filter */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'NOW_SHOWING' && styles.segmentActive]}
          onPress={() => setActiveTab('NOW_SHOWING')}
        >
          <Text style={[styles.segmentText, activeTab === 'NOW_SHOWING' && styles.segmentTextActive]}>
            Now Showing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'UPCOMING' && styles.segmentActive]}
          onPress={() => setActiveTab('UPCOMING')}
        >
          <Text style={[styles.segmentText, activeTab === 'UPCOMING' && styles.segmentTextActive]}>
            Coming Soon
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading Movies Catalog..." />
      ) : (
        <FlatList
          data={movies}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listGrid}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMovies();
              }}
              tintColor={Colors.gold}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MoviePosterCard
                movie={item}
                onPress={() =>
                  navigation.navigate('MovieDetails', { movieId: item.id, title: item.title })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <Text style={styles.emptyText}>No movies found in this category.</Text>
            </View>
          }
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
  searchLink: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
  },
  segmentContainer: {
    flexDirection: 'row',
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.gold,
  },
  segmentText: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  listGrid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  gridItem: {
    width: '48%',
  },
  emptyCenter: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
});
