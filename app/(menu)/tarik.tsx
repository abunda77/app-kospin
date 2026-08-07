import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiBaseUrl, API_ENDPOINTS } from '../config/api';
import LoginRequired from '../../components/LoginRequired';
import Skeleton from '../../components/Skeleton';
import { Ionicons } from '@expo/vector-icons';

// ─── Tipe Data ────────────────────────────────────────────────────────────────

interface RekeningOption {
  id: number;
  no_tabungan: string;
  nama_produk: string;
  saldo_akhir: number;
}

interface PenarikanData {
  id: number;
  nomor_penarikan: string;
  jenis_simpanan: string;
  jumlah: number;
  bank: string;
  nama_bank: string;
  nama_nasabah: string;
  referensi_penarikan: string | null;
  catatan_pengguna: string | null;
  status: string;
  status_label: string;
  catatan_verifikasi: string | null;
  alasan_penolakan: string | null;
  referensi_transfer: string | null;
  waktu_transfer: string | null;
  no_tabungan: string;
}

// ─── Konstanta ────────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];
const PENARIKAN_MIN = 10000;
const PENARIKAN_MAX = 100000000;
const BANK_OPTIONS = ['BRI', 'BNI', 'BCA', 'MANDIRI', 'BSI', 'BTPN', 'LAINNYA'] as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const formatNumber = (num: string) =>
  num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

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

