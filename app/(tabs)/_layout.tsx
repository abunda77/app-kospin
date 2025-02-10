import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TabBarIcon = (props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) => {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
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

  if (!isLoggedIn) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0066AE',
          headerShown: false,
        }}>
        <Tabs.Screen 
          name="index" 
          options={{
            title: 'Beranda',
            tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066AE',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <TabBarIcon name="grid-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mutasi"
        options={{
          title: 'Mutasi',
          tabBarIcon: ({ color }) => <TabBarIcon name="document-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="aktivitas"
        options={{
          title: 'Aktivitas',
          tabBarIcon: ({ color }) => <TabBarIcon name="mail-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="akun"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color }) => <TabBarIcon name="person-outline" color={color} />,
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
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  tabBarItem: {
    paddingVertical: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  }
});
