import React, { useCallback, useState } from "react";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Flame,
  GraduationCap,
  Lightbulb,
  Map,
  MessageCircle,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react-native";

import {
  getDashboard,
  DashboardData,
} from "../../services/dashboardApi";
import PageSkeleton from "@/components/PageSkeleton";


  //  HELPERS

const clamp = (value: number) =>
  Math.min(100, Math.max(0, Number(value) || 0));

const getSkillColor = (percentage: number) => {
  if (percentage >= 80) return "#22c55e";
  if (percentage >= 50) return "#f59e0b";
  return "#8b5cf6";
};

const getSkillLabel = (percentage: number) => {
  if (percentage >= 80) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 40) return "Average";
  return "Needs improvement";
};


  //  REUSABLE COMPONENTS

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
}

const ProgressBar = ({
  percentage,
  color = "#8b5cf6",
  height = 7,
}: ProgressBarProps) => {
  const progress = clamp(percentage);

  return (
    <View
      className="w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      style={{ height }}
    >
      <View
        className="rounded-full"
        style={{
          width: `${progress}%`,
          height,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: StatCardProps) => (
  <View className="w-[48%] rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.07] dark:bg-[#15151f]">
    <View className="mb-4 flex-row items-center justify-between">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
        <Icon size={19} color={iconColor} />
      </View>

      <TrendingUp size={16} color="#22c55e" />
    </View>

    <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
      {value}
    </Text>

    <Text className="mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {title}
    </Text>

    <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
      {subtitle}
    </Text>
  </View>
);

interface ReadinessItemProps {
  title: string;
  percentage: number;
  icon: React.ElementType;
}

const ReadinessItem = ({
  title,
  percentage,
  icon: Icon,
}: ReadinessItemProps) => {
  const progress = clamp(percentage);

  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon size={16} color="#a78bfa" />
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {title}
          </Text>
        </View>

        <Text className="text-sm font-bold text-zinc-900 dark:text-white">
          {progress}%
        </Text>
      </View>

      <ProgressBar percentage={progress} />
    </View>
  );
};


  //  HOME DASHBOARD

export default function HomeScreen() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDashboard();
      setDashboard(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const readiness = dashboard?.careerReadiness;

  const quickActions = [
    {
      title: "Build Resume",
      description: "Create your professional resume",
      icon: FileText,
      color: "#8b5cf6",
      route: "/resume-builder" as const,
    },
    {
      title: "Mock Interview",
      description: "Practice real interview questions",
      icon: MessageCircle,
      color: "#06b6d4",
      route: "/mock-interview" as const,
    },
    {
      title: "Skill Assessment",
      description: "Test your technical knowledge",
      icon: ClipboardCheck,
      color: "#f59e0b",
      route: "/skill-assessment" as const,
    },
    {
      title: "AI Mentor",
      description: "Get guidance from your AI mentor",
      icon: Sparkles,
      color: "#ec4899",
      route: "/ai-mentor" as const,
    },
  ];

  if (loading && !dashboard) {
    return (
    <PageSkeleton cards={3} />
    );
  }

  if (error && !dashboard) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-[#08090d]">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <RefreshCw size={28} color="#ef4444" />
        </View>

        <Text className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
          Unable to load dashboard
        </Text>

        <Text className="mt-2 text-center text-sm text-zinc-500">
          {error}
        </Text>

        <Pressable
          onPress={() => loadDashboard()}
          className="mt-6 flex-row items-center gap-2 rounded-xl bg-violet-600 px-6 py-3"
        >
          <RefreshCw size={16} color="white" />
          <Text className="font-semibold text-white">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor="#8b5cf6"
          />
        }
      >
        {/* HEADER */}
        <View className="px-5 pb-5 pt-14">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Sparkles size={17} color="#8b5cf6" />
                <Text className="text-xs font-bold uppercase tracking-widest text-violet-500">
                  SkillPrep AI
                </Text>
              </View>

              <Text className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                Welcome back!
              </Text>

              <Text className="mt-1 text-sm text-zinc-500">
                Let's make progress toward your career goals.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/settings")}
              className="h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-[#15151f]"
            >
              <Settings
                size={20}
                color="#a1a1aa"
              />
            </Pressable>
          </View>
        </View>

        {/* CAREER READINESS HERO */}
        <View className="mx-5 overflow-hidden rounded-3xl bg-violet-600 p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Target size={17} color="white" />
                <Text className="text-sm font-semibold text-violet-100">
                  Career Readiness
                </Text>
              </View>

              <Text className="mt-3 text-3xl font-bold text-white">
                {clamp(readiness?.score ?? 0)}%
              </Text>

              <Text className="mt-1 text-xs text-violet-100">
                Your overall career preparation score
              </Text>
            </View>

            <View className="h-20 w-20 items-center justify-center rounded-full border-[5px] border-violet-300/40 bg-white/10">
              <Award size={34} color="white" />
            </View>
          </View>

          <View className="mt-5">
            <View className="mb-2 flex-row justify-between">
              <Text className="text-xs font-medium text-violet-100">
                Overall progress
              </Text>
              <Text className="text-xs font-bold text-white">
                {clamp(readiness?.score ?? 0)}%
              </Text>
            </View>

            <View className="h-2 overflow-hidden rounded-full bg-white/20">
              <View
                className="h-2 rounded-full bg-white"
                style={{
                  width: `${clamp(readiness?.score ?? 0)}%`,
                }}
              />
            </View>
          </View>

          <Text className="mt-4 text-xs leading-5 text-violet-100">
            Keep improving your skills, completing interviews, and following
            your roadmap to become career ready.
          </Text>
        </View>

        {/* STATISTICS */}
        <View className="mt-7 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-zinc-900 dark:text-white">
              Your Activity
            </Text>

            <Text className="text-xs text-zinc-500">
              All time
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            <StatCard
              title="Resumes"
              value={dashboard?.stats.resumes ?? 0}
              subtitle="Resumes created"
              icon={FileText}
              iconColor="#8b5cf6"
            />

            <StatCard
              title="Interviews"
              value={dashboard?.stats.interviewCompleted ?? 0}
              subtitle="Questions completed"
              icon={MessageCircle}
              iconColor="#06b6d4"
            />

            <StatCard
              title="Assessments"
              value={dashboard?.stats.assessmentsCompleted ?? 0}
              subtitle="Tests completed"
              icon={GraduationCap}
              iconColor="#f59e0b"
            />

            <StatCard
              title="Mock Interviews"
              value={dashboard?.stats.mockInterviewsCompleted ?? 0}
              subtitle="Sessions completed"
              icon={BriefcaseBusiness}
              iconColor="#ec4899"
            />
          </View>
        </View>

        {/* CAREER READINESS BREAKDOWN */}
        <View className="mx-5 mt-7 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.07] dark:bg-[#15151f]">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-zinc-900 dark:text-white">
                Performance Overview
              </Text>
              <Text className="mt-1 text-xs text-zinc-500">
                Your progress across different areas
              </Text>
            </View>

            <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <TrendingUp size={20} color="#8b5cf6" />
            </View>
          </View>

          <ReadinessItem
            title="Interview Preparation"
            percentage={readiness?.interview ?? 0}
            icon={MessageCircle}
          />

          <ReadinessItem
            title="Skill Assessment"
            percentage={readiness?.assessment ?? 0}
            icon={GraduationCap}
          />

          <ReadinessItem
            title="Mock Interview"
            percentage={readiness?.mockInterview ?? 0}
            icon={BriefcaseBusiness}
          />

          <ReadinessItem
            title="Roadmap Progress"
            percentage={readiness?.roadmap ?? 0}
            icon={Map}
          />
        </View>

        {/* INTERVIEW PROGRESS */}
        <View className="mx-5 mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.07] dark:bg-[#15151f]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-zinc-900 dark:text-white">
                Interview Progress
              </Text>
              <Text className="mt-1 text-xs text-zinc-500">
                Your question preparation status
              </Text>
            </View>

            <View className="h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <BookOpen size={20} color="#06b6d4" />
            </View>
          </View>

          <View className="mt-5 flex-row items-end justify-between">
            <View>
              <Text className="text-3xl font-bold text-zinc-900 dark:text-white">
                {dashboard?.interview.completed ?? 0}
                <Text className="text-base font-medium text-zinc-400">
                  {" "}
                  / {dashboard?.interview.total ?? 0}
                </Text>
              </Text>

              <Text className="mt-1 text-xs text-zinc-500">
                Questions completed
              </Text>
            </View>

            <Text className="text-xl font-bold text-violet-500">
              {clamp(dashboard?.interview.percentage ?? 0)}%
            </Text>
          </View>

          <View className="mt-4">
            <ProgressBar
              percentage={dashboard?.interview.percentage ?? 0}
              color="#06b6d4"
              height={9}
            />
          </View>

          <View className="mt-5 flex-row items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/[0.07]">
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#22c55e" />
              <Text className="text-xs text-zinc-500">
                {dashboard?.interview.completed ?? 0} completed
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Flame size={16} color="#f59e0b" />
              <Text className="text-xs text-zinc-500">
                {dashboard?.interview.bookmarked ?? 0} bookmarked
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/interview")}
            className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-violet-600 py-3"
          >
            <Text className="text-sm font-semibold text-white">
              Continue Preparation
            </Text>
            <ArrowRight size={16} color="white" />
          </Pressable>
        </View>

        {/* ROADMAP */}
        <View className="mx-5 mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.07] dark:bg-[#15151f]">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <Map size={21} color="#10b981" />
              </View>

              <View className="flex-1">
                <Text className="text-lg font-bold text-zinc-900 dark:text-white">
                  My Roadmap
                </Text>
                <Text className="mt-1 text-xs text-zinc-500">
                  Track your learning journey
                </Text>
              </View>
            </View>

            <Pressable onPress={() => router.push("/roadmap")}>
              <ChevronRight size={21} color="#a1a1aa" />
            </Pressable>
          </View>

          {dashboard?.roadmap ? (
            <>
              <Text className="mt-5 text-base font-semibold text-zinc-900 dark:text-white">
                {dashboard.roadmap.targetRole}
              </Text>

              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-xs text-zinc-500">
                  Roadmap completion
                </Text>

                <Text className="text-sm font-bold text-emerald-500">
                  {clamp(dashboard.roadmap.progress)}%
                </Text>
              </View>

              <View className="mt-2">
                <ProgressBar
                  percentage={dashboard.roadmap.progress}
                  color="#10b981"
                  height={8}
                />
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <View className="rounded-lg bg-emerald-500/10 px-3 py-1.5">
                  <Text className="text-xs font-semibold capitalize text-emerald-600 dark:text-emerald-400">
                    {dashboard.roadmap.status}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    router.push(`/roadmap/${dashboard.roadmap!._id}`)
                  }
                  className="flex-row items-center gap-1"
                >
                  <Text className="text-xs font-semibold text-violet-500">
                    View Roadmap
                  </Text>
                  <ArrowRight size={14} color="#8b5cf6" />
                </Pressable>
              </View>
            </>
          ) : (
            <View className="mt-5 items-center rounded-xl bg-zinc-50 p-5 dark:bg-white/[0.03]">
              <Target size={28} color="#8b5cf6" />

              <Text className="mt-3 text-sm font-semibold text-zinc-800 dark:text-white">
                No roadmap created yet
              </Text>

              <Text className="mt-1 text-center text-xs text-zinc-500">
                Create a learning roadmap to track your career progress.
              </Text>

              <Pressable
                onPress={() => router.push("/roadmap")}
                className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5"
              >
                <Text className="text-xs font-semibold text-white">
                  Create Roadmap
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* SKILL PERFORMANCE */}
        <View className="mt-7 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-zinc-900 dark:text-white">
                Skill Performance
              </Text>
              <Text className="mt-1 text-xs text-zinc-500">
                Your technical skill levels
              </Text>
            </View>

            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Zap size={20} color="#f59e0b" />
            </View>
          </View>

          {dashboard?.skillPerformance?.length ? (
            <View className="gap-3">
              {dashboard.skillPerformance.map((skill, index) => {
                const percentage = clamp(skill.percentage);
                const color = getSkillColor(percentage);

                return (
                  <View
                    key={`${skill.technology}-${skill.topic}-${index}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.07] dark:bg-[#15151f]"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                          {skill.technology}
                        </Text>

                        <Text className="mt-1 text-xs text-zinc-500">
                          {skill.topic}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text
                          className="text-base font-bold"
                          style={{ color }}
                        >
                          {percentage}%
                        </Text>

                        <Text className="mt-1 text-[10px] text-zinc-500">
                          {skill.skillLevel || getSkillLabel(percentage)}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-3">
                      <ProgressBar
                        percentage={percentage}
                        color={color}
                        height={6}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.07] dark:bg-[#15151f]">
              <GraduationCap size={30} color="#8b5cf6" />

              <Text className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                No skill data available
              </Text>

              <Text className="mt-1 text-center text-xs text-zinc-500">
                Complete skill assessments to see your performance here.
              </Text>

              <Pressable
                onPress={() => router.push("/skill-assessment")}
                className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5"
              >
                <Text className="text-xs font-semibold text-white">
                  Start Assessment
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View className="mt-7 px-5">
          <View className="mb-4">
            <Text className="text-lg font-bold text-zinc-900 dark:text-white">
              Quick Actions
            </Text>

            <Text className="mt-1 text-xs text-zinc-500">
              Continue building your career
            </Text>
          </View>

          <View className="gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Pressable
                  key={action.title}
                  onPress={() => router.push(action.route)}
                  className="flex-row items-center rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.07] dark:bg-[#15151f]"
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${action.color}18`,
                    }}
                  >
                    <Icon size={22} color={action.color} />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                      {action.title}
                    </Text>

                    <Text className="mt-1 text-xs text-zinc-500">
                      {action.description}
                    </Text>
                  </View>

                  <ChevronRight size={19} color="#a1a1aa" />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* MOTIVATION CARD */}
        <View className="mx-5 mt-7 rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] p-5">
          <View className="flex-row items-center gap-2">
            <Lightbulb size={19} color="#8b5cf6" />

            <Text className="text-sm font-bold text-zinc-900 dark:text-white">
              Keep Growing!
            </Text>
          </View>

          <Text className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Every interview you practice and every skill you improve brings you
            one step closer to your dream job. Stay consistent and keep
            learning.
          </Text>

          <View className="mt-4 flex-row items-center gap-2">
            <Flame size={16} color="#f59e0b" />
            <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
              Small progress every day leads to big results.
            </Text>
          </View>
        </View>

        {/* PROFILE SHORTCUT */}
        <Pressable
          onPress={() => router.push("/profile")}
          className="mx-5 mt-5 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.07] dark:bg-[#15151f]"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <UserRound size={19} color="#8b5cf6" />
            </View>

            <View>
              <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                Complete Your Profile
              </Text>
              <Text className="mt-1 text-xs text-zinc-500">
                Keep your career information updated
              </Text>
            </View>
          </View>

          <ChevronRight size={19} color="#a1a1aa" />
        </Pressable>

        <Text className="mt-7 text-center text-xs text-zinc-400">
          Made with ♥ by Sumit Sahu
        </Text>
      </ScrollView>
    </View>
  );
}