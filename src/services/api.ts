
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/config";

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken =
        await SecureStore.getItemAsync("refreshToken");

      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 401 || response.status === 403) {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to refresh access token"
        );
      }

      if (!data.accessToken) {
        throw new Error("New access token not received");
      }

      await SecureStore.setItemAsync(
        "accessToken",
        data.accessToken
      );

      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit,
  isRetry = false
): Promise<T> {
  const accessToken =
    await SecureStore.getItemAsync("accessToken");

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes("/auth/refresh")
  ) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      return makeRequest<T>(endpoint, options, true);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return makeRequest<T>(endpoint, options);
}

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  return makeRequest<T>(endpoint, {
    method: "POST",
    body: formData,
  });
}
