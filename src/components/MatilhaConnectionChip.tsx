"use client";

import { useEffect, useState } from "react";

type ConnectionInfo = {
  mode?: string;
  appUrl?: string;
  version?: string;
};

const MODE_LABEL: Record<string, string> = {
  "http-lan": "HTTP LAN",
  "https-lan": "HTTPS LAN",
  tailscale: "Tailscale",
};

export function MatilhaConnectionChip() {
  const [info, setInfo] = useState<ConnectionInfo | null>(null);

  useEffect(() => {
    fetch("/api/matilha/connection")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setInfo(data))
      .catch(() => null);
  }, []);

  if (!info?.mode) return null;

  const label = MODE_LABEL[info.mode] ?? info.mode;
  const secure = info.mode !== "http-lan";

  return (
    <span
      className={`bc-connection-chip ${secure ? "bc-connection-chip--secure" : "bc-connection-chip--warn"}`}
      title={info.appUrl ?? undefined}
    >
      <span className="bc-connection-chip-dot" aria-hidden />
      {label}
      {info.version ? (
        <span className="bc-connection-chip-ver">{info.version}</span>
      ) : null}
    </span>
  );
}
