import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

interface DetailAngsuran {
  info_pinjaman: {
    no_pinjaman: string;
    nama_nasabah: string;
    produk_pinjaman: string;
    jumlah_pinjaman: string;
    jangka_waktu: number;
    tanggal_pinjaman: string;
    bunga_per_tahun: string;
    status_pinjaman: string;
    rate_denda: string;
  };
  detail_angsuran: Array<{
    periode: number;
    pokok: number;
    bunga: number;
    total_angsuran: number;
    sisa_pokok: number;
    tanggal_jatuh_tempo: string;
    countdown: string;
    status_pembayaran: string;
    tanggal_pembayaran: string | null;
    denda: number;
    hari_terlambat: number;
    total_tagihan: number;
  }>;
}

export default function DetailAngsuran() {
  const params = useLocalSearchParams();
  const detailData: DetailAngsuran = JSON.parse(params.detailData as string);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Detail Pinjaman</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>No. Pinjaman</Text>
                <Text style={styles.value}>{detailData.info_pinjaman.no_pinjaman}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nama Nasabah</Text>
                <Text style={styles.value}>{detailData.info_pinjaman.nama_nasabah}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Produk</Text>
                <Text style={styles.value}>{detailData.info_pinjaman.produk_pinjaman}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Jumlah Pinjaman</Text>
                <Text style={styles.value}>{formatCurrency(detailData.info_pinjaman.jumlah_pinjaman)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Jangka Waktu</Text>
                <Text style={styles.value}>{detailData.info_pinjaman.jangka_waktu} Bulan</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Tanggal Pinjaman</Text>
                <Text style={styles.value}>{formatDate(detailData.info_pinjaman.tanggal_pinjaman)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Bunga per Tahun</Text>
                <Text style={styles.value}>{detailData.info_pinjaman.bunga_per_tahun}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Riwayat Angsuran</Text>
          {detailData.detail_angsuran.map((angsuran, index) => (
            <View key={index} style={styles.angsuranCard}>
              <View style={styles.angsuranHeader}>
                <Text style={styles.periodeText}>Angsuran ke-{angsuran.periode}</Text>
                <Text style={[
                  styles.statusText,
                  { color: angsuran.status_pembayaran === 'LUNAS' ? '#4CAF50' : '#FF9800' }
                ]}>
                  {angsuran.status_pembayaran}
                </Text>
              </View>
              
              <View style={styles.angsuranDetails}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Pokok</Text>
                  <Text style={styles.value}>{formatCurrency(angsuran.pokok.toString())}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Bunga</Text>
                  <Text style={styles.value}>{formatCurrency(angsuran.bunga.toString())}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Total Angsuran</Text>
                  <Text style={styles.value}>{formatCurrency(angsuran.total_angsuran.toString())}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Jatuh Tempo</Text>
                  <Text style={styles.value}>{formatDate(angsuran.tanggal_jatuh_tempo)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.countdownText}>{angsuran.countdown}</Text>
                </View>
                {angsuran.denda > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Denda</Text>
                    <Text style={[styles.value, styles.dendaText]}>
                      {formatCurrency(angsuran.denda.toString())}
                    </Text>
                  </View>
                )}
                {angsuran.tanggal_pembayaran && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Tanggal Pembayaran</Text>
                    <Text style={styles.value}>{formatDate(angsuran.tanggal_pembayaran)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  angsuranCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  angsuranHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  periodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  angsuranDetails: {
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
  countdownText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  dendaText: {
    color: '#FF0000',
    fontWeight: '600',
  },
});
