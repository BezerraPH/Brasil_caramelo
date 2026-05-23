-- v2.3.6: DNA Caramelo, Tribunal do Cão, Pet Shop cupons

CREATE TYPE "BreedingRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE "TribunalCaseStatus" AS ENUM ('OPEN', 'KEEP', 'REMOVED');
CREATE TYPE "TribunalVoteChoice" AS ENUM ('KEEP', 'REMOVE');

ALTER TABLE "Post" ADD COLUMN "tribunalHidden" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "PetBreedingRequest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "BreedingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetBreedingRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PetOffspring" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "parentAUserId" TEXT NOT NULL,
    "parentBUserId" TEXT NOT NULL,
    "dnaLevel" "DogReputationLevel" NOT NULL,
    "color" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Filhote',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetOffspring_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostTribunalCase" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "status" "TribunalCaseStatus" NOT NULL DEFAULT 'OPEN',
    "votesKeep" INTEGER NOT NULL DEFAULT 0,
    "votesRemove" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PostTribunalCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TribunalVote" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "jurorId" TEXT NOT NULL,
    "choice" "TribunalVoteChoice" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TribunalVote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PetShopCoupon" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coinCost" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PetShopCoupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PetShopRedemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetShopRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PostTribunalCase_postId_key" ON "PostTribunalCase"("postId");
CREATE INDEX "PostTribunalCase_status_createdAt_idx" ON "PostTribunalCase"("status", "createdAt");
CREATE INDEX "PetBreedingRequest_toUserId_status_idx" ON "PetBreedingRequest"("toUserId", "status");
CREATE INDEX "PetBreedingRequest_fromUserId_status_idx" ON "PetBreedingRequest"("fromUserId", "status");
CREATE INDEX "PetOffspring_ownerId_createdAt_idx" ON "PetOffspring"("ownerId", "createdAt");
CREATE UNIQUE INDEX "TribunalVote_caseId_jurorId_key" ON "TribunalVote"("caseId", "jurorId");
CREATE UNIQUE INDEX "PetShopCoupon_code_key" ON "PetShopCoupon"("code");
CREATE INDEX "PetShopCoupon_region_active_idx" ON "PetShopCoupon"("region", "active");
CREATE UNIQUE INDEX "PetShopRedemption_userId_couponId_key" ON "PetShopRedemption"("userId", "couponId");
CREATE UNIQUE INDEX "PetShopRedemption_qrToken_key" ON "PetShopRedemption"("qrToken");

ALTER TABLE "PetBreedingRequest" ADD CONSTRAINT "PetBreedingRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetBreedingRequest" ADD CONSTRAINT "PetBreedingRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetOffspring" ADD CONSTRAINT "PetOffspring_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostTribunalCase" ADD CONSTRAINT "PostTribunalCase_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TribunalVote" ADD CONSTRAINT "TribunalVote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "PostTribunalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TribunalVote" ADD CONSTRAINT "TribunalVote_jurorId_fkey" FOREIGN KEY ("jurorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetShopRedemption" ADD CONSTRAINT "PetShopRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetShopRedemption" ADD CONSTRAINT "PetShopRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "PetShopCoupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cupons demo (Recife / Caruaru)
INSERT INTO "PetShopCoupon" ("id", "region", "shopName", "title", "code", "coinCost", "active") VALUES
  ('demo_recife_1', 'Recife', 'Pet Center Boa Viagem', '10% ração premium', 'BC-RECIFE10', 120, true),
  ('demo_recife_2', 'Recife', 'Cão & Gato Olinda', 'Banho e tosa -15%', 'BC-OLINDA15', 200, true),
  ('demo_caruaru_1', 'Caruaru', 'AgroPet Caruaru', '5% em medicamentos', 'BC-CARU5', 80, true);
