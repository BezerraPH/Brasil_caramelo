-- v2.20: enquetes com encerramento, cápsula notificada, novos tipos de notificação
ALTER TYPE "NotificationType" ADD VALUE 'POLL_RESULTS';
ALTER TYPE "NotificationType" ADD VALUE 'PACK_EVENT_REMINDER';

ALTER TABLE "Post" ADD COLUMN "capsuleNotified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ThreadPoll" ADD COLUMN "closesAt" TIMESTAMP(3);
ALTER TABLE "ThreadPoll" ADD COLUMN "resultsNotifiedAt" TIMESTAMP(3);
