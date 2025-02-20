import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Share, ScrollView, Linking, Alert, Clipboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WithdrawalThankYou() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = async () => {
    try {
      const withdrawalMethod = params.withdrawalMethod === 'cash' 
        ? 'Tunai'
        : params.withdrawalMethod === 'bank' 
        ? 'Transfer Bank'
        : 'E-Wallet';

      let detailMessage = `Invoice Penarikan Tabungan\nNomor Rekening: ${params.noRekening}\nProduk: ${params.produk}\nTotal Penarikan: ${formatCurrency(params.nominal as string)}`;

      if (params.withdrawalMethod !== 'cash') {
        detailMessage += `\nBiaya Transfer: ${formatCurrency(params.fee as string)}\nJumlah Diterima: ${formatCurrency(params.finalAmount as string)}`;
      }

      detailMessage += `\nMetode: ${withdrawalMethod}`;

      if (params.withdrawalMethod === 'bank') {
        detailMessage += `\nBank: ${params.bank}\nNo. Rekening: ${params.noRekening}\nNama: ${params.nama}`;
      } else if (params.withdrawalMethod === 'ewallet') {
        detailMessage += `\nE-Wallet: ${params.eWallet}\nNo. Wallet: ${params.noWallet}\nNama: ${params.nama}`;
      }

      await Share.share({
        message: detailMessage,
        title: 'Invoice Penarikan Tabungan'
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Ionicons name="checkmark-circle" size={64} color="#28a745" />
          <Text style={styles.title}>Terima Kasih</Text>
          
          <View style={styles.invoiceCard} ref={invoiceRef}>
            <Text style={styles.invoiceTitle}>Invoice Penarikan</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <Text style={styles.label}>Nomor Rekening</Text>
              <Text style={styles.value}>{params.noRekening}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Produk</Text>
              <Text style={styles.value}>{params.produk}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Total Penarikan</Text>
              <Text style={styles.amount}>{formatCurrency(params.nominal as string)}</Text>
            </View>

            {params.withdrawalMethod !== 'cash' && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Biaya Transfer</Text>
                  <Text style={styles.feeAmount}>{formatCurrency(params.fee as string)}</Text>
                </View>
                
                <View style={styles.row}>
                  <Text style={styles.label}>Jumlah Diterima</Text>
                  <Text style={styles.finalAmount}>{formatCurrency(params.finalAmount as string)}</Text>
                </View>
              </>
            )}

            <View style={styles.row}>
              <Text style={styles.label}>Metode Penarikan</Text>
              <Text style={styles.value}>
                {params.withdrawalMethod === 'cash' 
                  ? 'Tunai'
                  : params.withdrawalMethod === 'bank' 
                  ? 'Transfer Bank'
                  : 'E-Wallet'}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {params.withdrawalMethod === 'cash' ? (
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Petunjuk Penarikan:</Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.highlight}>Silakan datang ke kantor</Text>
                  <Text style={styles.normalText}> Koperasi Sinara Artha pada jam kerja yaitu:</Text>
                  {'\n'}
                  <Text style={styles.scheduleText}>Senin-Sabtu, pk 08.00 s/d 16.00</Text>
                  {'\n\n'}
                  <Text style={styles.importantText}>Tunjukkan invoice ini saat melakukan penarikan.</Text>
                  {'\n\n'}
                  <Text style={styles.warningText}>Invoice hanya berlaku hari ini.</Text>
                </Text>
              </View>
            ) : (
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Detail Penarikan:</Text>
                <Text style={styles.instructionText}>
                  {params.withdrawalMethod === 'bank' ? (
                    <>
                      <Text style={styles.fieldLabel}>Bank:</Text>
                      <Text style={styles.fieldValue}> {params.bank}</Text>
                      {'\n'}
                      <Text style={styles.fieldLabel}>Nomor Rekening:</Text>
                      <Text style={styles.fieldValue}> {params.noRekening}</Text>
                      {'\n'}
                      <Text style={styles.fieldLabel}>Nama:</Text>
                      <Text style={styles.fieldValue}> {params.nama}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.fieldLabel}>E-Wallet:</Text>
                      <Text style={styles.fieldValue}> {params.eWallet}</Text>
                      {'\n'}
                      <Text style={styles.fieldLabel}>Nomor:</Text>
                      <Text style={styles.fieldValue}> {params.noWallet}</Text>
                      {'\n'}
                      <Text style={styles.fieldLabel}>Nama:</Text>
                      <Text style={styles.fieldValue}> {params.nama}</Text>
                    </>
                  )}
                  {'\n\n'}
                  <Text style={styles.confirmationText}>
                    Penarikan akan diproses dalam 1x24 jam kerja. Mohon konfirmasi melalui WhatsApp di nomor berikut ini.
                  </Text>
                  {'\n\n'}
                  <View style={styles.whatsappContainer}>
                    <TouchableOpacity 
                      onPress={() => {
                        Clipboard.setString('6287778715788');
                        Alert.alert('Berhasil', 'Nomor telepon berhasil disalin');
                      }}
                    >
                      <Text style={[styles.phoneNumber, { textDecorationLine: 'underline' }]}>
                        +62 877-7871-5788
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.whatsappButton}
                      onPress={() => {
                        const method = params.withdrawalMethod === 'bank' 
                          ? `Transfer Bank\nBank: ${params.bank}\nNo. Rekening: ${params.noRekening}\nNama: ${params.nama}`
                          : `E-Wallet\n${params.eWallet}\nNo: ${params.noWallet}\nNama: ${params.nama}`;
                        
                        const message = `Konfirmasi Penarikan Tabungan\n\nNo. Rekening: ${params.noRekening}\nProduk: ${params.produk}\nTotal: ${formatCurrency(params.nominal as string)}\nMetode: ${method}\n\nTerima kasih.`;
                        const url = `whatsapp://send?phone=6287778715788&text=${encodeURIComponent(message)}`;
                        Linking.openURL(url).catch(err => {
                          Alert.alert('Error', 'Pastikan WhatsApp sudah terinstall di perangkat Anda');
                        });
                      }}
                    >
                      <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                    </TouchableOpacity>
                  </View>
                  {'\n\n'}
                  <Text style={styles.warningText}>Invoice hanya berlaku hari ini.</Text>
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadInvoice}
            disabled={isDownloading}
          >
            <LinearGradient
              colors={['#0066AE', '#0095FF']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>
                  {isDownloading ? 'Mengunduh...' : 'Unduh Invoice'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.backButtonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#666666',
  },
  value: {
    fontWeight: '500',
  },
  amount: {
    fontWeight: 'bold',
    color: '#0066AE',
  },
  instructions: {
    marginTop: 16,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2C3E50',
  },
  instructionText: {
    lineHeight: 22,
    color: '#333333',
  },
  highlight: {
    fontWeight: '600',
    color: '#34495E',
  },
  normalText: {
    color: '#4A5568',
  },
  scheduleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2980B9',
    marginTop: 4,
  },
  importantText: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  warningText: {
    fontWeight: '600',
    color: '#E74C3C',
    marginTop: 8,
  },
  downloadButton: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  backButton: {
    width: '100%',
    marginVertical: 16,
    alignItems: 'center',
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButtonText: {
    color: '#0066AE',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#0066AE',
    fontWeight: '500',
  },
  whatsappButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  fieldLabel: {
    fontWeight: '600',
    color: '#666666',
  },
  fieldValue: {
    color: '#333333',
    fontWeight: '500',
  },
  confirmationText: {
    color: '#666666',
    lineHeight: 20,
  },
  feeAmount: {
    fontWeight: '500',
    color: '#DC3545', // Red color for fees
  },
  finalAmount: {
    fontWeight: 'bold',
    color: '#28a745', // Green color for final amount
  },
});
