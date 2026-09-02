// Gerenciador de Temas: Sistema (Padrão), Claro e Escuro

export type ThemeMode = "system" | "light" | "dark";

const THEME_KEY = "bc_theme_mode";

/**
 * Obtém o tema configurado atualmente.
 */
export function getSavedTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

/**
 * Aplica o tema na tag <html> e persiste a preferência.
 */
export function applyTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(THEME_KEY, mode);
  const root = document.documentElement;

  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Inicializa os ouvintes de tema no carregamento da página.
 */
export function initThemeListener(): () => void {
  if (typeof window === "undefined") return () => {};

  const current = getSavedTheme();
  applyTheme(current);

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    if (getSavedTheme() === "system") {
      applyTheme("system");
    }
  };

  mediaQuery.addEventListener("change", handleChange);
  return () => mediaQuery.removeEventListener("change", handleChange);
}
