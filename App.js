// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { CarsProvider } from './src/context/CarsContext';
import AppNavigator from './src/navigation/AppNavigator';
import { scheduleAllNotifications } from './src/utils/notifications';
import { loadNotifSettings } from './src/utils/notifications';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const init = async () => {
      // Masquer le splash après 1.5s
      setTimeout(() => SplashScreen.hideAsync(), 1500);
    };
    init();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CarsProvider>
          <AppNavigator />
        </CarsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
