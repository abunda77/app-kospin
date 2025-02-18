import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const paymentChannels = [
  { id: 'cash', name: 'Tunai', icon: 'cash-outline' },
  { id: 'bank', name: 'Transfer Bank (Manual)', icon: 'card-outline' },
//   { id: 'va', name: 'Virtual Account', icon: 'wallet-outline' },
//   { id: 'qris', name: 'QRIS', icon: 'qr-code-outline' },
//   { id: 'retail', name: 'Indomaret/Alfamart', icon: 'storefront-outline' },
];

export default function Pembayaran() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedChannel, setSelectedChannel] = useState('');

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const handlePayment = () => {
    if (!selectedChannel) return;
    
    router.push({
      pathname: '/kredit/thank-you',
      params: {
        noPinjaman: params.noPinjaman,
        totalTagihan: params.totalTagihan,
        periode: params.periode,
        paymentChannel: selectedChannel
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nomor Pinjaman</Text>
              <Text style={styles.summaryValue}>{params.noPinjaman}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Angsuran ke-</Text>
              <Text style={styles.summaryValue}>{params.periode}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Pembayaran</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(params.totalTagihan as string)}
              </Text>
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
          onPress={handlePayment}
          disabled={!selectedChannel}
        >
          <Text style={styles.payButtonText}>Lanjutkan Pembayaran</Text>
        </TouchableOpacity>
      </View>
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
});
