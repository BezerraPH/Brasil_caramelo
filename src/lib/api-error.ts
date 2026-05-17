import { ZodError } from "zod";

export function validationMessage(error: unknown): string {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    if (first) return first.message;
  }
  return "Dados inválidos.";
}
