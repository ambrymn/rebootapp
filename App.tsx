import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
} from '@expo-google-fonts/nunito-sans';
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
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingMoon}>
          <Ionicons name="moon" size={30} color={colors.primarySoft} />
        </View>
        <ActivityIndicator color={colors.primarySoft} />
        <Text style={styles.loadingText}>Waking up Reboot…</Text>
      </View>
    );
  }

  return (
    <AppShell>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: styles.tabItem,
            tabBarLabelStyle: styles.tabLabel,
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.quiet,
            tabBarIcon: ({ focused, color }) => {
              const icon =
                route.name === 'Home'
                  ? focused ? 'moon' : 'moon-outline'
                  : route.name === 'Device'
                  ? focused ? 'watch' : 'watch-outline'
                  : focused ? 'stats-chart' : 'stats-chart-outline';

              return (
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  <Ionicons name={icon as any} size={22} color={focused ? colors.primarySoft : color} />
                </View>
              );
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

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: colors.bg,
  },
  loadingMoon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDeep,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.primaryShadow,
  },
  loadingText: {
    color: colors.soft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 78,
    borderRadius: 24,
    borderTopWidth: 2,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { borderRadius: 18 },
  tabLabel: {
    fontFamily: font.rounded,
    fontSize: 11,
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primaryDeep,
    borderWidth: 1,
    borderColor: colors.primaryShadow,
  },
});
