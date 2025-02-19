import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import LoginRequired from '../../components/LoginRequired';

const tagihanData = [
  { id: 1, name: 'PLN', icon: require('../../assets/tagihan/pln.png') },
  { id: 2, name: 'BPJS', icon: require('../../assets/tagihan/bpjs.png') },
  { id: 3, name: 'Telkom', icon: require('../../assets/tagihan/telkom.png') },
  { id: 4, name: 'Kartu Halo', icon: require('../../assets/tagihan/halo.png') },
  { id: 5, name: 'Matrix', icon: require('../../assets/tagihan/matrix.png') },
  { id: 6, name: 'Smartfren', icon: require('../../assets/tagihan/smartfren.png') },
  { id: 7, name: 'Tri', icon: require('../../assets/tagihan/tri.png') },
  { id: 8, name: 'XL Xplor', icon: require('../../assets/tagihan/xplor.png') },
];

export default function Tagihan() {
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
          <Text style={styles.headerText}>Pembayaran Tagihan</Text>
        </View>
        <View style={styles.gridContainer}>
          {tagihanData.map((item) => (
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
