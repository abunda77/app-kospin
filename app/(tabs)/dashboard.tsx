import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, RefreshControl, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import type { Route } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '../../components/Skeleton';
import React from 'react';

interface MenuItem {
  id: number;
  title: string;
  icon: any;
  route: 
    | '/(menu)/setor'
    | '/(menu)/tarik'
    | '/(menu)/angsuran'
    | '/(menu)/belanja'
    | '/(menu)/tabungan'
    | '/(menu)/deposito'
    | '/(menu)/kredit'
    | '/(menu)/gadai'
    | '/(menu)/e-wallet'
    | '/(menu)/qris'
    | '/(menu)/top-up'
    | '/(menu)/tagihan';
  color: string;
}

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
      saldo_berjalan: string;
    };
  };
}

// Fix route
const menuItems: MenuItem[] = [
  { id: 1, title: 'Setor', icon: require('../../assets/primary-menu/deposit.png'), route: '/(menu)/setor', color: '#0066AE' },
  { id: 2, title: 'Tarik Tunai', icon: require('../../assets/primary-menu/cash-withdrawal.png'), route: '/(menu)/tarik', color: '#0066AE' },
  { id: 3, title: 'Angsuran', icon: require('../../assets/primary-menu/installment.png'), route: '/(menu)/angsuran', color: '#0066AE' },
  { id: 4, title: 'Belanja', icon: require('../../assets/primary-menu/purchase.png'), route: '/(menu)/belanja', color: '#0066AE' },
];

