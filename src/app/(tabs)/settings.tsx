import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  User,
  LockKeyhole,
  Bell,
  Moon,
  Sun,
  Globe,
  ShieldCheck,
  FileText,
  ChevronRight,
  LogOut,
  Trash2,
  Info,
  Smartphone,
  Palette,
  Settings,
} from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  const [notifications, setNotifications] = useState(true);

  const colors = {
    icon: isDark ? "#a1a1aa" : "#71717a",
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    right,
    danger = false,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress && !right}
      className="flex-row items-center px-4 py-4"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${
          danger ? "bg-red-500/10" : "bg-zinc-100 dark:bg-[#222230]"
        }`}
      >
        <Icon size={19} color={danger ? "#ef4444" : colors.icon} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className={`text-sm font-semibold ${
            danger ? "text-red-500" : "text-zinc-900 dark:text-white"
          }`}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text className="mt-1 text-[11px] text-zinc-500">{subtitle}</Text>
        ) : null}
      </View>

      {right || <ChevronRight size={17} color="#71717a" />}
    </TouchableOpacity>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#15151f]">
      <Text className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
        {title}
      </Text>
      {children}
    </View>
  );

  const Separator = () => (
    <View className="ml-[68px] h-px bg-zinc-100 dark:bg-zinc-800" />
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const SecureStore = await import("expo-secure-store");
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action will permanently affect your account. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Not connected",
              "Connect this action to your account deletion API before using it."
            );
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <Settings size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Settings
            </Text>

            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Manage your app preferences
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 35 }}
      >
        {/* APPEARANCE */}
        <Section title="Appearance">
          <SettingItem
            icon={Palette}
            title="App Theme"
            subtitle={isDark ? "Dark mode enabled" : "Light mode enabled"}
            right={
              <View className="flex-row items-center">
                {isDark ? (
                  <Moon size={17} color="#a78bfa" />
                ) : (
                  <Sun size={17} color="#f59e0b" />
                )}
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: "#d4d4d8",
                    true: "#8b5cf6",
                  }}
                  thumbColor="#ffffff"
                  style={{ marginLeft: 8 }}
                />
              </View>
            }
          />
        </Section>

        {/* ACCOUNT */}
        <Section title="Account">
          <SettingItem
            icon={User}
            title="My Profile"
            subtitle="Manage your personal and professional details"
            onPress={() => router.push("/profile")}
          />
          <Separator />

          <SettingItem
            icon={LockKeyhole}
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => router.push("/change-password")}
          />
        </Section>

        {/* PREFERENCES */}
        <Section title="Preferences">
          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Receive interview and learning reminders"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: "#d4d4d8",
                  true: "#8b5cf6",
                }}
                thumbColor="#ffffff"
              />
            }
          />
          <Separator />

          <SettingItem
            icon={Globe}
            title="Language"
            subtitle="English"
            onPress={() =>
              Alert.alert("Language", "More languages can be added later.")
            }
          />
        </Section>

        {/* ABOUT */}
        <Section title="About">
          <SettingItem
            icon={Info}
            title="About SkillPrep AI"
            subtitle="Your AI-powered career preparation platform"
            onPress={() => router.push("/about")}
          />
          <Separator />

          <SettingItem
            icon={ShieldCheck}
            title="Privacy Policy"
            onPress={() => router.push("/privacy-policy")}
          />
          <Separator />

          <SettingItem
            icon={FileText}
            title="Terms & Conditions"
            onPress={() => router.push("/terms-and-conditions")}
          />
          <Separator />

          <SettingItem
            icon={Smartphone}
            title="App Version"
            subtitle="SkillPrep AI Mobile"
            right={<Text className="text-xs text-zinc-500">1.0.0</Text>}
          />
        </Section>

        {/* ACCOUNT ACTIONS */}
        <Section title="Account Actions">
          <SettingItem
            icon={LogOut}
            title="Logout"
            subtitle="Sign out from your account"
            danger
            onPress={handleLogout}
          />
          <Separator />

          <SettingItem
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently delete your account"
            danger
            onPress={handleDeleteAccount}
          />
        </Section>

        <View className="items-center py-3">
          <Text className="text-xs font-bold text-violet-500">
            SkillPrep AI
          </Text>
          <Text className="mt-1 text-[10px] text-zinc-500">
            Build skills. Prepare. Succeed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}