export default function TarikTunai() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rekeningOptions, setRekeningOptions] = useState<RekeningOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<RekeningOption | null>(null);
  const [isAccountSelectorVisible, setIsAccountSelectorVisible] = useState(false);

  // Form penarikan
  const [nominal, setNominal] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isBankSelectorVisible, setIsBankSelectorVisible] = useState(false);
  const [namaBank, setNamaBank] = useState('');
  const [namaNasabah, setNamaNasabah] = useState('');
  const [referensiPenarikan, setReferensiPenarikan] = useState('');
  const [catatanPengguna, setCatatanPengguna] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Penarikan aktif
  const [activePenarikan, setActivePenarikan] = useState<PenarikanData | null>(null);

  // Form revisi (untuk status perlu_revisi)
  const [revisiReferensi, setRevisiReferensi] = useState('');
  const [revisiCatatan, setRevisiCatatan] = useState('');
  const [isSubmittingRevisi, setIsSubmittingRevisi] = useState(false);

  // Pembatalan penarikan
  const [isSubmittingBatal, setIsSubmittingBatal] = useState(false);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async (token: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const [optionsRes, aktifRes] = await Promise.all([
        fetch(`${baseUrl}${API_ENDPOINTS.PENARIKAN_REKENING_OPTIONS}`, {
          headers: authHeaders(token),
        }),
        fetch(`${baseUrl}${API_ENDPOINTS.PENARIKAN_AKTIF}`, {
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
        setActivePenarikan(aktifData.data ?? null);
      }
    } catch (error) {
      console.error('Error fetching penarikan data:', error);
    }
  }, []);

  const checkLoginStatus = useCallback(async () => {
    setIsLoading(true);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
    }, [checkLoginStatus])
  );

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

  // ─── Validasi & Submit Penarikan ───────────────────────────────────────────

  const validateForm = (): string | null => {
    const jumlah = Number(nominal);
    if (!jumlah || jumlah < PENARIKAN_MIN) {
      return `Nominal minimal penarikan adalah ${formatCurrency(PENARIKAN_MIN)}.`;
    }
    if (jumlah > PENARIKAN_MAX) {
      return `Nominal maksimal penarikan adalah ${formatCurrency(PENARIKAN_MAX)}.`;
    }
    if (selectedAccount && jumlah > selectedAccount.saldo_akhir) {
      return `Nominal melebihi saldo tersedia (${formatCurrency(selectedAccount.saldo_akhir)}).`;
    }
    if (!selectedBank) {
      return 'Pilih bank tujuan penarikan.';
    }
    if (!namaBank.trim()) {
      return 'Nama bank wajib diisi.';
    }
    if (!namaNasabah.trim()) {
      return 'Nama nasabah penerima wajib diisi.';
    }
    return null;
  };

  const handleSubmitPenarikan = async () => {
    if (!selectedAccount) {
      Alert.alert('Rekening Belum Dipilih', 'Silakan pilih rekening sumber penarikan.');
      return;
    }
    const errMsg = validateForm();
    if (errMsg) {
      Alert.alert('Data Tidak Lengkap', errMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      const formData = new FormData();
      formData.append('id_tabungan', String(selectedAccount.id));
      formData.append('jumlah', nominal);
      formData.append('bank', selectedBank);
      formData.append('nama_bank', namaBank.trim());
      formData.append('nama_nasabah', namaNasabah.trim());
      if (referensiPenarikan.trim())
        formData.append('referensi_penarikan', referensiPenarikan.trim());
      if (catatanPengguna.trim())
        formData.append('catatan_pengguna', catatanPengguna.trim());

      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.PENARIKAN_SUBMIT}`,
        {
          method: 'POST',
          headers: authHeaders(token),
          body: formData,
        }
      );
      const body = await response.json();
      if (!response.ok || body.status === false) {
        Alert.alert('Penarikan Gagal', extractErrorMessage(body));
        return;
      }

      // Berhasil → tampilkan setoran aktif, reset form
      setActivePenarikan(body.data);
      setNominal('');
      setSelectedBank('');
      setNamaBank('');
      setNamaNasabah('');
      setReferensiPenarikan('');
      setCatatanPengguna('');
      Alert.alert(
        'Permohonan Dikirim',
        body.message ?? 'Permohonan penarikan berhasil diajukan dan menunggu verifikasi.'
      );
    } catch {
      Alert.alert('Penarikan Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Submit Revisi ─────────────────────────────────────────────────────────

  const handleSubmitRevisi = async () => {
    if (!activePenarikan) return;

    setIsSubmittingRevisi(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      const formData = new FormData();
      if (revisiReferensi.trim())
        formData.append('referensi_penarikan', revisiReferensi.trim());
      if (revisiCatatan.trim())
        formData.append('catatan_pengguna', revisiCatatan.trim());

      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.PENARIKAN_REVISI(activePenarikan.id)}`,
        {
          method: 'POST',
          headers: authHeaders(token),
          body: formData,
        }
      );
      const body = await response.json();
      if (!response.ok || body.status === false) {
        Alert.alert('Revisi Gagal', extractErrorMessage(body));
        return;
      }
      setActivePenarikan(body.data);
      setRevisiReferensi('');
      setRevisiCatatan('');
      Alert.alert('Revisi Terkirim', body.message ?? 'Revisi berhasil dikirim.');
    } catch {
      Alert.alert('Revisi Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmittingRevisi(false);
    }
  };

  // ─── Batalkan Penarikan ───────────────────────────────────────────────────

  const handleBatalkanPenarikan = async () => {
    if (!activePenarikan || isSubmittingBatal) return;

    setIsSubmittingBatal(true);
    try {
      const token = await SecureStore.getItemAsync('secure_token');
      if (!token) return;

      const response = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.PENARIKAN_BATALKAN(activePenarikan.id)}`,
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

      const nomorPenarikan = activePenarikan.nomor_penarikan;
      setActivePenarikan(null);
      setIsSubmittingBatal(false);

      const dataToken = await SecureStore.getItemAsync('secure_token');
      if (dataToken) await loadData(dataToken);

      Alert.alert(
        'Penarikan Dibatalkan',
        body.message ?? `Penarikan ${nomorPenarikan} berhasil dibatalkan. Anda dapat mengajukan penarikan baru.`
      );
    } catch {
      Alert.alert('Pembatalan Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmittingBatal(false);
    }
  };

  const confirmBatalkanPenarikan = () => {
    if (!activePenarikan) return;
    Alert.alert(
      'Batalkan Penarikan?',
      `Permohonan penarikan ${activePenarikan.nomor_penarikan} sebesar ${formatCurrency(activePenarikan.jumlah)} akan dibatalkan dan tidak dapat dikembalikan.`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: handleBatalkanPenarikan,
        },
      ]
    );
  };

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { backgroundColor: '#E0E0E0' }]}>
        <Skeleton width={180} height={22} />
      </View>
      <View style={styles.cardBody}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.infoRow}>
            <Skeleton width={100} height={14} />
            <Skeleton width={130} height={14} />
          </View>
        ))}
        <Skeleton width="100%" height={48} style={{ marginTop: 16 }} />
        <Skeleton width="100%" height={48} style={{ marginTop: 12 }} />
      </View>
    </View>
  );

  /** Kartu penarikan aktif */
  const renderActivePenarikan = () => {
    if (!activePenarikan) return null;
    const status = activePenarikan.status;

    // Selesai
    if (status === 'selesai') {
      return (
        <View style={[styles.card, styles.cardSuccess]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#1F7900" />
            <Text style={styles.statusTitleSuccess}>Penarikan Selesai</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow label="Nomor Penarikan" value={activePenarikan.nomor_penarikan} />
            <InfoRow label="Nominal" value={formatCurrency(activePenarikan.jumlah)} />
            <InfoRow label="Jenis Simpanan" value={activePenarikan.jenis_simpanan} />
            {activePenarikan.referensi_transfer && (
              <InfoRow label="Referensi Transfer" value={activePenarikan.referensi_transfer} />
            )}
            {activePenarikan.waktu_transfer && (
              <InfoRow
                label="Waktu Transfer"
                value={new Date(activePenarikan.waktu_transfer).toLocaleString('id-ID')}
              />
            )}
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActivePenarikan(null)}
            >
              <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.actionButtonText}>Ajukan Penarikan Baru</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Ditolak / dibatalkan
    if (status === 'ditolak' || status === 'dibatalkan') {
      return (
        <View style={[styles.card, styles.cardDanger]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="close-circle-outline" size={24} color="#DC3545" />
            <Text style={styles.statusTitleDanger}>{activePenarikan.status_label}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow label="Nomor Penarikan" value={activePenarikan.nomor_penarikan} />
            <InfoRow label="Nominal" value={formatCurrency(activePenarikan.jumlah)} />
            {activePenarikan.alasan_penolakan && (
              <View style={styles.catatanBox}>
                <Text style={styles.catatanLabel}>Alasan Penolakan:</Text>
                <Text style={styles.catatanText}>{activePenarikan.alasan_penolakan}</Text>
              </View>
            )}
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActivePenarikan(null)}
            >
              <LinearGradient colors={['#1F7900', '#4CAF50']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.actionButtonText}>Ajukan Penarikan Baru</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Perlu revisi → tampilkan catatan + form revisi
    if (status === 'perlu_revisi') {
      return (
        <View style={[styles.card, styles.cardWarning]}>
          <View style={styles.statusCardHeader}>
            <Ionicons name="warning-outline" size={24} color="#DC6C00" />
            <Text style={styles.statusTitleWarning}>Perlu Revisi</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow label="Nomor Penarikan" value={activePenarikan.nomor_penarikan} />
            <InfoRow label="Nominal" value={formatCurrency(activePenarikan.jumlah)} />
            <InfoRow label="Bank" value={`${activePenarikan.bank} — ${activePenarikan.nama_bank}`} />
            <InfoRow label="Nasabah" value={activePenarikan.nama_nasabah} />

            {activePenarikan.catatan_verifikasi && (
              <View style={styles.catatanBox}>
                <Text style={styles.catatanLabel}>Catatan Admin:</Text>
                <Text style={styles.catatanText}>{activePenarikan.catatan_verifikasi}</Text>
              </View>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Kirim Revisi</Text>

            <Text style={styles.fieldLabel}>Referensi Penarikan</Text>
            <TextInput
              style={styles.fieldInput}
              value={revisiReferensi}
              onChangeText={setRevisiReferensi}
              placeholder="Referensi (opsional)"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Catatan</Text>
            <TextInput
              style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
              value={revisiCatatan}
              onChangeText={setRevisiCatatan}
              placeholder="Catatan tambahan (opsional)"
              placeholderTextColor="#999"
              multiline
            />

            <TouchableOpacity
              style={[styles.actionButton, { marginTop: 16 }, isSubmittingRevisi && styles.buttonDisabled]}
              onPress={handleSubmitRevisi}
              disabled={isSubmittingRevisi}
            >
              <LinearGradient colors={['#DC6C00', '#FF8C00']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {isSubmittingRevisi ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Kirim Revisi</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Status lain: menunggu_verifikasi, sedang_diperiksa, disetujui
    const isApproved = status === 'disetujui';
    return (
      <View style={[styles.card, styles.cardInfo]}>
        <LinearGradient
          colors={['#1F7900', '#4CAF50']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeaderContent}>
            <Ionicons name="hourglass-outline" size={20} color="#FFF" />
            <Text style={styles.cardHeaderTitle}>{activePenarikan.status_label}</Text>
          </View>
        </LinearGradient>
        <View style={styles.cardBody}>
          <InfoRow label="Nomor Penarikan" value={activePenarikan.nomor_penarikan} />
          <InfoRow label="Jenis Simpanan" value={activePenarikan.jenis_simpanan} />
          <InfoRow label="Nominal" value={formatCurrency(activePenarikan.jumlah)} />
          <InfoRow label="Bank" value={`${activePenarikan.bank} — ${activePenarikan.nama_bank}`} />
          <InfoRow label="Nasabah" value={activePenarikan.nama_nasabah} />
          <Text style={styles.infoNote}>
            {isApproved
              ? 'Penarikan telah disetujui dan sedang dalam proses transfer.'
              : 'Permohonan sedang diproses oleh admin. Mohon tunggu konfirmasi.'}
          </Text>

          {status === 'menunggu_verifikasi' && (
            <TouchableOpacity
              style={[styles.cancelButton, isSubmittingBatal && styles.buttonDisabled]}
              onPress={confirmBatalkanPenarikan}
              disabled={isSubmittingBatal}
            >
              {isSubmittingBatal ? (
                <ActivityIndicator size="small" color="#DC3545" />
              ) : (
                <Ionicons name="close-circle-outline" size={18} color="#DC3545" />
              )}
              <Text style={styles.cancelButtonText}>
                {isSubmittingBatal ? 'Membatalkan…' : 'Batalkan Penarikan'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /** Form penarikan baru */
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
            <InfoRow label="Nomor Rekening" value={selectedAccount.no_tabungan} badge />
            <InfoRow
              label="Saldo Tersedia"
              value={formatCurrency(selectedAccount.saldo_akhir)}
              valueStyle={styles.saldoValue}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="wallet-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Tidak ada rekening tersedia.</Text>
        </View>
      )}

      {selectedAccount && (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            {/* Nominal */}
            <Text style={styles.sectionLabel}>Nominal Penarikan</Text>
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
              * Minimal {formatCurrency(PENARIKAN_MIN)} · Maksimal {formatCurrency(PENARIKAN_MAX)}
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

            {/* Bank */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Bank Tujuan *</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setIsBankSelectorVisible(true)}
            >
              <Text style={[styles.selectBoxText, !selectedBank && { color: '#999' }]}>
                {selectedBank || 'Pilih bank...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Nama Bank *</Text>
            <TextInput
              style={styles.fieldInput}
              value={namaBank}
              onChangeText={setNamaBank}
              placeholder="Contoh: BRI Unit Kota"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Nama Nasabah Penerima *</Text>
            <TextInput
              style={styles.fieldInput}
              value={namaNasabah}
              onChangeText={setNamaNasabah}
              placeholder="Nama sesuai rekening tujuan"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Referensi Penarikan</Text>
            <TextInput
              style={styles.fieldInput}
              value={referensiPenarikan}
              onChangeText={setReferensiPenarikan}
              placeholder="Opsional, maks. 100 karakter"
              placeholderTextColor="#999"
              maxLength={100}
            />

            <Text style={styles.fieldLabel}>Catatan</Text>
            <TextInput
              style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
              value={catatanPengguna}
              onChangeText={setCatatanPengguna}
              placeholder="Catatan tambahan (opsional)"
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[styles.submitButton, (!nominal || isSubmitting) && styles.buttonDisabled]}
              onPress={handleSubmitPenarikan}
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
                    <Ionicons name="arrow-up-circle-outline" size={18} color="#FFF" />
                    <Text style={[styles.actionButtonText, { marginLeft: 8 }]}>
                      Ajukan Penarikan
                    </Text>
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Penarikan Simpanan</Text>
            <Text style={styles.headerSubtitle}>Transfer ke rekening bank Anda</Text>
          </View>

          {/* Konten */}
          <View style={styles.content}>
            {isLoading ? (
              renderSkeleton()
            ) : activePenarikan ? (
              renderActivePenarikan()
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

      {/* Modal pilih bank */}
      <Modal
        visible={isBankSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBankSelectorVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsBankSelectorVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pilih Bank</Text>
                  <TouchableOpacity onPress={() => setIsBankSelectorVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.accountList}>
                  {BANK_OPTIONS.map((bank) => (
                    <TouchableOpacity
                      key={bank}
                      style={[
                        styles.accountItem,
                        selectedBank === bank && styles.accountItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedBank(bank);
                        setIsBankSelectorVisible(false);
                      }}
                    >
                      <Text style={[styles.accountName, { flex: 1 }]}>{bank}</Text>
                      {selectedBank === bank && (
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
    </SafeAreaView>
  );
}

// ─── Komponen helper ──────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  badge,
  valueStyle,
}: {
  label: string;
  value: string;
  badge?: boolean;
  valueStyle?: object;
}) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text
        style={[
          infoRowStyles.value,
          badge && infoRowStyles.badge,
          valueStyle,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: { fontSize: 13, color: '#666666', flex: 1 },
  value: { fontSize: 13, color: '#333333', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  badge: {
    backgroundColor: '#E7F7ED',
    color: '#28A745',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  headerContainer: {
    backgroundColor: '#1F7900',
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  content: { padding: 16, marginTop: -16 },

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
  saldoValue: { fontSize: 17, color: '#1F7900', fontWeight: '700' },

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
  noteText: { fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 6 },

  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 4,
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

  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  selectBoxText: { fontSize: 14, color: '#333' },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 8 },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },

  submitButton: { marginTop: 20, borderRadius: 8, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.5 },
  gradientButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: { borderRadius: 8, overflow: 'hidden' },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

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
    marginTop: 12,
    backgroundColor: '#FFF5F5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC3545',
  },

  // Status cards
  statusCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  statusTitleWarning: { fontSize: 16, fontWeight: '700', color: '#DC6C00', marginLeft: 8 },
  statusTitleDanger: { fontSize: 16, fontWeight: '700', color: '#DC3545', marginLeft: 8 },
  statusTitleSuccess: { fontSize: 16, fontWeight: '700', color: '#1F7900', marginLeft: 8 },
  infoNote: { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 4, paddingTop: 4 },

  catatanBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  catatanLabel: { fontSize: 12, fontWeight: '700', color: '#856404', marginBottom: 4 },
  catatanText: { fontSize: 13, color: '#856404' },

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
});
