import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Skeleton from '../../components/Skeleton';

export default function BannerDetail() {
  const { note, imageUrl } = useLocalSearchParams();
  const { width: windowWidth } = useWindowDimensions();
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={[styles.imageContainer, { width: windowWidth - 32 }]}>
            {imageLoading && (
              <View style={[styles.skeletonContainer, { width: windowWidth - 32 }]}>
                <Skeleton width="100%" height={200} />
              </View>
            )}
            <Image
              source={{ uri: imageUrl as string }}
              style={[
                styles.bannerImage,
                imageLoading && styles.hiddenImage
              ]}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoad={() => setImageLoading(false)}
            />
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Catatan Banner:</Text>
            <Text style={styles.noteText}>
              {note ? note : 'Tidak ada catatan untuk banner ini'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    // Shadow untuk Android
    elevation: 5,
    // Shadow untuk iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  hiddenImage: {
    opacity: 0,
  },
  noteContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
  },
});
