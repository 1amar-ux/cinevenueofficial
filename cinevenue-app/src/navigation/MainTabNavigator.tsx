import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { Colors, Spacing } from '../constants/theme';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { MoviesListScreen } from '../screens/movies/MoviesListScreen';
import { EventsListScreen } from '../screens/events/EventsListScreen';
import { CineCoinsScreen } from '../screens/cinecoins/CineCoinsScreen';
import { AccountScreen } from '../screens/account/AccountScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MoviesTab') {
            iconName = focused ? 'film' : 'film-outline';
          } else if (route.name === 'EventsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'CineCoinsTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'AccountTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="MoviesTab"
        component={MoviesListScreen}
        options={{ tabBarLabel: 'Movies' }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsListScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="CineCoinsTab"
        component={CineCoinsScreen}
        options={{ tabBarLabel: 'CineCoins' }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
