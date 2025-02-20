import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

export default function TarikTunai() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabunganData, setTabunganData] = useState<TabunganResponse['data'] | null>(null);
  const [mainAccount, setMainAccount] = useState<TabunganResponse['data']['tabungan'][0] | null>(null);
  const [saldoBerjalan, setSaldoBerjalan] = useState<number | null>(null);
  const [isAccountSelectorVisible, setIsAccountSelectorVisible] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [nominal, setNominal] = useState('');
  const [isExceedLimit, setIsExceedLimit] = useState(false);
  const SALDO_MINIMAL = 50000; // Tambahkan konstanta saldo minimal
  const router = useRouter();

  const checkLoginStatus = async () => {
    setIsLoading(true);
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

      // Set main account (assuming first account is the main one)
      if (data.data.tabungan.length > 0) {
        setMainAccount(data.data.tabungan[0]);
        // Fetch saldo berjalan after setting main account
        await fetchSaldoBerjalan(token, data.data.tabungan[0].no_tabungan);
      }
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
      setSaldoBerjalan(data.data.info_rekening.saldo_berjalan);
    } catch (error) {
      console.error('Error fetching saldo berjalan:', error);
      setSaldoBerjalan(null);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleNominalChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setNominal(numericValue);
    
    // Check if exceeds maximum withdrawal
    if (saldoBerjalan !== null) {
      const withdrawalAmount = Number(numericValue);
      const maxWithdrawal = calculateMaxWithdrawal(saldoBerjalan);
      setIsExceedLimit(withdrawalAmount > maxWithdrawal);
    }
  };

  const calculateMaxWithdrawal = (currentBalance: number): number => {
    return currentBalance - SALDO_MINIMAL;
  };

  const handleWithdrawal = () => {
    if (!mainAccount || saldoBerjalan === null) return;

    const withdrawalAmount = Number(nominal);
    const currentBalance = saldoBerjalan;
    const maxWithdrawal = calculateMaxWithdrawal(currentBalance);
    const minWithdrawal = 10000; // Minimum withdrawal amount

    if (withdrawalAmount > maxWithdrawal) {
      Alert.alert(
        'Penarikan Gagal',
        `Nominal penarikan melebihi batas maksimal. Maksimal penarikan adalah ${formatCurrency(maxWithdrawal.toString())}`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (withdrawalAmount < minWithdrawal) {
      Alert.alert(
        'Penarikan Gagal',
        'Minimal penarikan adalah Rp10.000',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to withdrawal method screen with necessary params
    router.push({
      pathname: '/(menu)/tabungan/withdrawal-method',
      params: {
        noRekening: mainAccount.no_tabungan,
        produk: mainAccount.produk_tabungan.nama_produk,
        nominal: nominal
      }
    });
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
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Proses fetch data Anda
        await checkLoginStatus();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  const handleAccountChange = async (account: TabunganResponse['data']['tabungan'][0]) => {
    setMainAccount(account);
    setIsAccountSelectorVisible(false);
    
    const token = await SecureStore.getItemAsync('secure_token');
    if (token) {
      await fetchSaldoBerjalan(token, account.no_tabungan);
    }
  };

  const renderSkeletonCards = () => (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { backgroundColor: '#0066AE' }]}>
        <View style={styles.cardHeaderContent}>
          <Skeleton width={150} height={24} />
          <Skeleton width={100} height={24} />
        </View>
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
          <Skeleton width={120} height={16} />
          <Skeleton width={140} height={20} />
        </View>
        <View style={styles.withdrawalSection}>
          <Skeleton width={120} height={16} />
          <Skeleton width="100%" height={48} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width="100%" height={48} style={{ marginTop: 24 }} />
      </View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Penarikan Tunai</Text>
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
          ) : !mainAccount ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Pilih rekening untuk melakukan penarikan
              </Text>
            </View>
          ) : (
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
                  <Text style={[styles.value, styles.rekeningBadge]}>
                    {mainAccount.no_tabungan}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Saldo Tersedia</Text>
                  <Text style={styles.balanceValue}>
                    {saldoBerjalan !== null 
                      ? formatCurrency(saldoBerjalan.toString())
                      : '-'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Maksimal Penarikan</Text>
                  <Text style={styles.maxWithdrawalValue}>
                    {saldoBerjalan !== null 
                      ? formatCurrency(calculateMaxWithdrawal(saldoBerjalan).toString())
                      : '-'}
                  </Text>
                </View>

                <View style={styles.infoNote}>
                  <Text style={styles.noteText}>
                    *Saldo minimal yang harus tersisa Rp50.000
                  </Text>
                  <Text style={styles.noteText}>
                    *Minimal penarikan Rp10.000
                  </Text>
                </View>

                <View style={styles.withdrawalSection}>
                  <Text style={styles.withdrawalLabel}>Nominal Penarikan</Text>
                  <View style={[
                    styles.inputContainer,
                    isExceedLimit && styles.inputContainerError
                  ]}>
                    <Text style={styles.currencyPrefix}>Rp</Text>
                    <TextInput
                      style={styles.input}
                      value={formatNumber(nominal)}
                      onChangeText={handleNominalChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#999"
                    />
                  </View>
                  {isExceedLimit && (
                    <Text style={styles.errorText}>
                      Nominal melebihi batas maksimal penarikan
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.withdrawButton,
                    !nominal && styles.withdrawButtonDisabled
                  ]}
                  onPress={handleWithdrawal}
                  disabled={!nominal}
                >
                  <LinearGradient
                    colors={['#0066AE', '#0095FF']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.withdrawButtonText}>Tarik Tunai</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Account Selector Modal */}
      <Modal
        visible={isAccountSelectorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAccountSelectorVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAccountSelectorVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pilih Rekening</Text>
                  <TouchableOpacity 
                    onPress={() => setIsAccountSelectorVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.accountList}>
                  {tabunganData?.tabungan.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountItem,
                        mainAccount?.id === account.id && styles.accountItemSelected
                      ]}
                      onPress={() => handleAccountChange(account)}
                    >
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>
                          {account.produk_tabungan.nama_produk}
                        </Text>
                        <Text style={styles.accountNumber}>
                          {account.no_tabungan}
                        </Text>
                      </View>
                      {mainAccount?.id === account.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#0066AE" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
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
    paddingTop: 25,
    paddingBottom: 25,
  },
  content: {
    padding: 30,
    marginTop: -60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  changeAccountText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    marginRight: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  cardBody: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  rekeningBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066AE',
  },
  maxWithdrawalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  infoNote: {
    marginTop: -8,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  withdrawalSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  withdrawalLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  inputContainerError: {
    borderColor: '#DC3545',
    backgroundColor: '#FFF8F8',
  },
  currencyPrefix: {
    fontSize: 16,
    color: '#666666',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  withdrawButton: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalCloseButton: {
    padding: 4,
  },
  accountList: {
    padding: 12,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
  },
  accountItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666666',
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
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    zIndex: 1,
  },
});
