import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationProvider } from './components/Notification';
import { CuisinesProvider } from './data/cuisines';
import SplashScreen from './components/SplashScreen';
import RootNavigator from './navigation/RootNavigator';
import { font } from './theme';

const FONT_STYLE = { fontFamily: font.family };

function withFont(type: any, props: any) {
  if ((type === Text || type === TextInput) && props) {
    return { ...props, style: [FONT_STYLE, props.style] };
  }
  return props;
}

function patchJsxRuntime(mod: any) {
  if (!mod || mod.__fontPatched) return;
  for (const key of ['jsx', 'jsxs', 'jsxDEV'] as const) {
    const original = mod[key];
    if (typeof original === 'function') {
      mod[key] = (type: any, props: any, ...rest: any[]) =>
        original(type, withFont(type, props), ...rest);
    }
  }
  mod.__fontPatched = true;
}

try { patchJsxRuntime(require('react/jsx-runtime')); } catch {}
try { patchJsxRuntime(require('react/jsx-dev-runtime')); } catch {}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <CuisinesProvider>
          <StatusBar style={splashDone ? 'dark' : 'light'} />
          <View style={{ flex: 1 }}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
          </View>
        </CuisinesProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
