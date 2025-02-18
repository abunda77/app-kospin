import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

interface PinjamanResponse {
  status: boolean;
  message: string;
  data: {
    info_profile: {
      id_profile: string;
      nama_lengkap: string;
      no_identity: string;
      phone: string;
    };
    pinjaman: Array<{
      no_pinjaman: string;
      jumlah_pinjaman: string;
      tanggal_pinjaman: string;
      jangka_waktu: string;
      tanggal_jatuh_tempo: string;
      status_pinjaman: string;
      produk_pinjaman: string;
    }>;
  };
}

interface PaymentHistoryResponse {
  status: boolean;
  message: string;
  data: {
    info_pinjaman: {
      no_pinjaman: string;
      nama_nasabah: string;
      produk_pinjaman: string;
      jumlah_pinjaman: string;
      tanggal_pinjaman: string;
      status_pinjaman: string;
    };
    pembayaran: {
      transaksi: Array<{
        angsuran_ke: number;
        tanggal_pembayaran: string;
        angsuran_pokok: string;
        angsuran_bunga: string;
        denda: string;
        total_pembayaran: string;
        status_pembayaran: string;
        hari_terlambat: number;
      }>;
      summary: {
        total_pokok: number;
        total_bunga: number;
        total_denda: number;
        total_pembayaran: number;
      };
    };
  };
}

export default function Kredit() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pinjamanData, setPinjamanData] = useState<PinjamanResponse['data'] | null>(null);
  const router = useRouter();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const fetchPinjamanData = async (token: string) => {
    try {
      // First API call - Profile
      const profileResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.PROFILES}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        const profileError = await profileResponse.text();
        console.error('Profile API Error:', {
          status: profileResponse.status,
          statusText: profileResponse.statusText,
          error: profileError
        });
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      const profileId = profileData.data.id_user;

      // Second API call - Pinjaman
      const pinjamanResponse = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.PINJAMAN_BY_PROFILE}?id_profile=${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const responseData = await pinjamanResponse.json();

      if (pinjamanResponse.status === 404) {
        // Handle the case where user has no loans
        setPinjamanData({
          info_profile: profileData.data,
          pinjaman: []
        });
        return;
      }

      if (!pinjamanResponse.ok) {
        // Handle other error cases
        console.error('Pinjaman API Error:', {
          status: pinjamanResponse.status,
          statusText: pinjamanResponse.statusText,
          error: responseData
        });
        throw new Error(`Failed to fetch pinjaman data: ${pinjamanResponse.status}`);
      }

      setPinjamanData(responseData.data);
    } catch (error) {
      console.error('Error in fetchPinjamanData:', error);
      Toast.show({
        type: 'info',
        text1: 'Informasi',
        text2: 'Anda belum memiliki data pinjaman',
        position: 'bottom'
      });
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
      if (token) {
        await fetchPinjamanData(token);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (token) {
        await fetchPinjamanData(token);
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

  const fetchPaymentHistory = async (noPinjaman: string) => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sesi telah berakhir. Silakan login kembali.',
          position: 'bottom'
        });
        return;
      }

      const url = `${getApiBaseUrl()}${API_ENDPOINTS.PINJAMAN_HISTORY_PEMBAYARAN}`;
      console.log('Fetching payment history from:', url);
      console.log('Request payload:', { no_pinjaman: noPinjaman });
      console.log('API Base URL:', getApiBaseUrl());
      console.log('API Endpoint:', API_ENDPOINTS.PINJAMAN_HISTORY_PEMBAYARAN);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ no_pinjaman: noPinjaman })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment History API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data: PaymentHistoryResponse = await response.json();
      
      if (!data.data) {
        throw new Error('No data received from server');
      }

      console.log('Successfully fetched payment history');
      router.push({
        pathname: "/(menu)/kredit/history",
        params: { historyData: JSON.stringify(data.data) }
      });
    } catch (error) {
      console.error('Detailed error in fetchPaymentHistory:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal mengambil history pembayaran. Silakan coba lagi.',
        position: 'bottom',
        visibilityTime: 4000
      });
    }
  };

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
            <Text style={styles.headerTitle}>Informasi Pinjaman</Text>
            {isLoading ? (
              <Skeleton width={200} height={20} />
            ) : (
              <Text style={styles.headerSubtitle}>
                {pinjamanData?.info_profile.nama_lengkap}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            renderSkeletonCards()
          ) : pinjamanData?.pinjaman.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Anda belum memiliki data pinjaman
              </Text>
            </View>
          ) : (
            pinjamanData?.pinjaman.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.produk_pinjaman}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Nomor Pinjaman</Text>
                    <Text style={styles.value}>{item.no_pinjaman}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Jumlah Pinjaman</Text>
                    <Text style={styles.balanceValue}>
                      {formatCurrency(item.jumlah_pinjaman)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Jangka Waktu</Text>
                    <Text style={styles.value}>{item.jangka_waktu}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Tanggal Pinjaman</Text>
                    <Text style={styles.value}>{formatDate(item.tanggal_pinjaman)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Jatuh Tempo</Text>
                    <Text style={styles.value}>{formatDate(item.tanggal_jatuh_tempo)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={[styles.value, styles.statusText]}>
                      {item.status_pinjaman.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => fetchPaymentHistory(item.no_pinjaman)}
                  >
                    <Text style={styles.historyButtonText}>Lihat History Pembayaran</Text>
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
  content: {
    padding: 16,
  },
  headerContainer: {
    backgroundColor: '#f5f5f5',
    marginBottom: 24,
    marginTop: 10,
    paddingTop: 0,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  balanceValue: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  statusText: {
    color: '#0066AE',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: '#28a745',  // Changed to green color
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
