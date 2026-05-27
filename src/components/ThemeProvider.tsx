"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

/** light = dia · luar = Luar da Matilha (modo escuro especial) */
type Theme = "light" | "luar";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  isLuar: boolean;
} | null>(null);

const STORAGE_KEY = "bc_theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "luar");
  if (theme === "luar") {
    root.classList.add("luar");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useAsyncEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    let initial: Theme = "light";
    if (stored === "luar" || stored === "dark") {
      initial = "luar";
    } else if (stored === "light") {
      initial = "light";
    } else if (prefersDark) {
      initial = "luar";
    }
    setTheme(initial);
    applyTheme(initial);
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "luar" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const resolved = ready ? theme : "light";

  return (
    <ThemeContext.Provider
      value={{ theme: resolved, toggle, isLuar: resolved === "luar" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: "light" as Theme, toggle: () => {}, isLuar: false };
  }
  return ctx;
}
