import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CHAVE_TEMA_PLATAFORMA } from "@/lib/plataforma";

type Theme = "light" | "dark";
type ThemeScope = "app" | "platform" | "none";

type ThemeContextValue = {
  theme: Theme;
  scope: ThemeScope;
  toggleTheme: () => void;
  setTheme: (theme: Theme, scope?: ThemeScope) => void;
};

const STORAGE_KEY_APP = "semear.tema";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  return "light";
};

export function ProvedorTema({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const scopeRef = useRef<ThemeScope>("none");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (scopeRef.current === "app") {
      window.localStorage.setItem(STORAGE_KEY_APP, theme);
    } else if (scopeRef.current === "platform") {
      window.localStorage.setItem(CHAVE_TEMA_PLATAFORMA, theme);
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme, scope: ThemeScope = "app") => {
    scopeRef.current = scope;
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (scopeRef.current === "app") {
        window.localStorage.setItem(STORAGE_KEY_APP, next);
      } else if (scopeRef.current === "platform") {
        window.localStorage.setItem(CHAVE_TEMA_PLATAFORMA, next);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      scope: scopeRef.current,
      toggleTheme,
      setTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function usarTema() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("usarTema deve ser usado dentro de ProvedorTema.");
  }
  return context;
}
