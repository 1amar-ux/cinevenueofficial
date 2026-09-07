import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { eventApi } from '../../api/services';
import { EventItem } from '../../types';

export const EventsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['ALL', 'CONCERT', 'STANDUP', 'THEATRE_PLAY', 'FESTIVAL'];

  const fetchEvents = async () => {
    try {
      const data = await eventApi.getEvents(selectedCategory === 'ALL' ? undefined : selectedCategory);
      setEvents(data);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <Header title="Events & Shows" subtitle="Concerts, Comedy, Theatre & Festivals" />

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = item === selectedCategory;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {item.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading Live Events..." />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchEvents();
              }}
              tintColor={Colors.gold}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id, title: item.title })}
              activeOpacity={0.85}
            >
              <Image
                source={{
                  uri:
                    item.bannerUrl ||
                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
                }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.eventBody}>
                <Text style={styles.eventCat}>{item.category}</Text>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventVenue}>{item.venueName} • {item.city}</Text>
                <View style={styles.eventFooter}>
                  <Text style={styles.eventDate}>{item.date} • {item.time}</Text>
                  <Text style={styles.eventPrice}>₹{item.minPrice || 499} onwards</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found in this category.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export const EventDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { eventId, title } = route.params;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventApi
      .getEventDetails(eventId)
      .then((data) => setEvent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading || !event) {
    return <LoadingSpinner message="Loading Event Details..." />;
  }

  return (
    <View style={styles.container}>
      <Header title={title} showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.detailsScroll}>
        <Image
          source={{
            uri:
              event.bannerUrl ||
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
          }}
          style={styles.detailsBanner}
          resizeMode="cover"
        />

        <View style={styles.detailsBody}>
          <Text style={styles.detailsCategory}>{event.category}</Text>
          <Text style={styles.detailsTitle}>{event.title}</Text>
          <Text style={styles.detailsMeta}>{event.venueName}, {event.city}</Text>
          <Text style={styles.detailsDateText}>{event.date} at {event.time}</Text>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.detailsDescription}>
            {event.description ||
              'Join us for an unforgettable live performance with world-class audio production and VIP lounge access.'}
          </Text>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>Ticket Passes</Text>
          <View style={styles.tiersContainer}>
            {event.tiers?.map((tier) => (
              <View key={tier.id} style={styles.tierCard}>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierDesc}>{tier.description || 'Standard entry'}</Text>
                </View>
                <Text style={styles.tierPrice}>₹{tier.price}</Text>
              </View>
            )) || (
              <View style={styles.tierCard}>
                <Text style={styles.tierName}>VIP General Pass</Text>
                <Text style={styles.tierPrice}>₹{event.minPrice || 499}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categoriesContainer: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.goldLight,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  eventsList: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerImage: {
    width: '100%',
    height: 160,
  },
  eventBody: {
    padding: Spacing.md,
    gap: 4,
  },
  eventCat: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
    textTransform: 'uppercase',
  },
  eventTitle: {
    ...Typography.h3,
    fontSize: 17,
  },
  eventVenue: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  eventDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  eventPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.gold,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  detailsScroll: {
    paddingBottom: 60,
  },
  detailsBanner: {
    width: '100%',
    height: 220,
  },
  detailsBody: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  detailsCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.gold,
    textTransform: 'uppercase',
  },
  detailsTitle: {
    ...Typography.h1,
    fontSize: 22,
  },
  detailsMeta: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  detailsDateText: {
    ...Typography.body2,
    color: Colors.gold,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  detailsDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tiersContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tierCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    ...Typography.body1,
    fontWeight: '700',
  },
  tierDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  tierPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gold,
  },
});