const secondaryMenuItems: MenuItem[] = [
  { id: 5, title: 'Tabungan', icon: require('../../assets/secondary-menu/saving.png'), route: '/(menu)/tabungan', color: '#0066AE' },
  { id: 6, title: 'Deposito', icon: require('../../assets/secondary-menu/deposito.png'), route: '/(menu)/deposito', color: '#0066AE' },
  { id: 7, title: 'Kredit', icon: require('../../assets/secondary-menu/loan.png'), route: '/(menu)/kredit', color: '#0066AE' },
  { id: 8, title: 'Gadai', icon: require('../../assets/secondary-menu/pawn.png'), route: '/(menu)/gadai', color: '#0066AE' },
  { id: 9, title: 'E-Wallet', icon: require('../../assets/secondary-menu/ewallet.png'), route: '/(menu)/e-wallet', color: '#0066AE' },
  { id: 10, title: 'QRIS', icon: require('../../assets/secondary-menu/qris.png'), route: '/(menu)/qris', color: '#0066AE' },
  { id: 11, title: 'Top Up', icon: require('../../assets/secondary-menu/topup.png'), route: '/(menu)/top-up', color: '#0066AE' },
  { id: 12, title: 'Tagihan', icon: require('../../assets/secondary-menu/bill.png'), route: '/(menu)/tagihan', color: '#0066AE' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>(''); // Changed from string to string
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    checkAuthAndFetchData();
    fetchBalance();
    // Simulasi loading
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndFetchData();
    }, [])
  );

  const checkAuthAndFetchData = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) {
        router.replace('/(tabs)');
        return;
      }

      // Ambil data user dari SecureStore
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        const fullName = `${parsedData.first_name} ${parsedData.last_name}`.trim();
        setUserName(fullName);
      } else {
        // Jika tidak ada data user, fetch dari API
        const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.USER_PROFILE}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const fullName = `${data.data.first_name} ${data.data.last_name}`.trim();
          setUserName(fullName);
          // Simpan data untuk penggunaan berikutnya
          await SecureStore.setItemAsync('userData', JSON.stringify(data.data));
        }
      }
    } catch (error) {
      console.log('Error checking auth:', error);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutConfirmation = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    setIsLogoutModalVisible(false);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      console.log('Attempting logout with token:', token);
      
      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Logout response:', data);
      
      if (data.status === 'success' || response.ok) {
        await SecureStore.deleteItemAsync('secure_token');
        await SecureStore.deleteItemAsync('userData');
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Logout berhasil'
        });
        router.replace('/(tabs)');
      } else {
        throw new Error(data.message || 'Gagal melakukan logout');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Gagal melakukan logout'
      });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Di sini Anda bisa menambahkan fungsi untuk memuat ulang data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleMenuPress = (route: 
    | '/(menu)/setor'
    | '/(menu)/tarik'
    | '/(menu)/angsuran'
    | '/(menu)/belanja'
    | '/(menu)/tabungan'
    | '/(menu)/deposito'
    | '/(menu)/kredit'
    | '/(menu)/gadai'
    | '/(menu)/e-wallet'
    | '/(menu)/qris'
    | '/(menu)/top-up'
    | '/(menu)/tagihan') => {
    router.push(route);
  };

  const visibleMenuItems = showAllMenu 
    ? secondaryMenuItems 
    : secondaryMenuItems.slice(0, 8);

  const fetchBalance = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      // First get the profile ID
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

      // Then fetch the tabungan data
      const tabunganResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.TABUNGAN_BY_PROFILE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id_profile: profileId })
      });

      if (!tabunganResponse.ok) throw new Error('Failed to fetch balance');
      const tabunganData: TabunganResponse = await tabunganResponse.json();

      if (tabunganData.data.tabungan.length > 0) {
        // Get saldo berjalan for the first tabungan
        const saldoBerjalanResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.TABUNGAN_SALDO_BERJALAN}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ no_tabungan: tabunganData.data.tabungan[0].no_tabungan })
        });

        if (!saldoBerjalanResponse.ok) throw new Error('Failed to fetch saldo berjalan');
        const saldoBerjalanData: SaldoBerjalanResponse = await saldoBerjalanResponse.json();
        setBalance(saldoBerjalanData.data.info_rekening.saldo_berjalan.toString());
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal mengambil data saldo'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066AE']}
            tintColor="#0066AE"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Hai,</Text>
              {loading ? (
                <Skeleton width={120} height={24} />
              ) : (
                <Text style={styles.userName}>
                  {userName || 'Pengguna'}
                </Text>
              )}
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="headset-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Combined Card */}
          <View style={styles.combinedCard}>
            <View style={styles.balanceSection}>
              <View style={styles.balanceContainer}>
                <View>
                  <Text style={styles.balanceLabel}>Saldo Rekening Utama</Text>
                  <View style={styles.balanceWrapper}>
                    {loading ? (
                      <Skeleton width={150} height={32} />
                    ) : (
                      <Text style={styles.balanceAmount}>
                        {showBalance 
                          ? new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(Number(balance))
                          : '••••••••••'}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowBalance(!showBalance)}
                      style={styles.eyeIconContainer}
                    >
                      <Ionicons
                        name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#BBBBBB"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.menuGrid}>
              {loading ? (
                // Skeleton untuk menu items
                Array(4).fill(0).map((_, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={{ marginTop: 8 }}>
                      <Skeleton width={60} height={16} />
                    </View>
                  </View>
                ))
              ) : (
                menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item.route)}
                  >
                    <View style={styles.menuIconContainer}>
                      <Image 
                        source={item.icon}
                        style={styles.menuIcon}
                      />
                    </View>
                    <Text style={styles.menuText}>{item.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* Secondary Menu */}
          <View style={styles.secondaryMenuContainer}>
            <View style={styles.secondaryMenuGrid}>
              {loading ? (
                // Skeleton untuk secondary menu items
                Array(8).fill(0).map((_, index) => (
                  <View key={index} style={styles.secondaryMenuItem}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={{ marginTop: 8 }}>
                      <Skeleton width={50} height={14} />
                    </View>
                  </View>
                ))
              ) : (
                visibleMenuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.secondaryMenuItem}
                    onPress={() => handleMenuPress(item.route)}
                  >
                    <View style={styles.secondaryMenuIconContainer}>
                      <Image 
                        source={item.icon}
                        style={styles.secondaryMenuIcon}
                      />
                    </View>
                    <Text style={styles.secondaryMenuText}>{item.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
            {secondaryMenuItems.length > 8 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllMenu(!showAllMenu)}
              >
                <Text style={styles.showMoreText}>
                  {showAllMenu ? 'Tutup' : 'Lainnya'}
                </Text>
                <Image 
                  source={require('../../assets/icons/chevron-down.png')} 
                  style={[
                    styles.chevronIcon,
                    showAllMenu && styles.chevronIconRotated
                  ]} 
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Financial Report Section */}
          <View style={styles.financialReportCard}>
            <View style={styles.financialReportHeader}>
              {loading ? (
                <>
                  <Skeleton width={120} height={20} />
                  <Skeleton width={80} height={16} />
                </>
              ) : (
                <>
                  <Text style={styles.financialReportTitle}>Catatan Keuangan</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewMoreText}>Tampilkan</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            {loading ? (
              <View style={{ marginTop: 8 }}>
                <Skeleton width={140} height={16} />
              </View>
            ) : (
              <Text style={styles.financialReportDate}>1 Feb 2025 - 28 Feb 2025</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi Logout</Text>
            <Text style={styles.modalText}>Apakah Anda yakin ingin logout?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={() => setIsLogoutModalVisible(false)}
                style={[styles.modalButton, styles.modalButtonCancel]}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.modalButton, styles.modalButtonConfirm]}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0066AE',
    paddingTop: 50,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  mainContent: {
    marginTop: -50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 25,
    backgroundColor: '#005488',
    padding: 10,
    borderRadius: 8,
  },
  iconButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  combinedCard: {
    backgroundColor: '#005488',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: -15, 
    zIndex: 2,
  },
  balanceSection: {
    padding: 16,
    backgroundColor: '#00549C',
  },
  menuSection: {
    backgroundColor: '#003C6C',
    padding: 16,
    paddingTop: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  seeAllAccounts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  seeAllAccountsText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  chevronForwardIcon: {
    width: 20,
    height: 20,
    tintColor: '#BBBBBB',
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuItem: {
    width: '23%',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIcon: {
    width: 36,
    height: 36,
    // tintColor: '#FFFFFF',
  },
  menuText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  secondaryMenuContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  secondaryMenuItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryMenuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryMenuIcon: {
    width: 36,
    height: 36,
  },
  secondaryMenuText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  showMoreButton: {
    paddingVertical: 10,    
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    alignSelf: 'center',
    gap: 4,
  },
  showMoreText: {
    fontSize: 14,
    color: '#0066AE',
    fontWeight: '500',
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: '#0066AE',
  },
  chevronIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  financialReportCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
  },
  financialReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialReportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#0066AE',
  },
  financialReportDate: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#ccc',
  },
  modalButtonConfirm: {
    backgroundColor: '#0066AE',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeIconContainer: {
    padding: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#BBBBBB',
  },
});
