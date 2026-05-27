-- CreateEnum
CREATE TYPE "ProfileTheme" AS ENUM ('CLASSIC', 'SUNSET', 'TROPICAL', 'CARAMELO', 'NIGHT');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BISCUIT_RECEIVED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isFoundingMember" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "profileTheme" "ProfileTheme" NOT NULL DEFAULT 'CLASSIC';
ALTER TABLE "User" ADD COLUMN "biscuitBalance" INTEGER NOT NULL DEFAULT 0;

-- Membros atuais da ALPHA recebem selo fundador
UPDATE "User" SET "isFoundingMember" = true;

-- CreateTable
CREATE TABLE "PostBiscuit" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostBiscuit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackEvent" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PackEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackEventRsvp" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PackEventRsvp_pkey" PRIMARY KEY ("id")
);

-- AlterTable Thread
ALTER TABLE "Thread" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Thread" ADD COLUMN "isGolden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Thread" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Thread" ADD COLUMN "anonymous" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "PostBiscuit_postId_fromUserId_key" ON "PostBiscuit"("postId", "fromUserId");
CREATE INDEX "PostBiscuit_postId_idx" ON "PostBiscuit"("postId");
CREATE INDEX "PackEvent_packId_startsAt_idx" ON "PackEvent"("packId", "startsAt");
CREATE UNIQUE INDEX "PackEventRsvp_ticketToken_key" ON "PackEventRsvp"("ticketToken");
CREATE UNIQUE INDEX "PackEventRsvp_eventId_userId_key" ON "PackEventRsvp"("eventId", "userId");
CREATE INDEX "PackEventRsvp_userId_idx" ON "PackEventRsvp"("userId");
CREATE INDEX "Thread_packId_pinned_isGolden_idx" ON "Thread"("packId", "pinned", "isGolden");
CREATE INDEX "Thread_packId_archived_createdAt_idx" ON "Thread"("packId", "archived", "createdAt");

-- AddForeignKey
ALTER TABLE "PostBiscuit" ADD CONSTRAINT "PostBiscuit_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostBiscuit" ADD CONSTRAINT "PostBiscuit_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackEvent" ADD CONSTRAINT "PackEvent_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackEvent" ADD CONSTRAINT "PackEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PackEventRsvp" ADD CONSTRAINT "PackEventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PackEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackEventRsvp" ADD CONSTRAINT "PackEventRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
