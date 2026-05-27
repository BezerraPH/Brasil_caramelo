"use client";

import { useState } from "react";
import type { FriendshipDegree } from "@/generated/prisma/enums";
import {
  FRIENDSHIP_DEGREE_EMOJI,
  FRIENDSHIP_DEGREE_LABELS,
} from "@/lib/friendship-degree";

const DEGREES: FriendshipDegree[] = ["FAN", "FRIEND", "BEST_FRIEND"];

type FriendDegreePickerProps = {
  friendshipId: string;
  current: FriendshipDegree;
  onUpdated?: (degree: FriendshipDegree) => void;
};

export function FriendDegreePicker({
  friendshipId,
  current,
  onUpdated,
}: FriendDegreePickerProps) {
  const [degree, setDegree] = useState(current);
  const [saving, setSaving] = useState(false);

  async function change(next: FriendshipDegree) {
    if (next === degree || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ degree: next }),
      });
      if (res.ok) {
        setDegree(next);
        onUpdated?.(next);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={degree}
      disabled={saving}
      onChange={(e) => change(e.target.value as FriendshipDegree)}
      className="rounded-lg border border-bc-blue/20 bg-bc-white px-2 py-1 text-[11px] font-medium text-bc-brown"
      title="Grau de amizade (estilo Orkut)"
    >
      {DEGREES.map((d) => (
        <option key={d} value={d}>
          {FRIENDSHIP_DEGREE_EMOJI[d]} {FRIENDSHIP_DEGREE_LABELS[d]}
        </option>
      ))}
    </select>
  );
}
