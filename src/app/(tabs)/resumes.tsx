import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react-native";

import { getAllResumes, deleteResume, Resume } from "@/services/resumeApi";
import { useTheme } from "@/context/ThemeContext";
import PageSkeleton from "@/components/PageSkeleton";

export default function ResumesScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchResumes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAllResumes();

      setResumes(response.resumes || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load your resumes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResumes();
    }, [])
  );

  const handleDelete = (resume: Resume) => {
    Alert.alert(
      "Delete Resume",
      `Are you sure you want to delete "${resume.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(resume._id);

              await deleteResume(resume._id);

              setResumes((previous) =>
                previous.filter((item) => item._id !== resume._id)
              );
            } catch (err: any) {
              Alert.alert(
                "Delete Failed",
                err?.message || "Unable to delete resume."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredResumes = resumes.filter((resume) =>
    resume.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date?: string) => {
    if (!date) return "Recently created";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently created";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handlePreviewResume = (id: string) => {
    router.push({
      pathname: "/resume-preview",
      params: { id },
    });
  };

  const renderResume = ({ item }: { item: Resume }) => {
    const isDeleting = deletingId === item._id;

    return (
      <View className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/resume-builder",
              params: { id: item._id },
            })
          }
        >
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
              <FileText size={23} color="#8b5cf6" />
            </View>

            <View className="ml-3 flex-1">
              <Text
                numberOfLines={1}
                className="text-base font-bold text-zinc-900 dark:text-white"
              >
                {item.title || "Untitled Resume"}
              </Text>

              <View className="mt-1 flex-row items-center">
                <CalendarDays size={12} color="#a1a1aa" />

                <Text className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Updated {formatDate(item.updatedAt || item.createdAt)}
                </Text>
              </View>
            </View>

            <ChevronRight size={19} color={isDark ? "#71717a" : "#a1a1aa"} />
          </View>
        </TouchableOpacity>

        <View className="my-4 h-px bg-zinc-100 dark:bg-white/[0.07]" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="rounded-lg bg-emerald-50 px-2.5 py-1 dark:bg-emerald-500/10">
              <Text className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {item.template || "Modern"} Template
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => handlePreviewResume(item._id)}
              className="mr-2 flex-row items-center rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-500/10"
            >
              <Eye size={16} color="#8b5cf6" />
              <Text className="ml-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
                Preview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/resume-builder",
                  params: { id: item._id },
                })
              }
              className="mr-2 flex-row items-center rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-500/10"
            >
              <Edit3 size={14} color="#8b5cf6" />
              <Text className="ml-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isDeleting}
              onPress={() => handleDelete(item)}
              className="h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Trash2 size={15} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
              <FileText size={23} color="#8b5cf6" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                My Resumes
              </Text>

              <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Manage and organize your professional resumes
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/resume-builder")}
            activeOpacity={0.8}
            className="ml-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <Plus size={22} color="#8b5cf6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH AND COUNT */}
      <View className="px-5 pt-5">
        <View className="h-12 flex-row items-center rounded-xl border border-zinc-200 bg-white px-3 dark:border-white/[0.08] dark:bg-[#11131a]">
          <Search size={18} color="#a1a1aa" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search resumes..."
            placeholderTextColor="#a1a1aa"
            className="ml-2 flex-1 text-sm text-zinc-900 dark:text-white"
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text className="text-xs font-semibold text-violet-500">
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-5 mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Saved Resumes
          </Text>

          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            {resumes.length} {resumes.length === 1 ? "Resume" : "Resumes"}
          </Text>
        </View>
      </View>

      {/* RESUME LIST */}
      {loading ? (
        <PageSkeleton cards={3} />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <RefreshCw size={35} color="#8b5cf6" />

          <Text className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
            Something went wrong
          </Text>

          <Text className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {error}
          </Text>

          <TouchableOpacity
            onPress={() => fetchResumes()}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3"
          >
            <Text className="text-sm font-semibold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredResumes}
          keyExtractor={(item) => item._id}
          renderItem={renderResume}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 30,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchResumes(true)}
              tintColor="#8b5cf6"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <View className="h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 dark:bg-violet-500/10">
                <FileText size={35} color="#8b5cf6" />
              </View>

              <Text className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
                {search ? "No resumes found" : "No resumes yet"}
              </Text>

              <Text className="mt-2 max-w-[260px] text-center text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                {search
                  ? "Try searching with another resume title."
                  : "Create your first professional resume and make your next career move."}
              </Text>

              {!search && (
                <TouchableOpacity
                  onPress={() => router.push("/resume-builder")}
                  className="mt-6 flex-row items-center rounded-xl bg-violet-600 px-5 py-3"
                >
                  <Plus size={17} color="#ffffff" />
                  <Text className="ml-2 text-sm font-semibold text-white">
                    Create Resume
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
