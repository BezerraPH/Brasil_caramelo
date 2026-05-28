-- v2.29: moderadores, regras fixadas, mural da comunidade
CREATE TYPE "CommunityMemberRole" AS ENUM ('MEMBER', 'MODERATOR');

ALTER TABLE "Community" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Community" ADD COLUMN "pinnedRules" TEXT NOT NULL DEFAULT '';

ALTER TABLE "CommunityMember" ADD COLUMN "role" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER';

ALTER TABLE "Post" ADD COLUMN "communityId" TEXT;

CREATE INDEX "Post_communityId_createdAt_idx" ON "Post"("communityId", "createdAt");

ALTER TABLE "Community" ADD CONSTRAINT "Community_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "Community" c
SET "ownerId" = p."ownerId"
FROM "Pack" p
WHERE c."packId" = p.id AND c."ownerId" IS NULL;

UPDATE "Community" SET "pinnedRules" = 'Seja gentil com a matilha. Sem spam, sem links suspeitos. Zoeira sim, ofensa não.'
WHERE "pinnedRules" = '';
