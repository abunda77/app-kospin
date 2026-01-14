import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    console.log('RootLayout mounted');
    console.log('Fonts loaded:', loaded);
    console.log('Font error:', fontError);

    async function prepare() {
      try {
        console.log('Starting app preparation...');

        // Wait for fonts to load
        if (loaded || fontError) {
          console.log('Fonts ready, hiding splash screen');
          await SplashScreen.hideAsync();
          setAppReady(true);
          console.log('App ready!');
        }
      } catch (e) {
        console.error('Error during app preparation:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
        // Hide splash screen even on error to show error message
        await SplashScreen.hideAsync();
        setAppReady(true);
      }
    }

    prepare();
  }, [loaded, fontError]);

  // Show error if fonts failed to load
  if (error || fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 18, marginBottom: 10 }}>Error Loading App</Text>
        <Text style={{ color: '#666' }}>{error || fontError?.message || 'Unknown error'}</Text>
      </View>
    );
  }

  // Keep showing null until app is ready
  if (!appReady) {
    console.log('App not ready yet, returning null');
    return null;
  }

  console.log('Rendering main app layout');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(menu)"
          options={{
            headerShown: true,
            headerTitle: ''
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
