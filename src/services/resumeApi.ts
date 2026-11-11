import { apiRequest } from "./api";

/* =========================================================
   TYPES
========================================================= */

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

export interface ResumeProject {
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
}

export interface Resume {
  _id: string;
  userId?: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  languages?: string[];
  template: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResumeInput {
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  languages?: string[];
  template?: string;
}

/* =========================================================
   API RESPONSE TYPES
========================================================= */

interface ResumeResponse {
  success: boolean;
  message?: string;
  resume: Resume;
}

interface ResumeListResponse {
  success: boolean;
  count?: number;
  resumes: Resume[];
}

/* =========================================================
   CREATE RESUME
========================================================= */

export const createResume = async (
  data: CreateResumeInput
): Promise<ResumeResponse> => {
  return apiRequest<ResumeResponse>("/resumes", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/* =========================================================
   GET ALL RESUMES
========================================================= */

export const getAllResumes = async (): Promise<ResumeListResponse> => {
  return apiRequest<ResumeListResponse>("/resumes");
};

/* =========================================================
   GET SINGLE RESUME
========================================================= */

export const getResumeById = async (
  id: string
): Promise<ResumeResponse> => {
  return apiRequest<ResumeResponse>(`/resumes/${id}`);
};

/* =========================================================
   UPDATE RESUME
========================================================= */

export const updateResume = async (
  id: string,
  data: Partial<CreateResumeInput>
): Promise<ResumeResponse> => {
  return apiRequest<ResumeResponse>(`/resumes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/* =========================================================
   DELETE RESUME
========================================================= */

export const deleteResume = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  return apiRequest(`/resumes/${id}`, {
    method: "DELETE",
  });
};