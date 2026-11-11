import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, BrainCircuit, Trophy } from "lucide-react-native";

import {
  getMockInterview,
  type MockInterview,
} from "../../services/mockInterviewApi";
import PageSkeleton from "@/components/PageSkeleton";

export default function MockInterviewResult() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [interview, setInterview] = useState<MockInterview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterview();
  }, [id]);

  const loadInterview = async () => {
    try {
      if (!id) return;

      setLoading(true);

      const response = await getMockInterview(id);

      if (response.success && response.interview) {
        setInterview(response.interview);
      } else {
        Alert.alert("Error", "Unable to load interview result.", [
          {
            text: "Go Back",
            onPress: () => router.replace("/mock-interview"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to load interview result.",
        [
          {
            text: "Go Back",
            onPress: () => router.replace("/mock-interview"),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <PageSkeleton cards={3} />
    );
  }

  if (!interview) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-[#08090d]">
        <Text className="text-zinc-600 dark:text-zinc-300">
          Interview result not found.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/mock-interview")}
          className="mt-4 rounded-xl bg-violet-600 px-5 py-3"
        >
          <Text className="font-semibold text-white">
            Back to Mock Interview
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const answeredCount = interview.questions.filter((question) =>
    question.userAnswer?.trim()
  ).length;

  const percentage = Math.min(100, Math.max(0, interview.percentage || 0));

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* Header */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:bg-[#08090d]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace("/mock-interview")}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={20} color="#8b5cf6" />
          </TouchableOpacity>

          {/* Interview Result Icon */}
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <BrainCircuit size={23} color="#8b5cf6" />
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Interview Result
            </Text>
            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Your interview performance summary
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Interview Completed & Overall Score Card */}
        <View className="items-center mb-5 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#15151f]">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15">
            <Trophy size={38} color="#8b5cf6" />
          </View>

          <Text className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
            Interview Completed!
          </Text>

          <Text className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Great work! Here is your performance summary.
          </Text>

          {/* Overall Score */}
          <View className="mt-7 items-center">
            <Text className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Your Overall Score
            </Text>

            <Text className="mt-2 text-5xl font-extrabold text-violet-600">
              {percentage}%
            </Text>

            <Text className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {interview.totalScore || 0} / {interview.questionCount * 10}{" "}
              points
            </Text>
          </View>

          <View className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <View
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${percentage}%` }}
            />
          </View>
        </View>

        {/* Interview Summary */}
        <Text className="mb-3 text-lg font-bold text-zinc-900 dark:text-white">
          Interview Summary
        </Text>

        <View className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-[#15151f]">
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Technology
          </Text>
          <Text className="mt-1 font-semibold text-zinc-900 dark:text-white">
            {interview.technology}
          </Text>

          <View className="my-3 h-px bg-zinc-100 dark:bg-zinc-700" />

          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Difficulty
          </Text>
          <Text className="mt-1 font-semibold text-zinc-900 dark:text-white">
            {interview.difficulty}
          </Text>

          <View className="my-3 h-px bg-zinc-100 dark:bg-zinc-700" />

          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Answered Questions
          </Text>
          <Text className="mt-1 font-semibold text-zinc-900 dark:text-white">
            {answeredCount} / {interview.questionCount}
          </Text>
        </View>

        {/* Question Evaluations */}
        <Text className="mb-3 text-lg font-bold text-zinc-900 dark:text-white">
          Question Evaluations
        </Text>

        {interview.questions.map((question, index) => (
          <View
            key={question._id}
            className="mb-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-[#15151f]"
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-bold text-violet-600">
                QUESTION {index + 1}
              </Text>

              <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                {question.score || 0}/10
              </Text>
            </View>

            <Text className="text-sm font-semibold leading-6 text-zinc-900 dark:text-white">
              {question.question}
            </Text>

            <Text className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              YOUR ANSWER
            </Text>

            <Text className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {question.userAnswer || "Not answered"}
            </Text>

            {question.feedback ? (
              <>
                <View className="my-3 h-px bg-zinc-100 dark:bg-zinc-700" />

                <Text className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  AI FEEDBACK
                </Text>

                <Text className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {question.feedback}
                </Text>
              </>
            ) : null}

            {question.betterAnswer ? (
              <View className="mt-3 rounded-xl bg-violet-50 p-3 dark:bg-violet-500/10">
                <Text className="text-xs font-bold text-violet-700 dark:text-violet-400">
                  BETTER ANSWER
                </Text>

                <Text className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {question.betterAnswer}
                </Text>
              </View>
            ) : null}
          </View>
        ))}

        {/* Start Another Interview */}
        <TouchableOpacity
          onPress={() => router.replace("/mock-interview")}
          className="mt-3 items-center rounded-2xl bg-violet-600 py-4"
        >
          <Text className="font-bold text-white">Start Another Interview</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
