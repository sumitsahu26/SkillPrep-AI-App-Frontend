import { useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
} from "lucide-react-native";

import type { LearningRoadmap, RoadmapTopic } from "../services/roadmapApi";

interface DailyTask {
  topic: RoadmapTopic;
  week: number;
  weekTitle: string;
  date: Date;
}

interface RoadmapScheduleProps {
  roadmap: LearningRoadmap;
  updatingTopicId: string | null;
  onToggleTopic: (topicId: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

const getStartDate = (createdAt?: string) => {
  const date = createdAt ? new Date(createdAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export default function RoadmapSchedule({
  roadmap,
  updatingTopicId,
  onToggleTopic,
}: RoadmapScheduleProps) {
  const startDate = useMemo(
    () => getStartDate(roadmap.createdAt),
    [roadmap.createdAt]
  );

  const [selectedDate, setSelectedDate] = useState(
    () => getDateKey(getStartDate(roadmap.createdAt))
  );

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const start = getStartDate(roadmap.createdAt);
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const allTasks = useMemo<DailyTask[]>(() => {
    const tasks: DailyTask[] = [];

    roadmap.steps.forEach((step, stepIndex) => {
      step.topics.forEach((topic, topicIndex) => {
        // Distribute each week's topics over its seven calendar days.
        const dayIndex = (topicIndex % 7) + (step.week - 1) * 7;

        tasks.push({
          topic,
          week: step.week,
          weekTitle: step.title,
          date: addDays(startDate, dayIndex),
        });
      });
    });

    return tasks;
  }, [roadmap.steps, startDate]);

  const tasksByDate = useMemo(() => {
    const result: Record<string, DailyTask[]> = {};

    allTasks.forEach((task) => {
      const key = getDateKey(task.date);
      if (!result[key]) result[key] = [];
      result[key].push(task);
    });

    return result;
  }, [allTasks]);

  const selectedTasks = tasksByDate[selectedDate] || [];

  const selectedDateObject = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const firstDayOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  );

  // Monday-first calendar.
  const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarCells = [
    ...Array(leadingDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const todayKey = getDateKey(new Date());

  const changeMonth = (direction: number) => {
    setVisibleMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + direction, 1)
    );
  };

  const monthLabel = visibleMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const completedCount = selectedTasks.filter(
    (task) => task.topic.completed
  ).length;

  return (
    <View className="mt-6">
      {/* Section heading */}
      <View className="mb-4 flex-row items-center">
        <CalendarDays size={19} color="#8b5cf6" />
        <Text className="ml-2 text-base font-bold text-zinc-900 dark:text-white">
          Daily Learning Schedule
        </Text>
      </View>

      {/* Calendar */}
      <View className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]">
        <View className="mb-5 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            className="h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5"
          >
            <ChevronLeft size={18} color="#8b5cf6" />
          </TouchableOpacity>

          <Text className="text-sm font-bold text-zinc-900 dark:text-white">
            {monthLabel}
          </Text>

          <TouchableOpacity
            onPress={() => changeMonth(1)}
            className="h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5"
          >
            <ChevronRight size={18} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Weekday labels */}
        <View className="mb-2 flex-row">
          {WEEKDAYS.map((day) => (
            <View key={day} className="flex-1 items-center">
              <Text className="text-[10px] font-semibold text-zinc-400">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar dates */}
        <View className="flex-row flex-wrap">
          {calendarCells.map((day, index) => {
            if (!day) {
              return (
                <View key={`empty-${index}`} className="w-[14.2857%] p-1" />
              );
            }

            const date = new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              day
            );

            const dateKey = getDateKey(date);
            const dayTasks = tasksByDate[dateKey] || [];
            const hasTasks = dayTasks.length > 0;
            const allCompleted =
              hasTasks && dayTasks.every((task) => task.topic.completed);
            const isSelected = selectedDate === dateKey;
            const isToday = todayKey === dateKey;

            return (
              <View key={dateKey} className="w-[14.2857%] p-1">
                <TouchableOpacity
                  disabled={!hasTasks}
                  onPress={() => setSelectedDate(dateKey)}
                  className={`h-10 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-violet-600"
                      : hasTasks
                      ? "bg-violet-50 dark:bg-violet-500/10"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected
                        ? "text-white"
                        : hasTasks
                        ? "text-violet-700 dark:text-violet-300"
                        : isToday
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {day}
                  </Text>

                  {hasTasks && (
                    <View
                      className={`mt-1 h-1 w-1 rounded-full ${
                        isSelected
                          ? "bg-white"
                          : allCompleted
                          ? "bg-green-500"
                          : "bg-violet-500"
                      }`}
                    />
                  )}

                  {!hasTasks && isToday && (
                    <View className="mt-1 h-1 w-1 rounded-full bg-zinc-400" />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Calendar legend */}
        <View className="mt-4 flex-row flex-wrap items-center gap-4 border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-violet-500" />
            <Text className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Learning tasks
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
            <Text className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Selected day tasks */}
      <View className="mt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-bold text-zinc-900 dark:text-white">
              {formatDate(selectedDateObject)}
            </Text>
            <Text className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Your learning tasks for this day
            </Text>
          </View>

          <View className="rounded-lg bg-violet-100 px-2.5 py-1.5 dark:bg-violet-500/15">
            <Text className="text-[10px] font-bold text-violet-700 dark:text-violet-300">
              {completedCount}/{selectedTasks.length} Done
            </Text>
          </View>
        </View>

        {selectedTasks.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-7 dark:border-white/10 dark:bg-[#15151f]">
            <CalendarDays size={25} color="#a1a1aa" />
            <Text className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              No tasks scheduled
            </Text>
            <Text className="mt-1 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
              Select a highlighted date to view its learning tasks.
            </Text>
          </View>
        ) : (
          selectedTasks.map((task) => {
            const isUpdating = updatingTopicId === task.topic._id;

            return (
              <TouchableOpacity
                key={task.topic._id}
                disabled={!!updatingTopicId}
                onPress={() => onToggleTopic(task.topic._id)}
                activeOpacity={0.8}
                className="mb-2 flex-row items-start rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#15151f]"
              >
                <View
                  className={`mt-0.5 h-6 w-6 items-center justify-center rounded-lg ${
                    task.topic.completed
                      ? "bg-green-500"
                      : "border border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#8b5cf6" />
                  ) : task.topic.completed ? (
                    <Check size={14} color="#ffffff" />
                  ) : (
                    <Circle size={12} color="#a1a1aa" />
                  )}
                </View>

                <View className="ml-3 flex-1">
                  <Text
                    className={`text-xs font-bold ${
                      task.topic.completed
                        ? "text-zinc-400 line-through"
                        : "text-zinc-900 dark:text-white"
                    }`}
                  >
                    {task.topic.title}
                  </Text>

                  {!!task.topic.description && (
                    <Text className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                      {task.topic.description}
                    </Text>
                  )}

                  <View className="mt-2 flex-row items-center">
                    <Clock size={11} color="#8b5cf6" />
                    <Text className="ml-1 text-[10px] text-violet-600 dark:text-violet-400">
                      Week {task.week} • {task.weekTitle}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}
