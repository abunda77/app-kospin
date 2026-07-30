import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus, PanResponder, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, API_ENDPOINTS } from '../app/config/api';

// Durasi tanpa aktivitas sebelum logout otomatis (1 menit)
const INACTIVITY_TIMEOUT = 60 * 1000;

interface AutoLogoutProviderProps {
  children: ReactNode;
}

export default function AutoLogoutProvider({ children }: AutoLogoutProviderProps) {
  const router = useRouter();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundTimestampRef = useRef<number | null>(null);
  const isLoggingOutRef = useRef(false);

  const performAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      // Jika belum login, tidak ada sesi yang perlu diakhiri
      if (!token) return;

      // Hapus sesi lokal terlebih dahulu agar logout pasti terjadi
      // meskipun request ke server gagal
      await SecureStore.deleteItemAsync('secure_token');
      await SecureStore.deleteItemAsync('userData');
      await AsyncStorage.removeItem('userData');

      // Beritahu server untuk mencabut token (best-effort, tanpa menunggu)
      fetch(`${getApiBaseUrl()}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {});

      router.replace('/(tabs)');
      Alert.alert(
        'Sesi Berakhir',
        'Demi keamanan, Anda telah logout otomatis karena tidak ada aktivitas selama 1 menit. Silakan login kembali.'
      );
    } catch (error) {
      console.error('Error during auto logout:', error);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      performAutoLogout();
    }, INACTIVITY_TIMEOUT);
  }, [performAutoLogout]);

  // Deteksi app berpindah ke background/kembali aktif
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundTimestampRef.current = Date.now();
      } else if (nextState === 'active') {
        const leftAt = backgroundTimestampRef.current;
        backgroundTimestampRef.current = null;
        if (leftAt && Date.now() - leftAt >= INACTIVITY_TIMEOUT) {
          performAutoLogout();
        } else {
          resetInactivityTimer();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    resetInactivityTimer();

    return () => {
      subscription.remove();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [performAutoLogout, resetInactivityTimer]);

  // Setiap sentuhan di mana pun akan me-reset timer,
  // return false agar sentuhan tetap diteruskan ke komponen di bawahnya
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false;
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
