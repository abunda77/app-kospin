import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import Skeleton from '../../components/Skeleton'; // Import Skeleton component
import LoginRequired from '../../components/LoginRequired'; // Import LoginRequired component
import Toast from 'react-native-toast-message';

interface UserProfile {
  id: number;
  id_user: number;
  first_name: string;
  last_name: string;
  address: string;
  sign_identity: string;
  no_identity: string;
  image_identity: string[];
  phone: string;
  email: string;
  whatsapp: string;
  gender: string;
  birthday: string;
  mariage: string;
  job: string;
  province_id: string;
  district_id: string;
  city_id: string;
  village_id: string;
  monthly_income: string;
  is_active: number;
  type_member: string;
  avatar: string;
}

interface Region {
  code: string;
  name: string;
  level: string;
  parent: string | null;
  children: Region[];
}

export default function AccountScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' atau 'password'
  const [village, setVillage] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fetchRegionDetails = useCallback(async (code: string): Promise<Region | null> => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return null;

      // Format the code properly without cleaning
      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.REGIONS}/${code}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        console.error('Region API Error:', {
          status: response.status,
          statusText: response.statusText,
          code: code
        });
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching region:', error);
      return null;
    }
  }, []);

  const loadRegionDetails = useCallback(async () => {
    if (!profile) return;

    try {
      // Fetch Province (level: 1)
      if (profile.province_id) {
        const provinceData = await fetchRegionDetails(profile.province_id);
        if (provinceData) {
          setProvince(provinceData.name);
        }
      }

      // Fetch District (level: 2)
      if (profile.district_id) {
        const districtData = await fetchRegionDetails(profile.district_id);
        if (districtData) {
          setDistrict(districtData.name);
        }
      }

      // Fetch City (level: 3)
      if (profile.city_id) {
        const cityData = await fetchRegionDetails(profile.city_id);
        if (cityData) {
          setCity(cityData.name);
        }
      }

      // Fetch Village (level: 4)
      if (profile.village_id) {
        const villageData = await fetchRegionDetails(profile.village_id);
        if (villageData) {
          setVillage(villageData.name);
        }
      }
    } catch (error) {
      console.error('Error loading region details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal memuat data wilayah',
        position: 'bottom'
      });
    }
  }, [profile, fetchRegionDetails]);

  const loadProfile = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.USER_PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkLoginStatus = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
    loadProfile();
  }, [checkLoginStatus, loadProfile]);

  useEffect(() => {
    if (profile) {
      loadRegionDetails();
    }
  }, [profile, loadRegionDetails]);

  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
      loadProfile();
    }, [checkLoginStatus, loadProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile().finally(() => setRefreshing(false));
  }, [loadProfile]);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !newPasswordConfirmation) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Semua kolom wajib diisi',
        position: 'bottom'
      });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password baru minimal 8 karakter',
        position: 'bottom'
      });
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Konfirmasi password baru tidak sama',
        position: 'bottom'
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sesi Anda telah berakhir, silakan login kembali',
          position: 'bottom'
        });
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.UPDATE_PASSWORD}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status) {
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: result.message || 'Password berhasil diperbarui',
          position: 'bottom'
        });
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirmation('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Gagal',
          text2: result.message || 'Gagal memperbarui password',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Terjadi kesalahan, silakan coba lagi',
        position: 'bottom'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F7900" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginRequired message="Silakan login untuk melihat profil Anda" />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header Profile */}
      <View style={styles.header}>
        <Image
          source={
            profile?.avatar
              ? { uri: `${getApiBaseUrl()}/storage/${profile.avatar}` }
              : require('../../assets/icons/default-avatar.png')
          }
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{`${profile?.first_name} ${profile?.last_name}`}</Text>
          <Text style={styles.memberType}>{profile?.type_member.toUpperCase()}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'profile' ? '#1F7900' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'profile' && styles.activeTabText
          ]}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'password' && styles.activeTab]}
          onPress={() => setActiveTab('password')}
        >
          <Ionicons 
            name="key-outline" 
            size={20} 
            color={activeTab === 'password' ? '#1F7900' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'password' && styles.activeTabText
          ]}>Ubah Password</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'profile' ? (
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={24} color="#1F7900" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NIK</Text>
              <Text style={styles.infoValue}>{profile?.no_identity}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{profile?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Lahir</Text>
              <Text style={styles.infoValue}>{formatDate(profile?.birthday || '')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pekerjaan</Text>
              <Text style={styles.infoValue}>{profile?.job}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={24} color="#1F7900" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telepon</Text>
              <Text style={styles.infoValue}>{profile?.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>WhatsApp</Text>
              <Text style={styles.infoValue}>{profile?.whatsapp}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="home-outline" size={24} color="#1F7900" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{profile?.address}</Text>
            </View>
            {village && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Desa</Text>
                <Text style={styles.infoValue}>{village}</Text>
              </View>
            )}
            {city && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kecamatan</Text>
                <Text style={styles.infoValue}>{city}</Text>
              </View>
            )}
            {district && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kabupaten</Text>
                <Text style={styles.infoValue}>{district}</Text>
              </View>
            )}
            {province && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Provinsi</Text>
                <Text style={styles.infoValue}>{province}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="wallet-outline" size={24} color="#1F7900" />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pendapatan Bulanan</Text>
              <Text style={styles.infoValue}>{formatCurrency(profile?.monthly_income || '0')}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="key-outline" size={24} color="#1F7900" />
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password Lama</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Masukkan password lama"
                  placeholderTextColor="#999"
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Ionicons
                    name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password Baru</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Masukkan password baru (min. 8 karakter)"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPasswordConfirmation}
                  onChangeText={setNewPasswordConfirmation}
                  placeholder="Ulangi password baru"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.submitButton, isUpdatingPassword && styles.submitButtonDisabled]}
              onPress={handleUpdatePassword}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Simpan Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      </ScrollView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1F7900',
    padding: 25,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  memberType: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1F7900',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#1F7900',
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    padding: 15,
  },
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1F7900',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
