import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack } from 'expo-router';

export default function Belanja() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Belanja',
          headerTitleAlign: 'center',
        }} 
      />
      <WebView 
        source={{ uri: 'https://pos.kospinsinaraartha.co.id' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
}); 