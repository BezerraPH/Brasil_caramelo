-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TESTIMONIAL_NEW';
ALTER TYPE "NotificationType" ADD VALUE 'TESTIMONIAL_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'PET_POKE';

-- CreateEnum
CREATE TYPE "PetPokeAction" AS ENUM ('PAWS', 'PET_CARE', 'BARK', 'CHEESE_BREAD', 'SNIFF');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "showVisits" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfileVisit" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitedId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileVisit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PetPoke" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "action" "PetPokeAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetPoke_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pack" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackMember" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reply" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_toUserId_accepted_idx" ON "Testimonial"("toUserId", "accepted");
CREATE INDEX "Testimonial_toUserId_acceptedAt_idx" ON "Testimonial"("toUserId", "acceptedAt");
CREATE UNIQUE INDEX "ProfileVisit_visitorId_visitedId_key" ON "ProfileVisit"("visitorId", "visitedId");
CREATE INDEX "ProfileVisit_visitedId_visitedAt_idx" ON "ProfileVisit"("visitedId", "visitedAt");
CREATE INDEX "PetPoke_toUserId_createdAt_idx" ON "PetPoke"("toUserId", "createdAt");
CREATE INDEX "PetPoke_fromUserId_toUserId_idx" ON "PetPoke"("fromUserId", "toUserId");
CREATE UNIQUE INDEX "Pack_slug_key" ON "Pack"("slug");
CREATE UNIQUE INDEX "Pack_name_key" ON "Pack"("name");
CREATE INDEX "Pack_createdAt_idx" ON "Pack"("createdAt");
CREATE UNIQUE INDEX "PackMember_packId_userId_key" ON "PackMember"("packId", "userId");
CREATE INDEX "PackMember_userId_idx" ON "PackMember"("userId");
CREATE INDEX "Thread_packId_createdAt_idx" ON "Thread"("packId", "createdAt");
CREATE INDEX "Reply_threadId_createdAt_idx" ON "Reply"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_visitedId_fkey" FOREIGN KEY ("visitedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetPoke" ADD CONSTRAINT "PetPoke_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetPoke" ADD CONSTRAINT "PetPoke_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pack" ADD CONSTRAINT "Pack_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PackMember" ADD CONSTRAINT "PackMember_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackMember" ADD CONSTRAINT "PackMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
