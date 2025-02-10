import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Image, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RouteNames = 'index' | 'dashboard' | 'mutasi' | 'aktivitas' | 'akun';

const getIconSource = (routeName: RouteNames) => {
  console.log('Getting icon for route:', routeName);
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
  console.log('Rendering TabBarIcon for route:', routeName);
  const source = getIconSource(routeName);
  
  if (!source) {
    console.error('No icon source found for route:', routeName);
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

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Current auth token:', token);
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const screenOptions = {
    tabBarActiveTintColor: '#0066AE',
    headerShown: false,
    tabBarStyle: styles.tabBar,
    tabBarItemStyle: styles.tabBarItem,
    tabBarLabelStyle: styles.tabBarLabel,
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
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    height: Platform.OS === 'ios' ? 75 : 55,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
  },
  tabBarItem: {
    paddingVertical: 3,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -2,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
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
