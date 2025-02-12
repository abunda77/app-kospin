import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

interface LoginRequiredProps {
  message?: string;
}

export default function LoginRequired({ message = 'Silakan login untuk mengakses halaman ini' }: LoginRequiredProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.containerLoggedOut}>
      <View style={styles.headerLoggedOut}>
        <Text style={styles.titleLoggedOut}>Akses Terbatas</Text>
      </View>
      <View style={styles.contentLoggedOut}>
        <Text style={styles.loginMessage}>{message}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/index')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerLoggedOut: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerLoggedOut: {
    backgroundColor: '#0066AE',
    padding: 40,
    marginTop: 0,
  },
  titleLoggedOut: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },
  contentLoggedOut: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#0066AE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
