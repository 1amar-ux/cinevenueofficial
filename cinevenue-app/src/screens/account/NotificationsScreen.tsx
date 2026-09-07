import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'BOOKING' | 'REWARD' | 'PROMO';
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Showtime Reminder 🎬',
    body: 'Your show for Avatar: The Way of Water starts in 2 hours at PVR ICON Gold.',
    time: '1 hour ago',
    read: false,
    type: 'BOOKING',
  },
  {
    id: 'n-2',
    title: 'Daily CineCoin Bonus Available 💎',
    body: 'Claim your +10 daily check-in bonus in the CineCoins Vault now!',
    time: '5 hours ago',
    read: false,
    type: 'REWARD',
  },
  {
    id: 'n-3',
    title: 'VIP Weekend Exclusive Offer 🔥',
    body: 'Get flat 20% discount on all IMAX 3D screenings using CineCoins.',
    time: '1 day ago',
    read: true,
    type: 'PROMO',
  },
];

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle="Booking updates, offers & alerts"
        showBack
        rightAction={
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.readAllText}>Mark read</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          let iconName: any = 'notifications-outline';
          let iconColor = Colors.gold;

          if (item.type === 'BOOKING') {
            iconName = 'ticket-outline';
            iconColor = '#60A5FA';
          } else if (item.type === 'REWARD') {
            iconName = 'sparkles';
            iconColor = Colors.gold;
          } else if (item.type === 'PROMO') {
            iconName = 'pricetag-outline';
            iconColor = '#F472B6';
          }

          return (
            <View style={[styles.card, !item.read && styles.unreadCard]}>
              <View style={[styles.iconBox, { backgroundColor: Colors.surfaceLight }]}>
                <Ionicons name={iconName} size={20} color={iconColor} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </View>
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
  readAllText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  unreadCard: {
    borderColor: Colors.borderGold,
    backgroundColor: Colors.goldGlow,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...Typography.body2,
    fontWeight: '700',
  },
  body: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  time: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
    marginTop: 6,
  },
});
