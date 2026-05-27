-- v2.21: Pedigree orders + salas Latidos em encontros Matilha
CREATE TYPE "PremiumOrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

ALTER TYPE "NotificationType" ADD VALUE 'PREMIUM_ACTIVATED';

CREATE TABLE "PremiumOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amountBrl" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'pix_manual',
    "externalId" TEXT,
    "status" "PremiumOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PremiumOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PremiumOrder_reference_key" ON "PremiumOrder"("reference");
CREATE INDEX "PremiumOrder_userId_status_idx" ON "PremiumOrder"("userId", "status");
CREATE INDEX "PremiumOrder_status_createdAt_idx" ON "PremiumOrder"("status", "createdAt");

ALTER TABLE "PremiumOrder" ADD CONSTRAINT "PremiumOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PackEvent" ADD COLUMN "latidosRoom" TEXT;
