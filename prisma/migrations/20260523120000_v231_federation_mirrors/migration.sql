CREATE TABLE "FederatedPostMirror" (
    "id" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "communityLevel" "DogReputationLevel" NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "sourceCreatedAt" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FederatedPostMirror_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FederatedPostMirror_peerId_externalId_key" ON "FederatedPostMirror"("peerId", "externalId");
CREATE INDEX "FederatedPostMirror_communityLevel_importedAt_idx" ON "FederatedPostMirror"("communityLevel", "importedAt");

ALTER TABLE "FederatedPostMirror" ADD CONSTRAINT "FederatedPostMirror_peerId_fkey" FOREIGN KEY ("peerId") REFERENCES "FederationPeer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
