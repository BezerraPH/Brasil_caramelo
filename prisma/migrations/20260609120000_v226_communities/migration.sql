-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🏘️',
    "category" TEXT NOT NULL DEFAULT 'outros',
    "themePrimary" TEXT NOT NULL DEFAULT '#005f38',
    "themeAccent" TEXT NOT NULL DEFAULT '#ffc72c',
    "packId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE UNIQUE INDEX "Community_packId_key" ON "Community"("packId");
CREATE INDEX "Community_category_idx" ON "Community"("category");
CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");
CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed comunidades demo (estilo Orkut)
INSERT INTO "Community" ("id", "slug", "name", "description", "emoji", "category", "themePrimary", "themeAccent") VALUES
('cmty_musica', 'musica-brasileira', 'Música Brasileira', 'MPB, sertanejo, pagode e playlists da matilha.', '🎵', 'musica', '#6b21a8', '#fbbf24'),
('cmty_caes', 'cachorros-pe', 'Cachorros de PE', 'Quem tem caramelo no Nordeste se reúne aqui.', '🐕', 'pets', '#005f38', '#ffc72c'),
('cmty_games', 'games-retro', 'Games Retrô', 'Orkut, LAN house e pixel art — nostalgia pura.', '🎮', 'games', '#1e3a5f', '#22d3ee'),
('cmty_futebol', 'futebol-brasil', 'Futebol Brasil', 'Zoeira de vestiário, escalação e memes de VAR.', '⚽', 'esportes', '#166534', '#fef08a'),
('cmty_receitas', 'receitas-pet', 'Receitas Pet', 'Petiscos caseiros e dicas de veterinário amigo.', '🍖', 'pets', '#9a3412', '#fed7aa'),
('cmty_memes', 'memes-caramelo', 'Memes Caramelo', 'O melhor do Brasil Caramelo em imagem e vídeo.', '😂', 'humor', '#c68642', '#002776');
