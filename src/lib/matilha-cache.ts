import { cacheDelPattern } from "@/lib/redis";

export async function invalidatePacksListCache(): Promise<void> {
  await cacheDelPattern("packs:v1:");
}
