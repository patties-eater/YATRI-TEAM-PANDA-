import { StatusBar } from 'expo-status-bar';
// import AuthScreen from './screens/AuthScreen';
import { NotificationProvider } from './components/Notification';
import HomeScreen from './screens/Home';

export default function App() {
  return (
    <NotificationProvider>
      <StatusBar style="dark" />
     {/* <AuthScreen /> */}
      <HomeScreen />
    </NotificationProvider>
    
  );
}
