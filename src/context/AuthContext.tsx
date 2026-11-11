import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
  } from "react";
  
  import * as SecureStore from "expo-secure-store";
  import { API_URL } from "../constants/config";
  import { refreshAccessToken } from "@/services/api";
  
  interface User {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  }
  
  interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshAuth: () => Promise<void>;
    logout: () => Promise<void>;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(
    undefined
  );
  
  export function AuthProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const refreshAuth = useCallback(async () => {
      const storedUser = await SecureStore.getItemAsync("user");
  
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }, []);
  

    const restoreSession = useCallback(async () => {
        try {
          const [accessToken, refreshToken, storedUser] =
            await Promise.all([
              SecureStore.getItemAsync("accessToken"),
              SecureStore.getItemAsync("refreshToken"),
              SecureStore.getItemAsync("user"),
            ]);
      
          if (!refreshToken || !storedUser) {
            setUser(null);
            return;
          }
      
          // Restore cached user immediately.
          setUser(JSON.parse(storedUser));
      
          // Refresh only if access token is missing.
          // If it exists but has expired, api.ts will refresh
          // automatically when an API request receives 401.
          if (!accessToken) {
            const newToken = await refreshAccessToken();
      
            if (!newToken) {
              setUser(null);
            }
          }
        } catch (error) {
          console.log("Session restore error:", error);
      
          // Keep cached user during temporary network failures.
        } finally {
          setIsLoading(false);
        }
      }, []);
      
  
    const logout = useCallback(async () => {
      const refreshToken =
        await SecureStore.getItemAsync("refreshToken");
  
      try {
        if (refreshToken) {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });
        }
      } catch (error) {
        console.log("Logout API error:", error);
      } finally {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
  
        setUser(null);
      }
    }, []);
  
    useEffect(() => {
      restoreSession();
    }, [restoreSession]);
  
    return (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          isLoading,
          refreshAuth,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error("useAuth must be used inside AuthProvider");
    }
  
    return context;
  }