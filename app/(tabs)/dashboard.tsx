import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import { useState, useEffect, useCallback } from 'react';

interface MenuItem {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const menuItems: MenuItem[] = [
  { id: 1, title: 'Transfer', icon: 'arrow-forward-outline', route: '/(menu)/transfer', color: '#4CAF50' },
  { id: 2, title: 'Tarik Tunai', icon: 'cash-outline', route: '/(menu)/tarik-tunai', color: '#2196F3' },
  { id: 3, title: 'Setor Tunai', icon: 'wallet-outline', route: '/(menu)/setor-tunai', color: '#9C27B0' },
  { id: 4, title: 'Pembayaran', icon: 'card-outline', route: '/(menu)/pembayaran', color: '#FF9800' },
  { id: 5, title: 'Pinjaman', icon: 'briefcase-outline', route: '/(menu)/pinjaman', color: '#F44336' },
  { id: 6, title: 'Simpanan', icon: 'save-outline', route: '/(menu)/simpanan', color: '#009688' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
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

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: item.color }]}
      onPress={() => handleMenuPress(item.route)}
    >
      <Ionicons name={item.icon} size={32} color="#fff" />
      <Text style={styles.menuText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {userName ? `Halo, ${userName}` : 'Selamat Datang'}
          </Text>
          <Text style={styles.subText}>di Koperasi Sinara Artha</Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogoutConfirmation}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.card}>
            <Ionicons name="wallet-outline" size={24} color="#0066AE" />
            <Text style={styles.cardTitle}>Saldo Anda</Text>
            <Text style={styles.balance}>Rp 1.000.000</Text>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: item.color }]}
                onPress={() => handleMenuPress(item.route)}
              >
                <Ionicons name={item.icon} size={32} color="#fff" />
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Modal
          transparent={true}
          animationType="slide"
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
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const menuItemWidth = (width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#0066AE',
    marginTop: 30,
    marginBottom: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    overflow: 'hidden',
  },
  subText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066AE',
    marginTop: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  menuItem: {
    width: menuItemWidth,
    height: 100,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.75)',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
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
  }
});
