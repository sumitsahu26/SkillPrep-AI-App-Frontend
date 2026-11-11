import { apiRequest } from "./api";

export type AssessmentDifficulty = "Easy" | "Medium" | "Hard";

export interface StartAssessmentInput {
  technology: string;
  topic?: string;
  difficulty: AssessmentDifficulty;
  questionCount: number;
}

export interface AssessmentOption {
  _id?: string;
  text: string;
}

export interface AssessmentQuestion {
  _id: string;
  questionId?: string;
  question: string;
  options: AssessmentOption[] | string[];
  topic: string;
  difficulty: AssessmentDifficulty;
}

export interface SkillAssessment {
  _id: string;
  technology: string;
  topic: string;
  difficulty: AssessmentDifficulty;
  questionCount: number;
  questions: AssessmentQuestion[];
  status: "in_progress" | "completed";
  score?: number;
  percentage?: number;
  correctAnswers?: number;
  skillLevel?: string;
  createdAt?: string;
}

const BASE_URL = "/skill-assessments";

export const startSkillAssessment = (data: StartAssessmentInput) => {
  return apiRequest(`${BASE_URL}/start`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const submitSkillAssessment = (id: string, answers: Record<string, string>) => {
  return apiRequest(`${BASE_URL}/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
};

export const getSkillAssessments = () => {
  return apiRequest(BASE_URL, {
    method: "GET",
  });
};

export const getSkillAssessment = (id: string) => {
  return apiRequest(`${BASE_URL}/${id}`, {
    method: "GET",
  });
};

export const deleteSkillAssessment = (id: string) => {
  return apiRequest(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
};