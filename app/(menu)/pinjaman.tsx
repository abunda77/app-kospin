import { View, Text, StyleSheet } from 'react-native';

export default function Pinjaman() {
  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Halaman Pinjaman</Text>
      </View> */}
      <View style={styles.content}>
        <Text style={styles.contentText}>Konten Pinjaman</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 40,
    marginTop: 0,
    backgroundColor: '#0066AE',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
  },
});
