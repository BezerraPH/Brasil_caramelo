import type { NotificationType } from "@/generated/prisma/enums";

export function notificationIcon(type: NotificationType): string {
  const map: Record<NotificationType, string> = {
    REPUTATION_VOTE: "🐕",
    PET_TREAT: "🦴",
    FRIEND_REQUEST: "🤝",
    FRIEND_ACCEPTED: "✅",
    FLASH_EVENT: "🎉",
    PET_BATTLE: "⚔️",
    STORY_NEW: "⭕",
    POST_LIKE: "❤️",
    POST_COMMENT: "💬",
    POST_MENTION: "@",
    POST_REACTION: "🐾",
    CHAT_MESSAGE: "💬",
    ROOM_MESSAGE: "🏠",
    INCOMING_CALL: "📹",
    TRIBUNAL_CASE: "⚖️",
    PET_BREED_REQUEST: "🧬",
    PET_BREED_ACCEPTED: "🧬",
    TESTIMONIAL_NEW: "📝",
    TESTIMONIAL_ACCEPTED: "👑",
    PET_POKE: "🐾",
    BISCUIT_RECEIVED: "🍪",
    PATIO_DUEL: "⚔️",
    CAPSULE_RELEASED: "🦴",
    PHOTO_COMMENT: "📷",
    POLL_RESULTS: "📊",
    PACK_EVENT_REMINDER: "📅",
  };
  return map[type] ?? "🔔";
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d`;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}
