-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ROOM_MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE 'INCOMING_CALL';

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('RINGING', 'ACTIVE', 'ENDED', 'MISSED', 'DECLINED');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachmentUrl" TEXT,
ADD COLUMN "attachmentMime" TEXT;
ALTER TABLE "Message" ALTER COLUMN "content" SET DEFAULT '';

-- CreateTable
CREATE TABLE "CasinhaRoom" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "communityLevel" "DogReputationLevel" NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CasinhaRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasinhaRoomMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "attachmentUrl" TEXT,
    "attachmentMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CasinhaRoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "callerId" TEXT NOT NULL,
    "calleeId" TEXT NOT NULL,
    "conversationId" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'RINGING',
    "offerSdp" TEXT,
    "answerSdp" TEXT,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CasinhaRoom_slug_key" ON "CasinhaRoom"("slug");

-- CreateIndex
CREATE INDEX "CasinhaRoom_lastMessageAt_idx" ON "CasinhaRoom"("lastMessageAt");

-- CreateIndex
CREATE INDEX "CasinhaRoomMessage_roomId_createdAt_idx" ON "CasinhaRoomMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "CallSession_calleeId_status_createdAt_idx" ON "CallSession"("calleeId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CallSession_callerId_status_idx" ON "CallSession"("callerId", "status");

-- AddForeignKey
ALTER TABLE "CasinhaRoomMessage" ADD CONSTRAINT "CasinhaRoomMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CasinhaRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasinhaRoomMessage" ADD CONSTRAINT "CasinhaRoomMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_calleeId_fkey" FOREIGN KEY ("calleeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
