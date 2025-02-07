import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function QRISScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'QRIS',
          headerStyle: {
            backgroundColor: '#0066AE',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <View style={styles.content}>
        <View style={styles.qrContainer}>
          <Ionicons name="qr-code" size={200} color="#0066AE" />
          <Text style={styles.scanText}>Scan QRIS untuk melakukan pembayaran</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons name="scan" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time" size={24} color="#0066AE" style={styles.buttonIcon} />
            <Text style={styles.historyButtonText}>Riwayat Transaksi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scanText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  scanButton: {
    backgroundColor: '#0066AE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  historyButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066AE',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyButtonText: {
    color: '#0066AE',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
});
