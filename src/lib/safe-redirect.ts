const ALLOWED_PREFIXES = [
  "/feed",
  "/perfil",
  "/configuracoes",
  "/amigos",
  "/buscar",
  "/cachorro",
  "/ranking",
  "/casinhas",
  "/casinha",
  "/rolezinho",
  "/batalha",
  "/premium",
  "/pet-shops",
  "/explorar",
  "/salvos",
  "/notificacoes",
  "/mensagens",
] as const;

/** Valida redirect interno pós-login (evita open redirect). */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/feed";
  }
  const path = next.split("?")[0] ?? next;
  const ok = ALLOWED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
  return ok ? next : "/feed";
}
