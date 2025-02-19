import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import Toast from 'react-native-toast-message';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FONT_SCALE = SCREEN_WIDTH / 400; // Base scale factor

interface DepositoResponse {
  status: boolean;
  message: string;
  data: {
    info_profile: {
      id_profile: string;
      nama_lengkap: string;
      no_identity: string;
      phone: string;
    };
    deposito: Array<{
      id: number;
      nomor_rekening: string;
      nominal_penempatan: string;
      jangka_waktu: number;
      tanggal_pembukaan: string;
      tanggal_jatuh_tempo: string;
      rate_bunga: string;
      nominal_bunga: string;
      status: string;
      perpanjangan_otomatis: boolean;
    }>;
  };
}

export default function Deposito() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositoData, setDepositoData] = useState<DepositoResponse['data'] | null>(null);
  const scrollY = new Animated.Value(0);
  const insets = useSafeAreaInsets();

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
      if (token) {
        try {
          await fetchDepositoData(token);
        } catch (fetchError) {
          console.error('Error in fetchDepositoData:', fetchError);
          // Optionally show an error message to the user
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load deposito data. Please try again later.',
            position: 'bottom'
          });
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepositoData = async (token: string) => {
    try {
      // First API call - Profile
      const profileResponse = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.PROFILES}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        const profileError = await profileResponse.text();
        console.error('Profile API Error:', {
          status: profileResponse.status,
          statusText: profileResponse.statusText,
          error: profileError
        });
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      const profileId = profileData.data.id_user;

      // Second API call - Deposito
      const depositoResponse = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.DEPOSITO_BY_PROFILE}?id_profile=${profileId}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!depositoResponse.ok) throw new Error('Failed to fetch deposito data');
      const data: DepositoResponse = await depositoResponse.json();
      setDepositoData(data.data);
    } catch (error) {
      console.error('Error fetching deposito data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (token) {
        await fetchDepositoData(token);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: 16,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066AE']}
            tintColor="#0066AE"
            progressViewOffset={16}
          />
        }
      >
        <Animated.View
          style={[
            styles.headerContainer,
            {
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [-50, 0, 50],
                  outputRange: [0, 0, 0],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.headerTitle}>Informasi Deposito</Text>
            {isLoading ? (
              <Skeleton width={200} height={20} />
            ) : (
              <Text style={styles.headerSubtitle}>
                {depositoData?.info_profile.nama_lengkap}
              </Text>
            )}
            {isLoading ? (
              renderSkeletonCards()
            ) : (
              depositoData?.deposito.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.productName}>Deposito {item.jangka_waktu} Bulan</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Nomor Rekening</Text>
                      <Text style={styles.value}>{item.nomor_rekening}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Nominal</Text>
                      <Text style={[styles.balanceValue, styles.nominalValue]}>
                        {formatCurrency(item.nominal_penempatan)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Bunga</Text>
                      <Text style={styles.value}>{item.rate_bunga}% / tahun</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Nominal Bunga</Text>
                      <Text style={[styles.balanceValue, styles.bungaValue]}>
                        {formatCurrency(item.nominal_bunga)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Tanggal Pembukaan</Text>
                      <Text style={styles.value}>{formatDate(item.tanggal_pembukaan)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Jatuh Tempo</Text>
                      <Text style={styles.value}>{formatDate(item.tanggal_jatuh_tempo)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Status</Text>
                      <View style={[
                        styles.badge,
                        item.status.toLowerCase() === 'active' ? styles.activeBadge : styles.inactiveBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          item.status.toLowerCase() === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                        ]}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Perpanjangan Otomatis</Text>
                      <View style={[
                        styles.badge,
                        item.perpanjangan_otomatis ? styles.autoBadge : styles.manualBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          item.perpanjangan_otomatis ? styles.autoText : styles.manualText
                        ]}>
                          {item.perpanjangan_otomatis ? 'Ya' : 'Tidak'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
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
    marginTop: -25,
    paddingTop: 0,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: Math.min(24 * FONT_SCALE, 28),
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,    
    textAlign: 'left',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: Math.min(16 * FONT_SCALE, 20), 
    color: '#000000',
    opacity: 0.9,
    textAlign: 'left',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066AE',
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
    color: '#333333',
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nominalValue: {
    color: '#0066AE',
  },
  bungaValue: {
    color: '#34A853',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E6F4EA',
  },
  inactiveBadge: {
    backgroundColor: '#F1F3F4',
  },
  autoBadge: {
    backgroundColor: '#E8F0FE',
  },
  manualBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#34A853',
  },
  inactiveStatusText: {
    color: '#5F6368',
  },
  autoText: {
    color: '#1A73E8',
  },
  manualText: {
    color: '#D97706',
  },
});
