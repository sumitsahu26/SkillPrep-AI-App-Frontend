import { Redirect, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<"/login" | "/(tabs)" | null>(
    null
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");

        if (token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }

        setInitialRoute(token ? "/(tabs)" : "/login");
      } catch (error) {
        console.error("Auth initialization error:", error);
        setInitialRoute("/login");
      }
    };

    checkAuth();
  }, []);

  if (!initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#08090d]">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return <Redirect href={initialRoute} />;
}
