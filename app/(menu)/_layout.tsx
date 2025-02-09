import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MenuLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      if (!token) {
        Platform.OS === 'android' 
          ? router.replace('/(tabs)') 
          : router.push('/(tabs)'); 
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
      Platform.OS === 'android' 
        ? router.replace('/(tabs)') 
        : router.push('/(tabs)');
    }
  };

  const handleBackToDashboard = () => {
    if (Platform.OS === 'android') {
      router.replace('/(tabs)/dashboard');
    } else {
      router.push('/(tabs)/dashboard');
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          // backgroundColor: '#0066AE',
          backgroundColor: '#ff9900',
          // height: Platform.OS === 'ios' ? 110 : 65,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'left',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={handleBackToDashboard}
            style={{ 
              marginLeft: Platform.OS === 'ios' ? 8 : 0,
              padding: 12,
            }}
          >
            {/* <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#ffff" 
            /> */}
          </TouchableOpacity>
        ),
        headerShadowVisible: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        contentStyle: {
          backgroundColor: '#F5F5F5',
        },
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
