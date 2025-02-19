import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect, useRouter } from 'expo-router';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TabunganResponse {
  status: boolean;
  message: string;
  data: {
    info_profile: {
      id_profile: number;
      nama_lengkap: string;
      no_identity: string;
      phone: string;
    };
    tabungan: Array<{
      id: number;
      no_tabungan: string;
      saldo: string;
      produk_tabungan: {
        nama_produk: string;
      };
    }>;
  };
}

export default function SetorTunai() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabunganData, setTabunganData] = useState<TabunganResponse['data'] | null>(null);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
      if (token) {
        await fetchTabunganData(token);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabunganData = async (token: string) => {
    try {
      const profileResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.PROFILES}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileResponse.json();
      const profileId = profileData.data.id;

      const tabunganResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.TABUNGAN_BY_PROFILE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id_profile: profileId })
      });

      if (!tabunganResponse.ok) throw new Error('Failed to fetch tabungan data');
      const data: TabunganResponse = await tabunganResponse.json();
      setTabunganData(data.data);
    } catch (error) {
      console.error('Error fetching tabungan data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (token) {
        await fetchTabunganData(token);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const renderSkeletonCards = () => (
    <>
      {[1, 2].map((key) => (
        <View key={key} style={styles.card}>
          <View style={styles.cardHeader}>
            <Skeleton width={200} height={24} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Skeleton width={100} height={16} />
              <Skeleton width={120} height={16} />
            </View>
          </View>
        </View>
      ))}
    </>
  );

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066AE']}
            tintColor="#0066AE"
          />
        }
      >
        <View style={styles.headerContainer}>
          <View style={styles.content}>
            <Text style={styles.headerTitle}>Setor Tunai</Text>
            {isLoading ? (
              <Skeleton width={200} height={20} />
            ) : (
              <Text style={styles.headerSubtitle}>
                {tabunganData?.info_profile.nama_lengkap}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            renderSkeletonCards()
          ) : tabunganData?.tabungan.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Anda belum memiliki rekening tabungan
              </Text>
            </View>
          ) : (
            tabunganData?.tabungan.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.produk_tabungan.nama_produk}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Nomor Rekening</Text>
                    <Text style={[styles.value, styles.rekeningBadge]}>{item.no_tabungan}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.setorButton}
                    onPress={() => router.push({
                      pathname: '/tabungan/setoran_tabungan',
                      params: { 
                        noRekening: item.no_tabungan,
                        produk: item.produk_tabungan.nama_produk
                      }
                    })}
                  >
                    <LinearGradient
                      colors={['#0066AE', '#0095FF']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={styles.buttonContent}>
                        <Ionicons name="wallet-outline" size={20} color="#fff" />
                        <Text style={styles.setorButtonText}>Setor Tunai</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: '#F5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066AE',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  rekeningBadge: {
    backgroundColor: '#E7F7ED',
    color: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontWeight: '600',
    overflow: 'hidden',
  },
  setorButton: {
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 8,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
