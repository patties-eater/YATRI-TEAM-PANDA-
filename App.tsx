import { StatusBar } from 'expo-status-bar';
// import AuthScreen from './screens/AuthScreen';
import { NotificationProvider } from './components/Notification';
import Plan from './screens/Plan';

export default function App() {
  return (
    <NotificationProvider>
      <StatusBar style="dark" />
      <Plan />
      {/* <AuthScreen /> */}
    </NotificationProvider>
  );
}
