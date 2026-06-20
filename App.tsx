import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationProvider } from './components/Notification';
import { CuisinesProvider } from './data/cuisines';
import RootNavigator from './navigation/RootNavigator';
import { font } from './theme';

// Force the app font (Times New Roman / serif) onto EVERY <Text>/<TextInput>.
// In RN 0.85 `Text` is a plain function component (no `.render` and
// defaultProps don't merge with an explicit style), so we intercept the JSX
// runtime that every element is created through and inject the font there.
const FONT_STYLE = { fontFamily: font.family };

function withFont(type: any, props: any) {
  if ((type === Text || type === TextInput) && props) {
    // FONT_STYLE goes first so an explicit fontFamily (e.g. icon fonts like
    // Ionicons) still wins, while normal text — which never sets fontFamily —
    // inherits Times New Roman.
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
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <CuisinesProvider>
          <StatusBar style="dark" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </CuisinesProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
