-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('SINGLE', 'IN_RELATIONSHIP', 'ENGAGED', 'MARRIED', 'COMPLICATED', 'NOT_SAYING');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "birthDate" DATE;
ALTER TABLE "User" ADD COLUMN "relationshipStatus" "RelationshipStatus";
ALTER TABLE "User" ADD COLUMN "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
