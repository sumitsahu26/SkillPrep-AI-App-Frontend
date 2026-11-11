import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Section = {
  title: string;
  body?: string;
  bullets?: string[];
};

type LegalInfoScreenProps = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  sections: Section[];
  lastUpdated?: string;
};

export default function LegalInfoScreen({
  title,
  subtitle,
  icon: Icon,
  sections,
  lastUpdated = "November 5, 2026",
}: LegalInfoScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-white dark:bg-[#111218]"
    >
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-3 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={20} color="#8b5cf6" />
          </TouchableOpacity>

          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <Icon size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              {title}
            </Text>
            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        className="flex-1 bg-zinc-50 dark:bg-[#08090d]"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4">
          <Text className="text-sm font-bold text-violet-700 dark:text-violet-300">
            {title}
          </Text>
          <Text className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </Text>
          <Text className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-500">
            Last updated: {lastUpdated}
          </Text>
        </View>

        {sections.map((section, index) => (
          <View
            key={`${section.title}-${index}`}
            className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]"
          >
            <Text className="text-sm font-bold text-zinc-900 dark:text-white">
              {index + 1}. {section.title}
            </Text>

            {section.body ? (
              <Text className="mt-2 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
                {section.body}
              </Text>
            ) : null}

            {section.bullets?.map((item, bulletIndex) => (
              <View
                key={bulletIndex}
                className="mt-2 flex-row items-start"
              >
                <View className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
                <Text className="flex-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text className="mt-2 text-center text-[11px] text-zinc-400">
          © 2026 SkillPrep AI. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}