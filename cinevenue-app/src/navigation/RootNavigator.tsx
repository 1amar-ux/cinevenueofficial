import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Colors } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

// Navigators & Screens
import { MainTabNavigator } from './MainTabNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { GlobalSearchScreen } from '../screens/home/GlobalSearchScreen';
import { LocationSelectScreen } from '../screens/home/LocationSelectScreen';
import { MovieDetailsScreen } from '../screens/movies/MovieDetailsScreen';
import { TheatreShowtimeSelectScreen } from '../screens/movies/TheatreShowtimeSelectScreen';
import { SeatSelectionScreen } from '../screens/movies/SeatSelectionScreen';
import { BookingSummaryScreen } from '../screens/movies/BookingSummaryScreen';
import { PaymentScreen } from '../screens/movies/PaymentScreen';
import { EventDetailsScreen } from '../screens/events/EventDetailsScreen';
import { DailySpinScreen } from '../screens/cinecoins/DailySpinScreen';
import { TransactionHistoryScreen } from '../screens/cinecoins/TransactionHistoryScreen';
import { ProjectDetailsScreen } from '../screens/marketplace/ProjectDetailsScreen';
import { TalentProfilesScreen } from '../screens/marketplace/TalentProfilesScreen';
import { MyBookingsScreen } from '../screens/account/MyBookingsScreen';
import { TicketViewScreen } from '../screens/account/TicketViewScreen';
import { EditProfileScreen } from '../screens/account/EditProfileScreen';
import { NotificationsScreen } from '../screens/account/NotificationsScreen';
import { SupportPoliciesScreen } from '../screens/account/SupportPoliciesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['cinevenue://', 'https://cinevenue.in', 'https://*.cinevenue.in'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: 'home',
          MoviesTab: 'movies',
          EventsTab: 'events',
          CineCoinsTab: 'cinecoins',
          AccountTab: 'account',
        },
      },
      MovieDetails: 'movie/:movieId',
      TheatreShowtimes: 'movie/:movieId/showtimes',
      EventDetails: 'event/:eventId',
      TicketView: 'ticket/:bookingId',
      GlobalSearch: 'search',
      LocationSelect: 'location',
      DailySpin: 'spin',
      TransactionHistory: 'transactions',
    },
  },
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: true,
        colors: {
          primary: Colors.gold,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.textPrimary,
          border: Colors.border,
          notification: Colors.gold,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Auth Flow */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Home & Utility */}
        <Stack.Screen
          name="GlobalSearch"
          component={GlobalSearchScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="LocationSelect"
          component={LocationSelectScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />

        {/* Movie Booking Funnel */}
        <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
        <Stack.Screen name="TheatreShowtimes" component={TheatreShowtimeSelectScreen} />
        <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
        <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />

        {/* Events */}
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />

        {/* CineCoins */}
        <Stack.Screen name="DailySpin" component={DailySpinScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />

        {/* Marketplace */}
        <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
        <Stack.Screen name="TalentProfiles" component={TalentProfilesScreen} />

        {/* Account & Tickets */}
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="TicketView" component={TicketViewScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="SupportPolicies" component={SupportPoliciesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
