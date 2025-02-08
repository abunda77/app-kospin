import React, { useState, useEffect, useCallback } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, RefreshControl } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';

interface MenuItem {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: "/(tabs)/qris" | "/(tabs)/mutasi" | "/(tabs)/aktivitas" | "/(tabs)/akun";
}

const menuItems: MenuItem[] = [
  { id: 1, icon: 'qr-code-outline', label: 'QRIS', route: '/(tabs)/qris' },
  { id: 2, icon: 'document-text-outline', label: 'Mutasi', route: '/(tabs)/mutasi' },
  { id: 3, icon: 'mail-outline', label: 'Aktivitas', route: '/(tabs)/aktivitas' },
  { id: 4, icon: 'person-outline', label: 'Akun', route: '/(tabs)/akun' },
];

export default function HomeScreen() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: ''
  });
  const router = useRouter();
  const formHeight = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const loginContainerOpacity = useSharedValue(1);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsLoggedIn(true);
        router.replace('/dashboard');
      } else {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setShowLogin(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUsername('');
      setPassword('');
      setShowLogin(false);
    }
  };

  const handleLoginPress = () => {
    setShowLogin(true);
    formHeight.value = withSpring(400);
    formOpacity.value = withSpring(1);
    loginContainerOpacity.value = withSpring(0);
  };

  const handleLoginCancel = () => {
    setShowLogin(false);
    formHeight.value = withSpring(0);
    formOpacity.value = withSpring(0);
    loginContainerOpacity.value = withSpring(1);
  };

  const validateForm = () => {
    const errors = {
      username: '',
      password: ''
    };
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Username harus diisi';
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = 'Password harus diisi';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validasi Gagal',
        text2: 'Silakan isi semua field yang diperlukan',
        position: 'bottom',
      });
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = `${getApiBaseUrl()}${API_ENDPOINTS.LOGIN}`;
      console.log('Attempting login to:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', data);
      
      if (response.ok) {
        if (!data.data?.token) {
          throw new Error('Token tidak ditemukan dalam response');
        }
        
        const { token, user } = data.data;
        await AsyncStorage.setItem('userToken', token);
        // Simpan data user juga untuk digunakan nanti
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        Toast.show({
          type: 'success',
          text1: 'Login Berhasil',
          text2: `Selamat datang kembali, ${user.name}!`
        });
        setIsLoggedIn(true);
        router.replace('/dashboard');
      } else {
        const errorMessage = Platform.OS !== 'web' 
          ? `Error: ${response.status}\nURL: ${API_URL}\nMessage: ${data.message || 'Unknown error'}`
          : data.message || 'Silakan cek kembali username dan password Anda';

        Toast.show({
          type: 'error',
          text1: 'Login Gagal',
          text2: errorMessage,
          visibilityTime: 4000,
          position: 'bottom'
        });
      }
    } catch (error) {
      const errorMessage = Platform.OS !== 'web'
        ? `Network Error\nURL: ${getApiBaseUrl()}${API_ENDPOINTS.LOGIN}\nDetails: ${error.message}`
        : 'Terjadi kesalahan pada server';

      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        visibilityTime: 4000,
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: formHeight.value,
      opacity: formOpacity.value,
      overflow: 'hidden',
    };
  });

  const loginContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: loginContainerOpacity.value,
    };
  });

  const showLoginButton = !isLoggedIn;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkLoginStatus().finally(() => {
      setRefreshing(false);
      setShowLogin(false);
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.languageSelector}>
              <Image 
                source={require("@/assets/images/id-flag.png")} 
                style={styles.flagIcon}
              />
              <Text style={styles.languageText}>ID</Text>
            </View>
            
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Lingkungan Aman</Text>
            </View>
          </View>

          {/* Promo Banner */}
          <View style={styles.promoBanner}>
           <Image 
              source={require("@/assets/images/banner_promo_mobile.png")} 
              style={styles.promoBannerImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Fast Menu Section */}
        <View style={styles.fastMenuSection}>
          <View style={styles.fastMenuHeader}>
            <Text style={styles.fastMenuTitle}>Fasilitas  </Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
          </View>
          
          <View style={styles.menuGrid}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="wallet-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Tabungan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="trending-up-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Deposito</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="cash-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Kredit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="diamond-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Gadai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Login Button Container */}
      {showLoginButton && (
        <Animated.View 
          style={[
            styles.loginButtonContainer,
            { opacity: loginContainerOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Login Form */}
      {showLogin && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={handleLoginCancel}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.loginForm} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleLoginCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.loginHeader}>Silakan Login</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                placeholder="Username"
                style={[styles.input, validationErrors.username ? styles.inputError : null]}
                placeholderTextColor="#999"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setValidationErrors(prev => ({ ...prev, username: '' }));
                }}
              />
            </View>
            {validationErrors.username ? (
              <Text style={styles.errorText}>{validationErrors.username}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={[styles.input, validationErrors.password ? styles.inputError : null]}
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setValidationErrors(prev => ({ ...prev, password: '' }));
                }}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {validationErrors.password ? (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            ) : null}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      <Toast />
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
    backgroundColor: '#0066Ae',
    //backgroundColor: '#ff9900',
    padding: 16,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 20,
  },
  flagIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  languageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  logoHeader: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 20,
  },
  securityText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  promoBanner: {
    width: '100%',
    height: 'auto',
    marginHorizontal: -16,
    marginBottom: -16,
  },
  promoBannerImage: {
    width: '110%',
    height: 350,
  },
  fastMenuSection: {
    padding: 16,
  },
  fastMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  fastMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  menuItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  loginButtonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 10,  
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderTopColor: '#eee',
  },
  loginButton: {
    backgroundColor: '#0066AE',
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginForm: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    elevation: 6,
    width: '85%',
    maxWidth: 400,
  },
  loginHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0066AE',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#0066AE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
});
