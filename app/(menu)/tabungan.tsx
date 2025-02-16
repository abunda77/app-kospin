import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';

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

interface SaldoBerjalanResponse {
  status: boolean;
  message: string;
  data: {
    info_rekening: {
      no_tabungan: string;
      nama_nasabah: string;
      produk_tabungan: string;
      saldo_berjalan: number;
    };
  };
}

export default function Tabungan() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabunganData, setTabunganData] = useState<TabunganResponse['data'] | null>(null);
  const [saldoBerjalanData, setSaldoBerjalanData] = useState<Record<string, number>>({});

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

      // Fetch saldo berjalan for each tabungan
      const saldoBerjalanPromises = data.data.tabungan.map(async (item) => {
        const saldoBerjalan = await fetchSaldoBerjalan(token, item.no_tabungan);
        return { [item.no_tabungan]: saldoBerjalan };
      });

      const saldoBerjalanResults = await Promise.all(saldoBerjalanPromises);
      const saldoBerjalanMap = saldoBerjalanResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      const saldoBerjalanMapFiltered = Object.fromEntries(
        Object.entries(saldoBerjalanMap).filter(([_, value]) => value !== null)
      ) as Record<string, number>;
      setSaldoBerjalanData(saldoBerjalanMapFiltered);
    } catch (error) {
      console.error('Error fetching tabungan data:', error);
    }
  };

  const fetchSaldoBerjalan = async (token: string, noTabungan: string) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.TABUNGAN_SALDO_BERJALAN}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ no_tabungan: noTabungan })
      });

      if (!response.ok) throw new Error('Failed to fetch saldo berjalan');
      const data: SaldoBerjalanResponse = await response.json();
      return data.data.info_rekening.saldo_berjalan;
    } catch (error) {
      console.error('Error fetching saldo berjalan:', error);
      return null;
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

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

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
            <View style={styles.infoRow}>
              <Skeleton width={80} height={16} />
              <Skeleton width={150} height={20} />
            </View>
            <View style={styles.infoRow}>
              <Skeleton width={80} height={16} />
              <Skeleton width={150} height={20} />
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
            <Text style={styles.headerTitle}>Informasi Tabungan</Text>
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
          ) : (
            tabunganData?.tabungan.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.produk_tabungan.nama_produk}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Nomor Rekening</Text>
                    <Text style={styles.value}>{item.no_tabungan}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Saldo Awal</Text>
                    <Text style={styles.balanceValue}>{formatCurrency(item.saldo)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Saldo Akhir</Text>
                    <Text style={styles.balanceValue}>
                      {saldoBerjalanData[item.no_tabungan] 
                        ? formatCurrency(saldoBerjalanData[item.no_tabungan].toString())
                        : '-'}
                    </Text>
                  </View>
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
  content: {
    padding: 16,
  },
  headerContainer: {
    backgroundColor: '#f5f5f5',
    marginBottom: 24,
    marginTop: 10,
    paddingTop: 0,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: -10,    
    textAlign: 'left',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
    opacity: 0.9,
    textAlign: 'left',
    marginBottom: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    marginTop: -40,
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  balanceValue: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: 'bold',
  },
});
