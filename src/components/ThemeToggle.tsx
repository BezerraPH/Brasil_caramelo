"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-bc-blue transition hover:bg-bc-blue/10"
      aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
