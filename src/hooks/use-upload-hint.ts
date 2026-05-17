"use client";

import { useCallback, useState } from "react";
import { formatUploadClientError } from "@/lib/uploadthing-token";
import { useAsyncEffect } from "@/hooks/use-async-effect";

export function useUploadHint() {
  const [hint, setHint] = useState<string | undefined>();

  const load = useCallback(async () => {
    const res = await fetch("/api/media/config");
    const data = await res.json();
    if (res.ok && !data.uploadReady) {
      setHint(data.hint ?? undefined);
    }
  }, []);

  useAsyncEffect(load, [load]);

  function formatUploadError(error: Error) {
    return formatUploadClientError(error.message, hint);
  }

  return { formatUploadError, uploadBlocked: Boolean(hint) };
}
