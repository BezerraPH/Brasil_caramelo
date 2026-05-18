-- v2.3.0: impulsionar posts, pet fetch, trending, federação, HLS stub
ALTER TABLE "Post" ADD COLUMN "videoHlsUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN "boostedUntil" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN "boostPriority" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "Post_boostPriority_createdAt_idx" ON "Post"("boostPriority", "createdAt");

ALTER TABLE "Pet" ADD COLUMN "lastFetchAt" TIMESTAMP(3);

CREATE TABLE "MatilhaTrend" (
    "tag" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatilhaTrend_pkey" PRIMARY KEY ("tag")
);

CREATE TABLE "FederationPeer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FederationPeer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FederationPeer_ownerId_baseUrl_key" ON "FederationPeer"("ownerId", "baseUrl");
CREATE INDEX "FederationPeer_ownerId_idx" ON "FederationPeer"("ownerId");
