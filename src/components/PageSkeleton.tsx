
import { ScrollView, View } from "react-native";

interface PageSkeletonProps {
  cards?: number;
}

export default function PageSkeleton({
  cards = 3,
}: PageSkeletonProps) {
  return (
    <ScrollView
      className="flex-1 bg-zinc-50 dark:bg-[#08090d]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-6 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <View className="h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-500/10" />
          <View className="ml-3 flex-1">
            <View className="h-5 w-40 rounded-full bg-zinc-200 dark:bg-[#252532]" />
            <View className="mt-2 h-3 w-28 rounded-full bg-zinc-100 dark:bg-[#252532]" />
          </View>
          <View className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-[#20202b]" />
        </View>
      </View>

      <View className="px-5 pt-6">
        {/* Highlight Card */}
        <View className="mb-6 overflow-hidden rounded-3xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/15 dark:bg-[#171326]">
          <View className="flex-row items-center justify-between">
            <View className="h-3 w-24 rounded-full bg-violet-200 dark:bg-violet-500/20" />
            <View className="h-8 w-8 rounded-xl bg-violet-200 dark:bg-violet-500/20" />
          </View>

          <View className="mt-5 h-7 w-3/4 rounded-full bg-violet-200 dark:bg-violet-500/20" />
          <View className="mt-3 h-3 w-full rounded-full bg-violet-100 dark:bg-violet-500/10" />
          <View className="mt-2 h-3 w-2/3 rounded-full bg-violet-100 dark:bg-violet-500/10" />

          <View className="mt-6 h-11 w-36 rounded-xl bg-violet-200 dark:bg-violet-500/20" />
        </View>

        {/* Stats Cards */}
        <View className="mb-6 flex-row gap-3">
          {[1, 2].map((item) => (
            <View
              key={item}
              className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]"
            >
              <View className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-500/10" />
              <View className="mt-4 h-6 w-16 rounded-full bg-zinc-200 dark:bg-[#252532]" />
              <View className="mt-2 h-3 w-24 rounded-full bg-zinc-100 dark:bg-[#252532]" />
            </View>
          ))}
        </View>

        {/* Section Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="h-5 w-36 rounded-full bg-zinc-200 dark:bg-[#252532]" />
          <View className="h-4 w-16 rounded-full bg-zinc-100 dark:bg-[#252532]" />
        </View>

        {/* Content Cards */}
        {Array.from({ length: cards }).map((_, index) => (
          <View
            key={index}
            className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#15151f]"
          >
            <View className="flex-row items-center">
              <View className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-500/10" />
              <View className="ml-3 flex-1">
                <View className="h-4 w-32 rounded-full bg-zinc-200 dark:bg-[#252532]" />
                <View className="mt-2 h-3 w-24 rounded-full bg-zinc-100 dark:bg-[#252532]" />
              </View>
              <View className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-[#252532]" />
            </View>

            <View className="mt-5 h-3 w-full rounded-full bg-zinc-100 dark:bg-[#252532]" />
            <View className="mt-3 h-3 w-4/5 rounded-full bg-zinc-100 dark:bg-[#252532]" />

            <View className="mt-5 flex-row gap-2">
              <View className="h-7 w-20 rounded-lg bg-violet-100 dark:bg-violet-500/10" />
              <View className="h-7 w-24 rounded-lg bg-zinc-100 dark:bg-[#252532]" />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
