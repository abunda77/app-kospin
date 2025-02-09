import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Pinjaman() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const unsubscribe = () => {
      if (params.from === 'dashboard') {
        router.push('/(tabs)/dashboard');
      }
    };

    return unsubscribe;
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Halaman Pinjaman</Text>
    </View>
  );
}
