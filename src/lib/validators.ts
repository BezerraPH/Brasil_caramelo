import { z } from "zod";
import { DOG_REPUTATION_LEVELS } from "./constants";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _"),
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const postSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const reputationSchema = z.object({
  toUserId: z.string().min(1),
  level: z.enum(DOG_REPUTATION_LEVELS),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(300).optional().nullable(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _")
    .optional(),
});
