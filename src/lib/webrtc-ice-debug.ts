import { buildIceServers } from "@/lib/webrtc-ice";

export type IcePathKind = "idle" | "gathering" | "p2p" | "turn" | "unknown";

export type GatheredIceCandidate = {
  type: string;
  protocol: string;
  address: string;
};

/** Teste local: coleta candidatos ICE sem chamada real. */
export async function gatherIceCandidates(
  timeoutMs = 8000,
): Promise<GatheredIceCandidate[]> {
  if (typeof RTCPeerConnection === "undefined") return [];

  return new Promise((resolve) => {
    const found: GatheredIceCandidate[] = [];
    const pc = new RTCPeerConnection(buildIceServers());
    const done = () => {
      pc.close();
      resolve(found);
    };

    const timer = setTimeout(done, timeoutMs);

    pc.onicecandidate = (ev) => {
      if (!ev.candidate) {
        clearTimeout(timer);
        done();
        return;
      }
      const c = ev.candidate;
      found.push({
        type: c.type || "unknown",
        protocol: c.protocol || "?",
        address: c.address || c.candidate || "—",
      });
    };

    pc.createDataChannel("bc-ice-probe");
    void pc
      .createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        clearTimeout(timer);
        done();
      });
  });
}

/** Caminho ativo da chamada (P2P direto vs relay TURN). */
export async function detectActiveIcePath(
  pc: RTCPeerConnection,
): Promise<IcePathKind> {
  if (pc.iceConnectionState === "checking" || pc.iceConnectionState === "new") {
    return "gathering";
  }
  if (
    pc.iceConnectionState === "disconnected" ||
    pc.iceConnectionState === "failed" ||
    pc.iceConnectionState === "closed"
  ) {
    return "idle";
  }

  try {
    const stats = await pc.getStats();
    let selectedPairId: string | undefined;

    for (const report of stats.values()) {
      if (report.type === "transport") {
        const t = report as RTCStats & {
          selectedCandidatePairId?: string;
        };
        if (t.selectedCandidatePairId) {
          selectedPairId = t.selectedCandidatePairId;
          break;
        }
      }
    }

    if (!selectedPairId) return "unknown";

    const pair = stats.get(selectedPairId) as RTCStats & {
      localCandidateId?: string;
      remoteCandidateId?: string;
      state?: string;
    };
    if (!pair?.localCandidateId) return "unknown";

    const local = stats.get(pair.localCandidateId) as RTCStats & {
      candidateType?: string;
    };
    const remote = pair.remoteCandidateId
      ? (stats.get(pair.remoteCandidateId) as RTCStats & {
          candidateType?: string;
        })
      : null;

    if (
      local?.candidateType === "relay" ||
      remote?.candidateType === "relay"
    ) {
      return "turn";
    }
    if (local?.candidateType) return "p2p";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export function icePathLabel(kind: IcePathKind): string {
  switch (kind) {
    case "p2p":
      return "P2P direto";
    case "turn":
      return "Via TURN (relay)";
    case "gathering":
      return "Negociando ICE…";
    case "unknown":
      return "Caminho desconhecido";
    default:
      return "Sem conexão";
  }
}

export function icePathBadgeClass(kind: IcePathKind): string {
  switch (kind) {
    case "p2p":
      return "bc-ice-badge bc-ice-badge--p2p";
    case "turn":
      return "bc-ice-badge bc-ice-badge--turn";
    case "gathering":
      return "bc-ice-badge bc-ice-badge--checking";
    default:
      return "bc-ice-badge bc-ice-badge--unknown";
  }
}
