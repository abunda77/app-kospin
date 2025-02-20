import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView,
  RefreshControl,
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
import { TouchableOpacity } from 'react-native';

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
  const [mainAccount, setMainAccount] = useState<TabunganResponse['data']['tabungan'][0] | null>(null);
  const [isAccountSelectorVisible, setIsAccountSelectorVisible] = useState(false);

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
      }

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
          ) : !mainAccount ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Tidak ada rekening yang tersedia
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
                  <Text style={[styles.value, styles.rekeningBadge]}>{mainAccount.no_tabungan}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Saldo Awal</Text>
                  <Text style={[styles.value, styles.saldoAwalValue]}>
                    {formatCurrency(mainAccount.saldo)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Saldo Akhir</Text>
                  <Text style={[styles.value, styles.saldoAkhirValue]}>
                    {saldoBerjalanData[mainAccount.no_tabungan] 
                      ? formatCurrency(saldoBerjalanData[mainAccount.no_tabungan].toString())
                      : '-'}
                  </Text>
                </View>
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
                      onPress={() => {
                        setMainAccount(account);
                        setIsAccountSelectorVisible(false);
                      }}
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
    overflow: 'hidden',
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
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
    fontWeight: '500',
  },
  saldoAwalValue: {
    fontSize: 16,
    color: '#666666',  // Gray color for initial balance
    fontWeight: 'regular',
  },
  saldoAkhirValue: {
    fontSize: 20,
    color: '#28a745',  // Green color for final balance
    fontWeight: 'bold',
  },
  balanceValue: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  rekeningBadge: {
    backgroundColor: '#E7F7ED',  // Light green background
    color: '#28a745',           // Success green text color
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,           // More rounded corners
    fontWeight: '600',
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  accountList: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accountItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
  },
});
