import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Tipe Data ────────────────────────────────────────────────────────────────

interface RekeningOption {
  id: number;
  no_tabungan: string;
  nama_produk: string;
  saldo_akhir: number;
}

type MetodePembayaranSetoran = 'qris' | 'transfer_rekening';

interface RekeningTransfer {
  bank: string;
  nomor_rekening: string;
  atas_nama: string;
}

interface SetoranData {
  id: number;
  nomor_setoran: string;
  jenis_simpanan: string;
  jumlah: number;
  kode_unik: number;
  jumlah_bayar: number;
  metode_pembayaran: MetodePembayaranSetoran;
  metode_pembayaran_label: string;
  rekening_transfer: RekeningTransfer | null;
  qris_payload: string | null;
  qris_image_url: string | null;
  kedaluwarsa_at: string | null;
  status: string;
  status_label: string;
  catatan_verifikasi: string | null;
  alasan_penolakan: string | null;
  no_tabungan: string;
}

// ─── Konstanta ────────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];
const SETORAN_MIN = 10000;
const SETORAN_MAX = 100000000;

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const formatNumber = (num: string) =>
  num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatCountdown = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatDateTimeInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
});

const extractErrorMessage = (body: Record<string, unknown>): string => {
  if (body?.errors && typeof body.errors === 'object') {
    const firstField = Object.values(body.errors as Record<string, string[]>)[0];
    if (Array.isArray(firstField) && firstField.length > 0) {
      return String(firstField[0]);
    }
  }
  if (body?.message) return String(body.message);
  return 'Terjadi kesalahan. Silakan coba lagi.';
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function Setor() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rekeningOptions, setRekeningOptions] = useState<RekeningOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<RekeningOption | null>(null);
  const [isAccountSelectorVisible, setIsAccountSelectorVisible] = useState(false);

  const [nominal, setNominal] = useState('');
  const [metodePembayaran, setMetodePembayaran] =
    useState<MetodePembayaranSetoran>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeSetoran, setActiveSetoran] = useState<SetoranData | null>(null);
  const [sisaDetik, setSisaDetik] = useState<number | null>(null);

  // Klaim form
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);
  const [waktuKlaim, setWaktuKlaim] = useState('');
  const [namaPembayar, setNamaPembayar] = useState('');
  const [referensiPembayaran, setReferensiPembayaran] = useState('');
  const [catatanPengguna, setCatatanPengguna] = useState('');
  const [isSubmittingKlaim, setIsSubmittingKlaim] = useState(false);

  // Download QRIS
  const [isDownloading, setIsDownloading] = useState(false);

  // Pembatalan setoran
  const [isSubmittingBatal, setIsSubmittingBatal] = useState(false);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async (token: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const [optionsRes, aktifRes] = await Promise.all([
        fetch(`${baseUrl}${API_ENDPOINTS.SETORAN_REKENING_OPTIONS}`, {
          headers: authHeaders(token),
        }),
        fetch(`${baseUrl}${API_ENDPOINTS.SETORAN_AKTIF}`, {
          headers: authHeaders(token),
        }),
      ]);

      if (optionsRes.ok) {
        const optionsData = await optionsRes.json();
        const list: RekeningOption[] = optionsData.data ?? [];
        setRekeningOptions(list);
        setSelectedAccount((prev) => {
          if (prev) {
            const updated = list.find((r) => r.id === prev.id);
            return updated ?? list[0] ?? null;
          }
          return list[0] ?? null;
        });
      }

      if (aktifRes.ok) {
        const aktifData = await aktifRes.json();
        setActiveSetoran(aktifData.data ?? null);
      }
    } catch (error) {
      console.error('Error fetching setoran data:', error);
    }
  }, []);

  const checkLoginStatus = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      setIsLoggedIn(!!token);
      if (token) {
        await loadData(token);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
    }, [checkLoginStatus])
  );

  // ─── Countdown ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      !activeSetoran?.kedaluwarsa_at ||
      activeSetoran.status !== 'menunggu_pembayaran'
    ) {
      setSisaDetik(null);
      return;
    }
    const target = new Date(activeSetoran.kedaluwarsa_at).getTime();
    const tick = () => {
      const diff = Math.floor((target - Date.now()) / 1000);
      setSisaDetik(diff > 0 ? diff : 0);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSetoran?.id, activeSetoran?.kedaluwarsa_at, activeSetoran?.status]);

  // ─── Refresh ───────────────────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (token) await loadData(token);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // ─── Navigasi kembali ─────────────────────────────────────────────────────

  const handleBackToDashboard = () => {
    if (Platform.OS === 'android') {
      router.replace('/(tabs)/dashboard');
    } else {
      router.push('/(tabs)/dashboard');
    }
  };

  // ─── Buat instruksi pembayaran ─────────────────────────────────────────────

  const handleBuatSetoran = async () => {
    if (!selectedAccount) {
      Alert.alert('Pilih Rekening', 'Silakan pilih rekening tujuan setoran.');
      return;
    }
    const jumlah = Number(nominal);
    if (!jumlah || jumlah < SETORAN_MIN) {
      Alert.alert(
        'Nominal Tidak Valid',
        `Minimal setoran adalah ${formatCurrency(SETORAN_MIN)}.`
      );
      return;
    }
    if (jumlah > SETORAN_MAX) {
      Alert.alert(
        'Nominal Terlalu Besar',
        `Maksimal setoran adalah ${formatCurrency(SETORAN_MAX)}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.SETORAN_GENERATE}`,
        {
          method: 'POST',
          headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_tabungan: selectedAccount.id,
            jumlah,
            metode_pembayaran: metodePembayaran,
          }),
        }
      );
      const body = await response.json();
      if (!response.ok || body.status === false) {
        Alert.alert('Setoran Gagal', extractErrorMessage(body));
        return;
      }
      setActiveSetoran(body.data);
      setNominal('');
    } catch {
      Alert.alert('Setoran Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Klaim Pembayaran ──────────────────────────────────────────────────────

  const openClaimModal = () => {
    setWaktuKlaim(formatDateTimeInput(new Date()));
    setNamaPembayar('');
    setReferensiPembayaran('');
    setCatatanPengguna('');
    setIsClaimModalVisible(true);
  };

  const handleKlaim = async () => {
    if (!activeSetoran) return;
    if (!namaPembayar.trim()) {
      Alert.alert('Klaim Tidak Valid', 'Nama pembayar wajib diisi.');
      return;
    }
    if (!waktuKlaim.trim()) {
      Alert.alert('Klaim Tidak Valid', 'Waktu pembayaran wajib diisi.');
      return;
    }

    setIsSubmittingKlaim(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      const formData = new FormData();
      formData.append('waktu_klaim_bayar', waktuKlaim.trim());
      formData.append('nama_pembayar', namaPembayar.trim());
      if (referensiPembayaran.trim())
        formData.append('referensi_pembayaran', referensiPembayaran.trim());
      if (catatanPengguna.trim())
        formData.append('catatan_pengguna', catatanPengguna.trim());

      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.SETORAN_KLAIM(activeSetoran.id)}`,
        {
          method: 'POST',
          headers: authHeaders(token),
          body: formData,
        }
      );
      const body = await response.json();
      if (!response.ok || body.status === false) {
        Alert.alert('Klaim Gagal', extractErrorMessage(body));
        return;
      }
      setIsClaimModalVisible(false);
      setActiveSetoran(body.data);
      Alert.alert('Klaim Berhasil', body.message ?? 'Klaim pembayaran berhasil dikirim.');
    } catch {
      Alert.alert('Klaim Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmittingKlaim(false);
    }
  };

  // ─── Batalkan Setoran ──────────────────────────────────────────────────────

  const handleBatalkanSetoran = async () => {
    if (!activeSetoran || isSubmittingBatal) return;

    setIsSubmittingBatal(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.SETORAN_BATALKAN(activeSetoran.id)}`,
        {
          method: 'POST',
          headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        }
      );
      const body = await response.json();
      if (!response.ok || body.status === false) {
        Alert.alert('Pembatalan Gagal', extractErrorMessage(body));
        return;
      }

      const nomorSetoran = activeSetoran.nomor_setoran;
      setActiveSetoran(null);
      setIsSubmittingBatal(false);

      const dataToken = await SecureStore.getItemAsync('secure_token');
      if (dataToken) await loadData(dataToken);

      Alert.alert(
        'Setoran Dibatalkan',
        body.message ?? `Setoran ${nomorSetoran} berhasil dibatalkan. Anda dapat membuat setoran baru.`
      );
    } catch {
      Alert.alert('Pembatalan Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmittingBatal(false);
    }
  };

  const confirmBatalkanSetoran = () => {
    if (!activeSetoran) return;
    const instruksi =
      activeSetoran.metode_pembayaran === 'transfer_rekening'
        ? 'instruksi transfer rekening'
        : 'QRIS';
    Alert.alert(
      'Batalkan Setoran?',
      `Pastikan Anda BELUM melakukan pembayaran untuk setoran ${activeSetoran.nomor_setoran}. ${instruksi} yang sudah dibatalkan tidak dapat dipakai untuk pembayaran.`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: handleBatalkanSetoran,
        },
      ]
    );
  };

  // ─── Download QRIS ─────────────────────────────────────────────────────────

  /**
   * Strategi download berdasarkan platform:
   * - Android & iOS: minta izin MEDIA_LIBRARY → download ke cache →
   *   simpan ke galeri (MediaLibrary.saveToLibraryAsync).
   * - Fallback (jika izin ditolak / galeri tidak tersedia): gunakan
   *   expo-sharing agar user bisa menyimpan sendiri ke folder pilihan.
   * - Jika qris_image_url null: tampilkan pesan bahwa gambar tidak tersedia.
   */
  const handleDownloadQris = async (imageUrl: string, nomorSetoran: string) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. Buat nama file yang unik
      const fileName = `QRIS-${nomorSetoran}-${Date.now()}.png`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;

      // 2. Download gambar ke cache lokal
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
      if (downloadResult.status !== 200) {
        Alert.alert('Unduhan Gagal', 'Tidak dapat mengunduh gambar QRIS dari server.');
        return;
      }

      // 3. Minta permission MediaLibrary
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

      if (status === 'granted') {
        // Simpan ke galeri (Photos / DCIM)
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Alert.alert(
          'QRIS Tersimpan',
          `Gambar QRIS berhasil disimpan ke galeri foto Anda.\nNama file: ${fileName}`
        );
      } else if (canAskAgain === false) {
        // Izin ditolak permanen → tawarkan sharing
        Alert.alert(
          'Izin Ditolak',
          'Akses galeri ditolak secara permanen. Gunakan opsi Bagikan untuk menyimpan gambar secara manual.',
          [
            { text: 'Batal', style: 'cancel' },
            {
              text: 'Bagikan',
              onPress: async () => {
                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                  await Sharing.shareAsync(downloadResult.uri, {
                    mimeType: 'image/png',
                    dialogTitle: `Simpan QRIS ${nomorSetoran}`,
                  });
                } else {
                  Alert.alert('Tidak Tersedia', 'Fitur berbagi tidak tersedia di perangkat ini.');
                }
              },
            },
          ]
        );
      } else {
        // Izin ditolak sementara → tawarkan sharing
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'image/png',
            dialogTitle: `Simpan QRIS ${nomorSetoran}`,
          });
        } else {
          Alert.alert(
            'Izin Diperlukan',
            'Berikan izin akses galeri agar QRIS dapat disimpan otomatis ke perangkat Anda.'
          );
        }
      }
    } catch (err) {
      console.error('Download QRIS error:', err);
      Alert.alert('Unduhan Gagal', 'Terjadi kesalahan saat mengunduh gambar QRIS.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <>
      {[1, 2].map((key) => (
        <View key={key} style={styles.card}>
          <View style={styles.cardHeader}>
            <Skeleton width={220} height={24} />
          </View>
          <View style={styles.cardBody}>
            <Skeleton width={160} height={16} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={48} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={48} />
          </View>
        </View>
      ))}
    </>
  );

  /** Kartu setoran aktif — tampilan berbeda per status */
  const renderActiveSetoran = () => {
    if (!activeSetoran) return null;

    const status = activeSetoran.status;

    // Instruksi kedaluwarsa: biarkan user buat setoran baru
    if (status === 'kedaluwarsa' || (status === 'menunggu_pembayaran' && sisaDetik === 0)) {
      return (
        <View style={[styles.card, styles.cardWarning]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="time-outline" size={24} color="#DC6C00" />
            <Text style={styles.statusTitleWarning}>Instruksi Pembayaran Kedaluwarsa</Text>
          </View>
          <Text style={styles.statusDesc}>
            Instruksi untuk nomor setoran{' '}
            <Text style={{ fontWeight: '700' }}>{activeSetoran.nomor_setoran}</Text>{' '}
            telah melewati batas waktu.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveSetoran(null)}
          >
            <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionButtonText}>Buat Setoran Baru</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Ditolak / dibatalkan
    if (status === 'ditolak' || status === 'dibatalkan') {
      return (
        <View style={[styles.card, styles.cardDanger]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="close-circle-outline" size={24} color="#DC3545" />
            <Text style={styles.statusTitleDanger}>{activeSetoran.status_label}</Text>
          </View>
          {activeSetoran.alasan_penolakan ? (
            <Text style={styles.statusDesc}>
              Alasan: {activeSetoran.alasan_penolakan}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveSetoran(null)}
          >
            <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionButtonText}>Buat Setoran Baru</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Selesai
    if (status === 'selesai') {
      return (
        <View style={[styles.card, styles.cardSuccess]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#1F7900" />
            <Text style={styles.statusTitleSuccess}>Setoran Selesai</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nomor Setoran</Text>
            <Text style={styles.value}>{activeSetoran.nomor_setoran}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nominal</Text>
            <Text style={styles.value}>{formatCurrency(activeSetoran.jumlah)}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveSetoran(null)}
          >
            <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionButtonText}>Buat Setoran Baru</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Perlu revisi → tampilkan catatan + tombol klaim ulang
    if (status === 'perlu_revisi') {
      return (
        <View style={[styles.card, styles.cardWarning]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="warning-outline" size={24} color="#DC6C00" />
            <Text style={styles.statusTitleWarning}>Perlu Revisi</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nomor Setoran</Text>
            <Text style={styles.value}>{activeSetoran.nomor_setoran}</Text>
          </View>
          {activeSetoran.catatan_verifikasi ? (
            <View style={styles.catatanBox}>
              <Text style={styles.catatanLabel}>Catatan Admin:</Text>
              <Text style={styles.catatanText}>{activeSetoran.catatan_verifikasi}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.actionButton} onPress={openClaimModal}>
            <LinearGradient colors={['#DC6C00', '#FF8C00']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionButtonText}>Kirim Ulang Klaim</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Menunggu pembayaran → tampilkan instruksi sesuai metode
    if (status === 'menunggu_pembayaran') {
      const isExpired = sisaDetik !== null && sisaDetik === 0;
      const isTransfer = activeSetoran.metode_pembayaran === 'transfer_rekening';

      return (
        <View style={styles.card}>
          <LinearGradient
            colors={['#1F7900', '#4CAF50']}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardHeaderContent}>
              <Ionicons
                name={isTransfer ? 'business-outline' : 'qr-code-outline'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.cardHeaderTitle}>
                Setoran {activeSetoran.metode_pembayaran_label}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nomor Setoran</Text>
              <Text style={styles.value}>{activeSetoran.nomor_setoran}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Rekening</Text>
              <Text style={[styles.value, styles.rekeningBadge]}>{activeSetoran.no_tabungan}</Text>
            </View>

            {isTransfer ? (
              activeSetoran.rekening_transfer ? (
                <View style={styles.transferAccountBox}>
                  <View style={styles.transferAccountIcon}>
                    <Ionicons name="business" size={28} color="#1F7900" />
                  </View>
                  <Text style={styles.transferBank}>{activeSetoran.rekening_transfer.bank}</Text>
                  <Text style={styles.transferAccountNumber} selectable>
                    {activeSetoran.rekening_transfer.nomor_rekening}
                  </Text>
                  <Text style={styles.transferAccountName}>
                    a.n. {activeSetoran.rekening_transfer.atas_nama}
                  </Text>
                  <Text style={styles.transferNote}>
                    Transfer tepat sesuai total pembayaran agar setoran mudah diverifikasi.
                  </Text>
                </View>
              ) : (
                <View style={styles.instructionUnavailable}>
                  <Ionicons name="warning-outline" size={24} color="#DC6C00" />
                  <Text style={styles.instructionUnavailableText}>
                    Informasi rekening transfer tidak tersedia. Muat ulang halaman atau hubungi layanan bantuan.
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.qrisImageContainer}>
                {activeSetoran.qris_image_url ? (
                  <Image
                    source={{ uri: activeSetoran.qris_image_url }}
                    style={styles.qrisImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.qrisFallback}>
                    <Ionicons name="qr-code" size={48} color="#CCCCCC" />
                    <Text style={styles.qrisFallbackText}>
                      QRIS tidak tersedia. Silakan muat ulang halaman atau hubungi layanan bantuan.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Tombol Download QRIS — hanya untuk QRIS dengan URL gambar */}
            {!isTransfer && activeSetoran.qris_image_url && !isExpired && (
              <TouchableOpacity
                style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
                onPress={() =>
                  handleDownloadQris(
                    activeSetoran.qris_image_url!,
                    activeSetoran.nomor_setoran
                  )
                }
                disabled={isDownloading}
                activeOpacity={0.75}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#1F7900" />
                ) : (
                  <Ionicons name="download-outline" size={18} color="#1F7900" />
                )}
                <Text style={styles.downloadButtonText}>
                  {isDownloading ? 'Mengunduh…' : 'Unduh Gambar QRIS'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Jumlah bayar dengan kode unik */}
            <View style={styles.jumlahBayarBox}>
              <Text style={styles.jumlahBayarLabel}>Total yang Harus Dibayar</Text>
              <Text style={styles.jumlahBayarAmount}>
                {formatCurrency(activeSetoran.jumlah_bayar)}
              </Text>
              <View style={styles.kodeUnikRow}>
                <Text style={styles.kodeUnikLabel}>Nominal setoran</Text>
                <Text style={styles.kodeUnikValue}>{formatCurrency(activeSetoran.jumlah)}</Text>
              </View>
              <View style={styles.kodeUnikRow}>
                <Text style={styles.kodeUnikLabel}>Kode unik</Text>
                <Text style={[styles.kodeUnikValue, { color: '#DC6C00' }]}>
                  + {formatCurrency(activeSetoran.kode_unik)}
                </Text>
              </View>
            </View>

            {/* Countdown */}
            {!isExpired && sisaDetik !== null && (
              <View style={styles.countdownRow}>
                <Ionicons name="timer-outline" size={16} color="#666" />
                <Text style={styles.countdownText}>
                  Berlaku dalam{' '}
                  <Text style={[styles.countdownTimer, sisaDetik < 60 && { color: '#DC3545' }]}>
                    {formatCountdown(sisaDetik)}
                  </Text>
                </Text>
              </View>
            )}

            {isExpired && (
              <View style={[styles.countdownRow, { backgroundColor: '#FFF3CD' }]}>
                <Ionicons name="warning-outline" size={16} color="#DC6C00" />
                <Text style={[styles.countdownText, { color: '#DC6C00' }]}>
                  Instruksi pembayaran telah kedaluwarsa
                </Text>
              </View>
            )}

            {/* Tombol klaim */}
            {!isExpired && (
              <TouchableOpacity style={[styles.actionButton, { marginTop: 16 }]} onPress={openClaimModal}>
                <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                  <Text style={[styles.actionButtonText, { marginLeft: 6 }]}>Saya Sudah Bayar</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Tombol batalkan setoran */}
            {!isExpired && (
              <TouchableOpacity
                style={[styles.cancelButton, isSubmittingBatal && styles.submitButtonDisabled]}
                onPress={confirmBatalkanSetoran}
                disabled={isSubmittingBatal}
              >
                {isSubmittingBatal ? (
                  <ActivityIndicator size="small" color="#DC3545" />
                ) : (
                  <Ionicons name="close-circle-outline" size={18} color="#DC3545" />
                )}
                <Text style={styles.cancelButtonText}>
                  {isSubmittingBatal ? 'Membatalkan…' : 'Batalkan Setoran'}
                </Text>
              </TouchableOpacity>
            )}

            {isExpired && (
              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 16 }]}
                onPress={() => setActiveSetoran(null)}
              >
                <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.actionButtonText}>Buat Setoran Baru</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // Status lain: menunggu_verifikasi, sedang_diperiksa, disetujui
    const statusColor =
      status === 'disetujui' ? '#1F7900' : '#555555';

    return (
      <View style={[styles.card, styles.cardInfo]}>
        <View style={styles.statusCardHeader}>
          <Ionicons name="hourglass-outline" size={24} color={statusColor} />
          <Text style={[styles.statusTitleInfo, { color: statusColor }]}>
            {activeSetoran.status_label}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nomor Setoran</Text>
          <Text style={styles.value}>{activeSetoran.nomor_setoran}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Jenis Simpanan</Text>
          <Text style={styles.value}>{activeSetoran.jenis_simpanan}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nominal</Text>
          <Text style={styles.value}>{formatCurrency(activeSetoran.jumlah)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Metode Pembayaran</Text>
          <Text style={styles.value}>{activeSetoran.metode_pembayaran_label}</Text>
        </View>
        <Text style={styles.infoNote}>
          Setoran sedang diproses oleh admin. Anda akan mendapat notifikasi setelah diverifikasi.
        </Text>
      </View>
    );
  };

  /** Form buat setoran baru */
  const renderForm = () => (
    <>
      {/* Kartu rekening */}
      {selectedAccount ? (
        <View style={styles.card}>
          <LinearGradient
            colors={['#1F7900', '#4CAF50']}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardHeaderContent}>
              <Text style={styles.productName}>{selectedAccount.nama_produk}</Text>
              {rekeningOptions.length > 1 && (
                <TouchableOpacity
                  onPress={() => setIsAccountSelectorVisible(true)}
                  style={styles.changeAccountButton}
                >
                  <Ionicons name="swap-horizontal" size={18} color="#FFF" />
                  <Text style={styles.changeAccountText}>Ganti</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nomor Rekening</Text>
              <Text style={[styles.value, styles.rekeningBadge]}>
                {selectedAccount.no_tabungan}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Saldo Akhir</Text>
              <Text style={styles.saldoValue}>
                {formatCurrency(selectedAccount.saldo_akhir)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="wallet-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Tidak ada rekening tersedia.</Text>
        </View>
      )}

      {/* Input nominal */}
      {selectedAccount && (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.sectionLabel}>Nominal Setoran</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>Rp</Text>
              <TextInput
                style={styles.input}
                value={formatNumber(nominal)}
                onChangeText={(text) => setNominal(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.noteText}>
              * Minimal {formatCurrency(SETORAN_MIN)} · Maksimal {formatCurrency(SETORAN_MAX)}
            </Text>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Pilih Nominal Cepat</Text>
            <View style={styles.quickAmountGrid}>
              {QUICK_AMOUNTS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    nominal === String(amount) && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => setNominal(String(amount))}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      nominal === String(amount) && styles.quickAmountTextActive,
                    ]}
                  >
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Metode Pembayaran</Text>
            <View style={styles.paymentMethodRow}>
              {([
                { value: 'qris', label: 'QRIS', icon: 'qr-code-outline' },
                {
                  value: 'transfer_rekening',
                  label: 'Transfer Rekening',
                  icon: 'business-outline',
                },
              ] as const).map((method) => {
                const isSelected = metodePembayaran === method.value;
                return (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.paymentMethodButton,
                      isSelected && styles.paymentMethodButtonActive,
                    ]}
                    onPress={() => setMetodePembayaran(method.value)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={method.icon}
                      size={22}
                      color={isSelected ? '#1F7900' : '#777777'}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        isSelected && styles.paymentMethodTextActive,
                      ]}
                    >
                      {method.label}
                    </Text>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#1F7900' : '#AAAAAA'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (!nominal || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleBuatSetoran}
              disabled={!nominal || isSubmitting}
            >
              <LinearGradient
                colors={['#1F7900', '#4CAF50']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons
                      name={metodePembayaran === 'qris' ? 'qr-code-outline' : 'business-outline'}
                      size={18}
                      color="#FFF"
                    />
                    <Text style={[styles.actionButtonText, { marginLeft: 8 }]}>Lanjutkan Pembayaran</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  // ─── Guard login ───────────────────────────────────────────────────────────

  if (!isLoggedIn && !isLoading) {
    return <LoginRequired />;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1F7900']}
              tintColor="#1F7900"
            />
          }
        >
          {/* Header — layout mengikuti dashboard */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#155D00', '#1F7900', '#0D4A00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.8 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerTop}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToDashboard}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                  <Text style={styles.headerTitle}>Setoran Simpanan</Text>
                  <Text style={styles.headerSubtitle}>QRIS atau Transfer Rekening</Text>
                </View>
                <View style={styles.headerIcons}>
                  <View style={styles.iconGroup}>
                    <Pressable
                      style={[styles.iconButton, styles.iconButtonLeft]}
                      android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
                    >
                      <Ionicons name="notifications-outline" size={24} color="#FFF" />
                    </Pressable>
                    <Pressable
                      style={[styles.iconButton, styles.iconButtonRight]}
                      android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
                    >
                      <Ionicons name="headset-outline" size={24} color="#FFF" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Konten */}
          <View style={styles.content}>
            {isLoading ? (
              renderSkeleton()
            ) : activeSetoran ? (
              renderActiveSetoran()
            ) : (
              renderForm()
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pilih rekening */}
      <Modal
        visible={isAccountSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAccountSelectorVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAccountSelectorVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pilih Rekening</Text>
                  <TouchableOpacity onPress={() => setIsAccountSelectorVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.accountList}>
                  {rekeningOptions.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountItem,
                        selectedAccount?.id === account.id && styles.accountItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedAccount(account);
                        setIsAccountSelectorVisible(false);
                      }}
                    >
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{account.nama_produk}</Text>
                        <Text style={styles.accountNumber}>{account.no_tabungan}</Text>
                        <Text style={styles.accountSaldo}>
                          {formatCurrency(account.saldo_akhir)}
                        </Text>
                      </View>
                      {selectedAccount?.id === account.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#1F7900" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal klaim pembayaran */}
      <Modal
        visible={isClaimModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsClaimModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsClaimModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.claimModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Konfirmasi Pembayaran</Text>
                  <TouchableOpacity onPress={() => setIsClaimModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
                  <Text style={styles.fieldLabel}>Waktu Pembayaran *</Text>
                  <Text style={styles.fieldHint}>Format: YYYY-MM-DD HH:mm:ss</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={waktuKlaim}
                    onChangeText={setWaktuKlaim}
                    placeholder="2026-08-07 10:25:00"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.fieldLabel}>Nama Pembayar *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={namaPembayar}
                    onChangeText={setNamaPembayar}
                    placeholder="Nama sesuai rekening pengirim"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.fieldLabel}>Referensi Pembayaran</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={referensiPembayaran}
                    onChangeText={setReferensiPembayaran}
                    placeholder="Nomor referensi (opsional)"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.fieldLabel}>Catatan</Text>
                  <TextInput
                    style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
                    value={catatanPengguna}
                    onChangeText={setCatatanPengguna}
                    placeholder="Catatan tambahan (opsional)"
                    placeholderTextColor="#999"
                    multiline
                  />

                  <TouchableOpacity
                    style={[styles.submitButton, isSubmittingKlaim && styles.submitButtonDisabled]}
                    onPress={handleKlaim}
                    disabled={isSubmittingKlaim}
                  >
                    <LinearGradient
                      colors={['#1F7900', '#4CAF50']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isSubmittingKlaim ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.actionButtonText}>Kirim Klaim</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    width: '100%',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  userInfo: {
    flex: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 11, fontStyle: 'italic', color: '#F5F5F5', marginTop: 8 },
  headerIcons: {
    flexDirection: 'row',
  },
  iconGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    marginRight: -12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  content: { padding: 16, marginTop: 16 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWarning: { borderLeftWidth: 4, borderLeftColor: '#DC6C00' },
  cardDanger: { borderLeftWidth: 4, borderLeftColor: '#DC3545' },
  cardSuccess: { borderLeftWidth: 4, borderLeftColor: '#1F7900' },
  cardInfo: { borderLeftWidth: 4, borderLeftColor: '#1F7900' },

  cardHeader: { padding: 16 },
  cardHeaderContent: { flexDirection: 'row', alignItems: 'center' },
  cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginLeft: 8, flex: 1 },
  cardBody: { padding: 16 },

  productName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },

  changeAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  changeAccountText: { color: '#FFFFFF', fontSize: 12, marginLeft: 4 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: { fontSize: 13, color: '#666666' },
  value: { fontSize: 13, color: '#333333', fontWeight: '500' },
  saldoValue: { fontSize: 15, color: '#1F7900', fontWeight: '700' },
  rekeningBadge: {
    backgroundColor: '#E7F7ED',
    color: '#28A745',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },

  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  currencyPrefix: { fontSize: 16, color: '#555', marginRight: 4 },
  input: { flex: 1, fontSize: 18, color: '#333333', paddingVertical: 12 },
  noteText: { fontSize: 12, color: '#888888', fontStyle: 'italic', marginTop: 6 },

  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  quickAmountButton: {
    margin: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F7900',
    backgroundColor: 'transparent',
  },
  quickAmountButtonActive: { backgroundColor: '#1F7900' },
  quickAmountText: { fontSize: 12, color: '#1F7900', fontWeight: '500' },
  quickAmountTextActive: { color: '#FFFFFF' },

  paymentMethodRow: { gap: 10 },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FAFAFA',
  },
  paymentMethodButtonActive: {
    borderColor: '#1F7900',
    backgroundColor: '#E7F7ED',
  },
  paymentMethodText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#555555' },
  paymentMethodTextActive: { color: '#1F7900' },

  submitButton: { marginTop: 16, borderRadius: 8, overflow: 'hidden' },
  submitButtonDisabled: { opacity: 0.5 },
  gradientButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: { borderRadius: 8, overflow: 'hidden' },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Status cards
  statusCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  statusTitleWarning: { fontSize: 16, fontWeight: '700', color: '#DC6C00', marginLeft: 8 },
  statusTitleDanger: { fontSize: 16, fontWeight: '700', color: '#DC3545', marginLeft: 8 },
  statusTitleSuccess: { fontSize: 16, fontWeight: '700', color: '#1F7900', marginLeft: 8 },
  statusTitleInfo: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  statusDesc: { fontSize: 13, color: '#555', paddingHorizontal: 16, marginBottom: 12 },
  infoNote: { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 4, paddingHorizontal: 16, paddingBottom: 16 },

  catatanBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  catatanLabel: { fontSize: 12, fontWeight: '700', color: '#856404', marginBottom: 4 },
  catatanText: { fontSize: 13, color: '#856404' },

  // QRIS display
  qrisImageContainer: { alignItems: 'center', marginVertical: 16 },
  qrisImage: { width: 240, height: 240, borderRadius: 8 },
  qrisFallback: {
    width: 240,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  qrisFallbackText: { fontSize: 12, color: '#666', textAlign: 'center', marginVertical: 8 },
  qrisPayloadText: { fontSize: 10, color: '#333', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  transferAccountBox: {
    alignItems: 'center',
    backgroundColor: '#F7FBF5',
    borderWidth: 1,
    borderColor: '#CDE7C5',
    borderRadius: 12,
    padding: 18,
    marginVertical: 16,
  },
  transferAccountIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F7ED',
    marginBottom: 10,
  },
  transferBank: { fontSize: 16, fontWeight: '700', color: '#333333' },
  transferAccountNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1F7900',
    letterSpacing: 1,
    marginTop: 5,
  },
  transferAccountName: { fontSize: 13, color: '#555555', marginTop: 4 },
  transferNote: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 14,
  },
  instructionUnavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: '#FFF3CD',
  },
  instructionUnavailableText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#856404' },

  jumlahBayarBox: {
    backgroundColor: '#E7F7ED',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  jumlahBayarLabel: { fontSize: 13, color: '#555', marginBottom: 4 },
  jumlahBayarAmount: { fontSize: 26, fontWeight: '800', color: '#1F7900' },
  kodeUnikRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },
  kodeUnikLabel: { fontSize: 12, color: '#555' },
  kodeUnikValue: { fontSize: 12, fontWeight: '600', color: '#333' },

  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginTop: 4,
  },
  countdownText: { fontSize: 13, color: '#555' },
  countdownTimer: { fontWeight: '700', color: '#1F7900' },

  // Tombol download QRIS
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#1F7900',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#F0FBF0',
  },
  downloadButtonDisabled: {
    borderColor: '#AAAAAA',
    backgroundColor: '#F5F5F5',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F7900',
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFF5F5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC3545',
  },

  // Empty state
  emptyStateContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyStateText: { fontSize: 15, color: '#888', marginTop: 12, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '90%',
    maxHeight: '75%',
  },
  claimModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxHeight: '90%',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  accountList: { padding: 8 },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
  },
  accountItemSelected: { backgroundColor: '#E7F7ED' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  accountNumber: { fontSize: 13, color: '#666', marginBottom: 2 },
  accountSaldo: { fontSize: 13, fontWeight: '700', color: '#1F7900' },

  // Klaim form fields
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 12 },
  fieldHint: { fontSize: 12, color: '#888', marginBottom: 4 },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
});
