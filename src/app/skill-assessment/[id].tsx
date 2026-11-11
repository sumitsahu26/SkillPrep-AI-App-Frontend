import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Flag,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react-native";

import {
  getSkillAssessment,
  submitSkillAssessment,
  type SkillAssessment,
  type AssessmentQuestion,
} from "../../services/skillAssessmentApi";
import PageSkeleton from "@/components/PageSkeleton";

type AnswerMap = Record<string, string>;

export default function SkillAssessmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);

      const response: any = await getSkillAssessment(id);
      const data =
        response?.assessment ??
        response?.data?.assessment ??
        response?.data ??
        response;

      setAssessment(data);

      if (data?.status === "completed") {
        setResult(data);
        setShowResult(true);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load assessment.");
    } finally {
      setLoading(false);
    }
  };

  const questions = assessment?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const getOptions = (question: AssessmentQuestion): string[] => {
    return (question.options ?? []).map((option: any) =>
      typeof option === "string" ? option : option.text
    );
  };

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: option,
    }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((previous) => previous + 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = totalQuestions - answeredCount;

    Alert.alert(
      "Submit Assessment",
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Do you still want to submit?`
        : "Are you sure you want to submit your assessment?",
      [
        { text: "Continue", style: "cancel" },
        {
          text: "Submit",
          onPress: submitAssessment,
        },
      ]
    );
  };

  const submitAssessment = async () => {
    try {
      setSubmitting(true);

      const response: any = await submitSkillAssessment(id, answers);

      const data =
        response?.assessment ??
        response?.data?.assessment ??
        response?.data ??
        response;

      setResult(data);
      setShowResult(true);
      setAssessment(data);
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.message || "Unable to submit your assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    Alert.alert(
      "Exit Assessment",
      "Are you sure you want to leave this assessment?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => router.replace("/skill-assessment"),
        },
      ]
    );
  };

  const score = result?.score ?? result?.totalScore ?? 0;
  const percentage = result?.percentage ?? 0;
  const correctAnswers = result?.correctAnswers ?? 0;
  const skillLevel = result?.skillLevel ?? "Completed";

  if (loading) {
    return <PageSkeleton cards={3} />;
  }

  if (!assessment || !questions.length) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-[#08090d]">
        <XCircle size={42} color="#ef4444" />
        <Text className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
          Assessment not found
        </Text>
        <Text className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          We couldn't load the assessment questions.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/skill-assessment")}
          className="mt-6 rounded-xl bg-violet-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showResult) {
    return (
      <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
        <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.replace("/skill-assessment")}
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
            >
              <ArrowLeft size={19} color="#8b5cf6" />
            </TouchableOpacity>

            <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
              <BrainCircuit size={23} color="#8b5cf6" />
            </View>

            <View className="flex-1">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                Assessment Result
              </Text>
              <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {assessment.technology} • {assessment.topic}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center rounded-3xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#15151f]">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15">
              <Trophy size={38} color="#8b5cf6" />
            </View>

            <Text className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
              Assessment Completed!
            </Text>

            <Text className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Your performance summary
            </Text>

            <Text className="mt-6 text-5xl font-extrabold text-violet-600">
              {percentage}%
            </Text>

            <Text className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {skillLevel}
            </Text>

            <View className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
              <View
                className="h-full rounded-full bg-violet-600"
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                }}
              />
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]">
              <CheckCircle2 size={22} color="#22c55e" />
              <Text className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
                {correctAnswers}
              </Text>
              <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Correct Answers
              </Text>
            </View>

            <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]">
              <Flag size={22} color="#8b5cf6" />
              <Text className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
                {totalQuestions}
              </Text>
              <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Total Questions
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.replace("/skill-assessment")}
            className="mt-6 flex-row items-center justify-center rounded-xl bg-violet-600 py-4"
          >
            <RotateCcw size={17} color="#ffffff" />
            <Text className="ml-2 font-bold text-white">
              Back to Assessments
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const options = getOptions(currentQuestion);
  const selectedAnswer = answers[currentQuestion._id];

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleExit}
            activeOpacity={0.8}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={20} color="#8b5cf6" />
          </TouchableOpacity>

          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <BrainCircuit size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text
              className="text-lg font-bold text-zinc-900 dark:text-white"
              numberOfLines={1}
            >
              {assessment.technology} Assessment
            </Text>

            <Text
              className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400"
              numberOfLines={1}
            >
              {assessment.topic} • {assessment.difficulty}
            </Text>
          </View>

          <View className="ml-2 rounded-xl bg-violet-500/10 px-3 py-2">
            <Text className="text-xs font-bold text-violet-600 dark:text-violet-300">
              {currentIndex + 1}/{totalQuestions}
            </Text>
          </View>
        </View>

        {/* PROGRESS */}
        <View className="mt-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Assessment Progress
            </Text>

            <Text className="text-xs font-bold text-violet-600 dark:text-violet-300">
              {Math.round(progress)}%
            </Text>
          </View>

          <View className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <View
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Question information */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center rounded-lg bg-violet-100 px-3 py-2 dark:bg-violet-500/15">
            <Text className="text-xs font-semibold text-violet-700 dark:text-violet-300">
              {currentQuestion.topic || assessment.topic}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Clock3 size={14} color="#a1a1aa" />
            <Text className="ml-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              {currentQuestion.difficulty}
            </Text>
          </View>
        </View>

        {/* Question card */}
        <View className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#15151f]">
          <Text className="text-xs font-semibold uppercase tracking-wider text-violet-600">
            Question {currentIndex + 1}
          </Text>

          <Text className="mt-4 text-lg font-bold leading-7 text-zinc-900 dark:text-white">
            {currentQuestion.question}
          </Text>

          <Text className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Select one correct answer.
          </Text>
        </View>

        {/* Options */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-zinc-900 dark:text-white">
            Choose your answer
          </Text>

          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;

            return (
              <TouchableOpacity
                key={`${currentQuestion._id}-${index}`}
                onPress={() => selectAnswer(currentQuestion._id, option)}
                className={`mb-3 flex-row items-center rounded-xl border p-4 ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                    : "border-zinc-200 bg-white dark:border-white/10 dark:bg-[#15151f]"
                }`}
              >
                <View
                  className={`mr-3 h-8 w-8 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-violet-600"
                      : "bg-zinc-100 dark:bg-white/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected
                        ? "text-white"
                        : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text
                  className={`flex-1 text-sm font-medium leading-5 ${
                    isSelected
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {option}
                </Text>

                {isSelected ? (
                  <CheckCircle2 size={19} color="#8b5cf6" />
                ) : (
                  <Circle size={19} color="#a1a1aa" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Answer count */}
        <View className="mt-2 flex-row items-center justify-between rounded-xl bg-zinc-100 px-4 py-3 dark:bg-white/5">
          <Text className="text-xs text-zinc-600 dark:text-zinc-400">
            Questions answered
          </Text>
          <Text className="text-xs font-bold text-violet-600">
            {answeredCount}/{totalQuestions}
          </Text>
        </View>

        {/* Navigation */}
        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            className={`h-12 flex-1 flex-row items-center justify-center rounded-xl border ${
              currentIndex === 0
                ? "border-zinc-200 opacity-40 dark:border-white/10"
                : "border-zinc-300 dark:border-white/15"
            }`}
          >
            <ChevronLeft size={18} color="#a1a1aa" />
            <Text className="ml-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Previous
            </Text>
          </TouchableOpacity>

          {currentIndex < totalQuestions - 1 ? (
            <TouchableOpacity
              onPress={handleNext}
              className="h-12 flex-1 flex-row items-center justify-center rounded-xl bg-violet-600"
            >
              <Text className="mr-1 text-sm font-bold text-white">
                Next Question
              </Text>
              <ChevronRight size={18} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="h-12 flex-1 flex-row items-center justify-center rounded-xl bg-violet-600"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text className="mr-2 text-sm font-bold text-white">
                    Submit Assessment
                  </Text>
                  <CheckCircle2 size={17} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {currentIndex < totalQuestions - 1 && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="mt-4 items-center py-2"
          >
            <Text className="text-xs font-semibold text-violet-600">
              Submit Assessment
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
