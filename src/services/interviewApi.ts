import { apiRequest } from "./api";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionSource = "manual" | "ai" | "seed";

export interface InterviewQuestion {
  _id: string;
  category: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  tags: string[];
  source?: QuestionSource;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewProgress {
  _id: string;
  userId: string;
  completedQuestions: string[];
  bookmarkedQuestions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionListResponse {
  success: boolean;
  count: number;
  questions: InterviewQuestion[];
}

export interface ProgressResponse {
  success: boolean;
  message?: string;
  progress: InterviewProgress;
}

export interface QuestionFilters {
  category?: string;
  topic?: string;
  difficulty?: Difficulty;
}

// GET ALL QUESTIONS

export const getInterviewQuestions = async (
  filters?: QuestionFilters
): Promise<QuestionListResponse> => {
  const params = new URLSearchParams();

  if (filters?.category) {
    params.append("category", filters.category);
  }

  if (filters?.topic) {
    params.append("topic", filters.topic);
  }

  if (filters?.difficulty) {
    params.append("difficulty", filters.difficulty);
  }

  const query = params.toString();

  return apiRequest<QuestionListResponse>(
    `/interview/questions${query ? `?${query}` : ""}`
  );
};

// GET SINGLE QUESTION

export const getInterviewQuestion = async (
  id: string
): Promise<{
  success: boolean;
  message?: string;
  question: InterviewQuestion;
}> => {
  return apiRequest(`/interview/questions/${id}`);
};

// GET CATEGORIES

export const getInterviewCategories = async (): Promise<{
  success: boolean;
  categories: string[];
}> => {
  return apiRequest("/interview/categories");
};

// GET TOPICS

export const getInterviewTopics = async (
  category: string
): Promise<{
  success: boolean;
  category: string;
  topics: string[];
}> => {
  return apiRequest(
    `/interview/topics/${encodeURIComponent(category)}`
  );
};

// GET USER PROGRESS

export const getInterviewProgress = async (): Promise<ProgressResponse> => {
  return apiRequest<ProgressResponse>("/interview/progress");
};

// TOGGLE COMPLETED QUESTION

export const toggleCompletedQuestion = async (
  questionId: string
): Promise<ProgressResponse> => {
  return apiRequest<ProgressResponse>(
    "/interview/progress/completed",
    {
      method: "POST",
      body: JSON.stringify({
        questionId,
      }),
    }
  );
};

// TOGGLE BOOKMARK QUESTION

export const toggleBookmarkQuestion = async (
  questionId: string
): Promise<ProgressResponse> => {
  return apiRequest<ProgressResponse>(
    "/interview/progress/bookmark",
    {
      method: "POST",
      body: JSON.stringify({
        questionId,
      }),
    }
  );
};

export interface GenerateAIQuestionsInput {
    technology: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    experience: string;
    count: number;
  }
  
  export async function generateAIQuestions(
    input: GenerateAIQuestionsInput
  ) {
    return apiRequest<{
      success: boolean;
      message: string;
      questions: InterviewQuestion[];
    }>("/interview/generate-ai", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }