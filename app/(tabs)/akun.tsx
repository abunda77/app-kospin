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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' atau 'password'

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(tabs)');
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
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066AE" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Profile */}
      <View style={styles.header}>
        {loading ? (
          <>
            <Skeleton width={80} height={80} borderRadius={40} />
            <View style={styles.headerInfo}>
              <Skeleton width={180} height={24} />
              <View style={{ height: 8 }} />
              <Skeleton width={100} height={20} />
            </View>
          </>
        ) : (
          <>
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
          </>
        )}
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
          {loading ? (
            // Skeleton loading untuk cards
            <>
              <View style={styles.infoCard}>
                <Skeleton width={24} height={24} borderRadius={12} />
                <View style={[styles.infoContent, { flex: 1 }]}>
                  <Skeleton width={150} height={20} />
                  <View style={{ height: 8 }} />
                  <Skeleton width="90%" height={16} />
                  <View style={{ height: 4 }} />
                  <Skeleton width="85%" height={16} />
                  <View style={{ height: 4 }} />
                  <Skeleton width="80%" height={16} />
                  <View style={{ height: 4 }} />
                  <Skeleton width="75%" height={16} />
                </View>
              </View>

              <View style={styles.infoCard}>
                <Skeleton width={24} height={24} borderRadius={12} />
                <View style={[styles.infoContent, { flex: 1 }]}>
                  <Skeleton width={120} height={20} />
                  <View style={{ height: 8 }} />
                  <Skeleton width="90%" height={16} />
                  <View style={{ height: 4 }} />
                  <Skeleton width="85%" height={16} />
                  <View style={{ height: 4 }} />
                  <Skeleton width="80%" height={16} />
                </View>
              </View>

              <View style={styles.infoCard}>
                <Skeleton width={24} height={24} borderRadius={12} />
                <View style={[styles.infoContent, { flex: 1 }]}>
                  <Skeleton width={100} height={20} />
                  <View style={{ height: 8 }} />
                  <Skeleton width="95%" height={16} />
                </View>
              </View>

              <View style={styles.infoCard}>
                <Skeleton width={24} height={24} borderRadius={12} />
                <View style={[styles.infoContent, { flex: 1 }]}>
                  <Skeleton width={160} height={20} />
                  <View style={{ height: 8 }} />
                  <Skeleton width="90%" height={16} />
                </View>
              </View>
            </>
          ) : (
            // Konten asli
            <>
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
            </>
          )}
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
});
