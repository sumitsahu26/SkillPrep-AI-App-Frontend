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
  Sparkles,
  Play,
  Code2,
  History,
  Trophy,
  Clock,
  ChevronRight,
  Trash2,
} from "lucide-react-native";

import {
  startSkillAssessment,
  getSkillAssessments,
  deleteSkillAssessment,
  type SkillAssessment,
  type AssessmentDifficulty,
} from "@/services/skillAssessmentApi";
import HistoryCard from "@/components/HistoryCard";
import PageSkeleton from "@/components/PageSkeleton";

const TECHNOLOGIES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express.js",
  "Next.js",
  "MongoDB",
  "MySQL",
  "AWS",
  "Docker",
  "Redis",
  "MERN Stack",
];

const DIFFICULTIES: AssessmentDifficulty[] = ["Easy", "Medium", "Hard"];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function SkillAssessmentScreen() {
  const router = useRouter();

  const [technology, setTechnology] = useState("MERN Stack");
  const [topic, setTopic] = useState("General");
  const [difficulty, setDifficulty] = useState<AssessmentDifficulty>("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const [previousAssessments, setPreviousAssessments] = useState<
    SkillAssessment[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadPreviousAssessments = async () => {
    try {
      setHistoryLoading(true);

      const response: any = await getSkillAssessments();

      setPreviousAssessments(
        response.assessments ??
          response.data?.assessments ??
          response.data ??
          []
      );
    } catch (error) {
      console.log("Load skill assessments error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPreviousAssessments();
    }, [])
  );

  const handleStartAssessment = async () => {
    try {
      setLoading(true);

      const response: any = await startSkillAssessment({
        technology,
        topic: topic.trim() || "General",
        difficulty,
        questionCount,
      });

      if (!response?.success || !response?.assessment?._id) {
        throw new Error(response?.message || "Unable to start assessment.");
      }

      router.replace({
        pathname: "/skill-assessment/[id]",
        params: { id: response.assessment._id },
      });
    } catch (error: any) {
      console.error("Start Assessment Error:", error);

      Alert.alert(
        "Unable to start",
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = (assessmentId: string) => {
    Alert.alert(
      "Delete Assessment",
      "Are you sure you want to delete this assessment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSkillAssessment(assessmentId);

              setPreviousAssessments((previous) =>
                previous.filter((item) => item._id !== assessmentId)
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "Unable to delete assessment."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* Compact Header */}
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          {/* <TouchableOpacity
            onPress={() => router.replace("/")}
            activeOpacity={0.8}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={20} color="#8b5cf6" />
          </TouchableOpacity> */}

          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <BrainCircuit size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Skill Assessment
            </Text>

            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Test your technical knowledge
            </Text>
          </View>

          <View className="ml-2 flex-row items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-2">
            <Sparkles size={13} color="#8b5cf6" />
            <Text className="ml-1 text-[10px] font-bold text-violet-600 dark:text-violet-300">
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
        {/* Intro Card */}
        <View className="mb-6 rounded-2xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
          <View className="flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-violet-600">
              <Code2 size={23} color="#ffffff" />
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-zinc-900 dark:text-white">
                Evaluate Your Skills
              </Text>
              <Text className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                Take an MCQ-based assessment and discover your strengths.
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row">
            <View className="mr-5">
              <Text className="text-lg font-bold text-violet-700 dark:text-violet-400">
                MCQ
              </Text>
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                Questions
              </Text>
            </View>

            <View>
              <Text className="text-lg font-bold text-violet-700 dark:text-violet-400">
                AI
              </Text>
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                Evaluation
              </Text>
            </View>
          </View>
        </View>

        {/* Technology */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
            Select Technology
          </Text>

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
                      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-[#15151f]"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300"
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
          <Text className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
            Select Topic
          </Text>

          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="Enter topic or General"
            placeholderTextColor="#9292a0"
            className="h-14 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-[#15151f] dark:text-white"
          />

          <Text className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Enter a specific topic or use General for mixed questions.
          </Text>
        </View>

        {/* Difficulty */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
            Difficulty Level
          </Text>

          <View className="flex-row rounded-xl bg-zinc-200 p-1 dark:bg-[#15151f]">
            {DIFFICULTIES.map((item) => {
              const selected = difficulty === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setDifficulty(item)}
                  className={`flex-1 items-center rounded-lg py-3 ${
                    selected ? "bg-violet-600" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : "text-zinc-600 dark:text-zinc-400"
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
          <Text className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
            Number of Questions
          </Text>

          <View className="flex-row flex-wrap">
            {QUESTION_COUNTS.map((count) => {
              const selected = questionCount === count;

              return (
                <TouchableOpacity
                  key={count}
                  onPress={() => setQuestionCount(count)}
                  className={`mr-3 flex-1 items-center rounded-xl border py-4 ${
                    selected
                      ? "border-violet-600 bg-violet-600"
                      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-[#15151f]"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      selected
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {count}
                  </Text>
                  <Text
                    className={`mt-1 text-[10px] ${
                      selected
                        ? "text-violet-100"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    Questions
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={handleStartAssessment}
          disabled={loading}
          className={`h-14 flex-row items-center justify-center rounded-2xl bg-violet-600 ${
            loading ? "opacity-60" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Play size={18} color="#ffffff" fill="#ffffff" />
              <Text className="ml-2 text-base font-bold text-white">
                Start Assessment
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          Complete the assessment to receive your score, skill level, and
          personalized improvement areas.
        </Text>

        <View className="mt-8">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <History size={19} color="#8b5cf6" />
              <Text className="ml-2 text-base font-bold text-zinc-900 dark:text-white">
                Previous Skill Assessments
              </Text>
            </View>

            <Text className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {previousAssessments.length} Sessions
            </Text>
          </View>

          {historyLoading ? (
            <PageSkeleton cards={3} />
          ) : previousAssessments.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 dark:border-white/10 dark:bg-[#15151f]">
              <History size={30} color="#a1a1aa" />
              <Text className="mt-3 text-sm font-bold text-zinc-800 dark:text-white">
                No previous assessments
              </Text>
              <Text className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Your completed skill assessments will appear here.
              </Text>
            </View>
          ) : (
            previousAssessments.map((item) => (
              <HistoryCard
                key={item._id}
                technology={item.technology}
                title={`${item.technology} Assessment`}
                subtitle={`${item.topic || "General"} • ${item.difficulty}`}
                status={item.status}
                questionCount={item.questionCount}
                percentage={item.percentage}
                onPress={() => router.push(`/skill-assessment/${item._id}`)}
                onDelete={() => handleDeleteAssessment(item._id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
