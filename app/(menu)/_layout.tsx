import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function MenuLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(tabs)');
        return;
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
      router.replace('/(tabs)');
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066AE',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackVisible: false,
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
      }}
    >
      <Stack.Screen
        name="transfer"
        options={{
          title: 'Transfer',
        }}
      />
      <Stack.Screen
        name="tarik-tunai"
        options={{
          title: 'Tarik Tunai',
        }}
      />
      <Stack.Screen
        name="setor-tunai"
        options={{
          title: 'Setor Tunai',
        }}
      />
      <Stack.Screen
        name="pembayaran"
        options={{
          title: 'Pembayaran',
        }}
      />
      <Stack.Screen
        name="pinjaman"
        options={{
          title: 'Pinjaman',
        }}
      />
      <Stack.Screen
        name="simpanan"
        options={{
          title: 'Simpanan',
        }}
      />
    </Stack>
  );
}
