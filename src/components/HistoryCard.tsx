import {
    View,
    Text,
    TouchableOpacity,
  } from "react-native";
  
  import {
    ChevronRight,
    Clock,
    Trophy,
    Trash2,
    XCircle,
  } from "lucide-react-native";
  
  export type HistoryStatus =
    | "in_progress"
    | "completed"
    | "abandoned";
  
  interface HistoryCardProps {
    technology: string;
    title?: string;
    subtitle?: string;
    status: HistoryStatus;
    questionCount: number;
    percentage?: number;
    onPress: () => void;
    onDelete: () => void;
  }
  
  export default function HistoryCard({
    technology,
    title,
    subtitle,
    status,
    questionCount,
    percentage,
    onPress,
    onDelete,
  }: HistoryCardProps) {
    const statusConfig = {
      completed: {
        label: "Completed",
        color: "text-green-600 dark:text-green-400",
        icon: <Trophy size={14} color="#22c55e" />,
      },
      in_progress: {
        label: "In Progress",
        color: "text-amber-600 dark:text-amber-400",
        icon: <Clock size={14} color="#f59e0b" />,
      },
      abandoned: {
        label: "Abandoned",
        color: "text-red-500 dark:text-red-400",
        icon: <XCircle size={14} color="#ef4444" />,
      },
    };
  
    const currentStatus = statusConfig[status];
  
    return (
      <View className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#15151f]">
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="flex-1 flex-row items-center"
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
              <Text className="text-sm font-bold text-violet-600 dark:text-violet-400">
                {technology.substring(0, 2).toUpperCase()}
              </Text>
            </View>
  
            <View className="ml-3 flex-1">
              <Text
                numberOfLines={1}
                className="text-sm font-bold text-zinc-900 dark:text-white"
              >
                {title || `${technology} Assessment`}
              </Text>
  
              {!!subtitle && (
                <Text
                  numberOfLines={1}
                  className="mt-1 text-xs text-zinc-500 dark:text-zinc-400"
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.7}
            className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10"
          >
            <Trash2 size={15} color="#ef4444" />
          </TouchableOpacity>
        </View>
  
        <View className="mx-4 border-t border-zinc-100 dark:border-white/[0.06]" />
  
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <View className="flex-row items-center">
            {currentStatus.icon}
  
            <Text className={`ml-1.5 text-[11px] font-semibold ${currentStatus.color}`}>
              {currentStatus.label}
            </Text>
          </View>
  
          <View className="flex-row items-center">
            {status === "completed" && percentage !== undefined && (
              <Text className="mr-3 text-xs font-bold text-violet-600 dark:text-violet-400">
                {percentage}%
              </Text>
            )}
  
            <Text className="mr-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {questionCount} Questions
            </Text>
  
            <ChevronRight size={16} color="#a1a1aa" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }