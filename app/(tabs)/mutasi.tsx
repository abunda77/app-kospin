import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TabunganResponse {
  status: boolean;
  message: string;
  data: {
    info_profile: {
      nama_lengkap: string;
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

interface MutasiResponse {
  no_tabungan: string;
  periode: string;
  transaksi: Array<{
    id: number;
    tanggal_transaksi: string;
    jenis_transaksi: string;
    jumlah: string;
    keterangan: string;
  }>;
}

type PeriodeType = '10_terakhir' | '1_minggu_terakhir' | '1_bulan_terakhir';

export default function MutasiScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabunganData, setTabunganData] = useState<TabunganResponse['data'] | null>(null);
  const [mainAccount, setMainAccount] = useState<TabunganResponse['data']['tabungan'][0] | null>(null);
  const [isAccountSelectorVisible, setIsAccountSelectorVisible] = useState(false);
  const [mutasiData, setMutasiData] = useState<MutasiResponse | null>(null);
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeType>('10_terakhir');

  const periodeOptions = [
    { label: '10 Transaksi Terakhir', value: '10_terakhir' as PeriodeType },
    { label: '1 Minggu Terakhir', value: '1_minggu_terakhir' as PeriodeType },
    { label: '1 Bulan Terakhir', value: '1_bulan_terakhir' as PeriodeType },
  ];

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

      if (data.data.tabungan.length > 0 && !mainAccount) {
        setMainAccount(data.data.tabungan[0]);
        await fetchMutasi(token, data.data.tabungan[0].no_tabungan, selectedPeriode);
      }
    } catch (error) {
      console.error('Error fetching tabungan data:', error);
    }
  };

  const fetchMutasi = async (token: string, noTabungan: string, periode: PeriodeType) => {
    try {
      setIsLoading(true);
      const url = `${getApiBaseUrl()}${API_ENDPOINTS.MUTASI_BY_PERIODE(noTabungan, periode)}`;
      console.log('Fetching mutasi URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Mutasi API Error:', data);
        // Handle specific error cases
        if (response.status === 404) {
          setMutasiData({ 
            no_tabungan: '',
            periode: '',
            transaksi: [] 
          });
        } else if (response.status === 401) {
          // Handle unauthorized
          setIsLoggedIn(false);
        } else {
          throw new Error(data.message || `Failed to fetch mutasi: ${response.status}`);
        }
        return;
      }

      // Validate data structure
      if (!data || !Array.isArray(data.transaksi)) {
        setMutasiData({ 
          no_tabungan: '',
          periode: '',
          transaksi: [] 
        });
        return;
      }

      setMutasiData(data);
    } catch (error) {
      console.error('Error fetching mutasi:', error);
      setMutasiData({ 
        no_tabungan: '',
        periode: '',
        transaksi: [] 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (token && mainAccount) {
        await fetchMutasi(token, mainAccount.no_tabungan, selectedPeriode);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [mainAccount, selectedPeriode]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format date as dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Format time as HH:mm
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const formattedTime = date.toLocaleTimeString('id-ID', timeOptions) + ' WIB';
    
    return {
      date: `${day}/${month}/${year}`,
      time: formattedTime
    };
  };

  const renderSkeletonCards = () => (
    <>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.transactionCard}>
          <Skeleton width={150} height={20} />
          <View style={styles.transactionContent}>
            <Skeleton width={100} height={16} />
            <Skeleton width={120} height={16} />
          </View>
          <Skeleton width={200} height={16} />
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
            <Text style={styles.headerTitle}>Mutasi Rekening</Text>
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
          {mainAccount && (
            <View style={styles.card}>
              <LinearGradient
                colors={['#0066AE', '#0095FF']}
                style={styles.cardHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.productName}>{mainAccount.produk_tabungan.nama_produk}</Text>
                  {tabunganData && tabunganData.tabungan.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => setIsAccountSelectorVisible(true)}
                      style={styles.changeAccountButton}
                    >
                      <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
                      <Text style={styles.changeAccountText}>Ganti Rekening</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
              
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nomor Rekening</Text>
                  <Text style={[styles.value, styles.rekeningBadge]}>{mainAccount.no_tabungan}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.periodeSelector}>
            {periodeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodeOption,
                  selectedPeriode === option.value && styles.periodeOptionSelected
                ]}
                onPress={async () => {
                  setSelectedPeriode(option.value as PeriodeType);
                  const token = await SecureStore.getItemAsync('secure_token');
                  if (token && mainAccount) {
                    await fetchMutasi(token, mainAccount.no_tabungan, option.value as PeriodeType);
                  }
                }}
              >
                <Text style={[
                  styles.periodeOptionText,
                  selectedPeriode === option.value && styles.periodeOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            renderSkeletonCards()
          ) : !mutasiData || !mutasiData.transaksi || mutasiData.transaksi.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="document-text-outline" size={48} color="#666666" />
              <Text style={styles.emptyStateText}>
                Tidak ada data mutasi untuk periode ini
              </Text>
              <Text style={styles.emptyStateSubText}>
                Silakan pilih periode lain atau coba lagi nanti
              </Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.dateColumn]}>Tanggal</Text>
                <Text style={[styles.tableHeaderText, styles.descColumn]}>Keterangan</Text>
                <Text style={[styles.tableHeaderText, styles.amountColumn]}>Jumlah</Text>
              </View>
              {mutasiData.transaksi.map((transaksi, index) => (
                <View 
                  key={transaksi.id} 
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  <View style={styles.dateColumn}>
                    <Text style={styles.dateText}>
                      {formatDate(transaksi.tanggal_transaksi).date}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatDate(transaksi.tanggal_transaksi).time}
                    </Text>
                  </View>
                  <Text style={[styles.descColumn, styles.descriptionText]}>
                    {transaksi.keterangan}
                  </Text>
                  <Text style={[
                    styles.amountColumn,
                    styles.amountText,
                    transaksi.jenis_transaksi === 'kredit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaksi.jenis_transaksi === 'kredit' ? '-' : '+'} {formatCurrency(transaksi.jumlah)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isAccountSelectorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAccountSelectorVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAccountSelectorVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pilih Rekening</Text>
              {tabunganData?.tabungan.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountOption}
                  onPress={async () => {
                    setMainAccount(account);
                    setIsAccountSelectorVisible(false);
                    const token = await SecureStore.getItemAsync('secure_token');
                    if (token) {
                      await fetchMutasi(token, account.no_tabungan, selectedPeriode);
                    }
                  }}
                >
                  <Text style={styles.accountName}>{account.produk_tabungan.nama_produk}</Text>
                  <Text style={styles.accountNumber}>{account.no_tabungan}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#0066AE',
    paddingTop: 60,
    paddingBottom: 20,
  },
  content: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeAccountText: {
    color: '#FFFFFF',
    marginLeft: 4,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    backgroundColor: '#E8F3FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: '#0066AE',
  },
  periodeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  periodeOption: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  periodeOptionSelected: {
    backgroundColor: '#0066AE',
  },
  periodeOptionText: {
    fontSize: 12,
    color: '#666666',
  },
  periodeOptionTextSelected: {
    color: '#FFFFFF',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  descriptionColumn: {
    flex:21,
    paddingRight: 16,
  },
  amountColumn: {
    flex: 3,
    alignItems: 'flex-end',
  },
  transactionDescription: {
    fontSize: 10,
    color: '#333333',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    
  },
  creditAmount: {
    color: '#DC3545',
  },
  debitAmount: {
    color: '#28A745',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  accountOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  accountName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666666',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  dateColumn: {
    flex: 2,
    paddingRight: 8,
  },
  descColumn: {
    flex: 4,
    paddingHorizontal: 8,
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  evenRow: {
    backgroundColor: '#FFFFFF',
  },
  oddRow: {
    backgroundColor: '#FAFAFA',
  },
  dateText: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#666666',
  },
  descriptionText: {
    fontSize: 12,
    color: '#333333',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },

  
});
