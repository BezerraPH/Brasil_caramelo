import { NostrFeedView } from "@/components/nostr/NostrFeedView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed Nostr Descentralizado — Brasil Caramelo",
  description: "Rede social descentralizada imutável transmitida via Nostr Relays.",
};

export default function NostrPage() {
  return <NostrFeedView />;
}
