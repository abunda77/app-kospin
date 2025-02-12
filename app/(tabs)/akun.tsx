import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import Skeleton from '../../components/Skeleton'; // Import Skeleton component

interface UserProfile {
  id: number;
  id_user: number;
  first_name: string;
  last_name: string;
  address: string;
  sign_identity: string;
  no_identity: string;
  image_identity: string[];
  phone: string;
  email: string;
  whatsapp: string;
  gender: string;
  birthday: string;
  mariage: string;
  job: string;
  province_id: string;
  district_id: string;
  city_id: string;
  village_id: string;
  monthly_income: string;
  is_active: number;
  type_member: string;
  avatar: string;
}

export default function AccountScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' atau 'password'

  useEffect(() => {
    checkLoginStatus();
    loadProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
      loadProfile();
    }, [])
  );

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const loadProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.USER_PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProfile().finally(() => setRefreshing(false));
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066AE" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.containerLoggedOut}>
        <View style={styles.headerLoggedOut}>
          <Text style={styles.titleLoggedOut}>Akun</Text>
        </View>
        <View style={styles.contentLoggedOut}>
          <Text style={styles.loginMessage}>Silakan login untuk melihat profil Anda</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Profile */}
      <View style={styles.header}>
        <Image
          source={
            profile?.avatar
              ? { uri: `${getApiBaseUrl()}/storage/${profile.avatar}` }
              : require('../../assets/icons/default-avatar.png')
          }
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{`${profile?.first_name} ${profile?.last_name}`}</Text>
          <Text style={styles.memberType}>{profile?.type_member.toUpperCase()}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'profile' ? '#0066AE' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'profile' && styles.activeTabText
          ]}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'password' && styles.activeTab]}
          onPress={() => setActiveTab('password')}
        >
          <Ionicons 
            name="key-outline" 
            size={20} 
            color={activeTab === 'password' ? '#0066AE' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'password' && styles.activeTabText
          ]}>Ubah Password</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'profile' ? (
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={24} color="#0066AE" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Informasi Pribadi</Text>
              <Text style={styles.infoValue}>NIK: {profile?.no_identity}</Text>
              <Text style={styles.infoValue}>
                Gender: {profile?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </Text>
              <Text style={styles.infoValue}>
                Tanggal Lahir: {formatDate(profile?.birthday || '')}
              </Text>
              <Text style={styles.infoValue}>Status: {profile?.mariage}</Text>
              <Text style={styles.infoValue}>Pekerjaan: {profile?.job}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={24} color="#0066AE" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Kontak</Text>
              <Text style={styles.infoValue}>Email: {profile?.email}</Text>
              <Text style={styles.infoValue}>Telepon: {profile?.phone}</Text>
              <Text style={styles.infoValue}>WhatsApp: {profile?.whatsapp}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="home-outline" size={24} color="#0066AE" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{profile?.address}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="wallet-outline" size={24} color="#0066AE" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Informasi Finansial</Text>
              <Text style={styles.infoValue}>
                Pendapatan Bulanan: {formatCurrency(profile?.monthly_income || '0')}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubah Password</Text>
              <Text style={styles.infoValue}>Fitur ubah password akan segera hadir</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0066AE',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    marginTop: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  headerInfo: {
    marginLeft: 15,
    marginTop: 30,
  },
  name: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  memberType: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 5,
  },
  infoSection: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 5,
    marginHorizontal: 15,
    marginTop: -13,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E6F0F9',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066AE',
    fontWeight: 'bold',
  },
  containerLoggedOut: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerLoggedOut: {
    backgroundColor: '#0066AE',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleLoggedOut: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },
  contentLoggedOut: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#0066AE',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
