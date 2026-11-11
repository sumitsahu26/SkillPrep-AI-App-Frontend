import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Send,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react-native";

import {
  getMockInterview,
  submitMockInterviewAnswer,
  completeMockInterview,
  abandonMockInterview,
  type MockInterview,
  type MockEvaluation,
  type MockInterviewQuestion,
} from "../../services/mockInterviewApi";
import PageSkeleton from "@/components/PageSkeleton";

export default function ActiveMockInterviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [interview, setInterview] = useState<MockInterview | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<MockEvaluation | null>(null);
  const [lastAnsweredQuestion, setLastAnsweredQuestion] =
    useState<MockInterviewQuestion | null>(null);

  const [showEvaluation, setShowEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

  useEffect(() => {
    loadInterview();
  }, [id]);

  const loadInterview = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await getMockInterview(id);

      if (!response.success || !response.interview) {
        throw new Error("Unable to load interview.");
      }

      setInterview(response.interview);
    } catch (error: any) {
      console.error("Load Mock Interview Error:", error);

      Alert.alert("Error", error?.message || "Unable to load this interview.", [
        { text: "Go Back", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!interview || !currentQuestion) return;

    if (!answer.trim()) {
      Alert.alert("Answer required", "Please enter your answer first.");
      return;
    }

    try {
      setSubmitting(true);

      // Important: use the embedded question _id.
      const response = await submitMockInterviewAnswer(
        interview._id,
        currentQuestion._id,
        answer.trim()
      );

      if (!response.success) {
        throw new Error(response.message || "Unable to submit answer.");
      }

      setLastAnsweredQuestion(currentQuestion);
      setEvaluation(response.evaluation);
      setInterview(response.interview);
      setShowEvaluation(true);
      setAnswer("");

      if (!response.evaluationSuccessful) {
        Alert.alert(
          "Answer saved",
          "Your answer was saved, but AI evaluation was unavailable."
        );
      }
    } catch (error: any) {
      console.error("Submit Answer Error:", error);

      Alert.alert(
        "Submission Failed",
        error?.message || "Unable to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setShowEvaluation(false);
    setEvaluation(null);
    setLastAnsweredQuestion(null);
    setAnswer("");
  };

  const handleCompleteInterview = async () => {
    if (!interview) return;

    try {
      setCompleting(true);

      const response = await completeMockInterview(interview._id);

      if (!response.success) {
        throw new Error(response.message || "Unable to complete interview.");
      }

      setInterview(response.interview);
      setShowEvaluation(false);
    } catch (error: any) {
      console.error("Complete Interview Error:", error);

      Alert.alert("Unable to complete", error?.message || "Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  const handleAbandonInterview = () => {
    if (!interview) return;

    Alert.alert(
      "Abandon Interview?",
      "Your current progress will be saved, but this interview will be marked as abandoned.",
      [
        { text: "Continue Interview", style: "cancel" },
        {
          text: "Abandon",
          style: "destructive",
          onPress: async () => {
            try {
              setAbandoning(true);

              await abandonMockInterview(interview._id);

              router.replace("/mock-interview");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "Unable to abandon interview."
              );
            } finally {
              setAbandoning(false);
            }
          },
        },
      ]
    );
  };

  const currentQuestion =
    interview && interview.questions[interview.currentQuestionIndex];

  const answeredCount =
    interview?.questions.filter((question) => question.userAnswer?.trim())
      .length || 0;

  const progress =
    interview && interview.questionCount > 0
      ? Math.min(100, (answeredCount / interview.questionCount) * 100)
      : 0;

  if (loading) {
    return (
    <PageSkeleton cards={3} />
    );
  }

  if (!interview) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#09090f]">
        <Text className="text-lg font-bold text-slate-900 dark:text-white">
          Interview not found
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-violet-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Completed interview screen
  if (interview.status === "completed") {
    return (
      <Redirect
        href={{
          pathname: "/mock-interview/result",
          params: { id: interview._id },
        }}
      />
    );
  }

  // Interview already has all questions answered but is not completed
  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#09090f]">
        <CheckCircle2 size={48} color="#8b5cf6" />

        <Text className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          All Questions Answered
        </Text>

        <Text className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
          You have answered all available questions. Complete your interview to
          see your results.
        </Text>

        <TouchableOpacity
          onPress={handleCompleteInterview}
          disabled={completing}
          className="mt-6 w-full flex-row items-center justify-center rounded-2xl bg-violet-600 py-4"
        >
          {completing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-bold text-white">Complete Interview</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#09090f]">
      {/* Header */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-4 pt-14 dark:border-white/10 dark:bg-[#111218]">
        {/* Header Row */}
        <View className="flex-row items-center">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.replace("/mock-interview")}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={19} color="#8b5cf6" />
          </TouchableOpacity>

          {/* Interview Title */}
          <View className="flex-1">
            <Text
              className="text-xl font-bold text-zinc-900 dark:text-white"
              numberOfLines={1}
            >
              {interview.technology} Interview
            </Text>

            <Text
              className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400"
              numberOfLines={1}
            >
              {interview.topic} • {interview.difficulty} •{" "}
              {interview.experience}
            </Text>
          </View>

          {/* Abandon Button */}
          <TouchableOpacity
            onPress={handleAbandonInterview}
            disabled={abandoning}
            className="ml-2 flex-row items-center rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-500/20 dark:bg-red-500/10"
          >
            {abandoning ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <XCircle size={16} color="#ef4444" />
                <Text className="ml-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                  Abandon
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="mt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Progress
            </Text>

            <Text className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
              {answeredCount}/{interview.questionCount}
            </Text>
          </View>

          <View className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <View
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-violet-500"
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Question and Answer */}
        {!showEvaluation && (
          <>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-violet-600">
                QUESTION {interview.currentQuestionIndex + 1}
              </Text>

              <View className="rounded-full bg-violet-50 px-3 py-1.5 dark:bg-violet-500/10">
                <Text className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                  {currentQuestion.difficulty}
                </Text>
              </View>
            </View>

            <View className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#15151f]">
              <Text className="text-lg font-bold leading-8 text-slate-900 dark:text-white">
                {currentQuestion.question}
              </Text>

              <Text className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Technology: {currentQuestion.category}
              </Text>
            </View>

            <View className="mb-4 mt-6">
              <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                Your Answer
              </Text>

              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder="Write your answer here..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                className="min-h-[190px] rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-900 dark:border-slate-700 dark:bg-[#15151f] dark:text-white"
              />

              <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Explain your answer clearly. AI will evaluate it after
                submission.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmitAnswer}
              disabled={submitting}
              className={`flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 ${
                submitting ? "opacity-60" : ""
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Send size={17} color="#ffffff" />
                  <Text className="ml-2 font-bold text-white">
                    Submit Answer
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* AI Evaluation */}
        {showEvaluation && evaluation && (
          <>
            <View className="mb-5 items-center rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/20 dark:bg-violet-500/10">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-violet-600">
                <Sparkles size={27} color="#ffffff" />
              </View>

              <Text className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                AI Evaluation
              </Text>

              <Text className="mt-2 text-4xl font-bold text-violet-600">
                {evaluation.score ?? 0}/10
              </Text>

              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your answer score
              </Text>
            </View>

            <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#15151f]">
              <Text className="text-base font-bold text-slate-900 dark:text-white">
                Feedback
              </Text>

              <Text className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {evaluation.feedback || "No feedback available."}
              </Text>
            </View>

            <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#15151f]">
              <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                Strengths
              </Text>

              {evaluation.strengths?.length ? (
                evaluation.strengths.map((item, index) => (
                  <View key={index} className="mb-2 flex-row">
                    <CheckCircle2 size={16} color="#16a34a" />
                    <Text className="ml-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-slate-500">
                  No strengths provided.
                </Text>
              )}
            </View>

            <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#15151f]">
              <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                Areas to Improve
              </Text>

              {evaluation.improvements?.length ? (
                evaluation.improvements.map((item, index) => (
                  <View key={index} className="mb-2 flex-row">
                    <XCircle size={16} color="#f59e0b" />
                    <Text className="ml-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-slate-500">
                  No improvements provided.
                </Text>
              )}
            </View>

            <View className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
              <Text className="text-base font-bold text-violet-700 dark:text-violet-400">
                Better Answer
              </Text>

              <Text className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {evaluation.betterAnswer || "No suggested answer available."}
              </Text>
            </View>

            {interview.currentQuestionIndex < interview.questions.length ? (
              <TouchableOpacity
                onPress={handleNextQuestion}
                className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4"
              >
                <Text className="font-bold text-white">Next Question</Text>
                <ChevronRight size={19} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleCompleteInterview}
                disabled={completing}
                className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4"
              >
                {completing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Trophy size={18} color="#ffffff" />
                    <Text className="ml-2 font-bold text-white">
                      Complete Interview
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
