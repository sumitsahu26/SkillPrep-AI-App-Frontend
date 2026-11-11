import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GraduationCap,
  Target,
} from "lucide-react-native";

import {
  getRoadmapById,
  toggleRoadmapTopic,
  type LearningRoadmap,
} from "../../services/roadmapApi";

import RoadmapSchedule from "../../components/RoadmapSchedule";
import PageSkeleton from "@/components/PageSkeleton";

export default function RoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTopic, setUpdatingTopic] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const response = await getRoadmapById(id);
      setRoadmap(response.roadmap);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load roadmap.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoadmap();
    }, [id])
  );

  const handleToggleTopic = async (topicId: string) => {
    try {
      setUpdatingTopic(topicId);

      const response = await toggleRoadmapTopic(id, topicId);

      if (response.roadmap) {
        setRoadmap(response.roadmap);
      } else {
        await loadRoadmap();
      }
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update topic progress."
      );
    } finally {
      setUpdatingTopic(null);
    }
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((previous) =>
      previous.includes(week)
        ? previous.filter((item) => item !== week)
        : [...previous, week]
    );
  };

  const openResource = async (url?: string) => {
    if (!url) {
      Alert.alert("Resource", "No resource link is available.");
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Unable to open this resource.");
    }
  };

  const completedTopics =
    roadmap?.steps.reduce(
      (total, step) =>
        total + step.topics.filter((topic) => topic.completed).length,
      0
    ) ?? 0;

  const totalTopics =
    roadmap?.steps.reduce((total, step) => total + step.topics.length, 0) ?? 0;

  if (loading) {
    return <PageSkeleton cards={3} />;
  }

  if (!roadmap) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-[#08090d]">
        <BookOpen size={40} color="#a1a1aa" />
        <Text className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
          Roadmap not found
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/roadmap")}
          className="mt-5 rounded-xl bg-violet-600 px-6 py-3"
        >
          <Text className="font-bold text-white">Back to Roadmaps</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* Header */}
      <View className="bg-violet-600 px-5 pb-5 pt-14">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace("/roadmap")}
            className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-white/15"
          >
            <ArrowLeft size={19} color="#ffffff" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-base font-bold text-white">
              Learning Roadmap
            </Text>
            <Text className="mt-0.5 text-[11px] text-violet-100">
              {roadmap.targetRole}
            </Text>
          </View>

          <GraduationCap size={23} color="#ffffff" />
        </View>

        <Text className="mt-5 text-xl font-bold text-white">
          {roadmap.title || roadmap.targetRole}
        </Text>

        <Text className="mt-1 text-xs text-violet-100">
          {roadmap.experience} • {roadmap.durationWeeks} Weeks
        </Text>

        <View className="mt-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-medium text-violet-100">
              Overall Progress
            </Text>
            <Text className="text-sm font-bold text-white">
              {roadmap.progress ?? 0}%
            </Text>
          </View>

          <View className="h-2 overflow-hidden rounded-full bg-white/20">
            <View
              className="h-full rounded-full bg-white"
              style={{
                width: `${Math.min(100, Math.max(0, roadmap.progress ?? 0))}%`,
              }}
            />
          </View>

          <Text className="mt-2 text-[11px] text-violet-100">
            {completedTopics} of {totalTopics} topics completed
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal summary */}
        <View className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]">
          <View className="flex-row items-center">
            <Target size={18} color="#8b5cf6" />
            <Text className="ml-2 text-sm font-bold text-zinc-900 dark:text-white">
              Learning Goal
            </Text>
          </View>

          <Text className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            Follow this structured learning plan to work towards your target
            role: {roadmap.targetRole}.
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {roadmap.currentSkills.map((skill) => (
              <View
                key={`current-${skill}`}
                className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/5"
              >
                <Text className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                  {skill}
                </Text>
              </View>
            ))}

            {roadmap.targetSkills.map((skill) => (
              <View
                key={`target-${skill}`}
                className="rounded-lg bg-violet-100 px-3 py-2 dark:bg-violet-500/15"
              >
                <Text className="text-[11px] font-medium text-violet-700 dark:text-violet-300">
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly plan */}
        <View className="mb-4 mt-7 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <BookOpen size={19} color="#8b5cf6" />
            <Text className="ml-2 text-base font-bold text-zinc-900 dark:text-white">
              Weekly Learning Plan
            </Text>
          </View>

          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            {roadmap.steps.length} Weeks
          </Text>
        </View>

        {roadmap.steps.map((step) => {
          const expanded = expandedWeeks.includes(step.week);
          const completed = step.topics.filter(
            (topic) => topic.completed
          ).length;

          return (
            <View
              key={step._id}
              className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#15151f]"
            >
              <TouchableOpacity
                onPress={() => toggleWeek(step.week)}
                className="flex-row items-center p-4"
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-xl ${
                    step.completed
                      ? "bg-green-100 dark:bg-green-500/15"
                      : "bg-violet-100 dark:bg-violet-500/15"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 size={20} color="#22c55e" />
                  ) : (
                    <Text className="text-sm font-bold text-violet-600 dark:text-violet-400">
                      {step.week}
                    </Text>
                  )}
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                    Week {step.week}
                  </Text>
                  <Text className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {step.title}
                  </Text>
                  <Text className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {completed}/{step.topics.length} topics completed
                  </Text>
                </View>

                {expanded ? (
                  <ChevronUp size={19} color="#a1a1aa" />
                ) : (
                  <ChevronDown size={19} color="#a1a1aa" />
                )}
              </TouchableOpacity>

              {expanded && (
                <View className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-white/[0.06]">
                  <Text className="mb-4 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </Text>

                  <Text className="mb-3 text-xs font-bold text-zinc-900 dark:text-white">
                    Topics to Learn
                  </Text>

                  {step.topics.map((topic) => {
                    const updating = updatingTopic === topic._id;

                    return (
                      <TouchableOpacity
                        key={topic._id}
                        disabled={!!updatingTopic}
                        onPress={() => handleToggleTopic(topic._id)}
                        className="mb-3 flex-row items-start"
                      >
                        <View
                          className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
                            topic.completed
                              ? "border-violet-600 bg-violet-600"
                              : "border-zinc-300 dark:border-zinc-600"
                          }`}
                        >
                          {updating ? (
                            <ActivityIndicator size="small" color="#8b5cf6" />
                          ) : topic.completed ? (
                            <Check size={13} color="#ffffff" />
                          ) : null}
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            className={`text-xs font-semibold ${
                              topic.completed
                                ? "text-zinc-400 line-through"
                                : "text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {topic.title}
                          </Text>

                          {!!topic.description && (
                            <Text className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                              {topic.description}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {step.resources?.length > 0 && (
                    <View className="mt-3">
                      <Text className="mb-3 text-xs font-bold text-zinc-900 dark:text-white">
                        Learning Resources
                      </Text>

                      {step.resources.map((resource, index) => (
                        <TouchableOpacity
                          key={`${step._id}-resource-${index}`}
                          onPress={() => openResource(resource.url)}
                          className="mb-2 flex-row items-center rounded-xl bg-zinc-50 p-3 dark:bg-white/5"
                        >
                          <BookOpen size={16} color="#8b5cf6" />

                          <View className="ml-3 flex-1">
                            <Text className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {resource.title}
                            </Text>
                            <Text className="mt-0.5 text-[10px] capitalize text-zinc-500 dark:text-zinc-400">
                              {resource.type}
                            </Text>
                          </View>

                          {!!resource.url && (
                            <ExternalLink size={15} color="#8b5cf6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
        <RoadmapSchedule
          roadmap={roadmap}
          updatingTopicId={updatingTopic}
          onToggleTopic={handleToggleTopic}
        />
      </ScrollView>
    </View>
  );
}
