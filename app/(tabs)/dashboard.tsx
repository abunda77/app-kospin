import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, RefreshControl, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '../../components/Skeleton';

interface MenuItem {
  id: number;
  title: string;
  icon: any;
  route: 
    | "/(menu)/transfer" 
    | "/(menu)/tarik-tunai" 
    | "/(menu)/setor-tunai" 
    | "/(menu)/pembayaran" 
    | "/(menu)/pinjaman" 
    | "/(menu)/simpanan";
  color: string;
}

const menuItems: MenuItem[] = [
  { id: 1, title: 'Setor', icon: require('../../assets/primary-menu/deposit.png'), route: '/(menu)/transfer', color: '#0066AE' },
  { id: 2, title: 'Tarik', icon: require('../../assets/primary-menu/cash-withdrawal.png'), route: '/(menu)/pembayaran', color: '#0066AE' },
  { id: 3, title: 'Angsuran', icon: require('../../assets/primary-menu/installment.png'), route: '/(menu)/setor-tunai', color: '#0066AE' },
  { id: 4, title: 'Pembelian', icon: require('../../assets/primary-menu/purchase.png'), route: '/(menu)/pembayaran', color: '#0066AE' },
];

const secondaryMenuItems: MenuItem[] = [
  { id: 5, title: 'Tabungan', icon: require('../../assets/secondary-menu/saving.png'), route: '/(menu)/setor-tunai', color: '#0066AE' },
  { id: 6, title: 'Deposito', icon: require('../../assets/secondary-menu/deposito.png'), route: '/(menu)/pembayaran', color: '#0066AE' },
  { id: 7, title: 'Kredit', icon: require('../../assets/secondary-menu/loan.png'), route: '/(menu)/tarik-tunai', color: '#0066AE' },
  { id: 8, title: 'Gadai', icon: require('../../assets/secondary-menu/pawn.png'), route: '/(menu)/simpanan', color: '#0066AE' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(tabs)');
        return;
      }
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { name } = JSON.parse(userData);
        setUserName(name);
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
      const token = await AsyncStorage.getItem('userToken');
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
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
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
    checkAuthAndFetchData().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const handleMenuPress = (route: MenuItem['route']) => {
    router.push({
      pathname: route,
      params: { from: 'index' }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Hai,</Text>
              <Text style={styles.userName}>{userName || 'Pengguna'}</Text>
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

        {/* Combined Card */}
        <View style={styles.combinedCard}>
          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <View>
              <Text style={styles.balanceLabel}>Saldo Rekening Utama</Text>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceAmount}>
                  {showBalance ? 'Rp1.234.567,00' : '••••••••••'}
                </Text>
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
            <TouchableOpacity style={styles.seeAllAccounts}>
              <Text style={styles.seeAllAccountsText}>Semua Rekeningmu</Text>
              <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
            </TouchableOpacity>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => router.push(item.route)}
                >
                  <View style={styles.menuIconContainer}>
                    <Image 
                      source={item.icon}
                      style={styles.menuIcon}
                    />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Cari Fitur</Text>
        </View>

        {/* Secondary Menu */}
        <View style={styles.secondaryMenuGrid}>
          {secondaryMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.secondaryMenuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.secondaryMenuIconContainer}>
                <Image 
                  source={item.icon}
                  style={styles.secondaryMenuIcon}
                />
              </View>
              <Text style={styles.secondaryMenuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Financial Report Section */}
        <View style={styles.financialReportCard}>
          <View style={styles.financialReportHeader}>
            <Text style={styles.financialReportTitle}>Catatan Keuangan</Text>
            <TouchableOpacity>
              <Text style={styles.viewMoreText}>Tampilkan</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.financialReportDate}>1 Feb 2025 - 28 Feb 2025</Text>
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
  header: {
    backgroundColor: '#0066AE',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 16,
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
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  combinedCard: {
    backgroundColor: '#005488',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: -20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  secondaryMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  secondaryMenuItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 24,
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
  eyeIconContainer: {
    padding: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#BBBBBB',
  },
});
