import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Share, ScrollView, Linking, Alert, Clipboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

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
    try {
      await Share.share({
        message: `Invoice Setoran Tabungan\nNomor Rekening: ${params.noRekening}\nTotal: ${formatCurrency(params.nominal as string)}`,
        title: 'Invoice Setoran Tabungan'
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
            <Text style={styles.invoiceTitle}>Invoice Setoran</Text>
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
              <Text style={styles.label}>Total Setoran</Text>
              <Text style={styles.amount}>
                {formatCurrency(params.nominal as string)}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {params.paymentChannel === 'cash' ? (
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Petunjuk Setoran:</Text>
                <Text style={styles.instructionText}>
                  <Text style={styles.highlight}>Silakan datang ke kantor</Text>
                  <Text style={styles.normalText}> Koperasi Sinara Artha pada jam kerja yaitu:</Text>
                  {'\n'}
                  <Text style={styles.scheduleText}>Senin-Sabtu, pk 08.00 s/d 16.00</Text>
                  {'\n\n'}
                  <Text style={styles.importantText}>Tunjukkan invoice ini saat melakukan setoran.</Text>
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
                  <Text style={styles.confirmationText}>Setelah melakukan setoran, mohon konfirmasi melalui WhatsApp di nomor berikut ini.
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
                        const message = `Konfirmasi Setoran Tabungan\n\nNo. Rekening: ${params.noRekening}\nProduk: ${params.produk}\nTotal: ${formatCurrency(params.nominal as string)}\n\nTerima kasih.`;
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
            <Ionicons name="download-outline" size={24} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Mengunduh...' : 'Unduh Invoice'}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
    backgroundColor: '#0066AE',
    backgroundImage: 'linear-gradient(to bottom, #0066AE, #ff9900)',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    marginTop: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
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
});
