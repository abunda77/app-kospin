import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import LoginRequired from '../../components/LoginRequired';
import { getApiBaseUrl, API_ENDPOINTS } from '@/app/config/api';
import Skeleton from '../../components/Skeleton';
import { useRouter } from 'expo-router';

interface TagihanResponse {
  status: boolean;
  message: string;
  data: {
    info_profile: {
      id_user: string;
      nama_lengkap: string;
    };
    tagihan: Array<{
      no_pinjaman: string;
      produk_pinjaman: string;
      periode: number;
      pokok: number;
      bunga: number;
      total_angsuran: number;
      tanggal_jatuh_tempo: string;
      countdown: string;
      status_pembayaran: string;
      denda: number;
      hari_terlambat: number;
      total_tagihan: number;
    }>;
  };
}

interface AngsuranDetailResponse {
  status: boolean;
  message: string;
  data: {
    info_pinjaman: {
      no_pinjaman: string;
      nama_nasabah: string;
      produk_pinjaman: string;
      jumlah_pinjaman: string;
      jangka_waktu: number;
      tanggal_pinjaman: string;
      bunga_per_tahun: string;
      status_pinjaman: string;
      rate_denda: string;
    };
    detail_angsuran: Array<{
      periode: number;
      pokok: number;
      bunga: number;
      total_angsuran: number;
      sisa_pokok: number;
      tanggal_jatuh_tempo: string;
      countdown: string;
      status_pembayaran: string;
      tanggal_pembayaran: string | null;
      denda: number;
      hari_terlambat: number;
      total_tagihan: number;
    }>;
  };
}

export default function Angsuran() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tagihanData, setTagihanData] = useState<TagihanResponse['data'] | null>(null);
  const router = useRouter();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      // Get just the day part from DD/MM/YYYY format
      const day = dateString.split('/')[0];
      // Ensure day is always 2 digits
      return `Tanggal ${day.padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const fetchTagihanData = async (token: string) => {
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
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();

      // Second API call - Get Pinjaman to get no_pinjaman
      const pinjamanResponse = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.PINJAMAN_BY_PROFILE}?id_profile=${profileData.data.id_user}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!pinjamanResponse.ok) {
        throw new Error(`Failed to fetch pinjaman data: ${pinjamanResponse.status}`);
      }

      const pinjamanData = await pinjamanResponse.json();

      if (!pinjamanData.data.pinjaman || pinjamanData.data.pinjaman.length === 0) {
        setTagihanData({
          info_profile: profileData.data,
          tagihan: []
        });
        return;
      }

      // Third API call - Get Angsuran Details using no_pinjaman
      const angsuranPromises = pinjamanData.data.pinjaman.map(async (pinjaman: any) => {
        const angsuranResponse = await fetch(
          `${getApiBaseUrl()}${API_ENDPOINTS.ANGSURAN_DETAILS}?no_pinjaman=${pinjaman.no_pinjaman}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!angsuranResponse.ok) {
          throw new Error(`Failed to fetch angsuran data: ${angsuranResponse.status}`);
        }

        return angsuranResponse.json();
      });

      const angsuranResults = await Promise.all(angsuranPromises);

      // Transform and get only first angsuran from each loan
      const allTagihan = angsuranResults.map(responseData => {
        const firstAngsuran = responseData.data.detail_angsuran[0];
        return {
          no_pinjaman: responseData.data.info_pinjaman.no_pinjaman,
          produk_pinjaman: responseData.data.info_pinjaman.produk_pinjaman,
          periode: firstAngsuran.periode,
          pokok: firstAngsuran.pokok,
          bunga: firstAngsuran.bunga,
          total_angsuran: firstAngsuran.total_angsuran,
          tanggal_jatuh_tempo: firstAngsuran.tanggal_jatuh_tempo,
          countdown: firstAngsuran.countdown,
          status_pembayaran: firstAngsuran.status_pembayaran,
          denda: firstAngsuran.denda,
          hari_terlambat: firstAngsuran.hari_terlambat,
          total_tagihan: firstAngsuran.total_tagihan
        };
      });

      setTagihanData({
        info_profile: profileData.data,
        tagihan: allTagihan
      });

    } catch (error) {
      console.error('Error in fetchTagihanData:', error);
      Toast.show({
        type: 'info',
        text1: 'Informasi',
        text2: 'Anda tidak memiliki tagihan yang belum dibayar',
        position: 'bottom'
      });
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
      if (token) {
        await fetchTagihanData(token);
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
        await fetchTagihanData(token);
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
          </View>
        </View>
      ))}
    </>
  );

  const fetchAngsuranDetails = async (noPinjaman: string) => {
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

      const url = `${getApiBaseUrl()}${API_ENDPOINTS.ANGSURAN_DETAILS}?no_pinjaman=${noPinjaman}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: AngsuranDetailResponse = await response.json();
      router.push({
        pathname: "/(menu)/kredit/detail-angsuran",
        params: { detailData: JSON.stringify(data.data) }
      });
    } catch (error) {
      console.error('Error fetching angsuran details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal mengambil detail angsuran. Silakan coba lagi.',
        position: 'bottom'
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
            <Text style={styles.headerTitle}>Informasi Angsuran</Text>
            {isLoading ? (
              <Skeleton width={200} height={20} />
            ) : (
              <Text style={styles.headerSubtitle}>
                {tagihanData?.info_profile.nama_lengkap}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            renderSkeletonCards()
          ) : tagihanData?.tagihan.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Anda tidak memiliki tagihan angsuran
              </Text>
            </View>
          ) : (
            tagihanData?.tagihan.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.produk_pinjaman}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Nomor Pinjaman</Text>
                    <Text style={styles.value}>{item.no_pinjaman}</Text>
                  </View>
                  {/* <View style={styles.infoRow}>
                    <Text style={styles.label}>Angsuran Ke</Text>
                    <Text style={styles.value}>{item.periode}</Text>
                  </View> */}
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Pokok</Text>
                    <Text style={styles.value}>{formatCurrency(item.pokok.toString())}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Bunga</Text>
                    <Text style={styles.value}>{formatCurrency(item.bunga.toString())}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Total Angsuran</Text>
                    <Text style={styles.balanceValue}>
                      {formatCurrency(item.total_angsuran.toString())}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Jatuh Tempo</Text>
                    <Text style={styles.value}>{formatDate(item.tanggal_jatuh_tempo)}</Text>
                  </View>
                  {/* <View style={styles.infoRow}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={[styles.value, styles.statusText]}>
                      {item.status_pembayaran}
                    </Text>
                  </View> */}
                  {/* <View style={styles.infoRow}>
                    <Text style={styles.label}>Countdown</Text>
                    <Text style={styles.value}>{item.countdown}</Text>
                  </View> */}
                  {/* {item.denda > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Denda</Text>
                      <Text style={[styles.value, styles.dendaText]}>
                        {formatCurrency(item.denda.toString())}
                      </Text>
                    </View>
                  )} */}
                  <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => fetchAngsuranDetails(item.no_pinjaman)}
                  >
                    <Text style={styles.historyButtonText}>Lihat Detail Angsuran</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
    color: '#333333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: '600',
  },
  dendaText: {
    color: '#FF0000',
    fontWeight: 'bold'
  },
  deadlineText: {
    color: '#FFC107',
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: '#0066AE',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loanNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statusText: {
    color: '#0066AE',
    fontWeight: 'bold',
  },
});
