export type UploadthingTokenIssue =
  | "missing"
  | "legacy_sk_format"
  | "invalid_base64"
  | "invalid_shape";

const LEGACY_HINT =
  "O token antigo (sk_live_…) não funciona no Uploadthing v7. No dashboard em uploadthing.com → seu app → API Keys, copie o token SDK (string base64 longa) para UPLOADTHING_TOKEN no .env e reinicie o servidor.";

export function diagnoseUploadthingToken(): {
  ok: boolean;
  issue?: UploadthingTokenIssue;
  hint?: string;
} {
  const raw = process.env.UPLOADTHING_TOKEN?.trim();
  if (!raw) {
    return {
      ok: false,
      issue: "missing",
      hint: "Defina UPLOADTHING_TOKEN no .env com o token SDK v7 do dashboard Uploadthing.",
    };
  }

  if (raw.startsWith("sk_live_") || raw.startsWith("sk_test_")) {
    return { ok: false, issue: "legacy_sk_format", hint: LEGACY_HINT };
  }

  try {
    const json = JSON.parse(
      Buffer.from(raw, "base64").toString("utf8"),
    ) as Record<string, unknown>;
    const valid =
      typeof json.apiKey === "string" &&
      typeof json.appId === "string" &&
      Array.isArray(json.regions);
    if (valid) return { ok: true };
    return {
      ok: false,
      issue: "invalid_shape",
      hint: "UPLOADTHING_TOKEN decodificado, mas não contém apiKey, appId e regions. Gere um novo token no dashboard.",
    };
  } catch {
    return {
      ok: false,
      issue: "invalid_base64",
      hint: LEGACY_HINT,
    };
  }
}

export function assertUploadthingConfigured(): void {
  const d = diagnoseUploadthingToken();
  if (!d.ok) {
    throw new Error(d.hint ?? "Uploadthing não configurado.");
  }
}

export function formatUploadClientError(message: string, serverHint?: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid token") ||
    lower.includes("base64") ||
    lower.includes("apikey")
  ) {
    return serverHint ?? LEGACY_HINT;
  }
  if (lower.includes("não autorizado") || lower.includes("unauthorized")) {
    return "Faça login novamente para enviar arquivos.";
  }
  return message;
}
