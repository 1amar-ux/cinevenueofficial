import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { POPULAR_CITIES, ALL_CITIES } from '../../constants/config';
import { useLocation } from '../../store/LocationContext';

export const LocationSelectScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentCity, setCity, detectCurrentLocation, loading } = useLocation();
  const [search, setSearch] = useState('');

  const filteredCities = ALL_CITIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    navigation.goBack();
  };

  const handleAutoDetect = async () => {
    await detectCurrentLocation();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Your City</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for your city..."
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          autoFocus={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Auto Detect Location */}
      <TouchableOpacity
        style={styles.autoDetectRow}
        onPress={handleAutoDetect}
        disabled={loading}
      >
        <View style={styles.autoDetectIconBox}>
          <Ionicons name="navigate" size={18} color={Colors.gold} />
        </View>
        <View style={styles.autoDetectTextWrap}>
          <Text style={styles.autoDetectTitle}>Use Current Location (GPS)</Text>
          <Text style={styles.autoDetectSub}>Automatically detect cinemas near you</Text>
        </View>
        {loading && <Ionicons name="sync" size={16} color={Colors.gold} />}
      </TouchableOpacity>

      {/* Popular Cities Grid */}
      {!search && (
        <View style={styles.popularSection}>
          <Text style={styles.sectionHeader}>POPULAR CITIES</Text>
          <View style={styles.popularGrid}>
            {POPULAR_CITIES.map((city) => {
              const isSelected = currentCity.toLowerCase() === city.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.popularChip,
                    isSelected && styles.popularChipSelected,
                  ]}
                  onPress={() => handleSelectCity(city.name)}
                >
                  <Text
                    style={[
                      styles.popularChipText,
                      isSelected && styles.popularChipTextSelected,
                    ]}
                  >
                    {city.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* All Cities List */}
      <Text style={styles.sectionHeader}>
        {search ? 'SEARCH RESULTS' : 'ALL CITIES'}
      </Text>

      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = currentCity.toLowerCase() === item.name.toLowerCase();
          return (
            <TouchableOpacity
              style={[styles.cityRow, isSelected && styles.cityRowSelected]}
              onPress={() => handleSelectCity(item.name)}
            >
              <View>
                <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                  {item.name}
                </Text>
                <Text style={styles.cityState}>{item.state}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    ...Typography.body1,
  },
  autoDetectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  autoDetectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  autoDetectTextWrap: {
    flex: 1,
  },
  autoDetectTitle: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.gold,
  },
  autoDetectSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  popularSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popularChipSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  popularChipText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  popularChipTextSelected: {
    color: Colors.gold,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cityRowSelected: {
    backgroundColor: Colors.goldGlow,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  cityName: {
    ...Typography.body1,
    fontWeight: '600',
  },
  cityNameSelected: {
    color: Colors.gold,
  },
  cityState: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
