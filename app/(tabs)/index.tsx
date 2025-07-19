import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  Platform,
  RefreshControl,
  Modal,
  Pressable,
  useWindowDimensions,
  Alert
} from "react-native";
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
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import Skeleton from '../../components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuItem {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface CustomTooltipProps {
  isVisible: boolean;
  onClose: () => void;
  text: string;
  position: {
    x: number;
    y: number;
  };
}

interface ValidationErrors {
  username?: string;
  password?: string;
}

interface BannerData {
  id: number;
  title: string;
  url: string;
  type: string;
  note: string;
  image: string;
  created_at: string;
  updated_at: string;
}

interface BannerResponse {
  status: string;
  data: BannerData[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ isVisible, onClose, text, position }) => {
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  if (!isVisible) return null;

  // Hitung posisi tooltip yang optimal
  const calculatePosition = () => {
    const margin = 10; // Margin dari tepi layar
    let left = position.x;
    let top = position.y;

    // Cek apakah tooltip akan terpotong di sebelah kanan
    if (left + tooltipWidth + margin > screenWidth) {
      left = screenWidth - tooltipWidth - margin;
    }

    // Pastikan tooltip tidak terpotong di sebelah kiri
    if (left < margin) {
      left = margin;
    }

    // Jika tooltip terlalu dekat dengan bagian atas layar
    if (top < margin) {
      top = margin;
    }

    return { left, top };
  };

  const tooltipPosition = calculatePosition();

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <Pressable style={styles.tooltipOverlay} onPress={onClose}>
        <View
          style={[styles.tooltipContainer, tooltipPosition]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setTooltipWidth(width);
            setTooltipHeight(height);
          }}
        >
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      </Pressable>
    </Modal>
  );
};

const menuItems: MenuItem[] = [
  { id: 1, icon: 'document-text-outline', label: 'Mutasi', route: '/(tabs)/mutasi' },
  { id: 2, icon: 'mail-outline', label: 'Aktivitas', route: '/(tabs)/aktivitas' },
  { id: 3, icon: 'person-outline', label: 'Akun', route: '/(tabs)/akun' },
];

