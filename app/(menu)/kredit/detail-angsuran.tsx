import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';

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
  const router = useRouter();
  const detailData: DetailAngsuran = JSON.parse(params.detailData as string);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedAngsuran, setSelectedAngsuran] = useState<any>(null);

  const handlePaymentConfirmation = (angsuran: any) => {
    setSelectedAngsuran(angsuran);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmPayment = () => {
    setIsConfirmModalVisible(false);
    router.push({
      pathname: '/(menu)/kredit/pembayaran',
      params: { 
        noPinjaman: detailData.info_pinjaman.no_pinjaman,
        totalTagihan: selectedAngsuran.total_tagihan.toString()
      }
    });
  };

  const canPayInstallment = (currentPeriode: number) => {
    // Jika ini adalah angsuran pertama, boleh dibayar
    if (currentPeriode === 1) return true;
    
    // Cek status pembayaran angsuran sebelumnya
    const previousInstallment = detailData.detail_angsuran.find(
      (angsuran) => angsuran.periode === currentPeriode - 1
    );
    
    // Hanya boleh bayar jika angsuran sebelumnya sudah LUNAS
    return previousInstallment?.status_pembayaran === 'LUNAS';
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
                  styles.statusBadge,
                  angsuran.status_pembayaran === 'LUNAS' 
                    ? styles.statusBadgeSuccess 
                    : styles.statusBadgeDanger
                ]}>
                  {angsuran.status_pembayaran}
                </Text>
              </View>
              
              <View style={styles.angsuranDetails}>
                {/* <View style={styles.infoRow}>
                  <Text style={styles.label}>Pokok</Text>
                  <Text style={styles.value}>{formatCurrency(angsuran.pokok.toString())}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Bunga</Text>
                  <Text style={styles.value}>{formatCurrency(angsuran.bunga.toString())}</Text>
                </View> */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Jumlah Angsuran</Text>
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
                {angsuran.status_pembayaran === 'BELUM BAYAR' && canPayInstallment(angsuran.periode) && (
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => handlePaymentConfirmation({
                      ...angsuran,
                      total_tagihan: angsuran.total_angsuran + angsuran.denda
                    })}
                  >
                    <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                  </TouchableOpacity>
                )}
                {angsuran.status_pembayaran === 'BELUM BAYAR' && !canPayInstallment(angsuran.periode) && (
                  <View style={[styles.payButton, { backgroundColor: '#ccc' }]}>
                    <Text style={styles.payButtonText}>Bayar Angsuran Sebelumnya</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Konfirmasi Pembayaran */}
      <Modal
        visible={isConfirmModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi Pembayaran</Text>
            <Text style={styles.modalText}>Detail Pembayaran:</Text>
            {selectedAngsuran && (
              <>
                <View style={styles.modalDetailRow}>
                  <Text>Total Angsuran:</Text>
                  <Text>{formatCurrency(selectedAngsuran.total_angsuran.toString())}</Text>
                </View>
                {selectedAngsuran.denda > 0 && (
                  <View style={styles.modalDetailRow}>
                    <Text>Denda:</Text>
                    <Text style={styles.dendaText}>{formatCurrency(selectedAngsuran.denda.toString())}</Text>
                  </View>
                )}
                <View style={styles.modalDetailRow}>
                  <Text style={styles.totalText}>Total Pembayaran:</Text>
                  <Text style={styles.totalText}>{formatCurrency(selectedAngsuran.total_tagihan.toString())}</Text>
                </View>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setIsConfirmModalVisible(false);
                  router.push({
                    pathname: '/kredit/pembayaran',
                    params: { 
                      noPinjaman: detailData.info_pinjaman.no_pinjaman,
                      totalTagihan: selectedAngsuran.total_tagihan.toString(),
                      periode: selectedAngsuran.periode.toString()
                    }
                  });
                }}
              >
                <Text style={styles.modalButtonText}>Lanjutkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  payButton: {
    backgroundColor: '#008AF0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#0066AE',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeSuccess: {
    backgroundColor: '#E7F7ED',
    color: '#28a745',
  },
  statusBadgeDanger: {
    backgroundColor: '#FFE9E9',
    color: '#dc3545',
  },
});
