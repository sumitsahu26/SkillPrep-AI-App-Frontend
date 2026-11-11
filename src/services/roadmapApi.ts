import { apiRequest } from "./api";

export type RoadmapStatus = "not_started" | "in_progress" | "completed";

export interface RoadmapResource {
  title: string;
  type: "documentation" | "practice" | "project" | "video" | "other";
  url?: string;
}

export interface RoadmapTopic {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface RoadmapStep {
  _id: string;
  week: number;
  title: string;
  description: string;
  topics: RoadmapTopic[];
  resources: RoadmapResource[];
  completed: boolean;
  completedAt?: string;
}

export interface LearningRoadmap {
  _id: string;
  title: string;
  targetRole: string;
  experience: string;
  durationWeeks: number;
  currentSkills: string[];
  targetSkills: string[];
  steps: RoadmapStep[];
  status: RoadmapStatus;
  progress: number;
  source: "ai" | "manual";
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateRoadmapInput {
  targetRole: string;
  experience: string;
  durationWeeks: number;
  currentSkills: string[];
  targetSkills?: string[];
}

interface RoadmapResponse {
  success: boolean;
  message?: string;
  roadmap: LearningRoadmap;
}

interface RoadmapListResponse {
  success: boolean;
  count: number;
  roadmaps: LearningRoadmap[];
}

export const generateRoadmap = (data: GenerateRoadmapInput) =>
  apiRequest<RoadmapResponse>("/roadmaps/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getRoadmaps = () =>
  apiRequest<RoadmapListResponse>("/roadmaps", {
    method: "GET",
  });

export const getRoadmapById = (id: string) =>
  apiRequest<RoadmapResponse>(`/roadmaps/${id}`, {
    method: "GET",
  });

export const toggleRoadmapTopic = (roadmapId: string, topicId: string) =>
  apiRequest<RoadmapResponse>(
    `/roadmaps/${roadmapId}/topics/${topicId}`,
    {
      method: "PATCH",
    }
  );

export const deleteRoadmap = (id: string) =>
  apiRequest<{ success: boolean; message?: string }>(
    `/roadmaps/${id}`,
    {
      method: "DELETE",
    }
  );