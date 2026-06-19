import { StatusBar } from 'expo-status-bar';
import AuthScreen from './screens/AuthScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AuthScreen />
    </>
  );
}