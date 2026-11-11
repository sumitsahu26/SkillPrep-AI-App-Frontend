import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowLeft,
  BrainCircuit,
  ChevronDown,
  Code2,
  Play,
  Sparkles,
  History,
  Trash2,
  Trophy,
  Clock,
  ChevronRight,
} from "lucide-react-native";

import {
  startMockInterview,
  getMockInterviews,
  deleteMockInterview,
  type MockInterview,
  type MockInterviewDifficulty,
} from "@/services/mockInterviewApi";

import HistoryCard from "@/components/HistoryCard";
import PageSkeleton from "@/components/PageSkeleton";

const TECHNOLOGIES = [
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Express.js",
  "React",
  "Next.js",
  "MongoDB",
  "MySQL",
  "AWS",
  "Docker",
  "Redis",
  "System Design",
];

const EXPERIENCES = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];

const DIFFICULTIES: MockInterviewDifficulty[] = ["Easy", "Medium", "Hard"];

export default function MockInterviewScreen() {
  const router = useRouter();

  const [technology, setTechnology] = useState("Node.js");
  const [topic, setTopic] = useState("General");
  const [difficulty, setDifficulty] =
    useState<MockInterviewDifficulty>("Medium");
  const [experience, setExperience] = useState("3-5 years");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // previous mock interviews
  const [previousInterviews, setPreviousInterviews] = useState<MockInterview[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadPreviousInterviews = async () => {
    try {
      setHistoryLoading(true);

      const response = await getMockInterviews();

      setPreviousInterviews(response.interviews || []);
    } catch (error) {
      console.log("Load mock interviews error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPreviousInterviews();
    }, [])
  );

  const handleStartInterview = async () => {
    if (!technology.trim()) {
      Alert.alert("Required", "Please select a technology.");
      return;
    }

    if (!experience.trim()) {
      Alert.alert("Required", "Please select your experience.");
      return;
    }

    if (questionCount < 1 || questionCount > 20) {
      Alert.alert("Invalid count", "Choose between 1 and 20 questions.");
      return;
    }

    try {
      setLoading(true);

      const response = await startMockInterview({
        technology,
        topic: topic.trim() || "General",
        difficulty,
        experience,
        questionCount,
      });

      if (!response.success || !response.interview?._id) {
        throw new Error(response.message || "Unable to start interview.");
      }

      if (response.usedFallback) {
        Alert.alert(
          "Interview started",
          `Only ${response.actualQuestionCount} questions were available for this selection.`
        );
      }

      router.replace({
        pathname: "/mock-interview/[id]",
        params: { id: response.interview._id },
      });
    } catch (error: any) {
      console.error("Start Mock Interview Error:", error);

      Alert.alert(
        "Unable to start",
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionCount = (value: number) => {
    setQuestionCount(Math.min(20, Math.max(1, value)));
  };

  const handleDeleteInterview = (interviewId: string) => {
    Alert.alert(
      "Delete Interview",
      "Are you sure you want to delete this mock interview?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMockInterview(interviewId);

              setPreviousInterviews((previous) =>
                previous.filter((item) => item._id !== interviewId)
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "Unable to delete interview."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#09090f]">
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          {/* Back Button */}
          {/* <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={19} color="#8b5cf6" />
          </TouchableOpacity> */}

          {/* Brain Icon */}
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <BrainCircuit size={23} color="#8b5cf6" />
          </View>

          {/* Title */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Mock Interview
            </Text>
            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Practice your interview skills
            </Text>
          </View>

          {/* AI Powered */}
          <View className="ml-2 flex-row items-center rounded-full bg-violet-500/10 px-2.5 py-2">
            <Sparkles size={13} color="#8b5cf6" />
            <Text className="ml-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
              AI Powered
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Technology */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center">
            <Code2 size={18} color="#8b5cf6" />
            <Text className="ml-2 text-base font-bold text-slate-900 dark:text-white">
              Select Technology
            </Text>
          </View>

          <View className="flex-row flex-wrap">
            {TECHNOLOGIES.map((item) => {
              const selected = technology === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTechnology(item)}
                  className={`mb-2 mr-2 rounded-xl border px-4 py-2.5 ${
                    selected
                      ? "border-violet-600 bg-violet-600"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-[#15151f]"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Topic */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Interview Topic
          </Text>

          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Event Loop, Hooks, Aggregation"
            placeholderTextColor="#94a3b8"
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-[#15151f] dark:text-white"
          />

          <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter a specific topic or keep General for mixed questions.
          </Text>
        </View>

        {/* Difficulty */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Difficulty Level
          </Text>

          <View className="flex-row rounded-xl bg-slate-200 p-1 dark:bg-[#15151f]">
            {DIFFICULTIES.map((item) => {
              const selected = difficulty === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setDifficulty(item)}
                  className={`flex-1 items-center rounded-lg py-3 ${
                    selected ? "bg-violet-600" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Experience */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Your Experience
          </Text>

          <View className="flex-row flex-wrap">
            {EXPERIENCES.map((item) => {
              const selected = experience === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setExperience(item)}
                  className={`mb-2 mr-2 rounded-xl border px-4 py-3 ${
                    selected
                      ? "border-violet-600 bg-violet-50 dark:bg-violet-500/15"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-[#15151f]"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-violet-700 dark:text-violet-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Question Count */}
        <View className="mb-8">
          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Number of Questions
          </Text>

          <View className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#15151f]">
            <View>
              <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                Questions
              </Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose between 1 and 20
              </Text>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => updateQuestionCount(questionCount - 1)}
                disabled={questionCount <= 1}
                className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700"
              >
                <Text className="text-xl font-bold text-slate-800 dark:text-white">
                  −
                </Text>
              </TouchableOpacity>

              <Text className="mx-5 min-w-[24px] text-center text-lg font-bold text-violet-600">
                {questionCount}
              </Text>

              <TouchableOpacity
                onPress={() => updateQuestionCount(questionCount + 1)}
                disabled={questionCount >= 20}
                className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700"
              >
                <Text className="text-xl font-bold text-slate-800 dark:text-white">
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={handleStartInterview}
          disabled={loading}
          className={`flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 ${
            loading ? "opacity-60" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Play size={19} color="#ffffff" fill="#ffffff" />
              <Text className="ml-2 text-base font-bold text-white">
                Start Mock Interview
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Your answers will be evaluated by AI, with feedback and suggestions to
          help you improve.
        </Text>

        <View className="mt-8">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <History size={19} color="#8b5cf6" />
              <Text className="ml-2 text-base font-bold text-zinc-900 dark:text-white">
                Previous Mock Interviews
              </Text>
            </View>

            <Text className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {previousInterviews.length} Sessions
            </Text>
          </View>

          {historyLoading ? (
            <PageSkeleton cards={3} />
          ) : previousInterviews.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 dark:border-white/10 dark:bg-[#15151f]">
              <History size={30} color="#a1a1aa" />
              <Text className="mt-3 text-sm font-bold text-zinc-800 dark:text-white">
                No previous interviews
              </Text>
              <Text className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Your mock interview history will appear here.
              </Text>
            </View>
          ) : (
            previousInterviews.map((item) => (
              <HistoryCard
                key={item._id}
                technology={item.technology}
                title={`${item.technology} Interview`}
                subtitle={`${item.topic || "General"} • ${item.difficulty} • ${
                  item.experience
                }`}
                status={item.status}
                questionCount={item.questions?.length ?? item.questionCount}
                percentage={item.percentage}
                onPress={() => router.push(`/mock-interview/${item._id}`)}
                onDelete={() => handleDeleteInterview(item._id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
