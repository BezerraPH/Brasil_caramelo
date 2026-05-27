-- Federation peers: suporte explícito a Tailscale (tailnet) além de LAN
ALTER TABLE "FederationPeer" ADD COLUMN "networkType" TEXT NOT NULL DEFAULT 'lan';
ALTER TABLE "FederationPeer" ADD COLUMN "lastProbeAt" TIMESTAMP(3);
ALTER TABLE "FederationPeer" ADD COLUMN "lastProbeOk" BOOLEAN;

CREATE INDEX "FederationPeer_networkType_idx" ON "FederationPeer"("networkType");
