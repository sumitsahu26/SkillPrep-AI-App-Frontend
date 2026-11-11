import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  Map,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from "lucide-react-native";

import {
  deleteRoadmap,
  generateRoadmap,
  getRoadmaps,
  type LearningRoadmap,
} from "@/services/roadmapApi";
import PageSkeleton from "@/components/PageSkeleton";

const skillSuggestions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "MySQL",
  "Next.js",
  "AWS",
  "Docker",
  "Redis",
  "System Design",
];

const experienceOptions = [
  "Fresher",
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5+ years",
];

export default function RoadmapScreen() {
  const [targetRole, setTargetRole] = useState("MERN Stack Developer");
  const [experience, setExperience] = useState("3-5 years");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [currentSkills, setCurrentSkills] = useState<string[]>([
    "JavaScript",
    "React",
    "Node.js",
  ]);
  const [targetSkills, setTargetSkills] = useState<string[]>([
    "TypeScript",
    "Next.js",
    "System Design",
  ]);

  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await getRoadmaps();
      setRoadmaps(response.roadmaps || []);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load roadmaps.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoadmaps();
    }, [])
  );

  const toggleSkill = (
    skill: string,
    selected: string[],
    setter: (value: string[]) => void
  ) => {
    setter(
      selected.includes(skill)
        ? selected.filter((item) => item !== skill)
        : [...selected, skill]
    );
  };

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      Alert.alert("Required", "Please enter your target role.");
      return;
    }

    if (currentSkills.length === 0) {
      Alert.alert("Required", "Select at least one current skill.");
      return;
    }

    try {
      setGenerating(true);

      const response = await generateRoadmap({
        targetRole: targetRole.trim(),
        experience,
        durationWeeks,
        currentSkills,
        targetSkills,
      });

      if (response.roadmap?._id) {
        router.push(`/roadmap/${response.roadmap._id}`);
      } else {
        await loadRoadmaps();
        Alert.alert("Success", "Your roadmap has been generated.");
      }
    } catch (error: any) {
      Alert.alert(
        "Generation Failed",
        error?.message || "Unable to generate roadmap."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Roadmap",
      "Are you sure you want to delete this learning roadmap?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoadmap(id);
              setRoadmaps((previous) =>
                previous.filter((item) => item._id !== id)
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "Unable to delete roadmap."
              );
            }
          },
        },
      ]
    );
  };

  const renderSkillSelector = (
    title: string,
    selected: string[],
    setter: (value: string[]) => void
  ) => (
    <View className="mt-5">
      <Text className="mb-3 text-sm font-bold text-zinc-900 dark:text-white">
        {title}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {skillSuggestions.map((skill) => {
          const active = selected.includes(skill);

          return (
            <TouchableOpacity
              key={`${title}-${skill}`}
              onPress={() => toggleSkill(skill, selected, setter)}
              className={`rounded-xl border px-3 py-2 ${
                active
                  ? "border-violet-500 bg-violet-100 dark:bg-violet-500/15"
                  : "border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  active
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const statusLabel = (status: LearningRoadmap["status"]) => {
    if (status === "completed") return "Completed";
    if (status === "in_progress") return "In Progress";
    return "Not Started";
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <Map size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Learning Roadmap
            </Text>

            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Build your personalized learning path
            </Text>
          </View>

          <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Sparkles size={21} color="#8b5cf6" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="rounded-2xl bg-violet-600 p-5">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Map size={21} color="#ffffff" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-white">
                Your Career Growth Plan
              </Text>
              <Text className="mt-1 text-xs text-violet-100">
                Generate a structured roadmap based on your goals.
              </Text>
            </View>
          </View>
        </View>

        {/* Generator */}
        <View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]">
          <View className="mb-4 flex-row items-center">
            <Sparkles size={18} color="#8b5cf6" />
            <Text className="ml-2 text-base font-bold text-zinc-900 dark:text-white">
              Generate New Roadmap
            </Text>
          </View>

          <Text className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Target Role
          </Text>

          <TextInput
            value={targetRole}
            onChangeText={setTargetRole}
            placeholder="e.g. Full Stack Developer"
            placeholderTextColor="#a1a1aa"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />

          <Text className="mb-3 mt-5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Experience Level
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {experienceOptions.map((option) => {
              const active = experience === option;

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setExperience(option)}
                  className={`rounded-xl border px-3 py-2 ${
                    active
                      ? "border-violet-500 bg-violet-100 dark:bg-violet-500/15"
                      : "border-zinc-200 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active
                        ? "text-violet-700 dark:text-violet-300"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {renderSkillSelector(
            "Current Skills",
            currentSkills,
            setCurrentSkills
          )}

          {renderSkillSelector(
            "Skills You Want to Learn",
            targetSkills,
            setTargetSkills
          )}

          <Text className="mb-3 mt-5 text-sm font-bold text-zinc-900 dark:text-white">
            Roadmap Duration
          </Text>

          <View className="flex-row items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
            <TouchableOpacity
              disabled={durationWeeks <= 1}
              onPress={() => setDurationWeeks((value) => value - 1)}
              className="h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-white/10"
            >
              <Text className="text-lg font-bold text-violet-600">−</Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                {durationWeeks} Weeks
              </Text>
              <Text className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                Learning duration
              </Text>
            </View>

            <TouchableOpacity
              disabled={durationWeeks >= 52}
              onPress={() => setDurationWeeks((value) => value + 1)}
              className="h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-white/10"
            >
              <Text className="text-lg font-bold text-violet-600">+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={generating}
            className="mt-6 h-12 flex-row items-center justify-center rounded-xl bg-violet-600"
          >
            {generating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Sparkles size={17} color="#ffffff" />
                <Text className="ml-2 text-sm font-bold text-white">
                  Generate Learning Roadmap
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Saved roadmaps */}
        <View className="mb-4 mt-8 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <BookOpen size={19} color="#8b5cf6" />
            <Text className="ml-2 text-base font-bold text-zinc-900 dark:text-white">
              My Learning Roadmaps
            </Text>
          </View>
          <Text className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {roadmaps.length} Roadmaps
          </Text>
        </View>

        {loading ? (
          <PageSkeleton cards={3} />
        ) : roadmaps.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 dark:border-white/10 dark:bg-[#15151f]">
            <BookOpen size={30} color="#a1a1aa" />
            <Text className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">
              No roadmaps yet
            </Text>
            <Text className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Generate your first personalized learning roadmap above.
            </Text>
          </View>
        ) : (
          roadmaps.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => router.push(`/roadmap/${item._id}`)}
              className="mb-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]"
            >
              <View className="flex-row items-start">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
                  <Target size={20} color="#8b5cf6" />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                    {item.title || item.targetRole}
                  </Text>
                  <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.targetRole} • {item.durationWeeks} Weeks
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10"
                >
                  <Trash2 size={15} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <View className="mt-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {statusLabel(item.status)}
                  </Text>
                  <Text className="text-xs font-bold text-violet-600">
                    {item.progress ?? 0}%
                  </Text>
                </View>

                <View className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                  <View
                    className="h-full rounded-full bg-violet-600"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, item.progress ?? 0)
                      )}%`,
                    }}
                  />
                </View>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {item.steps?.length ?? 0} Learning Weeks
                </Text>
                <ChevronRight size={17} color="#a1a1aa" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
