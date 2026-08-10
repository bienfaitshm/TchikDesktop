import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";
import {
  useConfigStore,
  useConfigActions,
} from "@/renderer/libs/stores/app-store";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

/**
 * Applies the given theme to the document root element and handles OS system theme changes.
 * @param theme - The target theme mode ("dark", "light", or "system").
 * @returns A cleanup function to unsubscribe from system preference listeners.
 */
function applyThemeToDocument(theme: Theme): () => void {
  const root = window.document.documentElement;

  const updateSystemTheme = () => {
    root.classList.remove("light", "dark");
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(isDark ? "dark" : "light");
  };

  if (theme === "system") {
    updateSystemTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }

  root.classList.remove("light", "dark");
  root.classList.add(theme);
  return () => {};
}

/**
 * Internal hook connecting global store theme state to DOM effects.
 * @returns An object containing the current theme and a stable setter function.
 */
function useThemeConfig(): ThemeProviderState {
  const theme = useConfigStore((state) => state.theme);
  const actions = useConfigActions();

  useEffect(() => {
    const cleanup = applyThemeToDocument(theme);
    return cleanup;
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      actions.setTheme(newTheme);
    },
    [actions],
  );

  return {
    theme,
    setTheme,
  };
}

/**
 * Context provider component exposing the theme state and setter function.
 * @param props - Component properties containing React children.
 * @returns The context provider wrapper component.
 */
export function ThemeProvider({ children }: ThemeProviderProps): ReactNode {
  const value = useThemeConfig();

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Custom hook to consume the current theme context.
 * @returns The current theme provider state.
 * @throws {Error} If called outside of a ThemeProvider component.
 */
export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
