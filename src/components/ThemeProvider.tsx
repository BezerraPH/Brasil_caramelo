"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import type { ProfileTheme } from "@/generated/prisma/enums";

/** light = dia · luar = Luar da Matilha (modo escuro especial) */
type Theme = "light" | "luar";

type ThemeContextType = {
  theme: Theme;
  toggle: () => void;
  isLuar: boolean;
  palette: ProfileTheme;
  setPalette: (palette: ProfileTheme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_THEME_KEY = "bc_theme";
const STORAGE_PALETTE_KEY = "bc_palette";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "luar");
  if (theme === "luar") {
    root.classList.add("luar");
  }
}

function applyPalette(palette: ProfileTheme) {
  const root = document.documentElement;
  root.setAttribute("data-palette", palette);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [palette, setPaletteState] = useState<ProfileTheme>("CLASSIC");
  const [ready, setReady] = useState(false);

  useAsyncEffect(() => {
    // 1. Tema Claro / Luar
    const storedTheme = localStorage.getItem(STORAGE_THEME_KEY);
    const prefersDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    let initialTheme: Theme = "light";
    if (storedTheme === "luar" || storedTheme === "dark") {
      initialTheme = "luar";
    } else if (storedTheme === "light") {
      initialTheme = "light";
    } else if (prefersDark) {
      initialTheme = "luar";
    }
    setTheme(initialTheme);
    applyTheme(initialTheme);

    // 2. Paleta de Cores do App
    const storedPalette = localStorage.getItem(STORAGE_PALETTE_KEY) as ProfileTheme | null;
    const validPalettes: ProfileTheme[] = ["CLASSIC", "CARAMELO", "TROPICAL", "SUNSET", "NIGHT"];
    const initialPalette = storedPalette && validPalettes.includes(storedPalette) ? storedPalette : "CLASSIC";
    setPaletteState(initialPalette);
    applyPalette(initialPalette);

    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "luar" : "light";
      localStorage.setItem(STORAGE_THEME_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const setPalette = useCallback((nextPalette: ProfileTheme) => {
    setPaletteState(nextPalette);
    localStorage.setItem(STORAGE_PALETTE_KEY, nextPalette);
    applyPalette(nextPalette);
  }, []);

  const resolvedTheme = ready ? theme : "light";
  const resolvedPalette = ready ? palette : "CLASSIC";

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        toggle,
        isLuar: resolvedTheme === "luar",
        palette: resolvedPalette,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "light" as Theme,
      toggle: () => {},
      isLuar: false,
      palette: "CLASSIC" as ProfileTheme,
      setPalette: () => {},
    };
  }
  return ctx;
}
