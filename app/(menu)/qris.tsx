import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import LoginRequired from '../../components/LoginRequired';

export default function QRIS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Halaman QRIS</Text>
      </View>
    </SafeAreaView>
  );
}
