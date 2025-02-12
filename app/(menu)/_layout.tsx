import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LoginRequired from '../../components/LoginRequired';

export default function MenuLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) {
        Platform.OS === 'android' 
          ? router.replace('/(tabs)') 
          : router.push('/(tabs)');
        return;
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error checking login status:', error);
      Platform.OS === 'android' 
        ? router.replace('/(tabs)') 
        : router.push('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const handleBackToDashboard = () => {
    if (Platform.OS === 'android') {
      router.replace('/(tabs)/dashboard');
    } else {
      router.push('/(tabs)/dashboard');
    }
  };

  if (isLoading) {
    return null;
  }

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
