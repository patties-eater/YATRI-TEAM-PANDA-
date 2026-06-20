import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen    from '../screens/Home';
import DetailsScreen from '../screens/DetailsScreen';
import MapScreen     from '../screens/MapScreen';
import SOSScreen     from '../screens/SOSScreen';

import { colors, radius } from '../theme';

export type TabParamList = {
  Home:    undefined;
  Cuisine: undefined;
  Map:     { cuisineId?: string; latitude?: number; longitude?: number } | undefined;
  SOS:     undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  keyof TabParamList,
  { label: string; active: IoniconName; inactive: IoniconName }
> = {
  Home:    { label: 'Home',    active: 'home',              inactive: 'home-outline' },
  Cuisine: { label: 'Cuisine', active: 'information-circle', inactive: 'information-circle-outline' },
  Map:     { label: 'Map',     active: 'map',               inactive: 'map-outline' },
  SOS:     { label: 'SOS',     active: 'warning',           inactive: 'warning-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name as keyof TabParamList];

        return {
          headerShown: false,
          tabBarStyle: styles.bar,
          tabBarItemStyle: styles.item,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? cfg.active : cfg.inactive}
                size={22}
                color={color}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={[styles.label, { color }, focused && styles.labelActive]}>
              {cfg.label}
            </Text>
          ),
        };
      }}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Cuisine" component={DetailsScreen} />
      <Tab.Screen name="Map"     component={MapScreen} />
      <Tab.Screen name="SOS"     component={SOSScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Platform.OS === 'ios' ? 84 : 68,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.secondary + '55',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
});
