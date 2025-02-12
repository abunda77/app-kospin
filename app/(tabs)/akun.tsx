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
import LoginRequired from '../../components/LoginRequired'; // Import LoginRequired component

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
    return <LoginRequired message="Silakan login untuk melihat profil Anda" />;
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NIK</Text>
              <Text style={styles.infoValue}>{profile?.no_identity}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{profile?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Lahir</Text>
              <Text style={styles.infoValue}>{formatDate(profile?.birthday || '')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{profile?.mariage}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pekerjaan</Text>
              <Text style={styles.infoValue}>{profile?.job}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={24} color="#0066AE" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telepon</Text>
              <Text style={styles.infoValue}>{profile?.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>WhatsApp</Text>
              <Text style={styles.infoValue}>{profile?.whatsapp}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="home-outline" size={24} color="#0066AE" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{profile?.address}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="wallet-outline" size={24} color="#0066AE" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pendapatan Bulanan</Text>
              <Text style={styles.infoValue}>{formatCurrency(profile?.monthly_income || '0')}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
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
  header: {
    backgroundColor: '#0066AE',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  memberType: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066AE',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#0066AE',
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 2,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    padding: 15,
  },
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
});
