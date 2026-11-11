import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loginUser } from "../services/authApi";
import { googleLogin } from "../services/googleAuth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    try {
      setLoading(true);

      await loginUser({
        email: email.trim(),
        password,
      });

      await refreshAuth();

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await googleLogin();

      await refreshAuth();

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Google Login Failed",
        error instanceof Error ? error.message : "Unable to login with Google"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 overflow-hidden bg-[#faf9ff] px-6 pt-20 dark:bg-[#08090d]">
      {/* Decorative Background */}
      <View className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-300/40 dark:bg-violet-700/20" />
      <View className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-violet-200/50 dark:bg-violet-900/20" />
      <View className="absolute -bottom-40 right-[-70px] h-64 w-80 rounded-full bg-violet-100/70 dark:bg-violet-800/10" />

      {/* Header */}
      <View className="mb-14">
        <View className="mb-7 h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30">
          <Text className="text-3xl font-bold text-white">S</Text>
        </View>

        <Text className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Welcome back
        </Text>

        <Text className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Login to continue with SkillPrep AI
        </Text>
      </View>

      {/* Login Form */}
      <View className="gap-6">
        {/* Email */}
        <View>
          <Text className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Email
          </Text>

          <View className="h-16 flex-row items-center rounded-2xl border border-violet-200 bg-white/80 px-4 dark:border-white/10 dark:bg-[#191b29]">
            <Mail size={21} color="#71717a" />

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              importantForAutofill="yes"
              className="ml-3 flex-1 text-base text-zinc-900 dark:text-white"
            />
          </View>
        </View>

        {/* Password */}
        <View>
          <Text className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Password
          </Text>

          <View className="h-16 flex-row items-center rounded-2xl border border-violet-200 bg-white/80 px-4 dark:border-white/10 dark:bg-[#191b29]">
            <Lock size={21} color="#71717a" />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9292a0"
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              textContentType="password"
              importantForAutofill="yes"
              className="ml-3 flex-1 text-base text-zinc-900 dark:text-white"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
            >
              {showPassword ? (
                <EyeOff size={21} color="#9292a0" />
              ) : (
                <Eye size={21} color="#9292a0" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
          className="mt-2 h-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30"
        >
          <Text className="text-lg font-bold text-white">
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Google Login */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.8}
          className="h-16 flex-row items-center justify-center rounded-2xl border border-violet-200 bg-white/70 dark:border-white/15 dark:bg-transparent"
        >
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-white">
            <Text className="text-xl font-extrabold text-[#4285F4]">G</Text>
          </View>

          <Text className="text-base font-semibold text-zinc-900 dark:text-white">
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="mt-10 items-center">
        <Text className="text-xs text-zinc-500 dark:text-zinc-500">
          Your journey to career success starts here.
        </Text>
      </View>
    </View>
  );
}
