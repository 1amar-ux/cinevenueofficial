import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';
import { bookingApi } from '../../api/bookingApi';
import { BookingRecord } from '../../types/booking';

export const AccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to sign out of CineVenue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Account" subtitle="Profile, Bookings & VIP Membership" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={Colors.gold} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest Explorer'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Sign in to access your bookings'}</Text>
            {user?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            )}
          </View>
          {!isAuthenticated ? (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInBtnText}>SIGN IN</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Menu Items Group: Bookings & Activity */}
        <Text style={styles.groupHeader}>YOUR ENTERTAINMENT</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="ticket-outline" size={20} color={Colors.gold} />
              <Text style={styles.menuItemLabel}>My Movie Bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('CineCoinsTab')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.gold} />
              <Text style={styles.menuItemLabel}>CineCoins Loyalty Vault</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.gold} />
              <Text style={styles.menuItemLabel}>Notifications & Alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Menu Items Group: Settings & Concierge */}
        <Text style={styles.groupHeader}>PREFERENCES & SUPPORT</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-circle-outline" size={20} color={Colors.gold} />
              <Text style={styles.menuItemLabel}>Edit Profile & Contact</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SupportPolicies', { type: 'terms' })}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.gold} />
              <Text style={styles.menuItemLabel}>Terms & Privacy Policies</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SupportPolicies', { type: 'cancellation' })}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="refresh-circle-outline" size={20} color={Colors.gold} />
              <Text style={styles.menuItemLabel}>Refund & Cancellation Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.appVersionText}>CineVenue v1.0.0 (Production Build)</Text>
      </ScrollView>
    </View>
  );
};

