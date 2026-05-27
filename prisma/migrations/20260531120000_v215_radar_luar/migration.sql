-- AlterTable
ALTER TABLE "User" ADD COLUMN "locationCity" TEXT;
ALTER TABLE "User" ADD COLUMN "locationArea" TEXT;
ALTER TABLE "User" ADD COLUMN "showLocation" BOOLEAN NOT NULL DEFAULT false;
