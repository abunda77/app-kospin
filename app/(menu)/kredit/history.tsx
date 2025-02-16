import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

interface PaymentHistoryData {
  info_pinjaman: {
    no_pinjaman: string;
    nama_nasabah: string;
    produk_pinjaman: string;
    jumlah_pinjaman: string;
    tanggal_pinjaman: string;
    status_pinjaman: string;
  };
  pembayaran: {
    transaksi: Array<{
      angsuran_ke: number;
      tanggal_pembayaran: string;
      angsuran_pokok: string;
      angsuran_bunga: string;
      denda: string;
      total_pembayaran: string;
      status_pembayaran: string;
      hari_terlambat: number;
    }>;
    summary: {
      total_pokok: number;
      total_bunga: number;
      total_denda: number;
      total_pembayaran: number;
    };
  };
}

export function PaymentHistory() {
  const params = useLocalSearchParams();
  const historyData: PaymentHistoryData = params.historyData ? JSON.parse(params.historyData as string) : null;

  const formatCurrency = (amount: string | number) => {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lunas':
        return '#28A745';
      case 'belum lunas':
        return '#FFC107';
      case 'terlambat':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  if (!historyData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'History Pembayaran',
            headerTitleAlign: 'center',
          }}
        />
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Data tidak tersedia</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'History Pembayaran',
          headerTitleAlign: 'center',
        }}
      />
      <ScrollView>
        <View style={styles.content}>
          {/* Loan Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Informasi Pinjaman</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>No. Pinjaman</Text>
                <Text style={styles.value}>{historyData.info_pinjaman.no_pinjaman}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nama</Text>
                <Text style={styles.value}>{historyData.info_pinjaman.nama_nasabah}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Produk</Text>
                <Text style={styles.value}>{historyData.info_pinjaman.produk_pinjaman}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Jumlah Pinjaman</Text>
                <Text style={styles.valueHighlight}>
                  {formatCurrency(historyData.info_pinjaman.jumlah_pinjaman)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status</Text>
                <Text style={[
                  styles.value,
                  { color: getStatusColor(historyData.info_pinjaman.status_pinjaman) }
                ]}>
                  {historyData.info_pinjaman.status_pinjaman.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment History */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Riwayat Pembayaran</Text>
            </View>
            <View style={styles.cardBody}>
              {historyData.pembayaran.transaksi.map((payment, index) => (
                <View key={index} style={styles.paymentItem}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.angsuranKe}>Angsuran ke-{payment.angsuran_ke}</Text>
                    <Text style={styles.paymentDate}>{formatDate(payment.tanggal_pembayaran)}</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pokok</Text>
                      <Text style={styles.detailValue}>{formatCurrency(payment.angsuran_pokok)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Bunga</Text>
                      <Text style={styles.detailValue}>{formatCurrency(payment.angsuran_bunga)}</Text>
                    </View>
                    {Number(payment.denda) > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Denda</Text>
                        <Text style={[styles.detailValue, styles.dendaText]}>
                          {formatCurrency(payment.denda)}
                        </Text>
                      </View>
                    )}
                    {payment.hari_terlambat > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Keterlambatan</Text>
                        <Text style={[styles.detailValue, styles.dendaText]}>
                          {payment.hari_terlambat} hari
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total</Text>
                      <Text style={styles.totalValue}>{formatCurrency(payment.total_pembayaran)}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(payment.status_pembayaran) }
                      ]}>
                        {payment.status_pembayaran.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Ringkasan Pembayaran</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Pokok</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(historyData.pembayaran.summary.total_pokok)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Bunga</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(historyData.pembayaran.summary.total_bunga)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Denda</Text>
                <Text style={[styles.summaryValue, styles.dendaText]}>
                  {formatCurrency(historyData.pembayaran.summary.total_denda)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={styles.grandTotal}>
                  {formatCurrency(historyData.pembayaran.summary.total_pembayaran)}
                </Text>
              </View>
            </View>
          </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
  valueHighlight: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: '600',
  },
  paymentItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  angsuranKe: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666666',
  },
  paymentDetails: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  dendaText: {
    color: '#DC3545',
  },
  totalValue: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  grandTotal: {
    fontSize: 18,
    color: '#0066AE',
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default PaymentHistory;
