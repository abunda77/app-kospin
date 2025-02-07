import { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';

// Mencegah splash screen otomatis hilang
// SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const [isReady, setIsReady] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    if (isReady) {
      return {
        opacity: withSequence(
          withTiming(1, { duration: 1000 }),
          withDelay(1000, withTiming(0, { duration: 500 }, () => {
            runOnJS(() => {
              if (Platform.OS === 'web') {
                router.replace('/(tabs)');
              } else {
                router.replace('/(tabs)');
              }
            })();
          }))
        ),
      };
    }
    return { opacity: 0 };
  }, [isReady]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require('../assets/images/logo_mobile_300.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
