import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import DishDetailScreen from '../screens/DishDetailScreen';
import PlaceScreen from '../screens/PlaceScreen';
import type { TabParamList } from './TabNavigator';

export type RootStackParamList = {
  Tabs:       NavigatorScreenParams<TabParamList> | undefined;
  DishDetail: { cuisineId: string };
  Place:      { name: string; description: string; lat: number; lng: number; areaKeys: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs"       component={TabNavigator} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      <Stack.Screen name="Place"      component={PlaceScreen} />
    </Stack.Navigator>
  );
}
