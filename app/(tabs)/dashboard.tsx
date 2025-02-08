import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import { useState, useEffect, useCallback } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { name } = JSON.parse(userData);
        setUserName(name);
      }
    };

    fetchUserData();
  }, []);

  const handleLogoutConfirmation = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    setIsLogoutModalVisible(false);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('(NOBRIDGE) LOG Response data:', JSON.stringify(data));
      
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Gagal melakukan logout'
      });
      console.error(error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { name } = JSON.parse(userData);
        setUserName(name);
      }
    };
    fetchUserData().finally(() => {
      setRefreshing(false);
    });
  }, []);

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
        </View>
        <Toast />
        <Modal
          animationType="slide"
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
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setIsLogoutModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleLogout}
                >
                  <Text style={styles.modalButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    // padding: 10,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.75)', // Red with 80% opacity
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
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
