-- AlterTable
ALTER TABLE "Pet" ADD COLUMN "ownedCosmetics" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Pet" ADD COLUMN "equippedHat" TEXT;
ALTER TABLE "Pet" ADD COLUMN "equippedCollar" TEXT;
ALTER TABLE "Pet" ADD COLUMN "equippedAccessory" TEXT;
