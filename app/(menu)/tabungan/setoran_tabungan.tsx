import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const paymentChannels = [
  { id: 'cash', name: 'Tunai', icon: 'cash-outline' },
  { id: 'bank', name: 'Transfer Bank (Manual)', icon: 'card-outline' },
];

const quickAmounts = [
  { value: '10000', label: '10.000' },
  { value: '50000', label: '50.000' },
  { value: '100000', label: '100.000' },
  { value: '200000', label: '200.000' },
  { value: '300000', label: '300.000' },
  { value: '400000', label: '400.000' },
  { value: '500000', label: '500.000' },
  { value: '1000000', label: '1.000.000' },
];

export default function SetoranTabungan() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [nominal, setNominal] = useState('');
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');

  const handleSubmit = () => {
    if (!nominal || parseFloat(nominal) <= 0) {
      Alert.alert('Error', 'Masukkan nominal setoran yang valid');
      return;
    }
    if (parseFloat(nominal) < 50000) {
      Alert.alert('Error', 'Minimal setoran adalah Rp50.000');
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const handleConfirmPayment = () => {
    setIsConfirmModalVisible(false);
    setShowPaymentMethods(true);
  };

  const handlePaymentMethodSelection = () => {
    if (!selectedChannel) return;
    
    router.push({
      pathname: '/tabungan/thank-you',
      params: {
        noRekening: params.noRekening,
        nominal: nominal,
        produk: params.produk,
        paymentChannel: selectedChannel
      }
    });
  };

  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleNominalChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setNominal(numericValue);
  };

  const handleQuickAmountSelect = (amount: string) => {
    setNominal(amount);
  };

  if (showPaymentMethods) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Ringkasan Setoran</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nomor Rekening</Text>
                <Text style={[styles.summaryValue, styles.rekeningBadge]}>{params.noRekening}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Produk</Text>
                <Text style={styles.summaryValue}>{params.produk}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Setoran</Text>
                <Text style={styles.summaryAmount}>Rp {formatNumber(nominal)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
            
            {paymentChannels.map((channel) => (
              <TouchableOpacity
                key={channel.id}
                style={[
                  styles.channelCard,
                  selectedChannel === channel.id && styles.channelCardSelected
                ]}
                onPress={() => setSelectedChannel(channel.id)}
              >
                <Ionicons name={channel.icon as any} size={24} color="#333" />
                <Text style={styles.channelName}>{channel.name}</Text>
                <View style={styles.radioButton}>
                  {selectedChannel === channel.id && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, !selectedChannel && styles.payButtonDisabled]}
            onPress={handlePaymentMethodSelection}
            disabled={!selectedChannel}
          >
            <Text style={styles.payButtonText}>Lanjutkan Pembayaran</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{params.produk}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nomor Rekening</Text>
                  <Text style={[styles.value, styles.rekeningBadge]}>{params.noRekening}</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nominal Setoran</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.input}
                  value={formatNumber(nominal)}
                  onChangeText={handleNominalChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.minimumNote}>*Minimal setoran Rp50.000</Text>

              <Text style={styles.quickAmountLabel}>Pilih Nominal Cepat</Text>
              <View style={styles.quickAmountContainer}>
                {quickAmounts.map((amount, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickAmountButton,
                      nominal === amount.value && styles.quickAmountButtonActive
                    ]}
                    onPress={() => handleQuickAmountSelect(amount.value)}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      nominal === amount.value && styles.quickAmountTextActive
                    ]}>
                      {amount.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !nominal && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!nominal}
            >
              <Text style={styles.submitButtonText}>Lanjutkan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal Konfirmasi Setoran */}
        <Modal
          visible={isConfirmModalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Konfirmasi Setoran</Text>
              <Text style={styles.modalText}>Detail Setoran:</Text>
              
              <View style={styles.modalDetailRow}>
                <Text>Nomor Rekening:</Text>
                <Text>{params.noRekening}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text>Produk:</Text>
                <Text>{params.produk}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.totalText}>Total Setoran:</Text>
                <Text style={styles.totalText}>Rp {formatNumber(nominal)}</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsConfirmModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmPayment}
                >
                  <Text style={styles.modalButtonText}>Lanjutkan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: '#F5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066AE',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  inputContainer: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencyPrefix: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0066AE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
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
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666666',
  },
  summaryValue: {
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066AE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  channelCardSelected: {
    borderColor: '#0066AE',
    borderWidth: 2,
  },
  channelName: {
    flex: 1,
    fontSize: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0066AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066AE',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  payButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAmountLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  quickAmountButton: {
    width: '31%', // Approximately 3 buttons per row with spacing
    marginHorizontal: 4,
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066AE',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: '#0066AE',
    borderColor: '#0066AE',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#0066AE',
    fontWeight: '500',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  rekeningBadge: {
    backgroundColor: '#E7F7ED',
    color: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontWeight: '600',
    overflow: 'hidden',
  },
  minimumNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#FF0000',
    marginTop: 4,
  },
});
