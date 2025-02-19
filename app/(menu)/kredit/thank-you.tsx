import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Share, ScrollView, Linking, Alert, Clipboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
// Temporarily removed:
// import { captureRef } from 'react-native-view-shot';
// import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ThankYou() {
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
    // Temporarily simplified download function
    try {
      await Share.share({
        message: `Invoice Pembayaran\nNomor Pinjaman: ${params.noPinjaman}\nTotal: ${params.totalTagihan}`,
        title: 'Invoice Pembayaran'
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
            <Text style={styles.invoiceTitle}>Invoice Pembayaran</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <Text style={styles.label}>Nomor Pinjaman</Text>
              <Text style={styles.value}>{params.noPinjaman}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Angsuran ke-</Text>
              <Text style={styles.value}>{params.periode}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Total Pembayaran</Text>
              <Text style={styles.amount}>
                {formatCurrency(params.totalTagihan as string)}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {params.paymentChannel === 'cash' ? (
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Petunjuk Pembayaran:</Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.highlight}>Silakan datang ke kantor</Text>
                  <Text style={styles.normalText}> Koperasi Sinara Artha pada jam kerja yaitu:</Text>
                  {'\n'}
                  <Text style={styles.scheduleText}>Senin-Sabtu, pk 08.00 s/d 16.00</Text>
                  {'\n\n'}
                  <Text style={styles.importantText}>Tunjukkan invoice ini saat melakukan pembayaran.</Text>
                  {'\n\n'}
                  <Text style={styles.warningText}>Invoice hanya berlaku hari ini.</Text>
                </Text>
              </View>
            ) : (
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Detail Rekening Bank:</Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.fieldLabel}>Bank:</Text>
                  <Text style={styles.fieldValue}> BCA</Text>
                  {'\n'}
                  <Text style={styles.fieldLabel}>Nomor Rekening:</Text>
                  <Text style={styles.fieldValue}> 0889333288</Text>
                  {'\n'}
                  <Text style={styles.fieldLabel}>Nama:</Text>
                  <Text style={styles.fieldValue}> KOPERASI SINARA ARTHA</Text>
                  {'\n\n'}
                  <Text style={styles.confirmationText}>Setelah melakukan pembayaran, mohon konfirmasi melalui WhatsApp di nomor berikut ini.  
                   {'\n\n'}Atau tekan tombol WA di samping.</Text>
                  {'\n'}
                  
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
                        const message = `Konfirmasi Pembayaran Angsuran\n\nNo. Pinjaman: ${params.noPinjaman}\nPeriode: ${params.periode}\nTotal: ${formatCurrency(params.totalTagihan as string)}\n\nTerima kasih.`;
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
                  <Text style={styles.confirmationText}>Terima kasih telah mempercayakan kami di:</Text>
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
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
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
    fontSize: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
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
  fieldLabel: {
    fontWeight: '600',
    color: '#34495E',
    fontSize: 15,
  },
  fieldValue: {
    color: '#2980B9',
    fontWeight: '500',
    fontSize: 15,
  },
  confirmationText: {
    fontWeight: '600',
    color: '#34495E',
    fontSize: 15,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2980B9',
    marginTop: 32,
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',    
    gap: 12,
  },
  whatsappButton: {
    padding: 10,
    marginTop: 24,
  },
});
