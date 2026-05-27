"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  initialMember: boolean;
};

export function CommunityJoinButton({ slug, initialMember }: Props) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, {
        method: member ? "DELETE" : "POST",
      });
      if (res.ok) {
        setMember(!member);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void toggle()}
      className={
        member
          ? "bc-btn-ghost border border-current"
          : "bc-btn-primary bc-community-join-pulse"
      }
    >
      {loading ? "…" : member ? "Sair da comunidade" : "Participar"}
    </button>
  );
}
