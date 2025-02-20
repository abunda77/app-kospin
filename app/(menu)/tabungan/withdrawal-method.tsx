import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Add constants for transfer fees
const TRANSFER_FEES = {
  bank: 2500,
  ewallet: 1000,
  cash: 0
};

type TransferFormData = {
  nama: string;
  bank?: string;
  noRekening?: string;
  eWallet?: string;
  noWallet?: string;
};

export default function WithdrawalMethod() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    nama: '',
    bank: '',
    noRekening: '',
    eWallet: '',
    noWallet: ''
  });

  // Calculate final amount after fees
  const calculatedAmount = useMemo(() => {
    const nominal = Number(params.nominal);
    const fee = TRANSFER_FEES[selectedMethod as keyof typeof TRANSFER_FEES] || 0;
    return {
      originalAmount: nominal,
      fee: fee,
      finalAmount: nominal - fee
    };
  }, [selectedMethod, params.nominal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setIsFormExpanded(method !== 'cash');
  };

  const validateForm = () => {
    if (selectedMethod === 'bank') {
      if (!formData.nama || !formData.bank || !formData.noRekening) {
        Alert.alert('Error', 'Mohon lengkapi semua data transfer bank');
        return false;
      }
    } else if (selectedMethod === 'ewallet') {
      if (!formData.nama || !formData.eWallet || !formData.noWallet) {
        Alert.alert('Error', 'Mohon lengkapi semua data e-wallet');
        return false;
      }
    }
    return true;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;

    const detailMessage = selectedMethod === 'bank' 
      ? `Bank: ${formData.bank}\nNo. Rekening: ${formData.noRekening}\nNama: ${formData.nama}`
      : selectedMethod === 'ewallet'
      ? `E-Wallet: ${formData.eWallet}\nNo. Wallet: ${formData.noWallet}\nNama: ${formData.nama}`
      : 'Penarikan Tunai';

    Alert.alert(
      'Konfirmasi Penarikan',
      `Metode: ${selectedMethod === 'cash' ? 'Tunai' : selectedMethod === 'bank' ? 'Transfer Bank' : 'E-Wallet'}\n${detailMessage}\n\nNominal: ${formatCurrency(calculatedAmount.originalAmount)}\nBiaya: ${formatCurrency(calculatedAmount.fee)}\nJumlah Diterima: ${formatCurrency(calculatedAmount.finalAmount)}`,
      [
        { 
          text: 'Batal', 
          style: 'cancel' 
        },
        { 
          text: 'Konfirmasi', 
          onPress: () => {
            router.push({
              pathname: '/(menu)/tabungan/withdrawal-thank-you',
              params: {
                noRekening: params.noRekening,
                produk: params.produk,
                nominal: params.nominal,
                withdrawalMethod: selectedMethod,
                paymentChannel: selectedMethod,
                fee: calculatedAmount.fee,
                finalAmount: calculatedAmount.finalAmount,
                ...formData
              }
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Pilih Metode Penarikan</Text>
          
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'cash' && styles.selectedCard]}
            onPress={() => handleMethodSelect('cash')}
          >
            <Ionicons name="cash-outline" size={24} color={selectedMethod === 'cash' ? '#0066AE' : '#666'} />
            <Text style={[styles.methodText, selectedMethod === 'cash' && styles.selectedText]}>Ambil Tunai</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'bank' && styles.selectedCard]}
            onPress={() => handleMethodSelect('bank')}
          >
            <Ionicons name="business-outline" size={24} color={selectedMethod === 'bank' ? '#0066AE' : '#666'} />
            <Text style={[styles.methodText, selectedMethod === 'bank' && styles.selectedText]}>Transfer Bank</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'ewallet' && styles.selectedCard]}
            onPress={() => handleMethodSelect('ewallet')}
          >
            <Ionicons name="wallet-outline" size={24} color={selectedMethod === 'ewallet' ? '#0066AE' : '#666'} />
            <Text style={[styles.methodText, selectedMethod === 'ewallet' && styles.selectedText]}>E-Wallet</Text>
          </TouchableOpacity>

          {isFormExpanded && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {selectedMethod === 'bank' ? 'Data Transfer Bank' : 'Data E-Wallet'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nama Penerima"
                value={formData.nama}
                onChangeText={(text) => setFormData({...formData, nama: text})}
              />

              {selectedMethod === 'bank' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Bank"
                    value={formData.bank}
                    onChangeText={(text) => setFormData({...formData, bank: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nomor Rekening"
                    value={formData.noRekening}
                    onChangeText={(text) => setFormData({...formData, noRekening: text})}
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama E-Wallet"
                    value={formData.eWallet}
                    onChangeText={(text) => setFormData({...formData, eWallet: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nomor E-Wallet"
                    value={formData.noWallet}
                    onChangeText={(text) => setFormData({...formData, noWallet: text})}
                    keyboardType="numeric"
                  />
                </>
              )}
            </View>
          )}

          {selectedMethod && selectedMethod !== 'cash' && (
            <View style={styles.feeInfoContainer}>
              <Text style={styles.feeInfoTitle}>Rincian Biaya:</Text>
              <View style={styles.feeInfoRow}>
                <Text style={styles.feeLabel}>Nominal Penarikan</Text>
                <Text style={styles.feeValue}>{formatCurrency(calculatedAmount.originalAmount)}</Text>
              </View>
              <View style={styles.feeInfoRow}>
                <Text style={styles.feeLabel}>Biaya Transfer</Text>
                <Text style={styles.feeValue}>{formatCurrency(calculatedAmount.fee)}</Text>
              </View>
              <View style={[styles.feeInfoRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Jumlah Diterima</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculatedAmount.finalAmount)}</Text>
              </View>
            </View>
          )}

          {selectedMethod && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleFormSubmit}
            >
              <LinearGradient
                colors={['#0066AE', '#0095FF']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitButtonText}>Lanjutkan</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#E8F0FE',
    borderColor: '#0066AE',
    borderWidth: 1,
  },
  methodText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#666',
  },
  selectedText: {
    color: '#0066AE',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feeInfoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  feeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  feeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0066AE',
  },
});
