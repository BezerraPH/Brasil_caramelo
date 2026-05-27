-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PATIO_DUEL';
ALTER TYPE "NotificationType" ADD VALUE 'CAPSULE_RELEASED';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "profileVibe" "ViewMode" NOT NULL DEFAULT 'FEED';
ALTER TABLE "User" ADD COLUMN "patioKingUntil" TIMESTAMP(3);
UPDATE "User" SET "profileVibe" = "viewMode";

-- AlterTable Post
ALTER TABLE "Post" ADD COLUMN "audioUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN "capsuleReleaseAt" TIMESTAMP(3);
CREATE INDEX "Post_capsuleReleaseAt_idx" ON "Post"("capsuleReleaseAt");

-- AlterTable Comment
ALTER TABLE "Comment" ADD COLUMN "audioUrl" TEXT;

-- AlterTable Testimonial
ALTER TABLE "Testimonial" ADD COLUMN "audioUrl" TEXT;

-- CreateTable PatioDuel
CREATE TABLE "PatioDuel" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatioDuel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatioDuel_challengerId_createdAt_idx" ON "PatioDuel"("challengerId", "createdAt");
CREATE INDEX "PatioDuel_opponentId_createdAt_idx" ON "PatioDuel"("opponentId", "createdAt");

ALTER TABLE "PatioDuel" ADD CONSTRAINT "PatioDuel_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatioDuel" ADD CONSTRAINT "PatioDuel_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
