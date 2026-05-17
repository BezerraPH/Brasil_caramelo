-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REPUTATION_VOTE', 'PET_TREAT', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED');

-- AlterTable Pet
ALTER TABLE "Pet" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Pet" ADD COLUMN "experience" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Pet" ADD COLUMN "coins" INTEGER NOT NULL DEFAULT 50;

-- CreateTable PetTreat
CREATE TABLE "PetTreat" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetTreat_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetTreat_toUserId_createdAt_idx" ON "PetTreat"("toUserId", "createdAt");
CREATE INDEX "PetTreat_fromUserId_toUserId_idx" ON "PetTreat"("fromUserId", "toUserId");
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");
CREATE INDEX "Reputation_level_createdAt_idx" ON "Reputation"("level", "createdAt");

-- AddForeignKey
ALTER TABLE "PetTreat" ADD CONSTRAINT "PetTreat_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetTreat" ADD CONSTRAINT "PetTreat_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
