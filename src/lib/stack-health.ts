/** Status de serviços self-hosted (configuração via env, sem probe de rede). */
export type StackServiceStatus = {
  configured: boolean;
  label: string;
};

export type StackHealthSnapshot = {
  soketi: StackServiceStatus;
  livekit: StackServiceStatus;
  turn: StackServiceStatus;
  ollama: StackServiceStatus;
};

function has(v: string | undefined): boolean {
  return Boolean(v?.trim());
}

export function getStackHealth(): StackHealthSnapshot {
  const soketi =
    has(process.env.PUSHER_HOST) && has(process.env.NEXT_PUBLIC_PUSHER_KEY);
  const livekit =
    has(process.env.LIVEKIT_API_KEY) && has(process.env.NEXT_PUBLIC_LIVEKIT_URL);
  const turn =
    has(process.env.NEXT_PUBLIC_TURN_URL) &&
    has(process.env.NEXT_PUBLIC_TURN_USERNAME);
  const ollama = has(process.env.OLLAMA_BASE_URL);

  return {
    soketi: { configured: soketi, label: "Soketi" },
    livekit: { configured: livekit, label: "LiveKit" },
    turn: { configured: turn, label: "TURN" },
    ollama: { configured: ollama, label: "Ollama" },
  };
}
