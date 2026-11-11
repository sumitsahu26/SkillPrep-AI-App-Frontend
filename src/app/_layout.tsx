import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ThemeProvider,
  useTheme,
} from "../context/ThemeContext";

import { AuthProvider, useAuth } from "../context/AuthContext";

function AppLayout() {
  const { theme } = useTheme();
  const { isLoading } = useAuth();

  const isDark = theme === "dark";

  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#08090d" : "#ffffff",
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}