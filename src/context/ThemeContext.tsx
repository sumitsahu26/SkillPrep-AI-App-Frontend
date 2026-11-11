
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const savedTheme =
          await SecureStore.getItemAsync("appTheme");

        if (!mounted) return;

        const initialTheme: Theme =
          savedTheme === "light" ? "light" : "dark";

        setThemeState(initialTheme);
        setColorScheme(initialTheme);
      } catch (error) {
        console.log("Theme loading error:", error);
        if (mounted) {
          setThemeState("dark");
          setColorScheme("dark");
        }
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, [setColorScheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      setColorScheme(newTheme);

      SecureStore.setItemAsync("appTheme", newTheme).catch(
        (error) => console.log("Theme saving error:", error)
      );
    },
    [setColorScheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: colorScheme === "light" ? "light" : theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
