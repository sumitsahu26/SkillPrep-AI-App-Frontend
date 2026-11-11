import { apiRequest } from "./api";
import { API_URL } from "../constants/config";
import * as SecureStore from "expo-secure-store";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

export interface Profile {
  _id?: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  currentRole: string;
  experience: number;
  skills: string[];
  github: string;
  linkedin: string;
  portfolio: string;
  userId: {
    name: string;
    email: string;
    profileImage: string;
  };
}

interface ProfileResponse {
  success: boolean;
  profile: Profile;
  message?: string;
}

interface UserResponse {
  success: boolean;
  user: {
    name: string;
    email: string;
  };
  message?: string;
}

export const getProfile = async (): Promise<Profile> => {
  const response = await apiRequest<ProfileResponse>("/profile");
  return response.profile;
};

export const updateProfile = async (
  data: Partial<Profile>
): Promise<Profile> => {
  const response = await apiRequest<ProfileResponse>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return response.profile;
};

export const updateUserName = async (
  name: string
): Promise<void> => {
  await apiRequest<UserResponse>("/profile/user", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
};

export const addProfileSkill = async (
  skill: string
): Promise<Profile> => {
  const response = await apiRequest<ProfileResponse>("/profile/skills", {
    method: "POST",
    body: JSON.stringify({ skill }),
  });

  return response.profile;
};

export const removeProfileSkill = async (
  skill: string
): Promise<Profile> => {
  const response = await apiRequest<ProfileResponse>(
    `/profile/skills/${encodeURIComponent(skill)}`,
    { method: "DELETE" }
  );

  return response.profile;
};

export const uploadProfileImage = async (
    imageUri: string,
    fileName: string,
    mimeType: string
  ): Promise<string> => {
    const accessToken = await SecureStore.getItemAsync("accessToken");
  
    const file = new File(imageUri);
  
    const formData = new FormData();
  
    formData.append("profileImage", file, fileName);
  
    const response = await expoFetch(`${API_URL}/profile/image`, {
      method: "PUT",
      headers: {
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      body: formData,
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || "Profile image upload failed");
    }
  
    return data.profileImage;
  };