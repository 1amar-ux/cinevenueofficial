import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "cine_theme_preference";

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  effectiveTheme: "dark",
  setThemeMode: () => {},
  toggleTheme: () => {}
});

function getSystemTheme(): EffectiveTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSavedThemePreference(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // Storage access restricted or disabled
  }
  return "system";
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getSavedThemePreference);
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(getSystemTheme);

  // Compute the current active theme
  const effectiveTheme: EffectiveTheme = useMemo(() => {
    return themeMode === "system" ? systemTheme : themeMode;
  }, [themeMode, systemTheme]);

  // Listen for OS/Browser system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else if ((mediaQuery as any).addListener) {
      // Fallback for older WebViews
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, []);

  // Sync DOM attributes, classes, and mobile theme-color meta tag
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.setAttribute("data-theme", effectiveTheme);

    if (effectiveTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

    // Update mobile browser status bar / theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", effectiveTheme === "light" ? "#F8F9FA" : "#0A0A0B");
  }, [effectiveTheme]);

  // Setter with storage persistence
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  // Quick toggle between Light and Dark
  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = effectiveTheme === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
  }, [effectiveTheme, setThemeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      effectiveTheme,
      setThemeMode,
      toggleTheme
    }),
    [themeMode, effectiveTheme, setThemeMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
