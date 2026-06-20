import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/Home';
import DetailsScreen from '../screens/DetailsScreen';
import MapScreen from '../screens/MapScreen';
import SOSScreen from '../screens/SOSScreen';

import { colors, radius } from '../theme';

export type TabParamList = {
  Home: undefined;
  Cuisine: undefined;
  Map: { cuisineId?: string; latitude?: number; longitude?: number } | undefined;
  SOS: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  keyof TabParamList,
  { label: string; active: IoniconName; inactive: IoniconName }
> = {
  Home: { label: 'Home', active: 'home', inactive: 'home-outline' },
  Cuisine: { label: 'Cuisine', active: 'restaurant', inactive: 'restaurant-outline' },
  Map: { label: 'Map', active: 'map', inactive: 'map-outline' },
  SOS: { label: 'SOS', active: 'shield', inactive: 'shield-outline' },
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
          tabBarShowLabel: false, // Keeps default text label disabled
          tabBarIconStyle: styles.navIconContainer,
          tabBarIcon: ({ focused, color }) => (
            // FIXED: This wrapper remains a perfect circle even when focused
            <View style={[styles.circleWrap, focused && styles.circleWrapActive]}>
              <Ionicons
                name={focused ? cfg.active : cfg.inactive}
                size={18} // Sized perfectly to share vertical circle space
                color={color}
              />
              <Text style={[styles.label, { color }, focused && styles.labelActive]}>
                {cfg.label}
              </Text>
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cuisine" component={DetailsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="SOS" component={SOSScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Platform.OS === 'ios' ? 92 : 78, // Slightly elevated to allow circles to sit comfortably
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainer: {
    width: '100%',
    height: '100%',
  },
  // CHANGED: Formatted as a tight, uniform perfect circle layout
  circleWrap: {
    width: 64, // Exact proportional symmetry
    height: 64,
    borderRadius: 32, // Perfect mathematical radius circle (64 / 2)
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1, // Micro-spacing to bundle elements inside the frame
  },
  circleWrapActive: {
    backgroundColor: colors.secondary + '55', // Active circle background tint color
  },
  label: {
    fontSize: 9, // Tailored micro-font size so text stays well inside the borders
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '700',
  },
});