import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import "../globals.css";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this
          starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{" "}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/* Tambahan elemen untuk test Tailwind CSS */}
      <ThemedView className="mt-8 p-4">
        {/* Test Font */}
        <ThemedText className="font-bold text-2xl mb-4">
          Ini Font Bold
        </ThemedText>
        <ThemedText className="font-light text-lg italic mb-6">
          Ini Font Light Italic
        </ThemedText>

        {/* Test Grid */}
        <ThemedView className="grid grid-cols-2 gap-4 mb-6">
          <ThemedView className="bg-blue-500 p-4 rounded">
            <ThemedText className="text-white">Grid Item 1</ThemedText>
          </ThemedView>
          <ThemedView className="bg-green-500 p-4 rounded">
            <ThemedText className="text-white">Grid Item 2</ThemedText>
          </ThemedView>
          <ThemedView className="bg-yellow-500 p-4 rounded">
            <ThemedText className="text-black">Grid Item 3</ThemedText>
          </ThemedView>
          <ThemedView className="bg-red-500 p-4 rounded">
            <ThemedText className="text-white">Grid Item 4</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Test Buttons */}
        <ThemedView className="flex flex-row gap-4">
          <ThemedView className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800">
            <ThemedText className="text-white font-medium">
              Tombol Primary
            </ThemedText>
          </ThemedView>
          <ThemedView className="border-2 border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">
            <ThemedText className="font-medium">Tombol Secondary</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
