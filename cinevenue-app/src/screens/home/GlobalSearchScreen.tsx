import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { movieApi } from '../../api/movieApi';
import { Movie, Theatre } from '../../types/movie';
import { useLocation } from '../../store/LocationContext';

export const GlobalSearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ movies: Movie[]; theatres: Theatre[] }>({
    movies: [],
    theatres: [],
  });

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ movies: [], theatres: [] });
      return;
    }

    setLoading(true);
    try {
      const data = await movieApi.search(text.trim());
      setResults({
        movies: data.movies || [],
        theatres: data.theatres || [],
      });
    } catch (e) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Search Bar */}
      <View style={styles.searchBarRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search movies, theatres, events..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.gold} />
        </View>
      )}

      <FlatList
        data={results.movies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          results.movies.length > 0 ? (
            <Text style={styles.sectionTitle}>Movies</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.searchItem}
            onPress={() =>
              navigation.navigate('MovieDetails', { movieId: item.id, title: item.title })
            }
          >
            <Ionicons name="film-outline" size={20} color={Colors.gold} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>
                {item.languages?.join(', ')} • {item.genres?.join(', ')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && query ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found for "{query}".</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export const LocationSelectScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { selectedCity, setSelectedCity, availableCities } = useLocation();

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.searchBarRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Select Location</Text>
      </View>

      <FlatList
        data={availableCities}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = item === selectedCity;
          return (
            <TouchableOpacity
              style={[styles.cityItem, isSelected && styles.cityItemSelected]}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.cityLeft}>
                <Ionicons
                  name="location-sharp"
                  size={18}
                  color={isSelected ? Colors.gold : Colors.textMuted}
                />
                <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                  {item}
                </Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    ...Typography.h3,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.body1,
    fontWeight: '700',
  },
  itemMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityItemSelected: {
    borderColor: Colors.borderGold,
    backgroundColor: Colors.goldGlow,
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cityName: {
    ...Typography.body1,
    fontWeight: '600',
  },
  cityNameSelected: {
    color: Colors.gold,
    fontWeight: '800',
  },
});
