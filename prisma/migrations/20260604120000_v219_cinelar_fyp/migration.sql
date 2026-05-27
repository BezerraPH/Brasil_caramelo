-- Cinelar FYP: score de relevância + interações de visualização
ALTER TABLE "Post" ADD COLUMN "reelScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX "Post_reelScore_createdAt_idx" ON "Post"("reelScore", "createdAt");

CREATE TABLE "PostInteraction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watchMs" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostInteraction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PostInteraction_postId_userId_key" ON "PostInteraction"("postId", "userId");
CREATE INDEX "PostInteraction_postId_idx" ON "PostInteraction"("postId");
CREATE INDEX "PostInteraction_userId_idx" ON "PostInteraction"("userId");

ALTER TABLE "PostInteraction" ADD CONSTRAINT "PostInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostInteraction" ADD CONSTRAINT "PostInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
