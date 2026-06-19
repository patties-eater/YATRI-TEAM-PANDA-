import { StatusBar } from 'expo-status-bar';
import AuthScreen from './screens/AuthScreen';
import { NotificationProvider } from './components/Notification';

export default function App() {
  return (
    <NotificationProvider>
      <StatusBar style="dark" />
      <AuthScreen />
    </NotificationProvider>
  );
}
