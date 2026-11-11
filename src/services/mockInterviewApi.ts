
import { apiRequest } from "./api";

/* =========================================================
   TYPES
========================================================= */

export type MockInterviewDifficulty = "Easy" | "Medium" | "Hard";

export type MockInterviewStatus =
  | "in_progress"
  | "completed"
  | "abandoned";

export type MockQuestionSource = "database" | "ai";

export interface StartMockInterviewInput {
  technology: string;
  topic?: string;
  difficulty: MockInterviewDifficulty;
  experience: string;
  questionCount: number;
}

export interface MockInterviewQuestion {
  _id: string;
  questionId: string;
  question: string;
  expectedAnswer?: string;
  userAnswer: string;
  category: string;
  topic: string;
  difficulty: MockInterviewDifficulty;
  source: MockQuestionSource;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
  answeredAt?: string;
}

export interface MockInterview {
  _id: string;
  title: string;
  technology: string;
  topic: string;
  difficulty: MockInterviewDifficulty;
  experience: string;
  questionCount: number;
  questions: MockInterviewQuestion[];
  currentQuestionIndex: number;
  status: MockInterviewStatus;
  totalScore: number;
  percentage: number;
  strengths: string[];
  improvements: string[];
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
}

export interface StartMockInterviewResponse {
  success: boolean;
  message: string;
  requestedQuestionCount: number;
  actualQuestionCount: number;
  usedFallback: boolean;
  interview: MockInterview;
}

export interface MockInterviewListResponse {
  success: boolean;
  count: number;
  interviews: MockInterview[];
}

export interface MockInterviewResponse {
  success: boolean;
  message: string;
  interview: MockInterview;
}

export interface SubmitAnswerResponse {
  success: boolean;
  message: string;
  evaluationSuccessful: boolean;
  evaluation: MockEvaluation;
  interview: MockInterview;
}

/* =========================================================
   API BASE PATH

   Change this if your backend uses a different
   app.use() route prefix.
========================================================= */

const BASE_URL = "/mock-interviews";

/* =========================================================
   START MOCK INTERVIEW
========================================================= */

export const startMockInterview = async (
  data: StartMockInterviewInput
): Promise<StartMockInterviewResponse> => {
  return apiRequest(BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<StartMockInterviewResponse>;
};

/* =========================================================
   GET USER INTERVIEW HISTORY
========================================================= */

export const getMockInterviews = async (): Promise<MockInterviewListResponse> => {
  return apiRequest(BASE_URL, {
    method: "GET",
  }) as Promise<MockInterviewListResponse>;
};

/* =========================================================
   GET SINGLE INTERVIEW
========================================================= */

export const getMockInterview = async (
  id: string
): Promise<MockInterviewResponse> => {
  return apiRequest(`${BASE_URL}/${id}`, {
    method: "GET",
  }) as Promise<MockInterviewResponse>;
};

/* =========================================================
   SUBMIT ANSWER
========================================================= */

export const submitMockInterviewAnswer = async (
  interviewId: string,
  questionId: string,
  answer: string
): Promise<SubmitAnswerResponse> => {
  return apiRequest(`${BASE_URL}/${interviewId}/answer`, {
    method: "POST",
    body: JSON.stringify({
      questionId,
      answer,
    }),
  }) as Promise<SubmitAnswerResponse>;
};

/* =========================================================
   COMPLETE INTERVIEW
========================================================= */

export const completeMockInterview = async (
  id: string
): Promise<MockInterviewResponse> => {
  return apiRequest(`${BASE_URL}/${id}/complete`, {
    method: "POST",
  }) as Promise<MockInterviewResponse>;
};

/* =========================================================
   ABANDON INTERVIEW
========================================================= */

export const abandonMockInterview = async (
  id: string
): Promise<MockInterviewResponse> => {
  return apiRequest(`${BASE_URL}/${id}/abandon`, {
    method: "POST",
  }) as Promise<MockInterviewResponse>;
};

/* =========================================================
   DELETE INTERVIEW
========================================================= */

export const deleteMockInterview = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  return apiRequest(`${BASE_URL}/${id}`, {
    method: "DELETE",
  }) as Promise<{ success: boolean; message: string }>;
};
