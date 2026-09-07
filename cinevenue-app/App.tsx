import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppSettingsProvider } from './src/store/AppSettingsContext';
import { AuthProvider } from './src/store/AuthContext';
import { LocationProvider } from './src/store/LocationContext';
import { BookingProvider } from './src/store/BookingContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <AppSettingsProvider>
        <AuthProvider>
          <LocationProvider>
            <BookingProvider>
              <RootNavigator />
            </BookingProvider>
          </LocationProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}
