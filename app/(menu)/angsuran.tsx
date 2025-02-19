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
import { LinearGradient } from 'expo-linear-gradient';

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
      // First get the profile ID
      const profileResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.PROFILES}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileResponse.json();
      const profileId = profileData.data.id_user;

      // First API call - Get Pinjaman with profile info
      const pinjamanUrl = `${getApiBaseUrl()}${API_ENDPOINTS.PINJAMAN_BY_PROFILE}?id_profile=${profileId}`;
      const pinjamanResponse = await fetch(pinjamanUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!pinjamanResponse.ok) {
        console.error('Pinjaman Response Error:', {
          status: pinjamanResponse.status,
          statusText: pinjamanResponse.statusText
        });
        throw new Error(`Failed to fetch pinjaman data: ${pinjamanResponse.status}`);
      }

      const pinjamanData = await pinjamanResponse.json();

      // Set the profile data directly from the pinjaman response
      setTagihanData({
        info_profile: {
          id_user: pinjamanData.data.info_profile.id_profile, // Use id_profile from the response
          nama_lengkap: pinjamanData.data.info_profile.nama_lengkap
        },
        tagihan: []
      });

      if (!pinjamanData.data.pinjaman || pinjamanData.data.pinjaman.length === 0) {
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
        info_profile: pinjamanData.data.info_profile,
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
      {!isLoggedIn ? (
        <LoginRequired />
      ) : (
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
                  {tagihanData?.info_profile?.nama_lengkap}
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
                      <LinearGradient
                        colors={['#0066AE', '#0095FF']}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.historyButtonText}>Lihat Detail Angsuran</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#455A64',
    marginTop: 4,
    letterSpacing: 0.25,
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
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066AE',
    letterSpacing: 0.15,
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
    color: '#546E7A',
    flex: 1,
    letterSpacing: 0.25,
  },
  value: {
    fontSize: 14,
    color: '#263238',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 16,
    color: '#1B5E20',
    flex: 2,
    textAlign: 'right',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusText: {
    textAlign: 'right',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  dendaText: {
    color: '#D32F2F',
    fontWeight: '700',
  },
  badge: {
    maxWidth: 120,
    alignSelf: 'flex-end',
  },
  historyButton: {
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 8,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loanNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
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
});
