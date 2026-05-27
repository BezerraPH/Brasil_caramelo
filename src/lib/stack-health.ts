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
  redis: StackServiceStatus;
  meilisearch: StackServiceStatus;
  minio: StackServiceStatus;
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

  const redis = has(process.env.REDIS_URL);
  const meilisearch =
    has(process.env.MEILISEARCH_HOST) && has(process.env.MEILISEARCH_MASTER_KEY);

  const minio =
    (has(process.env.S3_ENDPOINT) || has(process.env.MINIO_ENDPOINT)) &&
    (has(process.env.S3_BUCKET) || has(process.env.MINIO_BUCKET)) &&
    (has(process.env.S3_ACCESS_KEY) || has(process.env.MINIO_ROOT_USER));

  return {
    soketi: { configured: soketi, label: "Soketi" },
    livekit: { configured: livekit, label: "LiveKit" },
    turn: { configured: turn, label: "TURN" },
    ollama: { configured: ollama, label: "Ollama" },
    redis: { configured: redis, label: "Redis" },
    meilisearch: { configured: meilisearch, label: "Meilisearch" },
    minio: { configured: minio, label: "MinIO" },
  };
}
