import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from './src/components/AppShell';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DeviceScreen } from './src/screens/DeviceScreen';
import { ScreenTimeSleepScreen } from './src/screens/ScreenTimeSleepScreen';
import { colors } from './src/theme/colors';
import { font } from './src/theme/type';

export type RootTabParamList = {
  Home: undefined;
  Device: undefined;
  Tracker: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.panel,
    text: colors.text,
    border: 'transparent',
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <AppShell>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              left: 20,
              right: 20,
              bottom: 22,
              height: 74,
              borderRadius: 8,
              borderTopWidth: 1,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.panel,
              shadowColor: colors.shadow,
              shadowOpacity: 0.28,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
              paddingBottom: 12,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontFamily: font.rounded,
              fontWeight: '800',
              fontSize: 11,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.quiet,
            tabBarIcon: ({ focused, color, size }) => {
              const icon =
                route.name === 'Home'
                  ? focused ? 'planet' : 'planet-outline'
                  : route.name === 'Device'
                  ? focused ? 'watch' : 'watch-outline'
                  : focused ? 'bar-chart' : 'bar-chart-outline';

              return <Ionicons name={icon as any} size={size + 2} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={DashboardScreen} />
          <Tab.Screen name="Device" component={DeviceScreen} />
          <Tab.Screen name="Tracker" component={ScreenTimeSleepScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppShell>
  );
}
