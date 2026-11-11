import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/config";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

export async function loginUser(
  data: LoginInput
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  await SecureStore.setItemAsync(
    "accessToken",
    result.accessToken
  );

  await SecureStore.setItemAsync(
    "refreshToken",
    result.refreshToken
  );

  if (result.user) {
    await SecureStore.setItemAsync(
      "user",
      JSON.stringify(result.user)
    );
  }

  return result;
}

export async function logoutUser() {
  const refreshToken =
    await SecureStore.getItemAsync("refreshToken");

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.log("Logout API error:", error);
  } finally {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("user");
  }
}

export async function getStoredUser() {
  const user = await SecureStore.getItemAsync("user");

  return user ? JSON.parse(user) : null;
}

export async function getAccessToken() {
  return SecureStore.getItemAsync("accessToken");
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  const accessToken = await SecureStore.getItemAsync("accessToken");

  const response = await fetch(`${API_URL}/profile/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Password change failed");
  }

  return result;
}