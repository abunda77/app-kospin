import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack } from 'expo-router';
import { useRef } from 'react';

export default function Belanja() {
  const webViewRef = useRef<WebView>(null);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Belanja',
          headerTitleAlign: 'center',
        }} 
      />
      <WebView 
        ref={webViewRef}
        source={{ uri: 'https://pos.kospinsinaraartha.co.id' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        pullToRefreshEnabled={true}
       
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
}); 
