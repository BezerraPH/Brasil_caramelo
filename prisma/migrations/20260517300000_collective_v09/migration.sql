-- CreateEnum
CREATE TYPE "StoryMediaType" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "PetBattleStatus" AS ENUM ('ACTIVE', 'ENDED');

-- AlterEnum NotificationType
ALTER TYPE "NotificationType" ADD VALUE 'FLASH_EVENT';
ALTER TYPE "NotificationType" ADD VALUE 'PET_BATTLE';
ALTER TYPE "NotificationType" ADD VALUE 'STORY_NEW';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "premiumUntil" TIMESTAMP(3);

-- AlterTable Post
ALTER TABLE "Post" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN "communityLevel" "DogReputationLevel";

-- CreateTable Story
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" "StoryMediaType" NOT NULL DEFAULT 'IMAGE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable FlashEvent
CREATE TABLE "FlashEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "coinMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "targetLevel" "DogReputationLevel",
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FlashEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable PetBattle
CREATE TABLE "PetBattle" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "status" "PetBattleStatus" NOT NULL DEFAULT 'ACTIVE',
    "votesChallenger" INTEGER NOT NULL DEFAULT 0,
    "votesOpponent" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PetBattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable PetBattleVote
CREATE TABLE "PetBattleVote" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forChallenger" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PetBattleVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_communityLevel_createdAt_idx" ON "Post"("communityLevel", "createdAt");
CREATE INDEX "Story_userId_expiresAt_idx" ON "Story"("userId", "expiresAt");
CREATE INDEX "Story_expiresAt_idx" ON "Story"("expiresAt");
CREATE INDEX "FlashEvent_endsAt_idx" ON "FlashEvent"("endsAt");
CREATE INDEX "PetBattle_status_endsAt_idx" ON "PetBattle"("status", "endsAt");
CREATE UNIQUE INDEX "PetBattleVote_battleId_userId_key" ON "PetBattleVote"("battleId", "userId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetBattle" ADD CONSTRAINT "PetBattle_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetBattle" ADD CONSTRAINT "PetBattle_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetBattleVote" ADD CONSTRAINT "PetBattleVote_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "PetBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetBattleVote" ADD CONSTRAINT "PetBattleVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
