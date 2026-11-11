import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bot,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react-native";

import {
  clearMentorHistory,
  getMentorHistory,
  sendMentorMessage,
  MentorMessage,
} from "../services/aiMentorApi";

const QUICK_PROMPTS = [
  {
    title: "Explain a concept",
    prompt: "Explain the Node.js event loop with a simple example.",
  },
  {
    title: "Debug my code",
    prompt: "Help me debug my code. I will share the code and error.",
  },
  {
    title: "Interview preparation",
    prompt: "Ask me 5 intermediate-level Node.js interview questions.",
  },
  {
    title: "Improve my skills",
    prompt: "Based on my SkillPrep progress, what should I learn next?",
  },
];

export default function AIMentorScreen() {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const scrollRef = useRef<ScrollViewInstance>(null);

  const loadHistory = useCallback(async () => {
    try {
      setInitialLoading(true);
      const history = await getMentorHistory();
      setMessages(history);
    } catch (error) {
      console.error("AI Mentor history error:", error);
      Alert.alert("Error", "Unable to load chat history.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const message = (text ?? input).trim();

    if (!message || loading) return;

    const userMessage: MentorMessage = {
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMentorMessage(message);

      const assistantMessage: MentorMessage = {
        role: "assistant",
        content: response.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error("AI Mentor send error:", error);

      Alert.alert(
        "Unable to send message",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0 || loading) return;

    Alert.alert(
      "Clear chat history",
      "Are you sure you want to delete all your AI Mentor messages?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearMentorHistory();
              setMessages([]);
            } catch (error) {
              Alert.alert("Error", "Unable to clear chat history.");
            }
          },
        },
      ]
    );
  };

  const handleNewChat = () => {
    if (loading) return;

    Alert.alert(
      "Start a new chat",
      "This will clear your existing chat history. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            try {
              await clearMentorHistory();
              setMessages([]);
            } catch {
              Alert.alert("Error", "Unable to start a new chat.");
            }
          },
        },
      ]
    );
  };

  const renderMessage = (item: MentorMessage, index: number) => {
    const isUser = item.role === "user";

    return (
      <View
        key={item._id || `${item.createdAt}-${index}`}
        className={`mb-5 flex-row ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <View className="mr-2 mt-1 h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
            <Bot size={18} color="#ffffff" />
          </View>
        )}

        <View
          className={`max-w-[82%] rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-tr-sm bg-violet-600"
              : "rounded-tl-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#171722]"
          }`}
        >
          <Text
            className={`text-[14px] leading-6 ${
              isUser
                ? "text-white"
                : "text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {item.content}
          </Text>
        </View>

        {isUser && (
          <View className="ml-2 mt-1 h-8 w-8 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700">
            <User size={17} color="#a1a1aa" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800"
            >
              <ArrowLeft size={19} color="#a1a1aa" />
            </TouchableOpacity>

            <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <Sparkles size={21} color="#ffffff" />
            </View>

            <View className="ml-3">
              <Text className="text-base font-bold text-zinc-900 dark:text-white">
                AI Mentor
              </Text>
              <Text className="text-[11px] text-emerald-500">
                Your personal learning assistant
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleNewChat}
              disabled={loading}
              className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800"
            >
              <Plus size={19} color="#a1a1aa" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearHistory}
              disabled={loading || messages.length === 0}
              className="h-9 w-9 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800"
            >
              <Trash2 size={17} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CHAT */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {initialLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="mt-3 text-sm text-zinc-500">
                Loading your conversations...
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="pt-8">
              <View className="mb-5 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-3xl bg-violet-600">
                  <Bot size={34} color="#ffffff" />
                </View>

                <Text className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">
                  How can I help you?
                </Text>

                <Text className="mt-2 text-center text-sm leading-6 text-zinc-500">
                  Ask me anything about programming, interviews, resumes, or
                  your learning journey.
                </Text>
              </View>

              <Text className="mb-3 mt-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Try asking
              </Text>

              {QUICK_PROMPTS.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  onPress={() => handleSend(item.prompt)}
                  disabled={loading}
                  className="mb-3 flex-row items-center rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#15151f]"
                >
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                    <Sparkles size={17} color="#8b5cf6" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="mt-1 text-xs text-zinc-500"
                    >
                      {item.prompt}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            messages.map(renderMessage)
          )}

          {loading && (
            <View className="mb-4 flex-row items-center">
              <View className="mr-2 h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
                <Bot size={18} color="#ffffff" />
              </View>

              <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 dark:bg-[#171722]">
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text className="ml-2 text-xs text-zinc-500">
                  AI Mentor is thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* INPUT */}
        <View className="border-t border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-[#101018]">
          <View className="min-h-[48px] flex-row items-end rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-[#1a1a26]">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask your AI Mentor..."
              placeholderTextColor="#71717a"
              multiline
              maxLength={5000}
              editable={!loading && !initialLoading}
              className="max-h-28 min-h-[32px] flex-1 px-1 py-1 text-sm leading-5 text-zinc-900 dark:text-white"
            />

            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!input.trim() || loading || initialLoading}
              className={`ml-2 h-9 w-9 items-center justify-center rounded-xl ${
                input.trim() && !loading
                  ? "bg-violet-600"
                  : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <Send size={17} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text className="mt-2 text-center text-[10px] text-zinc-400">
            AI responses may occasionally be inaccurate. Verify important information.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}