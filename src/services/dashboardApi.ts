import { apiRequest } from "./api";

export interface DashboardData {
  stats: {
    resumes: number;
    interviewCompleted: number;
    assessmentsCompleted: number;
    mockInterviewsCompleted: number;
  };

  careerReadiness: {
    score: number;
    interview: number;
    assessment: number;
    mockInterview: number;
    roadmap: number;
  };

  interview: {
    completed: number;
    total: number;
    bookmarked: number;
    percentage: number;
  };

  roadmap: {
    _id: string;
    targetRole: string;
    progress: number;
    status: string;
  } | null;

  skillPerformance: {
    technology: string;
    topic: string;
    percentage: number;
    skillLevel: string;
  }[];

  recentResumes: any[];
  recentActivity: any[];
}

interface DashboardResponse {
  success: boolean;
  dashboard: DashboardData;
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await apiRequest<DashboardResponse>("/dashboard");
  return response.dashboard;
};