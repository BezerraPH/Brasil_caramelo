import type { FriendshipDegree } from "@/generated/prisma/enums";

export const FRIENDSHIP_DEGREE_LABELS: Record<FriendshipDegree, string> = {
  FAN: "Fã",
  FRIEND: "Amigo",
  BEST_FRIEND: "Melhor Amigo",
};

export const FRIENDSHIP_DEGREE_EMOJI: Record<FriendshipDegree, string> = {
  FAN: "⭐",
  FRIEND: "🤝",
  BEST_FRIEND: "💛",
};

export function myFriendshipDegree(
  friendship: {
    requesterId: string;
    addresseeId: string;
    requesterDegree: FriendshipDegree;
    addresseeDegree: FriendshipDegree;
  },
  viewerId: string,
): FriendshipDegree {
  if (friendship.requesterId === viewerId) return friendship.requesterDegree;
  return friendship.addresseeDegree;
}
