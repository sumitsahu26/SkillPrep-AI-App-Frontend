import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { apiRequest } from "../services/api";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      router.replace("/login");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-50 dark:bg-[#08090d]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {/* Header */}

          <Pressable onPress={() => router.back()} className="mb-8">
            <Text className="text-sm font-medium text-violet-400">
              ← Back to login
            </Text>
          </Pressable>

          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-600">
              <Text className="text-2xl font-bold text-zinc-900 dark:text-white">S</Text>
            </View>

            <Text className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
              Create your account
            </Text>

            <Text className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-500">
              Start your interview preparation journey
            </Text>
          </View>

          {/* Form */}

          <View className="mt-8">
            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Full name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#71717a"
              autoCapitalize="words"
              className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218] px-4 py-4 text-base text-zinc-900 dark:text-white"
            />

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-300">
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218] px-4 py-4 text-base text-zinc-900 dark:text-white"
            />

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-300">
              Password
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#71717a"
              secureTextEntry
              className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218] px-4 py-4 text-base text-zinc-900 dark:text-white"
            />

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-300">
              Confirm password
            </Text>

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#71717a"
              secureTextEntry
              className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218] px-4 py-4 text-base text-zinc-900 dark:text-white"
            />

            {error ? (
              <Text className="mt-4 text-sm text-red-400">{error}</Text>
            ) : null}

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              className={`mt-6 items-center rounded-xl bg-violet-600 py-4 ${
                loading ? "opacity-60" : ""
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                  Create account
                </Text>
              )}
            </Pressable>

            <View className="mt-7 flex-row justify-center">
              <Text className="text-sm text-zinc-600 dark:text-zinc-500">
                Already have an account?{" "}
              </Text>

              <Pressable onPress={() => router.replace("/login")}>
                <Text className="text-sm font-semibold text-violet-400">
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}