export default function HomeScreen() {
  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);

  const router = useRouter();
  const formHeight = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const loginContainerOpacity = useSharedValue(1);
  const { width: windowWidth } = useWindowDimensions();

  const showTooltip = (text: string, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setTooltipText(text);
    setTooltipPosition({ x: pageX, y: pageY - 50 }); // Offset to show above the touch point
    setTooltipVisible(true);
  };

  useEffect(() => {
    checkLoginStatus();
    fetchBanner();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setShowLogin(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchBanner = async () => {
    try {
      setBannerLoading(true);
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}${API_ENDPOINTS.BANNER_MOBILE}`;
      console.log('Fetching banner from URL:', url);
      
      const response = await fetch(url);
      const data: BannerResponse = await response.json();
      console.log('Banner API Response:', {
        status: data.status,
        dataLength: data.data?.length || 0,
        firstBanner: data.data?.[0],
        allData: data
      });
      
      if (data.status === 'success' && data.data.length > 0) {
        const shuffledBanners = shuffleArray(data.data);
        console.log('Shuffled Banners:', shuffledBanners);
        setBanners(shuffledBanners);
      } else {
        console.log('No banners found or invalid response');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    } finally {
      setBannerLoading(false);
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
        await SecureStore.setItemAsync('secure_token', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        Toast.show({
          type: 'success',
          text1: 'Login Berhasil',
          text2: `Selamat datang, ${data.data.user.name}`,
          visibilityTime: 3000,
          position: 'top'
        });
        setIsLoggedIn(true);
        setShowLogin(false);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1000); // delay 1 detik
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
    } catch (error: any) {
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

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      console.log('Attempting logout with token:', token);
      
      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Response data:', data);

      await SecureStore.deleteItemAsync('secure_token');
      setIsLoggedIn(false);
      Toast.show({
        type: 'success',
        text1: 'Berhasil',
        text2: 'Anda telah berhasil logout',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: 'Terjadi kesalahan saat logout',
      });
    }
  };

  const handleLogoutConfirmation = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Ya, Keluar',
          onPress: handleLogout,
          style: 'destructive'
        }
      ]
    );
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validasi Gagal',
        text2: 'Silakan masukkan email Anda',
        position: 'bottom',
      });
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = `${getApiBaseUrl()}${API_ENDPOINTS.FORGOT_PASSWORD}`;
      console.log('[FORGOT PASSWORD] Request URL:', API_URL);
      console.log('[FORGOT PASSWORD] Request Body:', { email: forgotPasswordEmail });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: forgotPasswordEmail
        })
      });

      const data = await response.json();
      console.log('[FORGOT PASSWORD] Response Status:', response.status);
      console.log('[FORGOT PASSWORD] Response Data:', data);
      
      if (response.ok) {
        console.log('[FORGOT PASSWORD] Success: Link reset password akan dikirim');
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Link reset password akan dikirim ke email Anda',
          position: 'bottom'
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        console.log('[FORGOT PASSWORD] Error:', data.message || 'Terjadi kesalahan');
        Toast.show({
          type: 'error',
          text1: 'Gagal',
          text2: data.message || 'Terjadi kesalahan',
          position: 'bottom'
        });
      }
    } catch (error: any) {
      console.error('[FORGOT PASSWORD] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Terjadi kesalahan pada server',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowForgotPassword = () => {
    setShowLogin(false);
    setShowForgotPassword(true);
    formHeight.value = withSpring(300);
    formOpacity.value = withSpring(1);
    loginContainerOpacity.value = withSpring(0);
  };

  const handleForgotPasswordCancel = () => {
    setShowForgotPassword(false);
    formHeight.value = withSpring(0);
    formOpacity.value = withSpring(0);
    loginContainerOpacity.value = withSpring(1);
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

          {/* Banner Section */}
          <View style={styles.bannerContainer}>
            {bannerLoading ? (
              <Skeleton width="100%" height={200} borderRadius={8} />
            ) : (
              banners.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.bannerContainer}
                >
                  {banners.map((banner) => (
                    <Image
                      key={banner.id}
                      source={{ uri: banner.url }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              ) : null
            )}
          </View>
        </View>

        {/* Fast Menu Section */}
        <View style={styles.fastMenuSection}>
          <View style={styles.fastMenuHeader}>
            <Text style={styles.fastMenuTitle}>Fasilitas</Text>
            <TouchableOpacity
              onPress={(e) => showTooltip('Fasilitas layanan keuangan yang tersedia di Kospin', e)}
            >
              <Ionicons name="information-circle-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuGrid}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={(e) => showTooltip('Simpan dana Anda dengan aman dan dapatkan bagi hasil yang menarik', e)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="wallet-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Tabungan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={(e) => showTooltip('Pinjaman dengan bunga rendah dan proses cepat', e)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="cash-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Pinjaman</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={(e) => showTooltip('Investasikan dana Anda dengan imbal hasil yang kompetitif', e)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="trending-up-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Deposito</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={(e) => showTooltip('Gadai barang berharga Anda dengan nilai taksir tinggi', e)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="diamond-outline" size={24} color="#0066AE" />
              </View>
              <Text style={styles.menuLabel}>Gadai</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomTooltip
          isVisible={tooltipVisible}
          onClose={() => setTooltipVisible(false)}
          text={tooltipText}
          position={tooltipPosition}
        />
      </ScrollView>
      
      {/* Login/Logout Button */}
      {isLoggedIn ? (
        <TouchableOpacity
          style={[styles.loginButton, styles.logoutButton]}
          onPress={handleLogoutConfirmation}
        >
          <View style={styles.logoutButtonContent}>
            <Ionicons name="log-out-outline" size={20} color="#DC3545" />
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </View>
        </TouchableOpacity>
      ) : showLoginButton && (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLoginPress}
        >
          <LinearGradient
            colors={['#0066AE', '#0095FF']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.loginButtonText}>
              Login
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Form Lupa Password */}
      {showForgotPassword && (
        <Animated.View
          style={[
            styles.formContainer,
            animatedStyle,
            { height: formHeight }
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Lupa Password</Text>
            <TouchableOpacity
              onPress={handleForgotPasswordCancel}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            {/* <Text style={styles.label}>Email</Text> */}
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Memproses...</Text>
            ) : (
              <Text style={styles.buttonText}>Kirim Link Reset Password</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Form Login */}
      {showLogin && (
        <Animated.View
          style={[
            styles.formContainer,
            animatedStyle,
            { height: formHeight }
          ]}
        >
          {/* Overlay tanpa transparansi */}
          <View style={styles.overlayWrapperNoTransparent}>
            <TouchableOpacity 
              style={styles.overlayNoTransparent} 
              onPress={handleLoginCancel}
              activeOpacity={1}
            >
              {/* Login Form */}
              <View style={styles.loginFormWrapper}>
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
                  <Text style={styles.forgotPasswordText} onPress={handleShowForgotPassword}>Lupa Password?</Text>
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
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  bannerContainer: {
    width: '110%',
    height: 'auto',
    marginHorizontal: -16,
    marginBottom: -17,
  },
  bannerImage: {
    width: '100%',
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
  loginContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loginButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    width: '90%', 
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC3545',
    overflow: 'hidden',
    padding: 0,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    color: '#DC3545',
    fontSize: 14,
    fontWeight: '600',
  },
  overlayWrapper: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayNoTransparent: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffff', // solid putih
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginFormWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 28,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'stretch',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  loginForm: {
    backgroundColor: '#f5f5f5',
    padding: 24,
    marginTop: 0,
    borderRadius: 16,
    // elevation: ,
    width: '100%',
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
  tooltipText: {
    color: '#fff',
    fontSize: 14,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    maxWidth: 200,
    elevation: 5,
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#0066AE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
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
    width: '100%', 
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlayWrapperNoTransparent: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
