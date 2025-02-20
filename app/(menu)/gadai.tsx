import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import LoginRequired from '../../components/LoginRequired';

export default function Gadai() {
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

  const openWhatsApp = async () => {
    const phoneNumber = '6287778715788'; // format nomor dengan awalan 62
    const message = 'Halo, saya tertarik dengan layanan gadai di Koperasi Sinara Artha.';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        alert('WhatsApp tidak terpasang di perangkat Anda');
      }
    } catch (error) {
      console.error('Error membuka WhatsApp:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Solusi Gadai Cepat & Terpercaya</Text>
          
          <Text style={styles.subtitle}>Gadai Mudah, Aman, dan Menguntungkan!</Text>
          
          <View style={styles.productContainer}>
            <Text style={styles.sectionTitle}>Kami Menerima Gadai:</Text>
            <Text style={styles.productItem}>• Smartphone & Tablet</Text>
            <Text style={styles.productItem}>• Laptop & Komputer</Text>
            <Text style={styles.productItem}>• Emas & Perhiasan</Text>
            <Text style={styles.productItem}>• Perangkat Elektronik Lainnya</Text>
          </View>

          <View style={styles.benefitContainer}>
            <Text style={styles.sectionTitle}>Keunggulan Kami:</Text>
            <Text style={styles.benefitItem}>✓ Proses Cepat dan Mudah</Text>
            <Text style={styles.benefitItem}>✓ Nilai Taksiran Tinggi</Text>
            <Text style={styles.benefitItem}>✓ Penyimpanan Aman</Text>
            <Text style={styles.benefitItem}>✓ Bunga Kompetitif</Text>
          </View>

          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Hubungi Kami:</Text>
            <Text style={styles.contactItem}>📍 Koperasi Sinara Artha</Text>
            <Text style={styles.contactDetail}>Easten Park Residence Blok B7 No. 7,</Text>
            <Text style={styles.contactDetail}>Sukolilo, Surabaya 60111</Text>
            <TouchableOpacity onPress={openWhatsApp}>
              <Text style={[styles.contactItem, styles.whatsappLink]}>
                📱 WhatsApp: +6287778715788
              </Text>
            </TouchableOpacity>
            <Text style={styles.contactItem}>✉️ Email: cs@kospinsinaraartha.com</Text>
          </View>
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
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#34495E',
    marginBottom: 30,
  },
  productContainer: {
    marginBottom: 25,
  },
  benefitContainer: {
    marginBottom: 25,
  },
  contactContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  productItem: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495E',
    paddingLeft: 10,
  },
  benefitItem: {
    fontSize: 16,
    marginBottom: 5,
    color: '#27AE60',
    paddingLeft: 10,
  },
  contactItem: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495E',
    fontWeight: '500',
  },
  contactDetail: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 5,
    paddingLeft: 20,
  },
  whatsappLink: {
    color: '#25D366', // warna WhatsApp
    textDecorationLine: 'underline',
  },
});


