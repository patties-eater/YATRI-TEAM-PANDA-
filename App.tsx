import React from 'react';
import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationProvider } from './components/Notification';
import RootNavigator from './navigation/RootNavigator';
import { font } from './theme';

// Apply Times New Roman globally to every Text / TextInput in the app.
// We override `render` (not defaultProps) so the font is MERGED into each
// element's style and always wins, even when a style prop is already set.
const fontStyle = { fontFamily: font.family };

function patchFont(Component: any) {
  if (!Component || Component.__fontPatched) return;
  const baseRender = Component.render;
  if (typeof baseRender !== 'function') return;
  Component.render = function (...args: any[]) {
    const element = baseRender.apply(this, args);
    if (!React.isValidElement(element)) return element;
    return React.cloneElement(element, {
      style: [(element.props as any).style, fontStyle],
    });
  };
  Component.__fontPatched = true;
}

patchFont(Text);
patchFont(TextInput);

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
