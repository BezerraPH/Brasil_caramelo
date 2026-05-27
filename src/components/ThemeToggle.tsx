"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-bc-blue transition hover:bg-bc-blue/10"
      aria-label={theme === "luar" ? "Modo claro" : "Luar da Matilha"}
      title={theme === "luar" ? "Modo claro" : "Luar da Matilha 🌙"}
    >
      {theme === "luar" ? "☀️" : "🌙"}
    </button>
  );
}
