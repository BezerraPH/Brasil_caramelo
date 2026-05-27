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

/** URL absoluta (legado) ou caminho servido pelo próprio servidor. */
export const mediaUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith("/api/media/") || /^https?:\/\//i.test(v),
    { message: "URL de mídia inválida." },
  );

export const postSchema = z
  .object({
    content: z.string().max(2000).optional(),
    imageUrl: mediaUrlSchema.optional(),
    videoUrl: mediaUrlSchema.optional(),
    videoHlsUrl: mediaUrlSchema.optional(),
    communityLevel: z.enum(DOG_REPUTATION_LEVELS).optional(),
    buryBone: z.boolean().optional(),
  })
  .refine(
    (d) =>
      (d.content?.trim().length ?? 0) > 0 || d.imageUrl || d.videoUrl,
    { message: "Escreva um texto ou envie mídia." },
  );

export const reputationSchema = z.object({
  toUserId: z.string().min(1),
  level: z.enum(DOG_REPUTATION_LEVELS),
});

export const editPostSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const chatMessageSchema = z
  .object({
    content: z.string().max(2000).optional(),
    attachmentUrl: mediaUrlSchema.optional(),
    attachmentMime: z.string().max(120).optional(),
  })
  .refine(
    (d) => (d.content?.trim().length ?? 0) > 0 || d.attachmentUrl,
    { message: "Envie texto ou anexo." },
  );

export const callSignalSchema = z.object({
  callId: z.string().optional(),
  targetUserId: z.string().optional(),
  type: z.enum(["invite", "offer", "answer", "ice", "hangup", "decline"]),
  sdp: z.string().optional(),
  candidate: z
    .object({
      candidate: z.string(),
      sdpMid: z.string().nullable().optional(),
      sdpMLineIndex: z.number().nullable().optional(),
    })
    .optional(),
});

export const startChatSchema = z.object({
  username: z.string().min(3).max(30),
});

export const commentSchema = z
  .object({
    content: z.string().max(500).optional(),
    audioUrl: mediaUrlSchema.optional(),
  })
  .refine((d) => (d.content?.trim().length ?? 0) > 0 || d.audioUrl, {
    message: "Escreva ou grave um áudio.",
  });

export const friendRequestSchema = z.object({
  username: z.string().min(3).max(30),
});

export const petCareSchema = z.object({
  action: z.enum(["feed", "play", "rest"]),
});

export const petUpdateSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  color: z.string().max(20).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(500).optional().nullable(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _")
    .optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato AAAA-MM-DD.")
    .optional()
    .nullable(),
  relationshipStatus: z
    .enum([
      "SINGLE",
      "IN_RELATIONSHIP",
      "ENGAGED",
      "MARRIED",
      "COMPLICATED",
      "NOT_SAYING",
    ])
    .optional()
    .nullable(),
  interests: z.array(z.string().min(1).max(30)).max(15).optional(),
});

export const viewModeSchema = z.object({
  viewMode: z.enum(["FEED", "INSTA", "REELS"]),
});

export const petTreatSchema = z.object({
  toUserId: z.string().min(1),
});

export const testimonialSchema = z.object({
  toUserId: z.string().min(1),
  content: z.string().min(1).max(1000),
  audioUrl: mediaUrlSchema.optional(),
});

export const testimonialActionSchema = z.object({
  id: z.string().min(1),
});

export const profileVisitSchema = z.object({
  visitedId: z.string().min(1),
});

export const petPokeSchema = z.object({
  toUserId: z.string().min(1),
  action: z.enum(["PAWS", "PET_CARE", "BARK", "CHEESE_BREAD", "SNIFF"]),
});

export const privacySchema = z.object({
  showVisits: z.boolean(),
});

export const packThreadSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(1).max(4000),
  anonymous: z.boolean().optional(),
  pollOptions: z.array(z.string().min(1).max(80)).min(2).max(6).optional(),
});

export const pollVoteSchema = z.object({
  optionId: z.string().min(1),
});

export const friendshipDegreeSchema = z.object({
  degree: z.enum(["FAN", "FRIEND", "BEST_FRIEND"]),
});

export const packEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  location: z.string().min(3).max(200),
  startsAt: z.string().min(1),
});

export const threadModerationSchema = z.object({
  pinned: z.boolean().optional(),
  isGolden: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const profileThemeSchema = z.object({
  profileTheme: z.enum(["CLASSIC", "SUNSET", "TROPICAL", "CARAMELO", "NIGHT"]),
});

export const packReplySchema = z.object({
  content: z.string().min(1).max(4000),
});

export const locationSchema = z.object({
  locationCity: z.string().max(80).optional().nullable(),
  locationArea: z.string().max(80).optional().nullable(),
  showLocation: z.boolean().optional(),
});

export const interestsSchema = z.object({
  interests: z.array(z.string().min(1).max(30)).max(15),
});

export const albumSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional().nullable(),
});

export const albumUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(300).optional().nullable(),
});

export const photoSchema = z.object({
  url: mediaUrlSchema,
  thumbUrl: mediaUrlSchema.optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
});

export const photoCommentSchema = z.object({
  content: z.string().max(1000).optional(),
  audioUrl: mediaUrlSchema.optional(),
});
