import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import LoginRequired from '../../components/LoginRequired';

const eWalletData = [
  { id: 1, name: 'Dana', icon: require('../../assets/e-wallet/dana.png') },
  { id: 2, name: 'Gopay', icon: require('../../assets/e-wallet/gopay.png') },
  { id: 3, name: 'LinkAja', icon: require('../../assets/e-wallet/linkaja.png') },
  { id: 4, name: 'OVO', icon: require('../../assets/e-wallet/ovo.png') },
  { id: 5, name: 'ShopeePay', icon: require('../../assets/e-wallet/shopee.png') },
];

export default function EWallet() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
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

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerText}>E-Wallet</Text>
        </View>
        <View style={styles.gridContainer}>
          {eWalletData.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <Image source={item.icon} style={styles.icon} resizeMode="contain" />
              <Text style={styles.iconText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  gridItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  iconText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