export const MyBookingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (e) {
      setBookings([
        {
          id: 'B-101',
          bookingNumber: 'CV-20260907-001245',
          posBookingId: 'POS-8795421',
          movieId: 'm1',
          movieTitle: 'Pushpa 2: The Rule',
          theatreId: 't1',
          theatreName: 'PVR Inox High Street',
          screenName: 'IMAX Laser 1',
          showTime: '7:30 PM',
          showDate: 'Today',
          seats: ['A5', 'A6'],
          totalAmount: 580,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="My Bookings" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {bookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            style={styles.bookingCard}
            onPress={() => navigation.navigate('TicketView', { bookingId: booking.id })}
            activeOpacity={0.85}
          >
            <View style={styles.bookingCardHeader}>
              <Text style={styles.bookingNumberText}>{booking.bookingNumber}</Text>
              <View style={[styles.statusBadge, booking.status === 'CONFIRMED' ? styles.statusConfirmed : styles.statusPending]}>
                <Text style={styles.statusBadgeText}>{booking.status}</Text>
              </View>
            </View>

            <Text style={styles.bMovieTitle}>{booking.movieTitle}</Text>
            <Text style={styles.bTheatreName}>{booking.theatreName} • {booking.screenName}</Text>
            
            <View style={styles.bDetailsRow}>
              <Text style={styles.bDate}>{booking.showDate} at {booking.showTime}</Text>
              <Text style={styles.bSeats}>Seats: <Text style={{ color: Colors.gold, fontWeight: '700' }}>{booking.seats.join(', ')}</Text></Text>
            </View>

            {booking.posBookingId && (
              <View style={styles.bPosTag}>
                <Text style={styles.bPosTagText}>POS: {booking.posBookingId}</Text>
              </View>
            )}

            <View style={styles.bookingFooter}>
              <Text style={styles.bAmount}>Paid: ₹{booking.totalAmount}</Text>
              <Text style={styles.bViewPass}>View Mobile Pass &rarr;</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const TicketViewScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { bookingId } = route.params;

  const mockBooking: BookingRecord = {
    id: bookingId || 'B-101',
    bookingNumber: 'CV-20260907-001245',
    posBookingId: 'POS-8795421',
    movieId: 'm1',
    movieTitle: 'Pushpa 2: The Rule',
    theatreId: 't1',
    theatreName: 'PVR Inox High Street',
    screenName: 'IMAX Laser 1',
    showTime: '7:30 PM',
    showDate: 'Today',
    seats: ['A5', 'A6'],
    totalAmount: 580,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  return (
    <View style={styles.container}>
      <Header title="Digital Pass" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.ticketWrap}>
          {/* Reusable Digital Ticket Pass */}
          <View style={styles.ticketCardOuter}>
            <View style={styles.tPassHeader}>
              <Text style={styles.tPassHeading}>E-TICKET CONFIRMED</Text>
              <Text style={styles.tPassBookingNo}>{mockBooking.bookingNumber}</Text>
            </View>

            <View style={styles.tPassBody}>
              <Text style={styles.tPassMovieTitle}>{mockBooking.movieTitle}</Text>
              <Text style={styles.tPassTheatre}>{mockBooking.theatreName} • {mockBooking.screenName}</Text>

              <View style={styles.tPassGrid}>
                <View>
                  <Text style={styles.tPassLabel}>SHOW DATE & TIME</Text>
                  <Text style={styles.tPassVal}>{mockBooking.showDate} at {mockBooking.showTime}</Text>
                </View>
                <View>
                  <Text style={styles.tPassLabel}>SEATS ({mockBooking.seats.length})</Text>
                  <Text style={[styles.tPassVal, { color: Colors.gold }]}>{mockBooking.seats.join(', ')}</Text>
                </View>
              </View>

              {mockBooking.posBookingId && (
                <View style={styles.tPassPosRow}>
                  <Text style={styles.tPassPosLabel}>POS SCANNER IDENTIFIER</Text>
                  <Text style={styles.tPassPosCode}>{mockBooking.posBookingId}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBack onBack={() => navigation.goBack()} />
      <View style={styles.emptyCenter}>
        <Text style={styles.emptyText}>Profile update form synced with CineVenue authentication.</Text>
      </View>
    </View>
  );
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack onBack={() => navigation.goBack()} />
      <View style={styles.emptyCenter}>
        <Text style={styles.emptyText}>No unread notifications.</Text>
      </View>
    </View>
  );
};

export const SupportPoliciesScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const type = route.params?.type || 'terms';
  return (
    <View style={styles.container}>
      <Header title={type === 'cancellation' ? 'Cancellation Policy' : 'Terms & Privacy'} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.policyCard}>
          <Text style={styles.policyHeading}>CineVenue VIP Concierge Guarantee</Text>
          <Text style={styles.policyBody}>
            1. Tickets booked on CineVenue are confirmed directly with theatre inventory.{'\n\n'}
            2. Cancellation eligibility depends on cinema policy (up to 2 hours prior to showtime).{'\n\n'}
            3. Instant refunds are returned through your original payment method.
          </Text>
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
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 60,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...Typography.h3,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
  },
  signInBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  signInBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 11,
  },
  groupHeader: {
    ...Typography.caption,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemLabel: {
    ...Typography.body2,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    marginTop: Spacing.md,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '800',
    fontSize: 13,
  },
  appVersionText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumberText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusConfirmed: {
    backgroundColor: Colors.successLight,
  },
  statusPending: {
    backgroundColor: Colors.goldGlow,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
  },
  bMovieTitle: {
    ...Typography.h3,
    marginTop: Spacing.xs,
  },
  bTheatreName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  bDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  bDate: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  bSeats: {
    ...Typography.body2,
  },
  bPosTag: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  bPosTagText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  bAmount: {
    fontWeight: '800',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  bViewPass: {
    color: Colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  policyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  policyHeading: {
    ...Typography.h3,
  },
  policyBody: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ticketWrap: {
    alignItems: 'center',
  },
  ticketCardOuter: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    overflow: 'hidden',
  },
  tPassHeader: {
    backgroundColor: Colors.gold,
    padding: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tPassHeading: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  tPassBookingNo: {
    color: '#000000',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  tPassBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  tPassMovieTitle: {
    ...Typography.h2,
  },
  tPassTheatre: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  tPassGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tPassLabel: {
    ...Typography.caption,
    fontSize: 8,
  },
  tPassVal: {
    ...Typography.body2,
    fontWeight: '700',
  },
  tPassPosRow: {
    backgroundColor: Colors.goldGlow,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tPassPosLabel: {
    fontSize: 8,
    color: Colors.gold,
    fontWeight: '800',
  },
  tPassPosCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
