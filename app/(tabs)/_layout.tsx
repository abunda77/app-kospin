import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          tabBarStyle: {
            display: 'none'
          },
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="dashboard" options={{ href: null }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066AE',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 60,
          paddingBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mutasi"
        options={{
          title: 'Mutasi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qris"
        options={{
          title: 'QRIS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aktivitas"
        options={{
          title: 'Aktivitas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="akun"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
