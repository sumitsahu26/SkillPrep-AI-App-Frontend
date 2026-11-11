import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { changePassword } from "@/services/authApi";

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Invalid Password", "Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Invalid Password", "New password must be different.");
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword(
        currentPassword,
        newPassword
      );

      Alert.alert(
        "Success",
        response.message || "Password changed successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    setVisible: (value: boolean) => void
  ) => (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </Text>

      <View className="flex-row items-center rounded-xl border border-zinc-200 bg-white px-4 dark:border-white/10 dark:bg-[#15151f]">
        <LockKeyhole size={18} color="#8b5cf6" />

        <TextInput
          value={value}
          onChangeText={setValue}
          secureTextEntry={!visible}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
          autoCapitalize="none"
          autoCorrect={false}
          className="h-14 flex-1 px-3 text-sm text-zinc-900 dark:text-white"
        />

        <TouchableOpacity onPress={() => setVisible(!visible)}>
          {visible ? (
            <EyeOff size={19} color="#a1a1aa" />
          ) : (
            <Eye size={19} color="#a1a1aa" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={20} color="#8b5cf6" />
          </TouchableOpacity>

          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <LockKeyhole size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Change Password
            </Text>
            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Keep your account secure
            </Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        <View className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
          <Text className="text-sm leading-5 text-violet-700 dark:text-violet-300">
            Choose a strong password with at least 8 characters.
          </Text>
        </View>

        {renderPasswordInput(
          "Current Password",
          currentPassword,
          setCurrentPassword,
          showCurrent,
          setShowCurrent
        )}

        {renderPasswordInput(
          "New Password",
          newPassword,
          setNewPassword,
          showNew,
          setShowNew
        )}

        {renderPasswordInput(
          "Confirm New Password",
          confirmPassword,
          setConfirmPassword,
          showConfirm,
          setShowConfirm
        )}

        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loading}
          className="mt-2 h-14 flex-row items-center justify-center rounded-xl bg-violet-600"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">
              Update Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}