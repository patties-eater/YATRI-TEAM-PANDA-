import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import DishDetailScreen from '../screens/DishDetailScreen';
import type { TabParamList } from './TabNavigator';

export type RootStackParamList = {
  Tabs:       NavigatorScreenParams<TabParamList> | undefined;
  DishDetail: { cuisineId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs"       component={TabNavigator} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
    </Stack.Navigator>
  );
}
