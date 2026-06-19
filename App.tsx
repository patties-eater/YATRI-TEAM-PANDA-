import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationProvider } from './components/Notification';
import TabNavigator from './navigation/TabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
