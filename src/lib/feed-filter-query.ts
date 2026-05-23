import type { FeedFilterMode } from "./feed-posts";

export function feedFilterQueryParam(mode: FeedFilterMode): string {
  if (mode === "friends") return "&filter=friends";
  if (mode === "video") return "&filter=video";
  return "";
}
