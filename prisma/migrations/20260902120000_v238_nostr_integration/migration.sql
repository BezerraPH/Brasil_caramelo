-- v2.38: Nostr integration (nostrEventId on Post)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "nostrEventId" TEXT;

CREATE INDEX IF NOT EXISTS "Post_nostrEventId_idx" ON "Post"("nostrEventId");
