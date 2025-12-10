import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConfigStore } from "../lib/stores/config";

export default function RootLayout() {
  const initiateConfig = useConfigStore((s) => s.initiateConfig);
  const isInitializing = useConfigStore((s) => s.isInitializing);

  useEffect(() => {
    initiateConfig();
  }, [initiateConfig]);

  if (isInitializing) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}