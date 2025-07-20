import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Image, View, Text, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RouteNames = 'index' | 'dashboard' | 'mutasi' | 'aktivitas' | 'akun';

const getIconSource = (routeName: RouteNames) => {
  const iconPath = {
    index: require('../../assets/tab-icons/home.png'),
    dashboard: require('../../assets/tab-icons/menu.png'),
    mutasi: require('../../assets/tab-icons/mutasi.png'),
    aktivitas: require('../../assets/tab-icons/aktivitas.png'),
    akun: require('../../assets/tab-icons/akun.png')
  };

  try {
    return iconPath[routeName] || iconPath.index;
  } catch (error) {
    console.error('Error loading icon for route:', routeName, error);
    return iconPath.index; // fallback ke icon home jika terjadi error
  }
};

const TabBarIcon = ({ routeName, color }: { routeName: RouteNames; color: string }) => {
  const source = getIconSource(routeName);
  
  if (!source) {
    return (
      <View style={styles.iconContainer}>
        <Text style={[{ color }, styles.fallbackIcon]}>•</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Image
        source={source}
        style={[styles.icon, { tintColor: color }]}
        onError={(e) => {
          console.error('Error loading icon for route:', routeName, e.nativeEvent);
        }}
      />
    </View>
  );
};

// Get device dimensions and calculate proper offsets
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

// Determine if device has hardware navigation buttons (e.g., Samsung)
const hasHardwareButtons = () => {
  // Check screen ratio - most modern full-screen phones have ratio around 2:1
  const ratio = screenHeight / screenWidth;
  return Platform.OS === 'android' && ratio < 1.8;
};

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  // Calculate bottom offset to ensure tab bar stays above device navigation
  const getBottomOffset = () => {
    if (Platform.OS === 'ios') {
      // iOS with home indicator (iPhone X and newer)
      return insets.bottom > 0 ? 30 : 15;
    } else {
      // Android devices
      if (hasHardwareButtons()) {
        return 15; // For devices with hardware buttons
      } else {
        return 65; // For devices with virtual/gesture navigation
      }
    }
  };

  // Create floating tab bar style
  const tabBarStyle = {
    position: 'absolute' as 'absolute',
    bottom: getBottomOffset(),
    left: 10,
    right: 10,
    height: 65,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 10, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 999,
  };

  const screenOptions = {
    tabBarActiveTintColor: '#0066AE',
    headerShown: false,
    tabBarStyle: tabBarStyle,
    tabBarItemStyle: styles.tabBarItem,
    tabBarLabelStyle: styles.tabBarLabel,
  // Add bottom padding to content to prevent tab bar overlap and allow space for logout button
    contentStyle: { 
      paddingBottom: 130 + getBottomOffset(), // Increased padding to accommodate the logout button
    },
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <TabBarIcon routeName="index" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <TabBarIcon routeName="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mutasi"
        options={{
          title: 'Mutasi',
          tabBarIcon: ({ color }) => <TabBarIcon routeName="mutasi" color={color} />,
        }}
      />
      <Tabs.Screen
        name="aktivitas"
        options={{
          title: 'Aktivitas',
          tabBarIcon: ({ color }) => <TabBarIcon routeName="aktivitas" color={color} />,
        }}
      />
      <Tabs.Screen
        name="akun"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color }) => <TabBarIcon routeName="akun" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    paddingVertical: 5,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 0,
    marginBottom: 3,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  fallbackIcon: {
    fontSize: 20,
    lineHeight: 20,
  },
});
