import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  generateAIQuestions,
  getInterviewProgress,
  getInterviewQuestions,
  toggleBookmarkQuestion,
  toggleCompletedQuestion,
  type Difficulty,
  type InterviewQuestion,
} from "@/services/interviewApi";
import PageSkeleton from "@/components/PageSkeleton";

const aiTechnologies = [
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

const aiTopics = [
  "General",
  "Core Concepts",
  "Advanced Concepts",
  "Practical Coding",
  "Performance Optimization",
  "Best Practices",
  "System Design",
  "Real-world Scenarios",
  "Architecture",
  "Debugging",
  "Security",
  "Testing",
];

type FilterModalType =
  | "technology"
  | "topic"
  | "aiTechnology"
  | "aiTopic"
  | null;

export default function InterviewScreen() {
  // QUESTIONS

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);

  // FILTERS

  const [technology, setTechnology] = useState("All technologies");
  const [topic, setTopic] = useState("All topics");
  const [difficulty, setDifficulty] = useState("All levels");
  const [search, setSearch] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [filterModal, setFilterModal] = useState<FilterModalType>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // QUESTION EXPANSION

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // AI GENERATOR

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [aiTechnology, setAiTechnology] = useState("Node.js");
  const [aiTopic, setAiTopic] = useState("General");
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>("Medium");
  const [aiExperience, setAiExperience] = useState("3-5 years");
  const [aiCount, setAiCount] = useState(5);

  // LOAD DATA

  const loadInterviewData = async () => {
    try {
      setLoading(true);
      setError("");

      const [questionsResponse, progressResponse] = await Promise.all([
        getInterviewQuestions(),
        getInterviewProgress(),
      ]);

      setQuestions(questionsResponse.questions || []);

      setCompletedQuestions(
        progressResponse.progress?.completedQuestions || []
      );

      setBookmarkedQuestions(
        progressResponse.progress?.bookmarkedQuestions || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load interview questions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviewData();
  }, []);

  // TECHNOLOGIES

  const technologies = useMemo(() => {
    return [
      "All technologies",
      ...Array.from(
        new Set(questions.map((question) => question.category))
      ).sort(),
    ];
  }, [questions]);

  // TOPICS

  const topics = useMemo(() => {
    const filtered =
      technology === "All technologies"
        ? questions
        : questions.filter((question) => question.category === technology);

    return [
      "All topics",
      ...Array.from(new Set(filtered.map((question) => question.topic))).sort(),
    ];
  }, [questions, technology]);

  // DROPDOWN ITEMS

  const dropdownItems =
    filterModal === "technology"
      ? technologies
      : filterModal === "topic"
      ? topics
      : filterModal === "aiTechnology"
      ? aiTechnologies
      : filterModal === "aiTopic"
      ? aiTopics
      : [];

  const filteredDropdownItems = dropdownItems.filter((item) =>
    item.toLowerCase().includes(filterSearch.trim().toLowerCase())
  );

  // ACTIVE FILTER

  const hasActiveFilters =
    technology !== "All technologies" ||
    topic !== "All topics" ||
    difficulty !== "All levels" ||
    showSavedOnly;

  // FILTER QUESTIONS

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return questions.filter((question) => {
      const technologyMatch =
        technology === "All technologies" || question.category === technology;

      const topicMatch = topic === "All topics" || question.topic === topic;

      const difficultyMatch =
        difficulty === "All levels" || question.difficulty === difficulty;

      const savedMatch =
        !showSavedOnly || bookmarkedQuestions.includes(question._id);

      const searchMatch =
        !term ||
        `${question.question} ${question.answer} ${question.category} ${
          question.topic
        } ${question.tags.join(" ")}`
          .toLowerCase()
          .includes(term);

      return (
        technologyMatch &&
        topicMatch &&
        difficultyMatch &&
        savedMatch &&
        searchMatch
      );
    });
  }, [
    questions,
    technology,
    topic,
    difficulty,
    search,
    showSavedOnly,
    bookmarkedQuestions,
  ]);

  // CLEAR FILTERS

  const clearFilters = () => {
    setTechnology("All technologies");
    setTopic("All topics");
    setDifficulty("All levels");
    setShowSavedOnly(false);
  };

  // MODAL

  const openFilterModal = (type: "technology" | "topic") => {
    setFilterSearch("");
    setFilterModal(type);
  };

  const closeFilterModal = () => {
    setFilterModal(null);
    setFilterSearch("");
  };

  const selectFilterItem = (item: string) => {
    switch (filterModal) {
      case "technology":
        setTechnology(item);
        setTopic("All topics");
        break;
      case "topic":
        setTopic(item);
        break;
      case "aiTechnology":
        setAiTechnology(item);
        break;
      case "aiTopic":
        setAiTopic(item);
        break;
    }

    closeFilterModal();
  };

  // QUESTION ACTIONS

  const toggleQuestion = (id: string) => {
    setExpandedQuestion((current) => (current === id ? null : id));
  };

  const toggleCompleted = async (id: string) => {
    try {
      const response = await toggleCompletedQuestion(id);

      setCompletedQuestions(response.progress?.completedQuestions || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update completed status"
      );
    }
  };

  const toggleSaved = async (id: string) => {
    try {
      const response = await toggleBookmarkQuestion(id);

      setBookmarkedQuestions(response.progress?.bookmarkedQuestions || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update bookmark"
      );
    }
  };

  // DIFFICULTY STYLE

  const getDifficultyStyle = (value: string) => {
    if (value === "Easy") {
      return {
        background: "bg-emerald-500/10",
        text: "text-emerald-500 dark:text-emerald-400",
      };
    }

    if (value === "Medium") {
      return {
        background: "bg-amber-500/10",
        text: "text-amber-500 dark:text-amber-400",
      };
    }

    return {
      background: "bg-rose-500/10",
      text: "text-rose-500 dark:text-rose-400",
    };
  };

  // GENERATE AI QUESTIONS

  const handleGenerateAIQuestions = async () => {
    try {
      setGeneratingAI(true);
      setError("");

      await generateAIQuestions({
        technology: aiTechnology,
        topic: aiTopic,
        difficulty: aiDifficulty,
        experience: aiExperience,
        count: aiCount,
      });

      await loadInterviewData();

      setTechnology(aiTechnology);
      setTopic("All topics");
      setDifficulty("All levels");
      setShowSavedOnly(false);
      setSearch("");
      setShowAIGenerator(false);

      Alert.alert(
        "Questions Generated",
        `${aiCount} ${aiTechnology} questions generated successfully.`
      );
    } catch (error) {
      Alert.alert(
        "Generation Failed",
        error instanceof Error ? error.message : "Unable to generate questions"
      );
    } finally {
      setGeneratingAI(false);
    }
  };

  // LOADING

  if (loading) {
    return (
      <PageSkeleton cards={3} />
    );
  }

  // SCREEN

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* FIXED HEADER */}

      {/* HEADER */}

      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
              <Sparkles size={23} color="#8b5cf6" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                Interview Prep
              </Text>

              <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Improve your technical interview skills
              </Text>
            </View>
          </View>

          <View className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5">
            <Text className="text-[10px] font-bold text-violet-600 dark:text-violet-300">
              AI POWERED
            </Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 30,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 rounded-2xl bg-violet-600 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">
                Ready to practice?
              </Text>

              <Text className="mt-1 text-xs leading-5 text-violet-100">
                Explore questions, learn answers and track your progress.
              </Text>
            </View>

            <View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <CheckCircle2 size={26} color="#ffffff" />
            </View>
          </View>
        </View>
        {/* STATS */}

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#111218]">
            <Text className="text-xs text-zinc-600 dark:text-zinc-500">
              Questions
            </Text>
            <Text className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
              {questions.length}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#111218]">
            <Text className="text-xs text-zinc-600 dark:text-zinc-500">
              Completed
            </Text>
            <Text className="mt-2 text-xl font-bold text-emerald-500 dark:text-emerald-400">
              {completedQuestions.length}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#111218]">
            <Text className="text-xs text-zinc-600 dark:text-zinc-500">
              Saved
            </Text>
            <Text className="mt-2 text-xl font-bold text-violet-500 dark:text-violet-400">
              {bookmarkedQuestions.length}
            </Text>
          </View>
        </View>

        {/* AI GENERATOR CARD */}

        <View className="mt-5 overflow-hidden rounded-2xl border border-violet-200 bg-white dark:border-violet-500/20 dark:bg-[#111218]">
          <Pressable
            onPress={() => setShowAIGenerator(!showAIGenerator)}
            className="flex-row items-center p-4"
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
              <Sparkles size={21} color="#8b5cf6" />
            </View>

            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                  AI Question Generator
                </Text>
                <View className="ml-2 rounded-full bg-violet-500/10 px-2 py-1">
                  <Text className="text-[9px] font-bold tracking-wide text-violet-600 dark:text-violet-300">
                    AI POWERED
                  </Text>
                </View>
              </View>

              <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Create tailored questions for your preparation
              </Text>
            </View>

            <ChevronDown
              size={19}
              color="#8b5cf6"
              style={{
                transform: [{ rotate: showAIGenerator ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>

          {!showAIGenerator ? (
            <View className="px-4 pb-4">
              <Pressable
                onPress={() => setShowAIGenerator(true)}
                className="flex-row items-center justify-center rounded-xl bg-violet-600 px-4 py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  Set up questions
                </Text>
                <ChevronDown
                  size={16}
                  color="#ffffff"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* AI GENERATOR */}

        {showAIGenerator ? (
          <View className="mt-2 rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-500/20 dark:bg-[#111218]">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Sparkles size={19} color="#a78bfa" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                  AI Question Generator
                </Text>
                <Text className="mt-1 text-xs text-zinc-600 dark:text-zinc-500">
                  Generate interview questions for your experience level.
                </Text>
              </View>
            </View>

            {/* TECHNOLOGY */}

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Technology
            </Text>

            <TouchableOpacity
              onPress={() => {
                setFilterSearch("");
                setFilterModal("aiTechnology");
              }}
              className="flex-row items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                {aiTechnology}
              </Text>
              <ChevronDown size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* TOPIC */}

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Topic
            </Text>

            <TouchableOpacity
              onPress={() => {
                setFilterSearch("");
                setFilterModal("aiTopic");
              }}
              className="flex-row items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                {aiTopic}
              </Text>
              <ChevronDown size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* DIFFICULTY */}

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Difficulty
            </Text>

            <View className="flex-row gap-2">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((item) => {
                const selected = aiDifficulty === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setAiDifficulty(item)}
                    className={`flex-1 items-center rounded-xl border py-3 ${
                      selected
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected
                          ? "text-violet-600 dark:text-violet-300"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* EXPERIENCE */}

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Experience
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {["0-1 years", "1-3 years", "3-5 years", "5+ years"].map(
                (item) => {
                  const selected = aiExperience === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setAiExperience(item)}
                      className={`rounded-xl border px-4 py-2.5 ${
                        selected
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          selected
                            ? "text-violet-600 dark:text-violet-300"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>

            {/* NUMBER OF QUESTIONS */}

            <Text className="mb-2 mt-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Number of Questions
            </Text>

            <View className="flex-row gap-2">
              {[5, 10, 15].map((item) => {
                const selected = aiCount === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setAiCount(item)}
                    className={`flex-1 items-center rounded-xl border py-3 ${
                      selected
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected
                          ? "text-violet-600 dark:text-violet-300"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* GENERATE BUTTON */}

            <TouchableOpacity
              onPress={handleGenerateAIQuestions}
              disabled={generatingAI}
              className={`mt-5 flex-row items-center justify-center rounded-xl py-3.5 shadow-sm ${
                generatingAI ? "bg-violet-500/50" : "bg-violet-600"
              }`}
            >
              {generatingAI ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Sparkles size={18} color="#ffffff" />
              )}

              <Text className="ml-2 font-semibold text-white">
                {generatingAI
                  ? "Generating Questions..."
                  : `Generate ${aiCount} Questions`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* SEARCH AND QUICK FILTERS */}

        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                Practice Questions
              </Text>
              <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Find questions by technology or difficulty
              </Text>
            </View>

            {hasActiveFilters ? (
              <Pressable
                onPress={clearFilters}
                className="rounded-lg px-2.5 py-1.5"
              >
                <Text className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                  Clear all
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View className="mt-4 flex-row items-center rounded-xl border border-zinc-200 bg-white px-3 dark:border-white/10 dark:bg-[#111218]">
            <Search size={18} color="#71717a" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search questions..."
              placeholderTextColor="#71717a"
              className="flex-1 px-3 py-3.5 text-sm text-zinc-900 dark:text-white"
            />
            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch("")}
                className="h-8 w-8 items-center justify-center"
              >
                <X size={17} color="#71717a" />
              </Pressable>
            ) : null}
          </View>

          <View className="mt-4 flex-row items-center gap-2">
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Technology
            </Text>

            <Pressable
              onPress={() => openFilterModal("technology")}
              className="flex-1 flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#111218]"
            >
              <Text
                numberOfLines={1}
                className="mr-2 flex-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
              >
                {technology}
              </Text>
              <ChevronDown size={16} color="#8b5cf6" />
            </Pressable>

            <Pressable
              onPress={() => setFilterModal("topic")}
              className={`h-10 w-10 items-center justify-center rounded-xl border ${
                topic !== "All topics"
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218]"
              }`}
            >
              <SlidersHorizontal
                size={17}
                color={topic !== "All topics" ? "#8b5cf6" : "#71717a"}
              />
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Difficulty
            </Text>

            <Pressable
              onPress={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex-row items-center rounded-full px-3 py-1.5 ${
                showSavedOnly
                  ? "bg-violet-500/15"
                  : "bg-zinc-200/70 dark:bg-white/[0.06]"
              }`}
            >
              <Bookmark
                size={12}
                color={showSavedOnly ? "#8b5cf6" : "#71717a"}
              />
              <Text
                className={`ml-1.5 text-[11px] font-semibold ${
                  showSavedOnly
                    ? "text-violet-600 dark:text-violet-300"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Saved only
              </Text>
            </Pressable>
          </View>

          <View className="mt-2 flex-row gap-2">
            {["All levels", "Easy", "Medium", "Hard"].map((item) => {
              const selected = difficulty === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setDifficulty(item)}
                  className={`flex-1 items-center rounded-xl border py-2.5 ${
                    selected
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218]"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      selected
                        ? "text-violet-700 dark:text-violet-300"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item === "All levels" ? "All" : item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {topic !== "All topics" ? (
            <Pressable
              onPress={() => setFilterModal("topic")}
              className="mt-3 self-start rounded-full bg-violet-500/10 px-3 py-1.5"
            >
              <Text className="text-[11px] font-semibold text-violet-600 dark:text-violet-300">
                Topic: {topic} · Change
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* RESULT COUNT */}

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-400">
            {filteredQuestions.length}{" "}
            {filteredQuestions.length === 1 ? "question" : "questions"}
          </Text>

          <Text className="text-xs text-zinc-500 dark:text-zinc-500">
            {completedQuestions.length} completed
          </Text>
        </View>

        {/* ERROR */}

        {error ? (
          <View className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <Text className="text-sm leading-5 text-red-500 dark:text-red-400">
              {error}
            </Text>

            <Pressable
              onPress={() => {
                setError("");
                loadInterviewData();
              }}
              className="mt-3"
            >
              <Text className="text-sm font-semibold text-red-500 dark:text-red-300">
                Try again
              </Text>
            </Pressable>
          </View>
        ) : null}
        {/* QUESTIONS */}

        <View className="mt-4 gap-3">
          {filteredQuestions.map((question, index) => {
            const expanded = expandedQuestion === question._id;
            const isCompleted = completedQuestions.includes(question._id);
            const isSaved = bookmarkedQuestions.includes(question._id);
            const difficultyStyle = getDifficultyStyle(question.difficulty);

            return (
              <View
                key={question._id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111218]"
              >
                <Pressable
                  onPress={() => toggleQuestion(question._id)}
                  className="p-4"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text className="text-xs font-medium text-violet-600 dark:text-violet-400">
                          #{index + 1}
                        </Text>

                        <Text className="text-xs text-zinc-500 dark:text-zinc-500">
                          {question.category}
                        </Text>

                        <View
                          className={`rounded-md px-2 py-1 ${difficultyStyle.background}`}
                        >
                          <Text
                            className={`text-[10px] font-semibold ${difficultyStyle.text}`}
                          >
                            {question.difficulty}
                          </Text>
                        </View>

                        {isCompleted ? (
                          <View className="rounded-md bg-emerald-500/10 px-2 py-1">
                            <Text className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                              Completed
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text className="mt-3 text-base font-semibold leading-6 text-zinc-900 dark:text-white">
                        {question.question}
                      </Text>

                      <Text className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        {question.topic}
                      </Text>
                    </View>

                    {expanded ? (
                      <ChevronUp size={19} color="#71717a" />
                    ) : (
                      <ChevronDown size={19} color="#71717a" />
                    )}
                  </View>
                </Pressable>

                {expanded ? (
                  <View className="border-t border-zinc-200 px-4 pb-4 pt-4 dark:border-white/10">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                      Answer
                    </Text>

                    <Text className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {question.answer}
                    </Text>

                    {question.tags?.length > 0 ? (
                      <View className="mt-4 flex-row flex-wrap gap-2">
                        {question.tags.map((tag) => (
                          <View
                            key={tag}
                            className="rounded-lg bg-zinc-100 px-2.5 py-1.5 dark:bg-white/[0.05]"
                          >
                            <Text className="text-[10px] text-zinc-600 dark:text-zinc-500">
                              #{tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <View className="mt-5 flex-row gap-3">
                      <Pressable
                        onPress={() => toggleCompleted(question._id)}
                        className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${
                          isCompleted
                            ? "bg-emerald-500/10"
                            : "bg-zinc-100 dark:bg-white/[0.05]"
                        }`}
                      >
                        <CheckCircle2
                          size={17}
                          color={isCompleted ? "#34d399" : "#71717a"}
                        />

                        <Text
                          className={`text-xs font-semibold ${
                            isCompleted
                              ? "text-emerald-500 dark:text-emerald-400"
                              : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Mark complete"}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => toggleSaved(question._id)}
                        className={`w-12 items-center justify-center rounded-xl ${
                          isSaved
                            ? "bg-violet-500/10"
                            : "bg-zinc-100 dark:bg-white/[0.05]"
                        }`}
                      >
                        <Bookmark
                          size={18}
                          color={isSaved ? "#a78bfa" : "#71717a"}
                          fill={isSaved ? "#a78bfa" : "none"}
                        />
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* EMPTY STATE */}

        {filteredQuestions.length === 0 && !error ? (
          <View className="items-center py-16">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.05]">
              <Search size={24} color="#71717a" />
            </View>

            <Text className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
              No questions found
            </Text>

            <Text className="mt-2 text-center text-sm leading-5 text-zinc-600 dark:text-zinc-500">
              Try changing your filters or search term.
            </Text>

            <Pressable
              onPress={() => {
                clearFilters();
                setSearch("");
              }}
              className="mt-5 rounded-xl bg-violet-500/10 px-5 py-3"
            >
              <Text className="text-sm font-semibold text-violet-600 dark:text-violet-300">
                Clear filters
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      {/* SEARCHABLE FILTER BOTTOM SHEET */}

      <Modal
        visible={filterModal !== null}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeFilterModal}
      >
        <View className="flex-1 bg-black/50">
          <Pressable className="absolute inset-0" onPress={closeFilterModal} />

          <View className="absolute bottom-0 left-0 right-0 h-[75%] rounded-t-3xl bg-white px-5 pt-3 dark:bg-[#111218]">
            {/* HANDLE */}

            <View className="mb-4 items-center">
              <View className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </View>

            {/* HEADER */}

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-zinc-900 dark:text-white">
                  {filterModal === "technology" ||
                  filterModal === "aiTechnology"
                    ? "Select Technology"
                    : filterModal === "aiTopic"
                    ? "Select AI Topic"
                    : "Filter by Topic"}
                </Text>

                <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {filterModal === "technology"
                    ? "Search and select a technology"
                    : filterModal === "topic"
                    ? technology === "All technologies"
                      ? "Search and select a topic"
                      : `Topics for ${technology}`
                    : filterModal === "aiTechnology"
                    ? "Choose a technology for AI question generation"
                    : "Choose a topic for AI question generation"}
                </Text>
              </View>

              <Pressable
                onPress={closeFilterModal}
                className="h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.05]"
              >
                <X size={18} color="#71717a" />
              </Pressable>
            </View>

            {/* SEARCH */}

            <View className="mt-5 flex-row items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 dark:border-white/10 dark:bg-white/[0.03]">
              <Search size={18} color="#71717a" />

              <TextInput
                value={filterSearch}
                onChangeText={setFilterSearch}
                placeholder={
                  filterModal === "technology" || filterModal === "aiTechnology"
                    ? "Search technology..."
                    : "Search topic..."
                }
                placeholderTextColor="#71717a"
                returnKeyType="search"
                className="ml-2 flex-1 py-3.5 text-sm text-zinc-900 dark:text-white"
              />

              {filterSearch.length > 0 && (
                <Pressable
                  onPress={() => setFilterSearch("")}
                  className="h-8 w-8 items-center justify-center"
                >
                  <X size={17} color="#71717a" />
                </Pressable>
              )}
            </View>

            {/* RESULTS */}

            <ScrollView
              className="mt-4 flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                paddingBottom: 30,
              }}
            >
              {filteredDropdownItems.map((item) => {
                const selected =
                  filterModal === "technology"
                    ? technology === item
                    : filterModal === "topic"
                    ? topic === item
                    : filterModal === "aiTechnology"
                    ? aiTechnology === item
                    : filterModal === "aiTopic"
                    ? aiTopic === item
                    : false;

                return (
                  <Pressable
                    key={item}
                    onPress={() => selectFilterItem(item)}
                    className={`mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3.5 ${
                      selected
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-transparent bg-zinc-50 dark:bg-white/[0.03]"
                    }`}
                  >
                    <Text
                      className={`mr-3 flex-1 text-sm font-medium ${
                        selected
                          ? "text-violet-700 dark:text-violet-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {item}
                    </Text>

                    {selected && <CheckCircle2 size={18} color="#8b5cf6" />}
                  </Pressable>
                );
              })}

              {filteredDropdownItems.length === 0 && (
                <View className="items-center py-10">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.05]">
                    <Search size={21} color="#71717a" />
                  </View>

                  <Text className="mt-3 text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                    No results found
                  </Text>

                  <Text className="mt-1 text-xs text-zinc-500">
                    Try another search term
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
