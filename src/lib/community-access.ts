import type { CommunityMemberRole } from "@/generated/prisma/enums";

export type CommunityAccess = {
  isOwner: boolean;
  isModerator: boolean;
  canModerate: boolean;
  memberRole: CommunityMemberRole | null;
};

export function resolveCommunityAccess(
  ownerId: string | null,
  userId: string,
  memberRole: CommunityMemberRole | null | undefined,
): CommunityAccess {
  const isOwner = Boolean(ownerId && ownerId === userId);
  const isModerator = memberRole === "MODERATOR";
  return {
    isOwner,
    isModerator,
    canModerate: isOwner || isModerator,
    memberRole: memberRole ?? null,
  };
}
